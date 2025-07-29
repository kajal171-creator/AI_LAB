import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuid } from 'uuid';
import { UPLOAD_STRATEGY } from '../constants/constants';

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
  }

  async upload(buffer: Buffer): Promise<string> {
    switch (this.strategy) {
      case UPLOAD_STRATEGY.AWS:
        return this.uploadToS3(buffer);
      case UPLOAD_STRATEGY.ON_PREM:
        return this.uploadToLocal(buffer);
      default:
        throw new Error(`Unknown UPLOAD_STRATEGY: ${this.strategy}`);
    }
  }

  private async uploadToS3(buffer: Buffer): Promise<string> {
    const key = `images/${uuid()}.png`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: 'image/png',
    });

    await this.s3Client.send(command);

    return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  }

  private async uploadToLocal(buffer: Buffer): Promise<string> {
    const filename = `${uuid()}.png`;
    // TODO: HAVE TO PROVISION FOR UPLOADING FILE TO ON PREM

    // const uploadPath = path.join(__dirname, '../../uploads/images');

    // if (!fs.existsSync(uploadPath)) {
    //   fs.mkdirSync(uploadPath, { recursive: true });
    // }

    // const filePath = path.join(uploadPath, filename);
    // fs.writeFileSync(filePath, buffer);

    // // You can customize the URL path if serving files statically via Express
    return `on-prem-uploaded-url`;
  }
}
