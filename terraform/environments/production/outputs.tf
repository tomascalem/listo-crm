# =============================================================================
# Outputs
# =============================================================================

output "vpc_id" {
  description = "VPC ID"
  value       = module.networking.vpc_id
}

# URLs
output "api_url" {
  description = "API URL (ALB)"
  value       = module.alb.api_url
}

output "frontend_url" {
  description = "Frontend URL (CloudFront)"
  value       = module.frontend.frontend_url
}

# ECR
output "ecr_repository_url" {
  description = "ECR repository URL"
  value       = module.ecs.ecr_repository_url
}

# S3
output "frontend_bucket_name" {
  description = "Frontend S3 bucket name"
  value       = module.frontend.bucket_name
}

output "uploads_bucket_name" {
  description = "Uploads S3 bucket name"
  value       = module.storage.bucket_name
}

# CloudFront
output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID (for cache invalidation)"
  value       = module.frontend.cloudfront_distribution_id
}

# ECS
output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = module.ecs.cluster_name
}

output "ecs_service_name" {
  description = "ECS service name"
  value       = module.ecs.service_name
}

# Database
output "rds_endpoint" {
  description = "RDS endpoint"
  value       = module.database.db_endpoint
  sensitive   = true
}

# Redis
output "redis_endpoint" {
  description = "Redis endpoint"
  value       = module.redis.redis_endpoint
}

# GitHub Actions
output "github_actions_role_arn" {
  description = "IAM role ARN for GitHub Actions"
  value       = aws_iam_role.github_actions.arn
}

# Monitoring
output "cloudwatch_dashboard_url" {
  description = "CloudWatch dashboard URL"
  value       = module.monitoring.dashboard_url
}

# Helpful commands
output "deploy_commands" {
  description = "Helpful deployment commands"
  value = {
    login_ecr           = "aws ecr get-login-password --region ${var.aws_region} | docker login --username AWS --password-stdin ${module.ecs.ecr_repository_url}"
    build_and_push      = "docker build -t ${module.ecs.ecr_repository_url}:latest ./server && docker push ${module.ecs.ecr_repository_url}:latest"
    update_ecs          = "aws ecs update-service --cluster ${module.ecs.cluster_name} --service ${module.ecs.service_name} --force-new-deployment"
    sync_frontend       = "aws s3 sync dist/ s3://${module.frontend.bucket_name} --delete"
    invalidate_cache    = "aws cloudfront create-invalidation --distribution-id ${module.frontend.cloudfront_distribution_id} --paths '/*'"
    view_logs           = "aws logs tail /ecs/${var.project_name}-${var.environment} --follow"
  }
}
