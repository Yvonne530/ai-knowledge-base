// backend/src/documents/documents.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsService } from './documents.service';
import { PrismaService } from '../prisma/prisma.service';
import { VectorService } from '../vector/vector.service';

describe('DocumentsService', () => {
  let service: DocumentsService;
  let prisma: PrismaService;
  let vectorService: VectorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentsService,
        {
          provide: PrismaService,
          useValue: {
            document: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              delete: jest.fn(),
            },
            documentChunk: {
              createMany: jest.fn(),
            },
          },
        },
        {
          provide: VectorService,
          useValue: {
            chunkText: jest.fn().mockReturnValue(['chunk1', 'chunk2']),
            storeDocumentChunks: jest.fn(),
            deleteDocumentChunks: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<DocumentsService>(DocumentsService);
    prisma = module.get<PrismaService>(PrismaService);
    vectorService = module.get<VectorService>(VectorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return array of documents', async () => {
      const mockDocuments = [
        {
          id: '1',
          filename: 'test.pdf',
          originalName: 'test.pdf',
          mimeType: 'application/pdf',
          size: 1024,
          uploadedAt: new Date(),
          _count: { chunks: 5 },
        },
      ];

      jest.sp