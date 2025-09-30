import { Module } from '@nestjs/common';
import { ConvertController } from './convert.controller';
import { DownloadController } from './download.controller';
import { ConvertService } from './convert.service';

@Module({
  controllers: [ConvertController, DownloadController],
  providers: [ConvertService],
  exports: [ConvertService],
})
export class ConvertModule {}