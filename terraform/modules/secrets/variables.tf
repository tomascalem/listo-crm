variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "jwt_secret" {
  description = "JWT signing secret"
  type        = string
  sensitive   = true
}

variable "jwt_access_expires_in" {
  description = "JWT access token expiration"
  type        = string
  default     = "15m"
}

variable "jwt_refresh_expires_in" {
  description = "JWT refresh token expiration"
  type        = string
  default     = "7d"
}

variable "google_client_id" {
  description = "Google OAuth client ID"
  type        = string
  sensitive   = true
  default     = ""
}

variable "google_client_secret" {
  description = "Google OAuth client secret"
  type        = string
  sensitive   = true
  default     = ""
}

variable "token_encryption_key" {
  description = "32-byte hex key for token encryption"
  type        = string
  sensitive   = true
}
