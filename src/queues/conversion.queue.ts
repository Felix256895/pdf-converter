import { Injectable, Logger } from '@nestjs/common';
import { ConvertService } from '../modules/convert/convert.service';

@Injectable()
export class ConversionQueue {
  private readonly logger = new Logger(ConversionQueue.name);
  private queue: string[] = [];
  private isProcessing = false;

  constructor(private readonly convertService: ConvertService) {}

  // 添加转换任务到队列
  addTask(fileId: string): void {
    this.queue.push(fileId);
    this.logger.log(`任务 ${fileId} 已添加到队列，当前队列长度: ${this.queue.length}`);
    
    // 如果没有正在处理的任务，则开始处理
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  // 处理队列中的任务
  private async processQueue(): Promise<void> {
    if (this.queue.length === 0) {
      this.isProcessing = false;
      return;
    }

    this.isProcessing = true;
    const fileId = this.queue.shift();

    if (fileId) {
      try {
        this.logger.log(`开始处理任务 ${fileId}`);
        await this.convertService.convertToPdf(fileId);
        this.logger.log(`任务 ${fileId} 处理完成`);
      } catch (error) {
        this.logger.error(`任务 ${fileId} 处理失败: ${error.message}`);
      }
    }

    // 处理下一个任务
    this.processQueue();
  }

  // 获取队列状态
  getQueueStatus(): { length: number; isProcessing: boolean } {
    return {
      length: this.queue.length,
      isProcessing: this.isProcessing,
    };
  }
}