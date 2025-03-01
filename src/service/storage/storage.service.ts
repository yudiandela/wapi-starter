import * as fs from 'fs';

import { Injectable } from '@nestjs/common';
import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { ParamUpload } from './storage.type';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.STORAGE_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.STORAGE_ACCESS_KEY!,
    secretAccessKey: process.env.STORAGE_SECRET_KEY!,
  },
});

@Injectable()
export class StorageService {
  async upload(param: ParamUpload) {
    try {
      const key = `wapi-starter/${param.name}`;
      const stream = fs.createReadStream(param.path);

      const upload = new Upload({
        client: s3Client,
        params: {
          Bucket: process.env.STORAGE_BUCKET_NAME,
          Key: key,
          Body: stream,
          ACL: 'public-read',
          ContentType: param.mimetype,
        },
      });

      await upload.done();
      fs.unlinkSync(param.path);

      return `${process.env.STORAGE_PUBLIC_URL}/${key}`;
    } catch {
      return '';
    }
  }
}
