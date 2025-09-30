import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { exec } from 'child_process';
import { promisify } from 'util';
import { join } from 'path';
import { existsSync, unlinkSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { ConversionTask } from './interfaces/conversion.interface';

const execAsync = promisify(exec);

@Injectable()
export class ConvertService {
  private readonly logger = new Logger(ConvertService.name);
  private tasks: Map<string, ConversionTask> = new Map();

  constructor(private readonly configService: ConfigService) {}

  // 创建转换任务
  createTask(fileId: string, originalFileName: string, filePath: string): ConversionTask {
    const now = new Date();
    const task: ConversionTask = {
      id: fileId,
      originalFileName,
      filePath,
      status: 'uploaded',
      createdAt: now,
      updatedAt: now,
    };

    this.tasks.set(fileId, task);
    this.logger.log(`创建转换任务: ${fileId}`);
    return task;
  }

  // 获取任务
  getTask(fileId: string): ConversionTask | undefined {
    return this.tasks.get(fileId);
  }

  // 更新任务状态
  private updateTaskStatus(fileId: string, status: ConversionTask['status']): void {
    const task = this.tasks.get(fileId);
    if (task) {
      task.status = status;
      task.updatedAt = new Date();
      this.tasks.set(fileId, task);
    }
  }

  // 转换为PDF
  async convertToPdf(fileId: string): Promise<string> {
    const task = this.tasks.get(fileId);
    if (!task) {
      throw new Error(`任务 ${fileId} 不存在`);
    }

    if (task.status !== 'uploaded') {
      throw new Error(`任务 ${fileId} 状态不正确: ${task.status}`);
    }

    this.updateTaskStatus(fileId, 'converting');
    this.logger.log(`开始转换文件: ${task.originalFileName}`);

    try {
      // LibreOffice 转换命令
      const libreOfficePath = this.configService.get<string>('app.libreOfficePath') || 'soffice';
      const outputDir = this.configService.get<string>('app.outputDir') || './output';

      if (!libreOfficePath || !outputDir) {
        throw new Error('缺少必要的配置: libreOfficePath 或 outputDir');
      }

      // 确保输出目录存在
      const { mkdir } = require('fs').promises;
      try {
        await mkdir(outputDir, { recursive: true });
      } catch (err) {
        this.logger.error(`创建输出目录失败: ${err.message}`);
      }

      // 构建转换命令
      const command = `"${libreOfficePath}" --headless --convert-to pdf --outdir "${outputDir}" "${task.filePath}"`;
      this.logger.log(`执行转换命令: ${command}`);

      // 执行转换
      const { stdout, stderr } = await execAsync(command);
      
      if (stderr) {
        this.logger.warn(`转换过程中的警告: ${stderr}`);
      }
      
      this.logger.log(`转换输出: ${stdout}`);

      // PDF 文件路径
      // 使用 fileId 作为 PDF 文件名，避免原始文件名中的特殊字符导致的问题
      const pdfFileName = `${fileId}.pdf`;
      const pdfPath = join(outputDir, pdfFileName);

      // 检查 PDF 是否生成成功
      if (!existsSync(pdfPath)) {
        throw new Error(`PDF 文件未生成: ${pdfPath}`);
      }

      // 更新任务信息
      task.pdfPath = pdfPath;
      this.updateTaskStatus(fileId, 'converted');

      this.logger.log(`文件转换完成: ${task.originalFileName} -> ${pdfFileName}`);
      return pdfPath;
    } catch (error) {
      this.logger.error(`转换失败: ${error.message}`, error.stack);
      this.updateTaskStatus(fileId, 'failed');
      throw error;
    }
  }

  // 清理原始文件
  cleanupOriginalFile(fileId: string): void {
    const task = this.tasks.get(fileId);
    if (task && task.filePath && existsSync(task.filePath)) {
      try {
        unlinkSync(task.filePath);
        this.logger.log(`原始文件已清理: ${task.filePath}`);
      } catch (error) {
        this.logger.error(`清理原始文件失败: ${error.message}`);
      }
    }
  }

  // 获取PDF路径
  getPdfPath(fileId: string): string | null {
    const task = this.tasks.get(fileId);
    return task && task.pdfPath ? task.pdfPath : null;
  }

  // 清理转换后的PDF文件
  cleanupPdfFile(fileId: string): void {
    const task = this.tasks.get(fileId);
    if (task && task.pdfPath && existsSync(task.pdfPath)) {
      try {
        unlinkSync(task.pdfPath);
        this.logger.log(`PDF文件已清理: ${task.pdfPath}`);
      } catch (error) {
        this.logger.error(`清理PDF文件失败: ${error.message}`);
      }
    }
  }
}