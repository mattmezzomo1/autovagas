import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

export const getMulterConfig = (
  configService: ConfigService,
  destination: string = 'uploads',
  fileFilter?: (req: any, file: Express.Multer.File, callback: (error: Error | null, acceptFile: boolean) => void) => void,
): MulterOptions => {
  const maxFileSize = configService.get<number>('upload.maxFileSize', 5 * 1024 * 1024); // 5MB default
  const allowedMimeTypes = configService.get<string[]>('upload.allowedMimeTypes', [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ]);

  return {
    storage: diskStorage({
      destination: `./uploads/${destination}`,
      filename: (req, file, callback) => {
        const uniqueSuffix = uuidv4();
        const ext = extname(file.originalname);
        callback(null, `${uniqueSuffix}${ext}`);
      },
    }),
    limits: {
      fileSize: maxFileSize,
    },
    fileFilter: fileFilter || ((req, file, callback) => {
      if (allowedMimeTypes.includes(file.mimetype)) {
        callback(null, true);
      } else {
        callback(
          new BadRequestException(
            `Unsupported file type. Allowed types: ${allowedMimeTypes.join(', ')}`,
          ),
          false,
        );
      }
    }),
  };
};

export const getImageMulterConfig = (
  configService: ConfigService,
  destination: string = 'images',
): MulterOptions => {
  return getMulterConfig(
    configService,
    destination,
    (req, file, callback) => {
      if (file.mimetype.match(/image\/(jpg|jpeg|png|gif)$/)) {
        callback(null, true);
      } else {
        callback(
          new BadRequestException('Only image files (jpg, jpeg, png, gif) are allowed'),
          false,
        );
      }
    },
  );
};

export const getDocumentMulterConfig = (
  configService: ConfigService,
  destination: string = 'documents',
): MulterOptions => {
  return getMulterConfig(
    configService,
    destination,
    (req, file, callback) => {
      if (
        file.mimetype.match(/application\/(pdf|msword|vnd.openxmlformats-officedocument.wordprocessingml.document)$/) ||
        file.mimetype === 'text/plain'
      ) {
        callback(null, true);
      } else {
        callback(
          new BadRequestException('Only document files (pdf, doc, docx, txt) are allowed'),
          false,
        );
      }
    },
  );
};
