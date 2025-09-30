import { Module } from '@nestjs/common';
import { ConversionQueue } from './conversion.queue';
import { ConvertModule } from '../modules/convert/convert.module';

@Module({
  imports: [ConvertModule],
  providers: [ConversionQueue],
  exports: [ConversionQueue],
})
export class QueueModule {}