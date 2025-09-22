// backend/src/documents/documents.service.ts
import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VectorService } from '../vector/vector.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as pdfParse from 'pdf-parse';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);
  private readonly uploadDir = path.join(process.cwd(), 'uploads');

  constructor(
    private prisma: PrismaService,
    private vectorService: VectorService,
  ) {
    this.ensureUploadDir();
  }

  private async ensureUploadDir() {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
      this.logger.log(`📁 Created upload directory: ${this.uploadDir}`);
    }
  }

  /**
   * 获取所有文档
   */
  async findAll() {
    const documents = await this.prisma.document.findMany({
      include: {
        _count: {
          select: { chunks: true }
        }
      },
      orderBy: { uploadedAt: 'desc' }
    });

    return documents.map(doc => ({
      id: doc.id,
      filename: doc.filename,
      originalName: doc.originalName,
      mimeType: doc.mimeType,
      size: doc.size,
      uploadedAt: doc.uploadedAt,
      chunkCount: doc._count.chunks,
    }));
  }

  /**
   * 根据ID获取文档
   */
  async findOne(id: string) {
    const document = await this.prisma.document.findUnique({
      where: { id },
      include: { chunks: true }
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    return document;
  }

  /**
   * 上传并处理文档
   */
  async uploadDocument(file: Express.Multer.File) {
    try {
      // 生成唯一文件名
      const fileExtension = path.extname(file.originalname);
      const filename = `${uuidv4()}${fileExtension}`;
      const filePath = path.join(this.uploadDir, filename);

      // 保存文件
      await fs.writeFile(filePath, file.buffer);

      // 创建数据库记录
      const document = await this.prisma.document.create({
        data: {
          filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          filePath,
        }
      });

      // 异步处理文本内容和向量化
      this.processDocumentAsync(document.id, filePath, file.mimetype);

      this.logger.log(`✅ Document uploaded: ${file.originalname}`);

      return {
        success: true,
        message: 'Document uploaded successfully',
        document: {
          id: document.id,
          filename: document.filename,
          originalName: document.originalName,
          mimeType: document.mimeType,
          size: document.size,
          uploadedAt: document.uploadedAt,
        }
      };
    } catch (error) {
      this.logger.error('Failed to upload document:', error);
      throw new BadRequestException('Failed to upload document');
    }
  }

  /**
   * 异步处理文档内容
   */
  private async processDocumentAsync(documentId: string, filePath: string, mimeType: string) {
    try {
      // 提取文本内容
      const textContent = await this.extractTextFromFile(filePath, mimeType);
      
      if (!textContent.trim()) {
        this.logger.warn(`No text content extracted from document ${documentId}`);
        return;
      }

      // 分块处理
      const chunks = this.vectorService.chunkText(textContent);
      
      // 存储到向量数据库
      await this.vectorService.storeDocumentChunks(documentId, chunks);

      // 保存块信息到数据库
      const chunkData = chunks.map((content, index) => ({
        documentId,
        content,
        chunkIndex: index,
        embedding: [], // ChromaDB 中存储实际向量
        metadata: { length: content.length }
      }));

      await this.prisma.documentChunk.createMany({
        data: chunkData
      });

      this.logger.log(`✅ Processed document ${documentId} into ${chunks.length} chunks`);
    } catch (error) {
      this.logger.error(`Failed to process document ${documentId}:`, error);
    }
  }

  /**
   * 从文件提取文本内容
   */
  private async extractTextFromFile(filePath: string, mimeType: string): Promise<string> {
    const buffer = await fs.readFile(filePath);

    switch (mimeType) {
      case 'application/pdf':
        const pdfData = await pdfParse(buffer);
        return pdfData.text;

      case 'text/plain':
      case 'text/markdown':
        return buffer.toString('utf-8');

      default:
        throw new BadRequestException(`Unsupported file type: ${mimeType}`);
    }
  }

  /**
   * 删除文档
   */
  async remove(id: string) {
    const document = await this.findOne(id);

    try {
      // 从向量数据库删除
      await this.vectorService.deleteDocumentChunks(id);

      // 删除数据库记录（会级联删除 chunks）
      await this.prisma.document.delete({
        where: { id }
      });

      // 删除文件
      try {
        await fs.unlink(document.filePath);
      } catch (error) {
        this.logger.warn(`Failed to delete file ${document.filePath}:`, error);
      }

      this.logger.log(`✅ Document deleted: ${document.originalName}`);

      return { success: true, message: 'Document deleted successfully' };
    } catch (error) {
      this.logger.error('Failed to delete document:', error);
      throw new BadRequestException('Failed to delete document');
    }
  }
}