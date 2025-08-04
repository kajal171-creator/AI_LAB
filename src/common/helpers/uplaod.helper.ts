import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuid } from 'uuid';
import { UPLOAD_STRATEGY } from '../constants/constants';
import * as mime from 'mime-types';

export class UploaderService {
  private readonly strategy: string;
  private readonly s3Client: S3Client;

  constructor() {
    this.strategy = process.env.UPLOAD_STRATEGY;

    if (this.strategy === UPLOAD_STRATEGY.AWS) {
      this.s3Client = new S3Client({
        region: process.env.AWS_REGION,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      });
    }

    if (this.strategy === UPLOAD_STRATEGY.ON_PREM) {
      this.s3Client = new S3Client({
        region: 'us-east-1',
        endpoint: process.env.MINIO_ENDPOINT,
        forcePathStyle: true,
        credentials: {
          accessKeyId: process.env.MINIO_ACCESS_KEY,
          secretAccessKey: process.env.MINIO_SECRET_KEY,
        },
      });
    }
  }

  async upload(
    buffer: Buffer,
    options?: {
      mimetype?: string;
      fileName?: string;
      folder?: string;
    },
  ): Promise<string> {
    const mimeType = options?.mimetype || 'application/octet-stream';
    const extension = mime.extension(mimeType) || 'bin';
    const fileName = options?.fileName || `${uuid()}.${extension}`;
    const folder = options?.folder || 'uploads';

    switch (this.strategy) {
      case UPLOAD_STRATEGY.AWS:
        return this.uploadToS3(buffer, fileName, folder, mimeType);
      case UPLOAD_STRATEGY.ON_PREM:
        return this.uploadToLocal(buffer, fileName, folder);
      default:
        throw new Error(`Unknown UPLOAD_STRATEGY: ${this.strategy}`);
    }
  }

  private async uploadToS3(
    buffer: Buffer,
    fileName: string,
    folder: string,
    contentType: string,
  ): Promise<string> {
    const key = `${folder}/${fileName}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: buffer,
      // ACL: 'public-read',
      ContentType: contentType,
    });

    await this.s3Client.send(command);

    return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  }

  private async uploadToLocal(
    buffer: Buffer,
    fileName: string,
    folder: string,
  ): Promise<string> {
    const key = `${folder}/${fileName}`;
    const bucket = process.env.MINIO_BUCKET;

    if (!this.s3Client) {
      throw new Error('S3 client not initialized');
    }

    const contentType = mime.lookup(fileName) || 'application/octet-stream';

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ACL: 'public-read',

      ContentType: contentType,
    });

    await this.s3Client.send(command);

    return `${process.env.MINIO_ENDPOINT}/${bucket}/${key}`;
  }
}
