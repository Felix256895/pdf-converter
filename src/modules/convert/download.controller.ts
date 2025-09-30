import {
  Controller,
  Get,
  Param,
  NotFoundException,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { ConvertService } from './convert.service';
import type { Response } from 'express';
import { createReadStream } from 'fs';

@Controller('download')
export class DownloadController {
  constructor(private readonly convertService: ConvertService) {}

  @Get(':fileId')
  downloadPdf(@Param('fileId') fileId: string, @Res() res: Response) {
    const pdfPath = this.convertService.getPdfPath(fileId);
    
    if (!pdfPath) {
      throw new NotFoundException('PDF 文件不存在或转换未完成');
    }

    // 设置响应头
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${fileId}.pdf"`,
    });

    // 创建文件读取流并管道到响应
    const fileStream = createReadStream(pdfPath);
    fileStream.pipe(res);
  }
}