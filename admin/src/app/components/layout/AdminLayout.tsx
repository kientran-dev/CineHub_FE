import { Link, Outlet, useLocation } from 'react-router';
import { 
  LayoutDashboard, 
  Film, 
  Users, 
  Grid3x3, 
  Crown,
  Menu,
  LogOut,
  Receipt
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { path: '/', label: 'Trang chủ', icon: <LayoutDashboard size={20} /> },
  { path: '/movies', label: 'Quản lý phim', icon: <Film size={20} /> },
  { path: '/accounts', label: 'Quản lý tài khoản', icon: <Users size={20} /> },
  { path: '/genres', label: 'Quản lý thể loại', icon: <Grid3x3 size={20} /> },
  { path: '/invoices', label: 'Quản lý hóa đơn', icon: <Receipt size={20} /> },
  { path: '/premium', label: 'Quản lý gói Premium', icon: <Crown size={20} /> },
];

export function AdminLayout() {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-gray-900 text-white transition-all duration-300 flex flex-col`}
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-gray-700">
          {isSidebarOpen && (
            <div className="flex items-center gap-2">
              <Film className="text-blue-400" size={28} />
              <span className="font-semibold text-lg">MovieAdmin</span>
            </div>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Menu size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    {item.icon}
                    {isSidebarOpen && <span>{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700">
          <button className="flex items-center gap-3 px-4 py-3 w-full text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors">
            <LogOut size={20} />
            {isSidebarOpen && <span>Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}