import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // 提供静态文件服务
  app.useStaticAssets(join(__dirname, '..', 'public'));
  
  app.useGlobalFilters(new HttpExceptionFilter());
  
  // 从配置中获取端口，默认为3000
  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port') || 3000;
  
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
