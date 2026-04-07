import { Link } from 'react-router';
import { Home, AlertTriangle } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <Header />
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="bg-gray-900/50 p-8 rounded-2xl border border-gray-800 text-center max-w-md w-full mx-auto">
          <div className="mx-auto w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-4xl font-bold mb-4 text-white">404</h1>
          <p className="text-xl text-gray-300 mb-2">Không tìm thấy trang</p>
          <p className="text-gray-500 mb-8 text-sm">
            Trang bạn đang tìm kiếm có thể đã bị xóa, thay đổi tên hoặc tạm thời không truy cập được.
          </p>
          <Link to="/">
            <Button className="w-full bg-red-600 hover:bg-red-700 h-12 text-base gap-2">
              <Home className="h-5 w-5" />
              Trở về trang chủ
            </Button>
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
