import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { statSync } from 'fs';
import { ConversionQueue } from '../../queues/conversion.queue';
import { ConvertService } from '../convert/convert.service';

@Controller('upload')
export class UploadController {
  private readonly logger = new Logger(UploadController.name);

  constructor(
    private readonly uploadService: UploadService,
    private readonly convertService: ConvertService,
    private readonly conversionQueue: ConversionQueue,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE || '52428800'), // 默认50MB
      },
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    this.logger.log('Received file upload request');
    
    if (!file) {
      this.logger.error('No file found in request');
      throw new BadRequestException('未找到文件');
    }

    this.logger.log(`File received: ${file.originalname}, size: ${file.size}, mimetype: ${file.mimetype}`);

    // 验证文件
    const validation = this.uploadService.validateFile(file);
    if (!validation.isValid) {
      this.logger.error(`File validation failed: ${validation.error}`);
      throw new BadRequestException(validation.error);
    }

    try {
      this.logger.log('Starting file save process');
      // 保存文件
      const { filePath, fileId } = await this.uploadService.saveFile(file);
      this.logger.log(`File saved successfully: ${filePath}, fileId: ${fileId}`);
      
      // 获取文件信息
      const stats = statSync(filePath);
      this.logger.log(`File stats retrieved: size: ${stats.size}`);
      
      // 创建转换任务
      this.logger.log('Creating conversion task');
      this.convertService.createTask(fileId, file.originalname, filePath);
      
      // 将转换任务添加到队列
      this.logger.log('Adding task to conversion queue');
      this.conversionQueue.addTask(fileId);

      this.logger.log('Upload process completed successfully');
      return {
        success: true,
        data: {
          fileId: fileId,
          originalName: file.originalname,
          size: stats.size,
          status: 'uploaded',
        },
      };
    } catch (error) {
      this.logger.error('Error during file upload process:', error);
      this.logger.error('Error stack:', error.stack);
      throw new InternalServerErrorException('文件保存失败');
    }
  }
}