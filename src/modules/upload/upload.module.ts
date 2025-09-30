import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { ConvertModule } from '../convert/convert.module';
import { QueueModule } from '../../queues/queue.module';

@Module({
  imports: [ConvertModule, QueueModule],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}