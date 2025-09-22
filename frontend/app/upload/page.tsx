// frontend/app/upload/page.tsx
import FileUpload from '../../components/FileUpload';

export default function UploadPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          上传文档
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          上传您的PDF、TXT或Markdown文档，系统将自动处理并准备用于AI问答。
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <FileUpload />
      </div>

      <div className="max-w-2xl mx-auto bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          📋 上传须知
        </h3>
        <ul className="space-y-2 text-blue-800 text-sm">
          <li>• 支持文件格式：PDF、TXT、MD</li>
          <li>• 单个文件最大大小：10MB</li>
          <li>• 文档将被自动分块处理，用于提高问答准确性</li>
          <li>• 处理完成后即可在AI问答中使用</li>
        </ul>
      </div>
    </div>
  );
}