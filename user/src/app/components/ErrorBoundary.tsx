import { useRouteError, isRouteErrorResponse, Link } from 'react-router';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import { Button } from './ui/button';

export default function ErrorBoundary() {
  const error = useRouteError();

  let title = 'Đã có lỗi xảy ra';
  let message = 'Xin lỗi, trang bạn yêu cầu đã gặp sự cố không mong muốn hoặc không tồn tại.';

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      title = '404 - Không tìm thấy trang';
      message = 'Trang bạn đang tìm kiếm có thể đã bị xóa, đổi tên hoặc tạm thời không truy cập được.';
    } else {
      title = `${error.status} - Lỗi hệ thống`;
      message = error.statusText;
    }
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <Header />
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="bg-gray-900/50 p-8 rounded-2xl border border-gray-800 text-center max-w-lg w-full mx-auto">
          <div className="mx-auto w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold mb-4 text-white">{title}</h1>
          <p className="text-gray-400 mb-8">{message}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              className="bg-gray-800 hover:bg-gray-700 text-white gap-2"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-4 w-4" />
              Tải lại trang
            </Button>
            <Link to="/">
              <Button className="w-full sm:w-auto bg-red-600 hover:bg-red-700 gap-2">
                <Home className="h-4 w-4" />
                Về trang chủ
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
