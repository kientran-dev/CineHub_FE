import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router';
import { Search, Film, ChevronDown, Crown, User, Heart, History, CreditCard, LogOut, Menu, X } from 'lucide-react';
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
import { movieService, type MovieResponse } from '../services/movieService';
import { userService } from '../services/userService';
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
      <button className="flex items-center gap-1 text-base hover:text-red-600 transition-colors whitespace-nowrap">
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
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [isPremium, setIsPremium] = useState(false);
  const [suggestions, setSuggestions] = useState<MovieResponse[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    genreService.getAllGenres()
      .then(setGenres)
      .catch(() => setGenres([]));
  }, []);

  // Fetch profile để lấy avatar và isPremium
  useEffect(() => {
    if (!isAuthenticated) { setAvatarUrl(''); setIsPremium(false); return; }
    userService.getMe()
      .then(p => { setAvatarUrl(p.avatar ?? ''); setIsPremium(p.isPremium ?? false); })
      .catch(() => { setAvatarUrl(''); setIsPremium(false); });
  }, [isAuthenticated]);

  // Debounced search: chỉ gọi API sau khi user dừng gõ 200ms
  const debouncedSearch = useCallback((query: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = query.trim().toLowerCase();
    if (!q) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const allMovies = await movieService.getAllMovies();
        const filtered = allMovies
          .filter(m =>
            m.title.toLowerCase().includes(q) ||
            (m.englishTitle && m.englishTitle.toLowerCase().includes(q))
          )
          .slice(0, 6);
        setSuggestions(filtered);
      } catch {
        setSuggestions([]);
      }
    }, 200);
  }, []);

  // Click ra ngoài thì đóng dropdown gợi ý
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      setShowSuggestions(false);
      navigate(`/movies/tim-kiem/${encodeURIComponent(q)}`);
      setSearchQuery('');
    }
  };

  const handleSelectSuggestion = (movie: MovieResponse) => {
    setShowSuggestions(false);
    setSearchQuery('');
    navigate(`/movie/${movie.id}`);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const displayName = user?.fullName || user?.username || 'Người dùng';
  const displayEmail = user?.email || '';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800/50 bg-[#0a0a0a]/95 backdrop-blur-md">
      <div className="container mx-auto flex h-20 items-center gap-6 px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-red-600">
          <Film className="h-8 w-8" />
          <span className="text-2xl font-bold">CineHub</span>
        </Link>

        {/* Search with Autocomplete */}
        <div ref={searchRef} className="relative flex-1 max-w-lg">
          <form onSubmit={handleSearch}>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 z-10" />
            <Input
              type="search"
              placeholder="Tìm kiếm phim..."
              className="pl-10 bg-gray-900 border-gray-700"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
                debouncedSearch(e.target.value);
              }}
              onFocus={() => { setShowSuggestions(true); debouncedSearch(searchQuery); }}
            />
          </form>

          {/* Dropdown gợi ý */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl z-[200] overflow-hidden">
              {suggestions.map((movie) => (
                <button
                  key={movie.id}
                  onClick={() => handleSelectSuggestion(movie)}
                  className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-gray-800 transition-colors text-left"
                >
                  {/* Poster nhỏ */}
                  <div className="w-10 h-14 rounded overflow-hidden flex-shrink-0 bg-gray-800">
                    {(movie.poster || movie.thumbnail) && (
                      <img
                        src={movie.poster || movie.thumbnail}
                        alt={movie.title}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    )}
                  </div>
                  {/* Thông tin phim */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{movie.title}</p>
                    {movie.englishTitle && (
                      <p className="text-xs text-gray-500 truncate">{movie.englishTitle}</p>
                    )}
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
                      {movie.releaseYear && <span>{movie.releaseYear}</span>}
                      {movie.imdbScore && (
                        <span className="text-yellow-500 font-medium">IMDb {movie.imdbScore}</span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
              {/* Nút xem tất cả kết quả */}
              <button
                onClick={() => {
                  setShowSuggestions(false);
                  navigate(`/movies/tim-kiem/${encodeURIComponent(searchQuery.trim())}`);
                  setSearchQuery('');
                }}
                className="w-full px-3 py-2.5 text-sm text-red-500 hover:bg-gray-800 transition-colors border-t border-gray-800 font-medium text-center"
              >
                Xem tất cả kết quả cho "{searchQuery.trim()}"
              </button>
            </div>
          )}
        </div>

        {/* Hamburger button — visible on < lg */}
        <button
          className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
          onClick={() => setMobileMenuOpen(v => !v)}
          aria-label="Menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Navigation — desktop */}
        <nav className="hidden lg:flex items-center gap-6">
          <Link to="/movies/phim-le" className="text-base hover:text-red-600 transition-colors whitespace-nowrap">
            Phim lẻ
          </Link>
          <Link to="/movies/phim-bo" className="text-base hover:text-red-600 transition-colors whitespace-nowrap">
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
          <Link to="/movies/tv-show" className="text-base hover:text-red-600 transition-colors whitespace-nowrap">
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
            <DropdownMenuTrigger
              className={`relative h-11 w-11 rounded-full cursor-pointer focus:outline-none ${
                isPremium
                  ? 'p-[2px] bg-gradient-to-tr from-yellow-400 via-amber-500 to-yellow-300 shadow-lg shadow-yellow-500/40'
                  : 'overflow-hidden bg-gray-700 flex items-center justify-center'
              }`}
            >
              <div className={`w-full h-full rounded-full overflow-hidden flex items-center justify-center ${
                isPremium ? 'bg-gray-900' : 'bg-gray-700'
              }`}>
                {avatarUrl
                  ? <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
                  : <span className="text-white font-bold text-sm">{displayName.charAt(0).toUpperCase()}</span>
                }
              </div>
              {isPremium && (
                <div className="absolute -top-0.5 -right-0.5 bg-yellow-500 rounded-full p-0.5">
                  <Crown className="h-2.5 w-2.5 text-black" />
                </div>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 bg-gray-900 border-gray-700 p-0 z-[9999]">
              <div className="flex items-start gap-3 px-4 py-3 border-b border-gray-700">
                <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center flex-shrink-0">
                  {avatarUrl
                    ? <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
                    : <span className="text-white font-bold text-lg">{displayName.charAt(0).toUpperCase()}</span>
                  }
                </div>
                <div className="flex flex-col">
                  <p className="text-sm font-medium text-white">{displayName}</p>
                  {isPremium && (
                    <span className="text-xs text-yellow-400 flex items-center gap-1">
                      <Crown className="h-3 w-3" /> Premium Member
                    </span>
                  )}
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

      {/* Mobile menu panel */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-800/50 bg-[#0a0a0a]/98 backdrop-blur-md animate-in slide-in-from-top-2 duration-200">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-1">
            <Link to="/movies/phim-le" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-lg text-base hover:bg-gray-800 hover:text-red-500 transition-colors">
              Phim lẻ
            </Link>
            <Link to="/movies/phim-bo" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-lg text-base hover:bg-gray-800 hover:text-red-500 transition-colors">
              Phim bộ
            </Link>
            <Link to="/movies/tv-show" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-lg text-base hover:bg-gray-800 hover:text-red-500 transition-colors">
              TV Show
            </Link>

            {genres.length > 0 && (
              <div className="px-4 py-3">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Thể loại</p>
                <div className="flex flex-wrap gap-2">
                  {genres.map(g => (
                    <button
                      key={g.id}
                      onClick={() => { navigate(`/movies/the-loai/${encodeURIComponent(g.name)}`); setMobileMenuOpen(false); }}
                      className="px-3 py-1.5 text-xs rounded-full bg-gray-800 border border-gray-700 text-gray-300 hover:border-red-600 hover:text-red-500 transition-colors"
                    >
                      {g.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="px-4 py-3">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Quốc gia</p>
              <div className="flex flex-wrap gap-2">
                {countries.map(c => (
                  <button
                    key={c.id}
                    onClick={() => { navigate(`/movies/quoc-gia/${encodeURIComponent(c.name)}`); setMobileMenuOpen(false); }}
                    className="px-3 py-1.5 text-xs rounded-full bg-gray-800 border border-gray-700 text-gray-300 hover:border-red-600 hover:text-red-500 transition-colors"
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-800 mt-2 pt-2">
              <Link to="/subscription" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-4 py-3 rounded-lg text-yellow-500 hover:bg-gray-800 transition-colors">
                <Crown className="h-4 w-4" />
                Premium
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}