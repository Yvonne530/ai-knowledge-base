// backend/src/documents/dto/create-document.dto.ts
import { IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDocumentDto {
  @ApiProperty({ description: '文件名' })
  @IsString()
  filename: string;

  @ApiProperty({ description: '原始文件名' })
  @IsString()
  originalName: string;

  @ApiProperty({ description: 'MIME 类型' })
  @IsString()
  mimeType: string;

  @ApiProperty({ description: '文件大小' })
  @IsNumber()
  size: number;

  @ApiProperty({ description: '文件路径' })
  @IsString()
  filePath: string;
}

// backend/src/documents/dto/upload-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class UploadResponseDto {
  @ApiProperty({ description: '是否成功' })
  success: boolean;

  @ApiProperty({ description: '消息' })
  message?: string;

  @ApiProperty({ description: '文档信息', required: false })
  document?: {
    id: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    uploadedAt: Date;
    chunkCount?: number;
  };
}