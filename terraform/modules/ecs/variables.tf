variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "subnet_ids" {
  description = "List of private subnet IDs for ECS tasks"
  type        = list(string)
}

variable "security_group_id" {
  description = "Security group ID for ECS tasks"
  type        = string
}

variable "target_group_arn" {
  description = "ALB target group ARN"
  type        = string
}

# Task Definition
variable "cpu" {
  description = "CPU units for the task"
  type        = number
  default     = 512
}

variable "memory" {
  description = "Memory (MB) for the task"
  type        = number
  default     = 1024
}

variable "container_port" {
  description = "Container port"
  type        = number
  default     = 4000
}

# Service
variable "desired_count" {
  description = "Desired number of tasks"
  type        = number
  default     = 2
}

variable "min_capacity" {
  description = "Minimum number of tasks for auto-scaling"
  type        = number
  default     = 2
}

variable "max_capacity" {
  description = "Maximum number of tasks for auto-scaling"
  type        = number
  default     = 10
}

# Secrets ARNs
variable "database_secret_arn" {
  description = "ARN of the database secret"
  type        = string
}

variable "jwt_secret_arn" {
  description = "ARN of the JWT secret"
  type        = string
}

variable "google_secret_arn" {
  description = "ARN of the Google OAuth secret"
  type        = string
}

variable "encryption_secret_arn" {
  description = "ARN of the encryption key secret"
  type        = string
}

# S3
variable "uploads_bucket_name" {
  description = "S3 bucket name for uploads"
  type        = string
}

variable "uploads_bucket_arn" {
  description = "S3 bucket ARN for uploads"
  type        = string
}

# URLs
variable "frontend_url" {
  description = "Frontend URL for CORS"
  type        = string
}

variable "api_url" {
  description = "API URL for Google OAuth redirect"
  type        = string
}

# Redis
variable "redis_url" {
  description = "Redis connection URL"
  type        = string
}
