output "jwt_secret_arn" {
  description = "ARN of the JWT secret"
  value       = aws_secretsmanager_secret.jwt.arn
}

output "google_secret_arn" {
  description = "ARN of the Google OAuth secret"
  value       = aws_secretsmanager_secret.google.arn
}

output "encryption_secret_arn" {
  description = "ARN of the encryption key secret"
  value       = aws_secretsmanager_secret.encryption.arn
}

output "all_secret_arns" {
  description = "List of all secret ARNs"
  value = [
    aws_secretsmanager_secret.jwt.arn,
    aws_secretsmanager_secret.google.arn,
    aws_secretsmanager_secret.encryption.arn
  ]
}
