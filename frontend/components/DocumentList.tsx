// frontend/components/DocumentList.tsx
'use client';

import React, { useEffect } from 'react';
import { Trash2, FileText, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { useDocumentStore } from '../lib/store';
import { documentsApi } from '../lib/api';
import { formatFileSize, formatDate, getFileIcon } from '../lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const DocumentList: React.FC = () => {
  const queryClient = useQueryClient();
  const { documents, setDocuments, removeDocument, isLoading, setLoading } = useDocumentStore();

  // 获取文档列表
  const { data: fetchedDocuments, isLoading: queryLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: documentsApi.getAll,
  });

  // 删除文档
  const deleteMutation = useMutation({
    mutationFn: documentsApi.delete,
    onSuccess: (_, documentId) => {
      removeDocument(documentId);
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
    onError: (error) => {
      console.error('Failed to delete document:', error);
    },
  });

  useEffect(() => {
    if (fetchedDocuments) {
      setDocuments(fetchedDocuments);
    }
  }, [fetchedDocuments, setDocuments]);

  useEffect(() => {
    setLoading(queryLoading);
  }, [queryLoading, setLoading]);

  const handleDelete = (id: string, filename: string) => {
    if (window.confirm(`确定要删除文档 "${filename}" 吗？此操作不可撤销。`)) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-200 h-20 rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          还没有上传任何文档
        </h3>
        <p className="text-gray-500">
          上传一些文档来开始使用AI问答功能
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          已上传的文档 ({documents.length})
        </h2>
      </div>

      <div className="grid gap-4">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <div className="text-2xl">
                  {getFileIcon(doc.mimeType)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {doc.originalName}
                  </h3>
                  <div className="mt-1 text-sm text-gray-500 space-y-1">
                    <div className="flex items-center space-x-4">
                      <span>{formatFileSize(doc.size)}</span>
                      <span className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(doc.uploadedAt)}</span>
                      </span>
                    </div>
                    {doc.chunkCount && (
                      <div className="text-xs text-gray-400">
                        已处理为 {doc.chunkCount} 个文本块
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(doc.id, doc.originalName)}
                disabled={deleteMutation.isPending}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentList;