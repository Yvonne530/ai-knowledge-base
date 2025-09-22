// frontend/app/documents/page.tsx
import DocumentList from '../../components/DocumentList';
import Link from 'next/link';
import { Button } from '../../components/ui/button';
import { Plus } from 'lucide-react';

export default function DocumentsPage() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            文档管理
          </h1>
          <p className="text-gray-600">
            查看和管理您上传的所有文档。
          </p>
        </div>
        
        <Link href="/upload">
          <Button className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>上传新文档</span>
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <DocumentList />
      </div>
    </div>
  );
}