// frontend/lib/api.ts
import axios from 'axios';
import { Document, ChatResponse, UploadResponse } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use((config) => {
  console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
  return config;
});

// 响应拦截器
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const documentsApi = {
  // 获取所有文档
  getAll: async (): Promise<Document[]> => {
    const response = await api.get('/api/documents');
    return response.data;
  },

  // 上传文档
  upload: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/api/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / (progressEvent.total || 1)
        );
        console.log(`Upload progress: ${percentCompleted}%`);
      },
    });
    
    return response.data;
  },

  // 删除文档
  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/documents/${id}`);
  },
};

export const chatApi = {
  // 发送聊天消息
  sendMessage: async (message: string): Promise<ChatResponse> => {
    const response = await api.post('/api/chat', { message });
    return response.data;
  },
};

export default api;