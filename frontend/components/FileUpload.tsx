// frontend/components/FileUpload.tsx
'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { documentsApi } from '../lib/api';
import { useDocumentStore } from '../lib/store';
import { formatFileSize } from '../lib/utils';

const FileUpload: React.FC = () => {
  const [uploadingFiles, setUploadingFiles] = useState<Map<string, number>>(new Map());
  const [completedFiles, setCompletedFiles] = useState<Set<string>>(new Set());
  const { addDocument } = useDocumentStore();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newUploadingFiles = new Map(uploadingFiles);
    
    for (const file of acceptedFiles) {
      const fileId = `${file.name}-${Date.now()}`;
      newUploadingFiles.set(fileId, 0);
      setUploadingFiles(new Map(newUploadingFiles));

      try {
        // 模拟上传进度
        const progressInterval = setInterval(() => {
          setUploadingFiles(prev => {
            const current = prev.get(fileId) || 0;
            if (current < 90) {
              const newMap = new Map(prev);
              newMap.set(fileId, current + 10);
              return newMap;
            }
            return prev;
          });
        }, 200);

        const result = await documentsApi.upload(file);
        
        clearInterval(progressInterval);
        
        if (result.success && result.document) {
          // 完成上传
          setUploadingFiles(prev => {
            const newMap = new Map(prev);
            newMap.set(fileId, 100);
            return newMap;
          });
          
          setTimeout(() => {
            setCompletedFiles(prev => new Set([...prev, fileId]));
            addDocument(result.document!);
            
            setTimeout(() => {
              setUploadingFiles(prev => {
                const newMap = new Map(prev);
                newMap.delete(fileId);
                return newMap;
              });
              setCompletedFiles(prev => {
                const newSet = new Set(prev);
                newSet.delete(fileId);
                return newSet;
              });
            }, 2000);
          }, 500);
        }
      } catch (error) {
        console.error('Upload failed:', error);
        setUploadingFiles(prev => {
          const newMap = new Map(prev);
          newMap.delete(fileId);
          return newMap;
        });
      }
    }
  }, [uploadingFiles, addDocument]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-gray-300 hover:border-primary/50 hover:bg-gray-50'
          }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        
        {isDragActive ? (
          <p className="text-primary font-medium">释放文件以开始上传...</p>
        ) : (
          <div>
            <p className="text-gray-600 mb-2">
              拖拽文件到此处，或点击选择文件
            </p>
            <p className="text-sm text-gray-500">
              支持 PDF、TXT、MD 格式，最大 10MB
            </p>
          </div>
        )}
      </div>

      {/* 上传进度显示 */}
      {uploadingFiles.size > 0 && (
        <div className="mt-6 space-y-3">
          {Array.from(uploadingFiles.entries()).map(([fileId, progress]) => {
            const fileName = fileId.split('-')[0];
            const isCompleted = completedFiles.has(fileId);
            
            return (
              <div key={fileId} className="bg-white rounded-lg border p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <File className="h-5 w-5 text-gray-400" />
                    )}
                    <span className="text-sm font-medium text-gray-900">
                      {fileName}
                    </span>
                  </div>
                  
                  {isCompleted ? (
                    <span className="text-sm text-green-600 font-medium">
                      上传完成
                    </span>
                  ) : (
                    <span className="text-sm text-gray-500">
                      {progress}%
                    </span>
                  )}
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      isCompleted ? 'bg-green-500' : 'bg-primary'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>