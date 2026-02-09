import { S3Client } from '@aws-sdk/client-s3';
import { config } from './index.js';

// Create S3 client (only if AWS credentials are configured)
export const s3Client = config.aws.accessKeyId && config.aws.secretAccessKey
  ? new S3Client({
      region: config.aws.region,
      credentials: {
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey,
      },
    })
  : null;

export const S3_BUCKET = config.aws.s3Bucket;

// Check if S3 is configured
export const isS3Configured = (): boolean => {
  return s3Client !== null;
};
