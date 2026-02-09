#!/bin/bash
# Bootstrap script to create S3 bucket and DynamoDB table for Terraform state
# Run this ONCE before running terraform init

set -e

AWS_REGION="${AWS_REGION:-us-east-1}"
BUCKET_NAME="listo-crm-terraform-state"
TABLE_NAME="listo-crm-terraform-locks"

echo "Creating S3 bucket for Terraform state..."
aws s3api create-bucket \
  --bucket "$BUCKET_NAME" \
  --region "$AWS_REGION" \
  ${AWS_REGION != "us-east-1" && echo "--create-bucket-configuration LocationConstraint=$AWS_REGION"} \
  2>/dev/null || echo "Bucket may already exist, continuing..."

echo "Enabling versioning on S3 bucket..."
aws s3api put-bucket-versioning \
  --bucket "$BUCKET_NAME" \
  --versioning-configuration Status=Enabled

echo "Enabling encryption on S3 bucket..."
aws s3api put-bucket-encryption \
  --bucket "$BUCKET_NAME" \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'

echo "Blocking public access on S3 bucket..."
aws s3api put-public-access-block \
  --bucket "$BUCKET_NAME" \
  --public-access-block-configuration '{
    "BlockPublicAcls": true,
    "IgnorePublicAcls": true,
    "BlockPublicPolicy": true,
    "RestrictPublicBuckets": true
  }'

echo "Creating DynamoDB table for state locking..."
aws dynamodb create-table \
  --table-name "$TABLE_NAME" \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region "$AWS_REGION" \
  2>/dev/null || echo "Table may already exist, continuing..."

echo ""
echo "Bootstrap complete!"
echo ""
echo "S3 Bucket: $BUCKET_NAME"
echo "DynamoDB Table: $TABLE_NAME"
echo ""
echo "You can now run: cd terraform/environments/production && terraform init"
