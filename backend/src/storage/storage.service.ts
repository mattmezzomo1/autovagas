import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StorageService {
  private s3: AWS.S3;

  constructor(private configService: ConfigService) {
    this.s3 = new AWS.S3({
      accessKeyId: this.configService.get('aws.accessKeyId'),
      secretAccessKey: this.configService.get('aws.secretAccessKey'),
      region: this.configService.get('aws.region'),
    });
  }

  async uploadFile(file: Express.Multer.File, folder: string): Promise<{ path: string }> {
    const bucketName = this.configService.get('aws.s3.bucketName');
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${folder}/${uuidv4()}.${fileExtension}`;

    const params = {
      Bucket: bucketName,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'private',
    };

    await this.s3.upload(params).promise();

    return { path: fileName };
  }

  async deleteFile(path: string): Promise<void> {
    const bucketName = this.configService.get('aws.s3.bucketName');

    const params = {
      Bucket: bucketName,
      Key: path,
    };

    await this.s3.deleteObject(params).promise();
  }

  async getSignedUrl(path: string): Promise<string> {
    const bucketName = this.configService.get('aws.s3.bucketName');

    const params = {
      Bucket: bucketName,
      Key: path,
      Expires: 3600, // URL expires in 1 hour
    };

    return this.s3.getSignedUrlPromise('getObject', params);
  }
}
