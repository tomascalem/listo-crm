# Listo CRM - AWS Infrastructure (Terraform)

This directory contains Terraform configurations to deploy Listo CRM to AWS.

## Architecture Overview

```
                              ┌─────────────────────────────────────────────────────┐
                              │                   VPC (10.0.0.0/16)                  │
                              │                                                      │
    ┌──────────┐              │  Public Subnets          Private App Subnets        │
    │CloudFront│──┐           │  ┌─────────────┐         ┌─────────────────┐        │
    │  (CDN)   │  │           │  │ NAT Gateway │         │  ECS Fargate    │        │
    └──────────┘  │           │  │     ALB     │────────▶│  (Node.js API)  │        │
         │        │           │  └─────────────┘         └────────┬────────┘        │
         ▼        │           │                                   │                 │
    ┌──────────┐  │           │  Private Data Subnets             │                 │
    │    S3    │  │           │  ┌─────────────────────────────────▼───────────┐    │
    │ Frontend │  │           │  │   RDS PostgreSQL     │    ElastiCache Redis │    │
    └──────────┘  │           │  └─────────────────────────────────────────────┘    │
                  │           └──────────────────────────────────────────────────────┘
    ┌──────────┐  │
    │    S3    │◀─┘
    │ Uploads  │
    └──────────┘
```

## Quick Start

### Prerequisites

