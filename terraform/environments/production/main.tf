# =============================================================================
# Listo CRM - Production Environment
# =============================================================================

locals {
  name_prefix = "${var.project_name}-${var.environment}"
}

# =============================================================================
# Networking
# =============================================================================

module "networking" {
  source = "../../modules/networking"

  project_name       = var.project_name
  environment        = var.environment
  vpc_cidr           = var.vpc_cidr
  availability_zones = var.availability_zones
  enable_nat_gateway = true
  single_nat_gateway = false # Set to true to save ~$35/month
}

# =============================================================================
# Secrets
# =============================================================================

module "secrets" {
  source = "../../modules/secrets"

  project_name         = var.project_name
  environment          = var.environment
  jwt_secret           = var.jwt_secret
  google_client_id     = var.google_client_id
  google_client_secret = var.google_client_secret
  token_encryption_key = var.token_encryption_key
}

# =============================================================================
# Database
# =============================================================================

module "database" {
  source = "../../modules/database"

  project_name        = var.project_name
  environment         = var.environment
  vpc_id              = module.networking.vpc_id
  subnet_ids          = module.networking.private_data_subnet_ids
  security_group_id   = module.networking.rds_security_group_id
  instance_class      = var.db_instance_class
  allocated_storage   = var.db_allocated_storage
  multi_az            = var.db_multi_az
  snapshot_identifier = var.db_snapshot_identifier
  deletion_protection = false  # Allow terraform destroy (snapshot taken first)
}

# =============================================================================
# Redis
# =============================================================================

module "redis" {
  source = "../../modules/redis"

  project_name      = var.project_name
  environment       = var.environment
  subnet_ids        = module.networking.private_data_subnet_ids
  security_group_id = module.networking.redis_security_group_id
  node_type         = var.redis_node_type
}

# =============================================================================
# Storage (S3 for uploads)
# =============================================================================

module "storage" {
  source = "../../modules/storage"

  project_name    = var.project_name
  environment     = var.environment
  allowed_origins = [module.frontend.frontend_url]
}

# =============================================================================
# Application Load Balancer
# =============================================================================

module "alb" {
  source = "../../modules/alb"

  project_name      = var.project_name
  environment       = var.environment
  vpc_id            = module.networking.vpc_id
  subnet_ids        = module.networking.public_subnet_ids
  security_group_id = module.networking.alb_security_group_id
}

# =============================================================================
# ECS (Fargate)
# =============================================================================

module "ecs" {
  source = "../../modules/ecs"

  project_name      = var.project_name
  environment       = var.environment
  aws_region        = var.aws_region
  vpc_id            = module.networking.vpc_id
  subnet_ids        = module.networking.private_app_subnet_ids
  security_group_id = module.networking.ecs_security_group_id
  target_group_arn  = module.alb.target_group_arn

  cpu           = var.ecs_cpu
  memory        = var.ecs_memory
  desired_count = var.ecs_desired_count
  min_capacity  = var.ecs_min_capacity
  max_capacity  = var.ecs_max_capacity

  database_secret_arn   = module.database.db_secret_arn
  jwt_secret_arn        = module.secrets.jwt_secret_arn
  google_secret_arn     = module.secrets.google_secret_arn
  encryption_secret_arn = module.secrets.encryption_secret_arn

  uploads_bucket_name = module.storage.bucket_name
  uploads_bucket_arn  = module.storage.bucket_arn

  frontend_url = module.frontend.frontend_url
  api_url      = module.frontend.frontend_url  # API accessed via CloudFront proxy
  redis_url    = module.redis.redis_url
}

# =============================================================================
# Frontend (S3 + CloudFront)
# =============================================================================

module "frontend" {
  source = "../../modules/frontend"

  project_name    = var.project_name
  environment     = var.environment
  api_domain_name = module.alb.alb_dns_name
}

# =============================================================================
# Monitoring
# =============================================================================

module "monitoring" {
  source = "../../modules/monitoring"

  project_name            = var.project_name
  environment             = var.environment
  aws_region              = var.aws_region
  ecs_cluster_name        = module.ecs.cluster_name
  ecs_service_name        = module.ecs.service_name
  alb_arn_suffix          = module.alb.alb_arn_suffix
  target_group_arn_suffix = module.alb.target_group_arn_suffix
  rds_instance_id         = module.database.db_instance_identifier
}

# =============================================================================
# GitHub Actions OIDC (for CI/CD)
# =============================================================================

# OIDC Provider for GitHub Actions
resource "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"

  client_id_list = ["sts.amazonaws.com"]

  thumbprint_list = [
    "6938fd4d98bab03faadb97b34396831e3780aea1",
    "1c58a3a8518e8759bf075b76b750d4f2df264fcd"
  ]

  tags = {
    Name = "${local.name_prefix}-github-oidc"
  }
}

# IAM Role for GitHub Actions
resource "aws_iam_role" "github_actions" {
  name = "${local.name_prefix}-github-actions"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Federated = aws_iam_openid_connect_provider.github.arn
      }
      Action = "sts:AssumeRoleWithWebIdentity"
      Condition = {
        StringLike = {
          "token.actions.githubusercontent.com:sub" = "repo:${var.github_org}/${var.github_repo}:*"
        }
        StringEquals = {
          "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
        }
      }
    }]
  })

  tags = {
    Name = "${local.name_prefix}-github-actions-role"
  }
}

# GitHub Actions Policy
resource "aws_iam_role_policy" "github_actions" {
  name = "github-actions-permissions"
  role = aws_iam_role.github_actions.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "ecr:InitiateLayerUpload",
          "ecr:UploadLayerPart",
          "ecr:CompleteLayerUpload",
          "ecr:PutImage"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "ecs:UpdateService",
          "ecs:DescribeServices",
          "ecs:DescribeTaskDefinition",
          "ecs:RegisterTaskDefinition",
          "ecs:RunTask"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "iam:PassRole"
        ]
        Resource = [
          module.ecs.task_role_arn,
          module.ecs.execution_role_arn
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          module.frontend.bucket_arn,
          "${module.frontend.bucket_arn}/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "cloudfront:CreateInvalidation"
        ]
        Resource = module.frontend.cloudfront_distribution_arn
      },
      # Terraform state management
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          "arn:aws:s3:::listo-crm-terraform-state",
          "arn:aws:s3:::listo-crm-terraform-state/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:DeleteItem"
        ]
        Resource = "arn:aws:dynamodb:${var.aws_region}:*:table/listo-crm-terraform-locks"
      },
      # RDS snapshot management
      {
        Effect = "Allow"
        Action = [
          "rds:CreateDBSnapshot",
          "rds:DeleteDBSnapshot",
          "rds:DescribeDBSnapshots",
          "rds:DescribeDBInstances",
          "rds:RestoreDBInstanceFromDBSnapshot"
        ]
        Resource = "*"
      },
      # Full infrastructure management (for terraform destroy/apply)
      {
        Effect = "Allow"
        Action = [
          "ec2:*",
          "elasticache:*",
          "rds:*",
          "secretsmanager:*",
          "logs:*",
          "cloudwatch:*",
          "sns:*",
          "iam:*",
          "s3:*",
          "cloudfront:*",
          "elasticloadbalancing:*"
        ]
        Resource = "*"
      }
    ]
  })
}
