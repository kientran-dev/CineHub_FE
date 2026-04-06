import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Play, Heart, Star, Crown, Calendar, Clock, Globe, Sparkles, Youtube, X, Loader2 } from 'lucide-react';
import Header from '../components/Header';
import MovieCard from '../components/MovieCard';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import CommentSection from '../components/CommentSection';
import { movieService, type MovieResponse } from '../services/movieService';
import { favoriteService } from '../services/favoriteService';
import { ratingService } from '../services/ratingService';
import { toMovie, toMovieList } from '../utils/movieAdapter';
import { useAuth } from '../contexts/AuthContext';
import type { Movie } from '../data/mockData';

export default function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [apiMovie, setApiMovie] = useState<MovieResponse | null>(null);
  const [allMovies, setAllMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [episodeRange, setEpisodeRange] = useState('all');
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  // Fetch movie detail
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      movieService.getMovieById(Number(id)),
      movieService.getAllMovies(),
    ]).then(([detail, all]) => {
      setApiMovie(detail);
      setMovie(toMovie(detail));
      setAllMovies(toMovieList(all.filter(m => m.id !== detail.id)).slice(0, 6));
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  // Fetch favorite & rating status nếu đã đăng nhập
  useEffect(() => {
    if (!isAuthenticated || !id) return;

    favoriteService.getFavorites()
      .then(favs => setIsFavorite(favs.some(f => f.movieId === Number(id))))
      .catch(() => {});

    ratingService.getMyRating(id)
      .then(r => { if (r) setUserRating(Math.round(r.score / 2)); })
      .catch(() => {});
  }, [isAuthenticated, id]);

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) { navigate('/auth'); return; }
    if (!id) return;
    setFavoriteLoading(true);
    try {
      if (isFavorite) {
        await favoriteService.removeFavorite(Number(id));
        setIsFavorite(false);
      } else {
        await favoriteService.addFavorite(Number(id));
        setIsFavorite(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleRate = async (r: number) => {
    if (!isAuthenticated) { navigate('/auth'); return; }
    if (!id) return;
    const score = r === userRating ? 0 : r;
    setUserRating(score);
    try {
      await ratingService.rateMovie(Number(id), score * 2); // chuyển 1-5 sao → 1-10 scale
    } catch (e) {
      console.error(e);
    }
  };

  const getFilteredEpisodes = () => {
    if (!movie?.episodes) return [];
    if (episodeRange === 'all') return movie.episodes;
    const [start, end] = episodeRange.split('-').map(Number);
    return movie.episodes.filter(ep => ep.episodeNumber >= start && ep.episodeNumber <= end);
  };

  const getEpisodeRanges = () => {
    if (!movie?.episodes || movie.episodes.length <= 20) return [];
    const ranges = [];
    const total = movie.episodes.length;
    for (let i = 1; i <= total; i += 20) {
      const end = Math.min(i + 19, total);
      ranges.push({ value: `${i}-${end}`, label: `Tập ${i} - ${end}` });
    }
    return ranges;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
        <Header />
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-red-600" />
        </div>
      </div>
    );
  }

  if (!movie || !apiMovie) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl">Không tìm thấy phim</h1>
          <button onClick={() => navigate('/')} className="mt-4 text-red-600 hover:underline">← Về trang chủ</button>
        </div>
      </div>
    );
  }

  const episodeRanges = getEpisodeRanges();
  const genreNames = apiMovie.genres?.map(g => g.name).join(', ');
  const actorsFromApi = apiMovie.actors ?? [];

  return (
    <>
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <Header />

        {/* Backdrop */}
        <div className="relative h-[60vh] overflow-hidden">
          <img
            src={movie.backdrop || movie.poster}
            alt={movie.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent" />
        </div>

        <div className="container mx-auto px-4 -mt-40 relative z-10 pb-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Poster */}
            <div className="flex-shrink-0">
              <img src={movie.poster} alt={movie.title} className="w-64 rounded-lg shadow-2xl" />
            </div>

            {/* Info */}
            <div className="flex-1 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-4xl font-bold">{movie.title}</h1>
                  {movie.englishTitle && (
                    <p className="text-xl text-gray-400 mt-1">{movie.englishTitle}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    {movie.isPremium && (
                      <div className="inline-flex items-center gap-1 rounded bg-yellow-600 px-3 py-1 text-sm">
                        <Crown className="h-4 w-4" />
                        Nội dung Premium
                      </div>
                    )}
                    <Badge className="bg-gray-700 text-white">Vietsub</Badge>
                  </div>
                </div>

                {/* Favorite button */}
                <Button
                  variant="outline"
                  size="icon"
                  className={`border-gray-600 flex-shrink-0 ${isFavorite ? 'bg-red-600 border-red-600' : ''}`}
                  onClick={handleToggleFavorite}
                  disabled={favoriteLoading}
                >
                  {favoriteLoading
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <Heart className={`h-5 w-5 ${isFavorite ? 'fill-white' : ''}`} />
                  }
                </Button>
              </div>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                {apiMovie.imdbScore && (
                  <div className="flex items-center gap-1 bg-yellow-500 px-2 py-1 rounded">
                    <span className="font-bold text-black">IMDb</span>
                    <span className="font-bold text-black">{apiMovie.imdbScore.toFixed(1)}</span>
                  </div>
                )}
                {(apiMovie.averageRating ?? 0) > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{apiMovie.averageRating?.toFixed(1)}</span>
                    <span className="text-gray-400">({apiMovie.totalRatings} đánh giá)</span>
                  </div>
                )}
                {apiMovie.releaseYear && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{apiMovie.releaseYear}</span>
                  </div>
                )}
                {apiMovie.duration && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{apiMovie.duration} phút</span>
                  </div>
                )}
                {apiMovie.country && (
                  <div className="flex items-center gap-1">
                    <Globe className="h-4 w-4" />
                    <span>{apiMovie.country}</span>
                  </div>
                )}
                {apiMovie.type?.toUpperCase() === 'SERIES' && apiMovie.episodes && (
                  <span className="text-gray-400">{apiMovie.episodes.length} tập</span>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-300 leading-relaxed">{apiMovie.description}</p>

              {/* Genres */}
              {genreNames && (
                <div>
                  <span className="text-gray-400">Thể loại: </span>
                  <span>{genreNames}</span>
                </div>
              )}

              {/* Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button
                  size="lg"
                  className="gap-2 bg-red-600 hover:bg-red-700"
                  onClick={() => navigate(`/watch/${movie.id}`)}
                >
                  <Play className="h-5 w-5" />
                  Xem ngay
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className={`gap-2 border-gray-600 ${isFavorite ? 'bg-red-600/20 border-red-600 text-red-500' : ''}`}
                  onClick={handleToggleFavorite}
                  disabled={favoriteLoading}
                >
                  <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                  {isFavorite ? 'Đã yêu thích' : 'Yêu thích'}
                </Button>

                {/* Star rating */}
                <div className="flex items-center gap-1 border border-gray-600 rounded-lg px-4 h-11">
                  <span className="text-sm text-gray-400 mr-1">Đánh giá:</span>
                  {[1, 2, 3, 4, 5].map(r => (
                    <button
                      key={r}
                      onClick={() => handleRate(r)}
                      onMouseEnter={() => setHoverRating(r)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-5 w-5 transition-colors ${
                          r <= (hoverRating || userRating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-600'
                        }`}
                      />
                    </button>
                  ))}
                  {userRating > 0 && (
                    <span className="text-xs text-yellow-400 ml-1 font-medium">
                      {['', 'Tệ', 'Tạm', 'Ổn', 'Hay', 'Xuất sắc'][userRating]}
                    </span>
                  )}
                </div>

                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 border-gray-600 hover:bg-red-900/20 hover:border-red-500 hover:text-red-400"
                  onClick={() => setTrailerOpen(true)}
                >
                  <Youtube className="h-5 w-5 text-red-500" />
                  Xem Trailer
                </Button>
              </div>
            </div>
          </div>

          {/* Diễn viên từ API */}
          {actorsFromApi.length > 0 && (
            <div className="mt-10">
              <h3 className="text-xl font-bold mb-4">Diễn viên</h3>
              <div className="flex gap-6 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                {actorsFromApi.map(actor => (
                  <div key={actor.id} className="flex flex-col items-center gap-2 flex-shrink-0">
                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-700 bg-gray-700">
                      {actor.imageUrl
                        ? <img src={actor.imageUrl} alt={actor.fullName} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-xl font-bold text-gray-400">
                            {actor.fullName?.charAt(0)}
                          </div>
                      }
                    </div>
                    <p className="text-sm font-medium text-center whitespace-nowrap">{actor.fullName}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tabs: Tập phim + Bình luận */}
          <Tabs
            defaultValue={apiMovie.type?.toUpperCase() === 'SERIES' ? 'episodes' : 'comments'}
            className="mt-12"
          >
            <TabsList className="bg-gray-900">
              {apiMovie.type?.toUpperCase() === 'SERIES' && (
                <TabsTrigger value="episodes">Tập phim</TabsTrigger>
              )}
              <TabsTrigger value="comments">Bình luận</TabsTrigger>
            </TabsList>

            {/* Danh sách tập (nếu là series) */}
            {apiMovie.type?.toUpperCase() === 'SERIES' && (
              <TabsContent value="episodes" className="mt-6">
                {episodeRanges.length > 0 && (
                  <div className="mb-6 flex items-center gap-3">
                    <span className="text-sm text-gray-400">Lọc tập:</span>
                    <Select value={episodeRange} onValueChange={setEpisodeRange}>
                      <SelectTrigger className="w-48 bg-gray-900 border-gray-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-gray-700">
                        <SelectItem value="all">Tất cả</SelectItem>
                        {episodeRanges.map(r => (
                          <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-3">
                  {getFilteredEpisodes().map(ep => (
                    <button
                      key={ep.id}
                      className="aspect-square flex items-center justify-center rounded-lg bg-gray-800 hover:bg-red-600 transition-colors border border-gray-700 hover:border-red-600"
                      onClick={() => navigate(`/watch/${movie.id}?episode=${ep.id}`)}
                    >
                      <span className="text-lg font-semibold">{ep.episodeNumber}</span>
                    </button>
                  ))}
                </div>
                {getFilteredEpisodes().length === 0 && (
                  <p className="text-gray-400 text-center py-8">Chưa có tập phim nào</p>
                )}
              </TabsContent>
            )}

            {/* Bình luận */}
            <TabsContent value="comments" className="mt-6">
              <CommentSection movieId={id || ''} initialComments={[]} />
            </TabsContent>
          </Tabs>

          {/* Phim tương tự */}
          {allMovies.length > 0 && (
            <div className="mt-12">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="h-5 w-5 text-yellow-400" />
                <h3 className="text-xl font-bold">Phim tương tự</h3>
                <span className="text-xs bg-yellow-600/20 text-yellow-400 px-2 py-1 rounded">
                  Recommendation
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {allMovies.map(m => <MovieCard key={m.id} movie={m} />)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* YouTube Trailer Modal */}
      {trailerOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setTrailerOpen(false)}
        >
          <button
            onClick={() => setTrailerOpen(false)}
            className="absolute top-4 right-4 z-10 rounded-full bg-white/10 p-2 hover:bg-white/20 transition-colors"
          >
            <X className="h-6 w-6 text-white" />
          </button>

          <div
            className="relative w-full max-w-5xl mx-4 aspect-video rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10"
            onClick={e => e.stopPropagation()}
          >
            <iframe
              src="https://www.youtube.com/embed/IoHWPAN6FPg?autoplay=1&rel=0"
              title={movie.title ? `${movie.title} - Trailer` : 'Trailer'}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full"
            />
          </div>

          <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-gray-400 text-sm select-none">
            Nhấn ra ngoài hoặc nút X để đóng
          </p>
        </div>
      )}
    </>
  );
}