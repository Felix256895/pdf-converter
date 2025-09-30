import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createReadStream, createWriteStream, existsSync, mkdirSync, writeFileSync, appendFileSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(private configService: ConfigService) {
    // 确保上传目录存在
    const uploadDir = this.configService.get<string>('app.uploadDir') || './uploads';
    this.logger.log(`Upload directory: ${uploadDir}`);
    if (!existsSync(uploadDir)) {
      this.logger.log('Creating upload directory');
      mkdirSync(uploadDir, { recursive: true });
    }
  }

  async saveFile(file: Express.Multer.File): Promise<{ filePath: string; fileId: string }> {
    // 创建日志文件记录错误
    const logError = (message: string) => {
      try {
        const timestamp = new Date().toISOString();
        appendFileSync('./uploads/error.log', `[${timestamp}] ${message}\n`);
      } catch (logError) {
        // 如果日志记录失败，至少在控制台输出
        console.error('Failed to write to error log:', logError);
      }
    };

    try {
      const uploadDir = this.configService.get<string>('app.uploadDir') || './uploads';
      this.logger.log(`Saving file to directory: ${uploadDir}`);
      logError(`Saving file to directory: ${uploadDir}`);
      
      // 使用同步方式生成 UUID
      const fileId = uuidv4();
      const fileExtension = file.originalname.split('.').pop();
      const fileName = `${fileId}.${fileExtension}`;
      const filePath = join(uploadDir, fileName);
      
      this.logger.log(`File path: ${filePath}`);
      this.logger.log(`File size: ${file.buffer.length} bytes`);
      this.logger.log(`File original name: ${file.originalname}`);
      logError(`File path: ${filePath}, size: ${file.buffer.length}, original name: ${file.originalname}`);

      // 尝试使用writeFileSync保存文件（更简单的方式）
      try {
        this.logger.log('Attempting to save file using writeFileSync');
        logError('Attempting to save file using writeFileSync');
        writeFileSync(filePath, file.buffer);
        this.logger.log(`File saved successfully using writeFileSync: ${filePath}`);
        logError(`File saved successfully using writeFileSync: ${filePath}`);
      } catch (writeFileError) {
        this.logger.error('Error saving file with writeFileSync:', writeFileError);
        this.logger.error('Error stack:', writeFileError.stack);
        logError(`Error saving file with writeFileSync: ${writeFileError.message}`);
        logError(`Error stack: ${writeFileError.stack}`);
        throw writeFileError;
      }

      this.logger.log(`File saved successfully: ${filePath}`);
      logError(`File saved successfully: ${filePath}`);
      return { filePath, fileId };
    } catch (error) {
      this.logger.error('Error saving file:', error);
      this.logger.error('Error stack:', error.stack);
      logError(`Error saving file: ${error.message}`);
      logError(`Error stack: ${error.stack}`);
      throw error;
    }
  }

  validateFile(file: Express.Multer.File): { isValid: boolean; error?: string } {
    // 检查文件类型
    const allowedMimeTypes = [
      'application/msword', // .doc
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/vnd.ms-excel', // .xls
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-powerpoint', // .ppt
      'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
      'text/plain', // .txt
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      return {
        isValid: false,
        error: '不支持的文件类型。仅支持 .doc, .docx, .xls, .xlsx, .ppt, .pptx, .txt 文件。',
      };
    }

    // 检查文件大小
    const maxSize = this.configService.get<number>('app.maxFileSize') || 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: `文件大小超出限制。最大允许 ${maxSize / (1024 * 1024)}MB。`,
      };
    }

    return { isValid: true };
  }
}