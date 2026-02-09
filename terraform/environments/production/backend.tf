terraform {
  backend "s3" {
    bucket         = "listo-crm-terraform-state"
    key            = "production/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "listo-crm-terraform-locks"
    encrypt        = true
  }
}