- [Terraform](https://www.terraform.io/downloads) >= 1.0
- [AWS CLI](https://aws.amazon.com/cli/) configured with appropriate credentials
- An AWS account with appropriate permissions

### 1. Bootstrap State Backend

First, create the S3 bucket and DynamoDB table for Terraform state:

```bash
cd terraform/scripts
chmod +x init-backend.sh
./init-backend.sh
```

### 2. Configure Variables

```bash
cd terraform/environments/production
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars` with your values:

```hcl
project_name = "listo-crm"
environment  = "production"
aws_region   = "us-east-1"

# Secrets (keep these secure!)
jwt_secret           = "your-secure-jwt-secret"
google_client_id     = "your-google-oauth-client-id"
google_client_secret = "your-google-oauth-client-secret"
token_encryption_key = "32-character-hex-encryption-key"

# Optional: Email for alerts
alert_email = "alerts@example.com"
```

### 3. Deploy Infrastructure

```bash
cd terraform/environments/production

# Initialize Terraform
terraform init

# Preview changes
terraform plan

# Apply changes
terraform apply
```

### 4. Configure GitHub Repository Secrets

After deployment, add these secrets to your GitHub repository:

| Secret | Description |
|--------|-------------|
| `AWS_ACCOUNT_ID` | Your AWS account ID (from terraform output) |
| `CLOUDFRONT_DISTRIBUTION_ID` | CloudFront distribution ID (from terraform output) |
| `API_URL` | The ALB URL for your API |

### 5. Deploy Application

```bash
# Build and push Docker image
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
docker build -t listo-crm-api ./server
docker tag listo-crm-api:latest <ecr-repository-url>:latest
docker push <ecr-repository-url>:latest

# Force ECS deployment
aws ecs update-service --cluster listo-crm-production --service listo-crm-production-api --force-new-deployment

# Deploy frontend
pnpm build
aws s3 sync dist/ s3://listo-crm-frontend-production --delete
aws cloudfront create-invalidation --distribution-id <distribution-id> --paths "/*"
```

## Directory Structure

```
terraform/
├── environments/
│   └── production/           # Production environment
│       ├── main.tf           # Root module - composes all modules
│       ├── variables.tf      # Input variables
│       ├── outputs.tf        # Output values
│       ├── backend.tf        # S3 state backend config
│       ├── versions.tf       # Provider versions
│       └── terraform.tfvars  # Variable values (gitignored)
│
├── modules/
│   ├── networking/           # VPC, subnets, NAT, security groups
│   ├── secrets/              # AWS Secrets Manager
│   ├── database/             # RDS PostgreSQL
│   ├── redis/                # ElastiCache Redis
│   ├── storage/              # S3 bucket for uploads
│   ├── alb/                  # Application Load Balancer
│   ├── ecs/                  # ECS Fargate cluster & service
│   ├── frontend/             # S3 + CloudFront for React app
│   └── monitoring/           # CloudWatch alarms & dashboard
│
└── scripts/
    └── init-backend.sh       # Bootstrap S3/DynamoDB for state
```

## Modules

### networking
Creates VPC infrastructure:
- VPC (10.0.0.0/16)
- 2 public subnets (NAT, ALB)
- 2 private app subnets (ECS)
- 2 private data subnets (RDS, Redis)
- NAT Gateways (single or HA)
- VPC Endpoints (S3, ECR, Secrets Manager, CloudWatch)
- Security groups

### secrets
Manages application secrets:
- JWT secret
- Google OAuth credentials
- Token encryption key
- Database password (auto-generated)

### database
RDS PostgreSQL setup:
- db.t3.small instance (configurable)
- 20GB storage with auto-scaling
- Automated backups (7 days)
- Multi-AZ optional

### redis
ElastiCache Redis cluster:
- cache.t3.micro (configurable)
- For BullMQ job queues

### storage
S3 bucket for file uploads:
- Versioning enabled
- CORS configured for frontend
- Lifecycle rules for old versions

### alb
Application Load Balancer:
- HTTP listener (no custom domain)
- Health check on /health
- Target group for ECS

### ecs
ECS Fargate deployment:
- ECR repository
- Task definition with secrets
- Service with auto-scaling (2-10 tasks)
- IAM roles and policies

### frontend
Static site hosting:
- S3 bucket for assets
- CloudFront distribution
- SPA routing (404 → index.html)
- Optimized caching

### monitoring
Observability:
- CloudWatch alarms (CPU, memory, 5xx errors)
- SNS topic for alerts
- Dashboard with key metrics

## Outputs

After `terraform apply`, you'll see:

```
api_url           = "http://listo-crm-production-alb-123456.us-east-1.elb.amazonaws.com"
frontend_url      = "https://d1234abcd.cloudfront.net"
ecr_repository    = "123456789.dkr.ecr.us-east-1.amazonaws.com/listo-crm-api"
database_endpoint = "listo-crm-production.xxxx.us-east-1.rds.amazonaws.com:5432"
redis_endpoint    = "listo-crm-production.xxxx.cache.amazonaws.com:6379"
dashboard_url     = "https://us-east-1.console.aws.amazon.com/cloudwatch/home?..."
```

## CI/CD

GitHub Actions workflows are included:

- **`.github/workflows/deploy-api.yml`** - Deploys API on `server/**` changes
- **`.github/workflows/deploy-frontend.yml`** - Deploys frontend on `src/**` changes

Both use OIDC for secure authentication (no AWS secrets stored in GitHub).

## Cost Estimate

| Service | Monthly Cost |
|---------|-------------|
| ECS Fargate (2 tasks) | $30-40 |
| RDS PostgreSQL (db.t3.small) | $15-25 |
| ElastiCache Redis | $12-15 |
| ALB | $20-30 |
| NAT Gateway (single) | $35-50 |
| S3 + CloudFront | $10-25 |
| Other | $10-20 |
| **Total** | **$130-205/month** |

### Cost Optimization Tips

- Use single NAT Gateway (`enable_nat_gateway_ha = false`)
- Reserved Instances for RDS (30-40% savings)
- Fargate Spot for non-critical tasks

## Common Operations

### Run Database Migrations

```bash
# One-time migration task
aws ecs run-task \
  --cluster listo-crm-production \
  --task-definition listo-crm-production-api \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx]}" \
  --overrides '{"containerOverrides":[{"name":"api","command":["npx","prisma","migrate","deploy"]}]}'
```

### View Logs

```bash
aws logs tail /ecs/listo-crm-production-api --follow
```

### Scale Service

```bash
aws ecs update-service \
  --cluster listo-crm-production \
  --service listo-crm-production-api \
  --desired-count 4
```

### Destroy Infrastructure

```bash
# WARNING: This will delete all resources including data!
terraform destroy
```

## Troubleshooting

### ECS Tasks Failing to Start

1. Check CloudWatch logs: `/ecs/listo-crm-production-api`
2. Verify secrets exist in Secrets Manager
3. Check security group allows outbound traffic

### Database Connection Issues

1. Verify security group allows port 5432 from ECS
2. Check DATABASE_URL secret is correct
3. Ensure RDS is in the same VPC

### Frontend Not Loading

1. Check S3 bucket has files
2. Verify CloudFront distribution is deployed
3. Check for CORS issues in browser console

## Adding Custom Domain (Future)

To add a custom domain later:

1. Create Route53 hosted zone
2. Request ACM certificate (us-east-1 for CloudFront)
3. Update ALB with HTTPS listener
4. Update CloudFront with custom domain
5. Update CORS origins in the application
