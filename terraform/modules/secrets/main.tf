# =============================================================================
# Secrets Manager - JWT Configuration
# =============================================================================

resource "aws_secretsmanager_secret" "jwt" {
  name                    = "${var.project_name}/${var.environment}/jwt"
  description             = "JWT configuration for Listo CRM"
  recovery_window_in_days = 7

  tags = {
    Name = "${var.project_name}-${var.environment}-jwt-secret"
  }
}

resource "aws_secretsmanager_secret_version" "jwt" {
  secret_id = aws_secretsmanager_secret.jwt.id
  secret_string = jsonencode({
    JWT_SECRET             = var.jwt_secret
    JWT_ACCESS_EXPIRES_IN  = var.jwt_access_expires_in
    JWT_REFRESH_EXPIRES_IN = var.jwt_refresh_expires_in
  })
}

# =============================================================================
# Secrets Manager - Google OAuth Configuration
# =============================================================================

resource "aws_secretsmanager_secret" "google" {
  name                    = "${var.project_name}/${var.environment}/google"
  description             = "Google OAuth configuration for Listo CRM"
  recovery_window_in_days = 7

  tags = {
    Name = "${var.project_name}-${var.environment}-google-secret"
  }
}

resource "aws_secretsmanager_secret_version" "google" {
  secret_id = aws_secretsmanager_secret.google.id
  secret_string = jsonencode({
    GOOGLE_CLIENT_ID     = var.google_client_id
    GOOGLE_CLIENT_SECRET = var.google_client_secret
  })
}

# =============================================================================
# Secrets Manager - Encryption Key
# =============================================================================

resource "aws_secretsmanager_secret" "encryption" {
  name                    = "${var.project_name}/${var.environment}/encryption"
  description             = "Token encryption key for Listo CRM"
  recovery_window_in_days = 7

  tags = {
    Name = "${var.project_name}-${var.environment}-encryption-secret"
  }
}

resource "aws_secretsmanager_secret_version" "encryption" {
  secret_id = aws_secretsmanager_secret.encryption.id
  secret_string = jsonencode({
    TOKEN_ENCRYPTION_KEY = var.token_encryption_key
  })
}
