import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  tempDir: process.env.TEMP_DIR || './temp',
  outputDir: process.env.OUTPUT_DIR || './output',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '52428800', 10), // 50MB default
  libreOfficePath: process.env.LIBREOFFICE_PATH || 'soffice',
}));