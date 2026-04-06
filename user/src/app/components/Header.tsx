import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { Search, Film, ChevronDown, Crown, User, Heart, History, CreditCard, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useAuth } from '../contexts/AuthContext';
import { genreService, type GenreResponse } from '../services/genreService';
import { countries } from '../data/mockData';

function HoverDropdown({
  label,
  items,
  columns = 2,
  onSelect,
}: {
  label: string;
  items: { id: string | number; name: string }[];
  columns?: number;
  onSelect: (item: { id: string | number; name: string }) => void;
}) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  };
  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 150);
  };

  const cols = items.length > 8 ? columns : 1;

  return (
    <div className="relative" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <button className="flex items-center gap-1 text-sm hover:text-red-600 transition-colors whitespace-nowrap">
        {label}
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div
          className="absolute top-full left-0 mt-1 rounded-md bg-gray-900 border border-gray-700 py-2 z-[100] shadow-xl"
          style={{ minWidth: cols > 1 ? `${cols * 160}px` : '180px' }}
        >
          <div
            className="grid gap-0"
            style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
          >
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setOpen(false);
                  onSelect(item);
                }}
                className="text-left px-4 py-2 text-sm text-white hover:bg-gray-800 hover:text-red-500 transition-colors whitespace-nowrap"
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [genres, setGenres] = useState<GenreResponse[]>([]);

  useEffect(() => {
    genreService.getAllGenres()
      .then(setGenres)
      .catch(() => setGenres([]));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Search:', searchQuery);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const displayName = user?.fullName || user?.username || 'Người dùng';
  const displayEmail = user?.email || '';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800/50 bg-[#0a0a0a]/95 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center gap-6 px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-red-600">
          <Film className="h-8 w-8" />
          <span className="text-xl font-bold">CineHub</span>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="relative flex-1 max-w-lg">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="search"
            placeholder="Tìm kiếm phim..."
            className="pl-10 bg-gray-900 border-gray-700"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        {/* Navigation */}
        <nav className="hidden lg:flex items-center gap-6">
          <Link to="/movies/phim-le" className="text-sm hover:text-red-600 transition-colors whitespace-nowrap">
            Phim lẻ
          </Link>
          <Link to="/movies/phim-bo" className="text-sm hover:text-red-600 transition-colors whitespace-nowrap">
            Phim bộ
          </Link>
          {genres.length > 0 && (
            <HoverDropdown
              label="Thể loại"
              items={genres}
              columns={3}
              onSelect={(item) => navigate(`/movies/the-loai/${encodeURIComponent(item.name)}`)}
            />
          )}
          <HoverDropdown
            label="Quốc gia"
            items={countries}
            columns={3}
            onSelect={(item) => navigate(`/movies/quoc-gia/${encodeURIComponent(item.name)}`)}
          />
          <Link to="/movies/tv-show" className="text-sm hover:text-red-600 transition-colors whitespace-nowrap">
            TV Show
          </Link>
        </nav>

        <div className="flex-1" />

        {/* Premium */}
        <Button
          variant="outline"
          size="sm"
          className="hidden md:flex gap-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white whitespace-nowrap"
          onClick={() => navigate('/subscription')}
        >
          <Crown className="h-4 w-4" />
          Premium
        </Button>

        {/* User Menu hoặc Đăng nhập */}
        {isAuthenticated ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative h-10 w-10 rounded-full overflow-hidden cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-600 bg-gray-700 flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 bg-gray-900 border-gray-700 p-0 z-[9999]">
              <div className="flex items-start gap-3 px-4 py-3 border-b border-gray-700">
                <Avatar className="h-12 w-12">
                  <AvatarImage src="" alt={displayName} />
                  <AvatarFallback className="bg-gray-700">{displayName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <p className="text-sm font-medium text-white">{displayName}</p>
                  <p className="text-xs text-gray-400">{displayEmail}</p>
                </div>
              </div>
              <div className="py-2">
                <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer px-4 py-2.5 focus:bg-gray-800 text-white">
                  <User className="h-4 w-4 mr-3" /><span>Hồ sơ</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/favorites')} className="cursor-pointer px-4 py-2.5 focus:bg-gray-800 text-white">
                  <Heart className="h-4 w-4 mr-3" /><span>Phim yêu thích</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/history')} className="cursor-pointer px-4 py-2.5 focus:bg-gray-800 text-white">
                  <History className="h-4 w-4 mr-3" /><span>Lịch sử xem</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/subscription')} className="cursor-pointer px-4 py-2.5 focus:bg-gray-800 text-white">
                  <CreditCard className="h-4 w-4 mr-3" /><span>Quản lý gói dịch vụ</span>
                </DropdownMenuItem>
              </div>
              <DropdownMenuSeparator className="bg-gray-700" />
              <div className="py-2">
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer px-4 py-2.5 focus:bg-gray-800 text-red-500 hover:text-red-400">
                  <LogOut className="h-4 w-4 mr-3" /><span>Đăng xuất</span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            className="bg-red-600 hover:bg-red-700 whitespace-nowrap"
            size="sm"
            onClick={() => navigate('/auth')}
          >
            Đăng nhập
          </Button>
        )}
      </div>
    </header>
  );
}