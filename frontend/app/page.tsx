// frontend/app/page.tsx
import { Upload, MessageSquare, FileText, Brain } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../components/ui/button';

export default function HomePage() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <Brain className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI智能知识库管理系统
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            上传您的文档，让AI帮您快速找到答案。基于最新的RAG技术，实现精准的文档问答体验。
          </p>
        </div>
        
        <div className="flex justify-center space-x-4">
          <Link href="/upload">
            <Button size="lg" className="px-8">
              开始上传文档
            </Button>
          </Link>
          <Link href="/chat">
            <Button variant="outline" size="lg" className="px-8">
              立即体验问答
            </Button>
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-8">
        <div className="text-center p-6 bg-white rounded-lg shadow-sm">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
            <Upload className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            智能文档上传
          </h3>
          <p className="text-gray-600">
            支持PDF、TXT、Markdown等多种格式，自动解析和向量化处理
          </p>
        </div>

        <div className="text-center p-6 bg-white rounded-lg shadow-sm">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
            <Brain className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            RAG技术问答
          </h3>
          <p className="text-gray-600">
            基于检索增强生成技术，提供准确的上下文相关答案
          </p>
        </div>

        <div className="text-center p-6 bg-white rounded-lg shadow-sm">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4">
            <MessageSquare className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            自然语言交互
          </h3>
          <p className="text-gray-600">
            像聊天一样提问，AI会基于您的文档内容给出精准回答
          </p>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
          工作原理
        </h2>
        
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-primary text-white rounded-full mb-3 text-lg font-bold">
              1
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">上传文档</h4>
            <p className="text-sm text-gray-600">
              上传PDF、TXT或MD格式的文档到系统
            </p>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-primary text-white rounded-full mb-3 text-lg font-bold">
              2
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">智能处理</h4>
            <p className="text-sm text-gray-600">
              系统自动分块并转换为向量存储
            </p>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-primary text-white rounded-full mb-3 text-lg font-bold">
              3
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">提出问题</h4>
            <p className="text-sm text-gray-600">
              用自然语言向AI提问关于文档的内容
            </p>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-primary text-white rounded-full mb-3 text-lg font-bold">
              4
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">获得答案</h4>
            <p className="text-sm text-gray-600">
              AI基于文档内容提供准确的答案
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}