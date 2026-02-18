# =============================================================================
# Random Password for RDS
# =============================================================================

resource "random_password" "db_password" {
  length           = 32
  special          = true
  # Only use URL-safe special characters to avoid connection string parsing issues
  override_special = "-_"
}

# =============================================================================
# RDS Subnet Group
# =============================================================================

resource "aws_db_subnet_group" "main" {
  name        = "${var.project_name}-${var.environment}-db"
  description = "Database subnet group for ${var.project_name}"
  subnet_ids  = var.subnet_ids

  tags = {
    Name = "${var.project_name}-${var.environment}-db-subnet-group"
  }
}

# =============================================================================
# RDS Parameter Group
# =============================================================================

resource "aws_db_parameter_group" "main" {
  name   = "${var.project_name}-${var.environment}-pg16"
  family = "postgres16"

  parameter {
    name  = "log_statement"
    value = "all"
  }

  parameter {
    name  = "log_min_duration_statement"
    value = "1000" # Log queries taking more than 1 second
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-pg16-params"
  }
}

# =============================================================================
# IAM Role for Enhanced Monitoring
# =============================================================================

resource "aws_iam_role" "rds_monitoring" {
  name = "${var.project_name}-${var.environment}-rds-monitoring"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "monitoring.rds.amazonaws.com"
      }
    }]
  })

  tags = {
    Name = "${var.project_name}-${var.environment}-rds-monitoring-role"
  }
}

resource "aws_iam_role_policy_attachment" "rds_monitoring" {
  role       = aws_iam_role.rds_monitoring.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
}

# =============================================================================
# RDS PostgreSQL Instance
# =============================================================================

resource "aws_db_instance" "main" {
  identifier = "${var.project_name}-${var.environment}"

  # Restore from snapshot if provided
  snapshot_identifier = var.snapshot_identifier != "" ? var.snapshot_identifier : null

  engine         = "postgres"
  engine_version = var.engine_version
  instance_class = var.instance_class

  allocated_storage     = var.snapshot_identifier != "" ? null : var.allocated_storage
  max_allocated_storage = var.max_allocated_storage
  storage_type          = "gp3"
  storage_encrypted     = true

  # These are ignored when restoring from snapshot
  db_name  = var.snapshot_identifier != "" ? null : var.database_name
  username = var.snapshot_identifier != "" ? null : "listo_admin"
  password = var.snapshot_identifier != "" ? null : random_password.db_password.result

  vpc_security_group_ids = [var.security_group_id]
  db_subnet_group_name   = aws_db_subnet_group.main.name
  parameter_group_name   = aws_db_parameter_group.main.name

  multi_az            = var.multi_az
  publicly_accessible = false

  deletion_protection       = var.deletion_protection
  skip_final_snapshot       = false
  final_snapshot_identifier = "${var.project_name}-${var.environment}-final-${formatdate("YYYYMMDD-hhmmss", timestamp())}"
  copy_tags_to_snapshot     = true

  backup_retention_period = var.backup_retention_period
  backup_window           = "03:00-04:00"
  maintenance_window      = "Mon:04:00-Mon:05:00"

  performance_insights_enabled          = true
  performance_insights_retention_period = 7
  monitoring_interval                   = 60
  monitoring_role_arn                   = aws_iam_role.rds_monitoring.arn

  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]

  tags = {
    Name = "${var.project_name}-${var.environment}-postgres"
  }

  lifecycle {
    ignore_changes = [
      snapshot_identifier,
      final_snapshot_identifier,
    ]
  }
}

# =============================================================================
# Store Database URL in Secrets Manager
# =============================================================================

resource "aws_secretsmanager_secret" "database_url" {
  name                    = "${var.project_name}/${var.environment}/database"
  description             = "Database connection URL for Listo CRM"
  recovery_window_in_days = 0

  tags = {
    Name = "${var.project_name}-${var.environment}-database-secret"
  }
}

resource "aws_secretsmanager_secret_version" "database_url" {
  secret_id = aws_secretsmanager_secret.database_url.id
  secret_string = jsonencode({
    DATABASE_URL = "postgresql://${aws_db_instance.main.username}:${urlencode(random_password.db_password.result)}@${aws_db_instance.main.endpoint}/${aws_db_instance.main.db_name}?schema=public"
    DB_HOST      = aws_db_instance.main.address
    DB_PORT      = aws_db_instance.main.port
    DB_NAME      = aws_db_instance.main.db_name
    DB_USERNAME  = aws_db_instance.main.username
    DB_PASSWORD  = random_password.db_password.result
  })
}
