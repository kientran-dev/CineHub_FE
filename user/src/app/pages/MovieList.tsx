import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router';
import { Film, Filter, Search, Loader2, X, SlidersHorizontal } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import MovieCard from '../components/MovieCard';
import { movieService } from '../services/movieService';
import { genreService } from '../services/genreService';
import { toMovieList } from '../utils/movieAdapter';
import type { Movie } from '../data/mockData';
import { countries } from '../data/mockData';

const PAGE_SIZE = 18;

const typeConfig: Record<string, { title: string; apiType: string | null; description: string }> = {
  'phim-le': {
    title: 'Phim Lẻ',
    apiType: 'MOVIE',
    description: 'Tổng hợp các bộ phim lẻ hay nhất, đa dạng thể loại từ hành động, tâm lý đến kinh dị, lãng mạn.',
  },
  'phim-bo': {
    title: 'Phim Bộ',
    apiType: 'SERIES',
    description: 'Kho phim bộ đặc sắc với hàng trăm tập phim hấp dẫn từ nhiều quốc gia trên thế giới.',
  },
  'tv-show': {
    title: 'TV Show',
    apiType: 'TV_SHOW',
    description: 'Tổng hợp các chương trình truyền hình, reality show, gameshow hấp dẫn nhất.',
  },
};

