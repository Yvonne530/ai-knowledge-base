// frontend/app/chat/page.tsx
import ChatInterface from '../../components/ChatInterface';

export default function ChatPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          AI问答
        </h1>
        <p className="text-gray-600">
          向AI提问关于您上传文档的任何问题，获得基于内容的准确答案。
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm" style={{ height: '600px' }}>
        <ChatInterface />
      </div>
    </div>
  );
}