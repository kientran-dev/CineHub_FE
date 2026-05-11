import { Link } from 'react-router';
import { Film, Facebook, Youtube, Instagram, Twitter, Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-gray-800/50 mt-16 overflow-hidden">
      {/* Background */}
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
            <p className="text-gray-500 text-sm mb-5 leading-relaxed max-w-xs">
              Nền tảng xem phim trực tuyến hàng đầu Việt Nam. Hàng ngàn bộ phim và chương trình truyền hình chất lượng cao.
            </p>

            {/* Social */}
            <div className="flex gap-3 mb-6">
              {[
                { Icon: Facebook, label: 'Facebook' },
                { Icon: Youtube, label: 'YouTube' },
                { Icon: Instagram, label: 'Instagram' },
                { Icon: Twitter, label: 'Twitter' },
              ].map(({ Icon, label }) => (
                <button
                  key={label}
                  onClick={() => toast.info(`${label} sẽ được cập nhật sau`)}
                  aria-label={label}
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-800/60 text-gray-400 hover:bg-red-600/20 hover:text-red-500 transition-all border border-gray-700/30"
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>

            {/* Contact */}
            <div className="space-y-1.5 text-sm text-gray-500">
              <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-gray-600" /> support@cinehub.vn</p>
              <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-gray-600" /> 1800 6868</p>
            </div>
          </div>

          {/* Khám phá */}
          <div>
            <h3 className="font-semibold mb-4 text-gray-300">Khám phá</h3>
            <ul className="space-y-2.5">
              {[
                { to: '/', label: 'Trang chủ' },
                { to: '/movies/phim-le', label: 'Phim lẻ' },
                { to: '/movies/phim-bo', label: 'Phim bộ' },
                { to: '/movies/tv-show', label: 'TV Show' },
                { to: '/subscription', label: 'Gói Premium' },
              ].map(link => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-gray-500 text-sm hover:text-red-500 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Hỗ trợ */}
          <div>
            <h3 className="font-semibold mb-4 text-gray-300">Hỗ trợ</h3>
            <ul className="space-y-2.5">
              {[
                'Trung tâm trợ giúp',
                'Điều khoản sử dụng',
                'Chính sách bảo mật',
                'Liên hệ',
                'Câu hỏi thường gặp',
              ].map(item => (
                <li key={item}>
                  <button onClick={() => toast.info(`${item} sẽ được cập nhật sau`)} className="text-gray-500 text-sm hover:text-red-500 transition-colors">
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800/50 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-600 text-sm">
            © {year} CineHub. All rights reserved.
          </p>
            <div className="flex items-center gap-4 text-xs text-gray-700">
              <button onClick={() => toast.info('Điều khoản sẽ được cập nhật sau')} className="hover:text-gray-500 transition-colors">Điều khoản</button>
              <span>·</span>
              <button onClick={() => toast.info('Chính sách bảo mật sẽ được cập nhật sau')} className="hover:text-gray-500 transition-colors">Bảo mật</button>
              <span>·</span>
              <button onClick={() => toast.info('Chính sách Cookie sẽ được cập nhật sau')} className="hover:text-gray-500 transition-colors">Cookie</button>
            </div>
        </div>
      </div>
    </footer>
  );
}
