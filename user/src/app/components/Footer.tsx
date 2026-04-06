import { Link } from 'react-router';
import { Film, Facebook, Youtube, Instagram, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative border-t border-gray-800/50 mt-16 overflow-hidden">
      {/* Subtle gradient bg */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-[#0d0d0d] to-[#0a0a0a]" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[200px] bg-red-900/5 rounded-full blur-3xl" />

      <div className="container relative mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 text-red-600 mb-4">
              <Film className="h-8 w-8" />
              <span className="text-2xl font-bold">CineHub</span>
            </Link>
            <p className="text-gray-500 text-sm mb-4 leading-relaxed">
              Nền tảng xem phim trực tuyến hàng đầu Việt Nam. Hàng ngàn bộ phim và chương trình truyền hình chất lượng cao.
            </p>
            <div className="flex gap-3">
              {[Facebook, Youtube, Instagram, Twitter].map((Icon, i) => (
                <a key={i} href="#" className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-800/60 text-gray-400 hover:bg-red-600/20 hover:text-red-500 transition-all border border-gray-700/30">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4 text-gray-300">Liên kết nhanh</h3>
            <ul className="space-y-2.5">
              {[
                { to: '/', label: 'Trang chủ' },
                { to: '/movies/phim-le', label: 'Phim lẻ' },
                { to: '/movies/phim-bo', label: 'Phim bộ' },
                { to: '/movies/phim-chieu-rap', label: 'Phim chiếu rạp' },
                { to: '/subscription', label: 'Gói Premium' },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-gray-500 text-sm hover:text-red-500 transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4 text-gray-300">Hỗ trợ</h3>
            <ul className="space-y-2.5">
              {['Trung tâm trợ giúp', 'Điều khoản sử dụng', 'Chính sách bảo mật', 'Liên hệ', 'Câu hỏi thường gặp'].map(item => (
                <li key={item}>
                  <a href="#" className="text-gray-500 text-sm hover:text-red-500 transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800/50 mt-10 pt-8 text-center">
          <p className="text-gray-600 text-sm">
            © {new Date().getFullYear()} CineHub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
