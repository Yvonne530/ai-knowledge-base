// backend/src/documents/documents.controller.ts
import {
    Controller,
    Get,
    Post,
    Delete,
    Param,
    UseInterceptors,
    UploadedFile,
    BadRequestException,
  } from '@nestjs/common';
  import { FileInterceptor } from '@nestjs/platform-express';
  import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiResponse } from '@nestjs/swagger';
  import { DocumentsService } from './documents.service';
  import { UploadResponseDto } from './dto/upload-response.dto';
  
  @ApiTags('documents')
  @Controller('documents')
  export class DocumentsController {
    constructor(private readonly documentsService: DocumentsService) {}
  
    @Get()
    @ApiOperation({ summary: '获取所有文档' })
    @ApiResponse({ status: 200, description: '成功获取文档列表' })
    findAll() {
      return this.documentsService.findAll();
    }
  
    @Get(':id')
    @ApiOperation({ summary: '根据ID获取文档' })
    @ApiResponse({ status: 200, description: '成功获取文档详情' })
    @ApiResponse({ status: 404, description: '文档不存在' })
    findOne(@Param('id') id: string) {
      return this.documentsService.findOne(id);
    }
  
    @Post('upload')
    @UseInterceptors(FileInterceptor('file', {
      fileFilter: (req, file, callback) => {
        const allowedMimes = [
          'application/pdf',
          'text/plain',
          'text/markdown',
        ];
        
        if (allowedMimes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(
            new BadRequestException(
              'Invalid file type. Only PDF, TXT, and MD files are allowed.'
            ),
            false
          );
        }
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }))
    @ApiOperation({ summary: '上传文档' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
      description: '文档文件',
      type: 'multipart/form-data',
      schema: {
        type: 'object',
        properties: {
          file: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    })
    @ApiResponse({ 
      status: 201, 
      description: '文档上传成功',
      type: UploadResponseDto 
    })
    @ApiResponse({ status: 400, description: '文件格式不支持或文件过大' })
    uploadDocument(@UploadedFile() file: Express.Multer.File) {
      if (!file) {
        throw new BadRequestException('No file uploaded');
      }
  
      return this.documentsService.uploadDocument(file);
    }
  
    @Delete(':id')
    @ApiOperation({ summary: '删除文档' })
    @ApiResponse({ status: 200, description: '文档删除成功' })
    @ApiResponse({ status: 404, description: '文档不存在' })
    remove(@Param('id') id: string) {
      return this.documentsService.remove(id);
    }
  }
  
  