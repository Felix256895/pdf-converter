export interface ConversionTask {
  id: string;
  originalFileName: string;
  filePath: string;
  status: 'uploaded' | 'converting' | 'converted' | 'failed';
  pdfPath?: string;
  createdAt: Date;
  updatedAt: Date;
  error?: string;
}