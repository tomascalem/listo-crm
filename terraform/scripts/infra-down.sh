#!/bin/bash
set -e

# Infrastructure Down Script
# Takes a snapshot of RDS and destroys all infrastructure to save costs

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_DIR="$SCRIPT_DIR/../environments/production"

echo "=== Infrastructure Down ==="
echo "This will:"
echo "  1. Create an RDS snapshot (preserves your data)"
echo "  2. Destroy all AWS infrastructure"
echo "  3. Keep: RDS snapshot, S3 upload bucket contents (optional)"
echo ""

# Check AWS credentials
if ! aws sts get-caller-identity &>/dev/null; then
    echo "Error: AWS credentials not configured"
    exit 1
fi

# Get current timestamp for snapshot name
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
SNAPSHOT_ID="listo-crm-production-${TIMESTAMP}"

echo "Step 1: Creating RDS snapshot..."
echo "  Snapshot ID: $SNAPSHOT_ID"

# Get RDS instance identifier
RDS_INSTANCE=$(aws rds describe-db-instances \
    --query "DBInstances[?contains(DBInstanceIdentifier, 'listo-crm-production')].DBInstanceIdentifier" \
    --output text 2>/dev/null || echo "")

if [ -z "$RDS_INSTANCE" ]; then
    echo "  No RDS instance found (may already be destroyed)"
else
    echo "  Found RDS instance: $RDS_INSTANCE"

    # Create snapshot
    aws rds create-db-snapshot \
        --db-instance-identifier "$RDS_INSTANCE" \
        --db-snapshot-identifier "$SNAPSHOT_ID" \
        --tags Key=Environment,Value=production Key=Project,Value=listo-crm

    echo "  Waiting for snapshot to complete..."
    aws rds wait db-snapshot-available \
        --db-snapshot-identifier "$SNAPSHOT_ID"

    echo "  Snapshot created successfully!"
fi

echo ""
echo "Step 2: Destroying infrastructure with Terraform..."
cd "$ENV_DIR"

# Initialize terraform if needed
terraform init -input=false

# Destroy with auto-approve
terraform destroy -auto-approve

echo ""
echo "=== Infrastructure Down Complete ==="
echo ""
echo "Snapshot ID: $SNAPSHOT_ID"
echo "Save this ID! You'll need it to restore."
echo ""
echo "To bring infrastructure back up:"
echo "  ./infra-up.sh $SNAPSHOT_ID"
echo ""
echo "Estimated monthly cost while down: ~\$2-5"
