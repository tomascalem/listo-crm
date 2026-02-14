#!/bin/bash
set -e

# Infrastructure Up Script
# Recreates all infrastructure and restores RDS from snapshot

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_DIR="$SCRIPT_DIR/../environments/production"

SNAPSHOT_ID="${1:-}"

echo "=== Infrastructure Up ==="

# Check AWS credentials
if ! aws sts get-caller-identity &>/dev/null; then
    echo "Error: AWS credentials not configured"
    exit 1
fi

# List available snapshots if no ID provided
if [ -z "$SNAPSHOT_ID" ]; then
    echo "Available snapshots:"
    aws rds describe-db-snapshots \
        --query "DBSnapshots[?contains(DBSnapshotIdentifier, 'listo-crm-production')].{ID:DBSnapshotIdentifier,Created:SnapshotCreateTime,Status:Status}" \
        --output table
    echo ""
    echo "Usage: $0 <snapshot-id>"
    echo "  Or run without snapshot to create fresh database"
    echo ""
    read -p "Continue without snapshot (fresh database)? [y/N] " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

cd "$ENV_DIR"

echo ""
echo "Step 1: Initializing Terraform..."
terraform init -input=false

echo ""
echo "Step 2: Creating infrastructure..."

if [ -n "$SNAPSHOT_ID" ]; then
    echo "  Restoring from snapshot: $SNAPSHOT_ID"
    terraform apply -auto-approve \
        -var="db_snapshot_identifier=$SNAPSHOT_ID"
else
    echo "  Creating fresh database"
    terraform apply -auto-approve
fi

echo ""
echo "Step 3: Getting outputs..."
FRONTEND_URL=$(terraform output -raw frontend_url 2>/dev/null || echo "")
ECR_REPO=$(terraform output -raw ecr_repository_url 2>/dev/null || echo "")

echo ""
echo "=== Infrastructure Up Complete ==="
echo ""
echo "Frontend URL: $FRONTEND_URL"
echo "ECR Repository: $ECR_REPO"
echo ""

if [ -z "$SNAPSHOT_ID" ]; then
    echo "NOTE: Fresh database created. You may need to:"
    echo "  1. Run database migrations"
    echo "  2. Seed initial data"
fi

echo ""
echo "Next steps:"
echo "  1. Build and push Docker image to ECR"
echo "  2. Force ECS deployment if needed"
echo "  3. Update Google OAuth redirect URI if CloudFront URL changed"