// Component chip tag cho multi-select
function FilterTagGroup({
  label,
  options,
  selected,
  onToggle,
  onClear,
}: {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (val: string) => void;
  onClear: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const SHOW_LIMIT = 8;
  const visible = expanded ? options : options.slice(0, SHOW_LIMIT);
  const hasMore = options.length > SHOW_LIMIT;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</span>
        {selected.length > 0 && (
          <button
            onClick={onClear}
            className="text-xs text-red-500 hover:text-red-400 transition-colors flex items-center gap-0.5"
          >
            <X className="h-3 w-3" />
            Xoá ({selected.length})
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {visible.map(opt => {
          const isActive = selected.includes(opt);
          return (
            <button
              key={opt}
              onClick={() => onToggle(opt)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-150 ${isActive
                  ? 'bg-red-600 border-red-600 text-white shadow-sm shadow-red-600/30'
                  : 'bg-gray-800/80 border-gray-700 text-gray-300 hover:border-red-600/50 hover:text-white'
                }`}
            >
              {opt}
            </button>
          );
        })}
        {hasMore && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="px-2.5 py-1 rounded-full text-xs border border-dashed border-gray-600 text-gray-500 hover:border-red-600 hover:text-red-500 transition-colors"
          >
            {expanded ? '− Thu gọn' : `+${options.length - SHOW_LIMIT} nữa`}
          </button>
        )}
      </div>
    </div>
  );
}

export default function MovieList() {
  const { type, filterType, filterValue } = useParams();

  const isGenreFilter = filterType === 'the-loai';
  const isCountryFilter = filterType === 'quoc-gia';
  const decodedFilterValue = filterValue ? decodeURIComponent(filterValue) : '';

  const config = isGenreFilter
    ? {
      title: `Thể loại: ${decodedFilterValue}`,
      apiType: null as string | null,
      description: `Danh sách phim thuộc thể loại ${decodedFilterValue}.`,
    }
    : isCountryFilter
      ? {
        title: `Quốc gia: ${decodedFilterValue}`,
        apiType: null as string | null,
        description: `Danh sách phim của ${decodedFilterValue}.`,
      }
      : typeConfig[type || ''] || typeConfig['phim-le'];

  const [allMovies, setAllMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [genres, setGenres] = useState<{ id: number; name: string }[]>([]);

  // Multi-select state (arrays)
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [showFilters, setShowFilters] = useState(true);

  // Reset & pre-select khi đổi route
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
    setSearchQuery('');
    setSortBy('newest');
    setSelectedYears([]);

    if (isGenreFilter && decodedFilterValue) {
      setSelectedGenres([decodedFilterValue]);
      setSelectedCountries([]);
    } else if (isCountryFilter && decodedFilterValue) {
      setSelectedCountries([decodedFilterValue]);
      setSelectedGenres([]);
    } else {
      setSelectedGenres([]);
      setSelectedCountries([]);
    }
  }, [type, filterType, filterValue]);

  // Fetch movies
  useEffect(() => {
    setLoading(true);
    movieService.getAllMovies()
      .then(data => {
        let filtered = data;
        if (!isGenreFilter && !isCountryFilter && (config as any).apiType) {
          filtered = data.filter(m => m.type?.toUpperCase() === (config as any).apiType);
        }
        setAllMovies(toMovieList(filtered));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [type, filterType, filterValue]);

  // Fetch genres
  useEffect(() => {
    genreService.getAllGenres()
      .then(g => setGenres(g))
      .catch(() => setGenres([]));
  }, []);

  const years = useMemo(() => {
    const ySet = new Set(allMovies.map(m => m.year).filter(y => y > 0));
    return Array.from(ySet).sort((a, b) => b - a).map(String);
  }, [allMovies]);

  const countryNames = countries.map(c => c.name);
  const genreNames = genres.map(g => g.name);

  const filteredMovies = useMemo(() => {
    let result = [...allMovies];

    if (selectedGenres.length > 0) {
      result = result.filter(m =>
        selectedGenres.some(sg => {
          const slug = sg.toLowerCase().replace(/\s+/g, '-');
          return m.categories.some(c => c === slug || c.includes(slug));
        })
      );
    }
    if (selectedCountries.length > 0) {
      result = result.filter(m =>
        selectedCountries.some(sc => {
          const sc_lower = sc.toLowerCase();
          return (
            m.country?.toLowerCase() === sc_lower ||
            m.country?.toLowerCase().includes(sc_lower) ||
            sc_lower.includes(m.country?.toLowerCase() ?? '___')
          );
        })
      );
    }
    if (selectedYears.length > 0) {
      result = result.filter(m => selectedYears.includes(String(m.year)));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(m =>
        m.title.toLowerCase().includes(q) ||
        (m.englishTitle && m.englishTitle.toLowerCase().includes(q))
      );
    }

    switch (sortBy) {
      case 'newest': result.sort((a, b) => b.year - a.year); break;
      case 'oldest': result.sort((a, b) => a.year - b.year); break;
      case 'rating': result.sort((a, b) => (b.imdbRating ?? b.rating) - (a.imdbRating ?? a.rating)); break;
      case 'name': result.sort((a, b) => a.title.localeCompare(b.title, 'vi')); break;
    }

    return result;
  }, [allMovies, selectedGenres, selectedCountries, selectedYears, sortBy, searchQuery]);

  const visibleMovies = filteredMovies.slice(0, visibleCount);
  const hasMore = visibleCount < filteredMovies.length;

  const toggleGenre = (val: string) =>
    setSelectedGenres(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);
  const toggleCountry = (val: string) =>
    setSelectedCountries(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);
  const toggleYear = (val: string) =>
    setSelectedYears(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);

  const hasActiveFilters = selectedGenres.length > 0 || selectedCountries.length > 0 || selectedYears.length > 0;

  const resetFilters = () => {
    setSelectedGenres([]);
    setSelectedCountries([]);
    setSelectedYears([]);
    setSortBy('newest');
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />

      {/* Hero Banner */}
      <div className="relative bg-gradient-to-b from-red-950/20 via-[#0f0a0a] to-[#0a0a0a] py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-3">
            <Film className="h-8 w-8 text-red-500" />
            <h1 className="text-4xl font-bold">{config.title}</h1>
          </div>
          <p className="text-gray-400 max-w-2xl">{config.description}</p>
          <p className="text-sm text-gray-500 mt-2">
            {loading
              ? 'Đang tải...'
              : <> Tìm thấy <span className="text-white font-semibold">{filteredMovies.length}</span> kết quả</>
            }
          </p>

          {/* Active filter tags */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mt-4">
              {selectedGenres.map(g => (
                <span key={g} className="flex items-center gap-1.5 bg-red-600/20 border border-red-600/40 text-red-400 text-sm px-4 py-1.5 rounded-full">
                  {g}
                  <button onClick={() => toggleGenre(g)} className="hover:text-white"><X className="h-4 w-4" /></button>
                </span>
              ))}
              {selectedCountries.map(c => (
                <span key={c} className="flex items-center gap-1.5 bg-blue-600/20 border border-blue-600/40 text-blue-400 text-sm px-4 py-1.5 rounded-full">
                  {c}
                  <button onClick={() => toggleCountry(c)} className="hover:text-white"><X className="h-4 w-4" /></button>
                </span>
              ))}
              {selectedYears.map(y => (
                <span key={y} className="flex items-center gap-1.5 bg-purple-600/20 border border-purple-600/40 text-purple-400 text-sm px-4 py-1.5 rounded-full">
                  {y}
                  <button onClick={() => toggleYear(y)} className="hover:text-white"><X className="h-4 w-4" /></button>
                </span>
              ))}
              <button onClick={resetFilters} className="text-xs text-gray-500 hover:text-red-500 transition-colors px-2 py-1">
                Xoá tất cả
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search & Filter toggle */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm border ${showFilters
                ? 'bg-red-600/20 border-red-600/40 text-red-400'
                : 'bg-gray-800 border-gray-700 hover:bg-gray-700 text-white'
              }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Bộ lọc
            {hasActiveFilters && (
              <span className="ml-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {selectedGenres.length + selectedCountries.length + selectedYears.length}
              </span>
            )}
          </button>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm trong danh sách..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm focus:outline-none focus:border-red-600 transition-colors"
            />
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm focus:outline-none focus:border-red-600"
          >
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
            <option value="rating">Đánh giá cao</option>
            <option value="name">Tên A-Z</option>
          </select>
        </div>

        {/* Filter Panel — multi-select chips */}
        {showFilters && (
          <div className="mb-8 p-5 rounded-xl bg-gray-900/60 border border-gray-800 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Thể loại */}
              {genreNames.length > 0 && (
                <FilterTagGroup
                  label="Thể loại"
                  options={genreNames}
                  selected={selectedGenres}
                  onToggle={toggleGenre}
                  onClear={() => setSelectedGenres([])}
                />
              )}

              {/* Quốc gia */}
              <FilterTagGroup
                label="Quốc gia"
                options={countryNames}
                selected={selectedCountries}
                onToggle={toggleCountry}
                onClear={() => setSelectedCountries([])}
              />

              {/* Năm */}
              {years.length > 0 && (
                <FilterTagGroup
                  label="Năm phát hành"
                  options={years}
                  selected={selectedYears}
                  onToggle={toggleYear}
                  onClear={() => setSelectedYears([])}
                />
              )}
            </div>
          </div>
        )}

        {/* Movie Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-red-600" />
          </div>
        ) : visibleMovies.length > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {visibleMovies.map(movie => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={() => setVisibleCount(prev => prev + PAGE_SIZE)}
                  className="px-8 py-3 rounded-lg bg-red-600 hover:bg-red-700 transition-colors font-semibold"
                >
                  Xem thêm ({filteredMovies.length - visibleCount} phim còn lại)
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <Film className="h-16 w-16 text-gray-700 mx-auto mb-4" />
            <p className="text-xl text-gray-400">Không tìm thấy phim nào</p>
            <p className="text-gray-500 mt-2">Hãy thử thay đổi bộ lọc để tìm phim phù hợp</p>
            {hasActiveFilters && (
              <button onClick={resetFilters} className="mt-4 px-6 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition-colors text-sm">
                Xoá bộ lọc
              </button>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}