import { prisma } from '../config/database.js';
import { ApiError, parsePagination, paginatedResponse } from '../utils/apiResponse.js';
import { FileType, EntityType } from '@prisma/client';
import { s3Client, S3_BUCKET, isS3Configured } from '../config/s3.js';
import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

function ensureS3Configured() {
  if (!isS3Configured()) {
    throw new ApiError(503, 'File storage is not configured. Please configure AWS S3 credentials.');
  }
}

interface CreateFileInput {
  name: string;
  type: FileType;
  s3Key: string;
  s3Url: string;
  size: number;
  mimeType: string;
  entityType: EntityType;
  entityId: string;
  isInheritable?: boolean;
}

interface UpdateFileInput {
  name?: string;
  type?: FileType;
  isInheritable?: boolean;
}

export const fileService = {
  // Get files for an entity (with inheritance)
  async findByEntity(
    entityType: EntityType,
    entityId: string,
    query: { page?: string; limit?: string }
  ) {
    const { page, limit, skip } = parsePagination(query);

    // Build where clause based on entity type
    let where: Record<string, unknown>;

    if (entityType === 'venue') {
      // For venues, include inherited files from operator and concessionaires
      const venue = await prisma.venue.findUnique({
        where: { id: entityId },
        include: {
          concessionaires: { select: { concessionaireId: true } },
        },
      });

      if (!venue) throw new ApiError(404, 'Venue not found');

      const concessionaireIds = venue.concessionaires.map(c => c.concessionaireId);

      where = {
        OR: [
          { venueId: entityId },
          { operatorId: venue.operatorId, isInheritable: true },
          { concessionaireId: { in: concessionaireIds }, isInheritable: true },
        ],
      };
    } else if (entityType === 'operator') {
      where = { operatorId: entityId };
    } else {
      where = { concessionaireId: entityId };
    }

    const [files, total] = await Promise.all([
      prisma.venueFile.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          uploadedBy: { select: { id: true, name: true } },
        },
      }),
      prisma.venueFile.count({ where }),
    ]);

    return paginatedResponse(files, total, page, limit);
  },

  // Get file by ID
  async findById(id: string) {
    const file = await prisma.venueFile.findUnique({
      where: { id },
      include: {
        uploadedBy: { select: { id: true, name: true, email: true } },
        venue: { select: { id: true, name: true } },
        operator: { select: { id: true, name: true } },
        concessionaire: { select: { id: true, name: true } },
      },
    });

    if (!file) {
      throw new ApiError(404, 'File not found');
    }

    return file;
  },

  // Get pre-signed upload URL
  async getUploadUrl(
    fileName: string,
    mimeType: string,
    entityType: EntityType,
    entityId: string
  ) {
    ensureS3Configured();

    const fileExtension = fileName.split('.').pop() || '';
    const key = `files/${entityType}/${entityId}/${randomUUID()}.${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      ContentType: mimeType,
    });

    const uploadUrl = await getSignedUrl(s3Client!, command, { expiresIn: 900 }); // 15 minutes

    return {
      uploadUrl,
      s3Key: key,
      s3Url: `https://${S3_BUCKET}.s3.amazonaws.com/${key}`,
    };
  },

  // Create file record after upload
  async create(input: CreateFileInput, uploadedById: string) {
    // Build the entity connection
    const entityConnection: Record<string, string> = {};
    if (input.entityType === 'venue') {
      entityConnection.venueId = input.entityId;
    } else if (input.entityType === 'operator') {
      entityConnection.operatorId = input.entityId;
    } else {
      entityConnection.concessionaireId = input.entityId;
    }

    return prisma.venueFile.create({
      data: {
        name: input.name,
        type: input.type,
        s3Key: input.s3Key,
        s3Url: input.s3Url,
        size: input.size,
        mimeType: input.mimeType,
        entityType: input.entityType,
        isInheritable: input.isInheritable ?? false,
        uploadedById,
        ...entityConnection,
      },
      include: {
        uploadedBy: { select: { id: true, name: true } },
      },
    });
  },

  // Update file metadata
  async update(id: string, input: UpdateFileInput) {
    const existing = await prisma.venueFile.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError(404, 'File not found');
    }

    return prisma.venueFile.update({
      where: { id },
      data: input,
      include: {
        uploadedBy: { select: { id: true, name: true } },
      },
    });
  },

  // Delete file (also from S3)
  async delete(id: string) {
    const file = await prisma.venueFile.findUnique({ where: { id } });
    if (!file) {
      throw new ApiError(404, 'File not found');
    }

    // Delete from S3 if configured and file has s3Key
    if (isS3Configured() && file.s3Key) {
      try {
        const command = new DeleteObjectCommand({
          Bucket: S3_BUCKET,
          Key: file.s3Key,
        });
        await s3Client!.send(command);
      } catch (error) {
        console.error('Failed to delete file from S3:', error);
        // Continue with database deletion even if S3 fails
      }
    }

    return prisma.venueFile.delete({ where: { id } });
  },

  // Get pre-signed download URL
  async getDownloadUrl(id: string) {
    ensureS3Configured();

    const file = await prisma.venueFile.findUnique({ where: { id } });
    if (!file) {
      throw new ApiError(404, 'File not found');
    }

    if (!file.s3Key) {
      throw new ApiError(400, 'File does not have an S3 key');
    }

    const command = new GetObjectCommand({
      Bucket: S3_BUCKET,
      Key: file.s3Key,
      ResponseContentDisposition: `attachment; filename="${file.name}"`,
    });

    const downloadUrl = await getSignedUrl(s3Client!, command, { expiresIn: 3600 }); // 1 hour

    return { downloadUrl, fileName: file.name };
  },
};
