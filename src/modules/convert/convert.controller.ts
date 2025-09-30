import { Controller, Get, Param, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { ConvertService } from './convert.service';
import { ConversionTask } from './interfaces/conversion.interface';

@Controller('convert')
export class ConvertController {
  constructor(private readonly convertService: ConvertService) {}

  @Get('status/:fileId')
  getConversionStatus(@Param('fileId') fileId: string) {
    const task = this.convertService.getTask(fileId);
    if (!task) {
      throw new NotFoundException('任务不存在');
    }

    // 添加下载URL
    const response: any = { ...task };
    if (task.status === 'converted') {
      response.pdfUrl = `/download/${fileId}`;
    }

    return {
      success: true,
      data: response,
    };
  }

  @Get('start/:fileId')
  async startConversion(@Param('fileId') fileId: string) {
    try {
      const pdfPath = await this.convertService.convertToPdf(fileId);
      
      return {
        success: true,
        data: {
          message: '转换完成',
          pdfPath: pdfPath,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(`转换失败: ${error.message}`);
    }
  }
}