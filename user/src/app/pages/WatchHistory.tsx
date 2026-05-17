import { useState, useEffect } from 'react';
import { Clock, Trash2, Loader2, Play } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { historyService, type WatchHistoryResponse } from '../services/historyService';
import { movieService } from '../services/movieService';
import { toMovie } from '../utils/movieAdapter';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router';
import type { Movie } from '../data/mockData';

interface HistoryItem extends Movie {
  historyId: number;
  movieId: number;
  episodeId: number;
  watchTime: number;
  watchDate: string;
  episodeName: string;
  currentEpisode: number;
  progressPercent: number;
}

export default function WatchHistory() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    if (!isAuthenticated) { setLoading(false); return; }
    try {
      const history = await historyService.getHistory();
      const allMovies = await movieService.getAllMovies();

      const mapped: HistoryItem[] = history
        .map((wh: WatchHistoryResponse) => {
          const apiMovie = allMovies.find(m => m.id === wh.movieId || m.title === wh.movieTitle);
          if (!apiMovie) return null;
          const durationSec = (apiMovie.duration ?? 0) * 60;
          const progressPercent = durationSec > 0
            ? Math.min(Math.round((wh.watchTime / durationSec) * 100), 100)
            : 0;
          return {
            ...toMovie(apiMovie),
            historyId: wh.id,
            movieId: apiMovie.id,
            episodeId: wh.episodeId,
            watchTime: wh.watchTime,
            watchDate: wh.watchDate,
            episodeName: wh.episodeName,
            currentEpisode: wh.currentEpisode,
            progressPercent,
          };
        })
        .filter(Boolean) as any[];

      // Loại bỏ trùng lặp (chỉ giữ bản ghi mới nhất cho mỗi phim)
      const uniqueMap = new Map<number, HistoryItem>();
      mapped.forEach(item => {
        const existing = uniqueMap.get(item.movieId);
        if (!existing || new Date(item.watchDate) > new Date(existing.watchDate)) {
          uniqueMap.set(item.movieId, item);
        }
      });

      const finalItems = Array.from(uniqueMap.values());
      finalItems.sort((a, b) => new Date(b.watchDate).getTime() - new Date(a.watchDate).getTime());
      setHistoryItems(finalItems);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, [isAuthenticated]);

  const handleDelete = async (historyId: number) => {
    try {
      await historyService.deleteHistory(historyId);
      setHistoryItems(prev => prev.filter(h => h.historyId !== historyId));
    } catch (e) {
      console.error(e);
    }
  };

  /** Navigate trực tiếp đến đúng tập đã xem gần nhất */
  const handleContinueWatch = (item: HistoryItem) => {
    if (item.episodeId) {
      navigate(`/watch/${item.movieId}?episode=${item.episodeId}`);
    } else {
      navigate(`/watch/${item.movieId}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />

      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1 h-8 bg-red-600 rounded-full" />
          <h1 className="text-3xl font-bold">Lịch sử xem</h1>
          {historyItems.length > 0 && (
            <span className="ml-2 text-sm text-gray-400 bg-gray-800 px-2 py-1 rounded">
              {historyItems.length} phim
            </span>
          )}
        </div>

        {!isAuthenticated ? (
          <div className="text-center py-20">
            <Clock className="h-16 w-16 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Đăng nhập để xem lịch sử xem phim</p>
            <button
              onClick={() => navigate('/auth')}
              className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              Đăng nhập
            </button>
          </div>
        ) : loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-red-600" />
          </div>
        ) : historyItems.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {historyItems.map((movie) => (
              <div key={movie.historyId} className="flex flex-col group/item">
                <div className="relative">
                  {/* Card với click navigate trực tiếp đến đúng tập */}
                  <div
                    onClick={() => handleContinueWatch(movie)}
                    className="cursor-pointer group relative overflow-hidden rounded-lg border border-gray-800/60 bg-gray-900/50 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-red-600/60 hover:shadow-xl hover:shadow-red-600/10"
                  >
                    <div className="relative aspect-[2/3] overflow-hidden">
                      <img
                        src={movie.poster}
                        alt={movie.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-center justify-center">
                        <div className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-lg shadow-red-600/30">
                          <Play className="h-5 w-5" />
                          <span className="font-medium">Xem tiếp</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="line-clamp-1 font-bold text-sm">{movie.title}</h3>
                      {movie.englishTitle && (
                        <p className="line-clamp-1 text-xs text-gray-500 mt-0.5">{movie.englishTitle}</p>
                      )}
                      <div className="mt-1.5 flex items-center gap-2 text-xs text-gray-500">
                        <span>{movie.year}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-600" />
                        <span>{movie.type === 'movie' ? 'Phim lẻ' : movie.type === 'tv_show' ? 'TV Show' : 'Phim bộ'}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(movie.historyId); }}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 opacity-0 group-hover/item:opacity-100 transition-opacity hover:bg-red-600/80 z-10"
                    title="Xóa khỏi lịch sử"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="mt-2 space-y-1 px-1">
                  <p className="text-xs text-gray-400 h-4">
                    {movie.currentEpisode ? `Tập ${movie.currentEpisode}` : 'Phim lẻ'}
                  </p>
                  <div className="relative h-1 w-full overflow-hidden rounded-full bg-gray-700">
                    <div
                      className="h-full bg-red-600 transition-all"
                      style={{ width: `${movie.progressPercent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>Đã xem {movie.progressPercent}%</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(movie.watchDate).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Clock className="h-16 w-16 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Bạn chưa xem phim nào</p>
            <p className="text-gray-500 mt-2">Lịch sử xem sẽ được hiển thị ở đây</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}