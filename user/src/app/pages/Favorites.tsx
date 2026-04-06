import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import MovieCard from '../components/MovieCard';
import { favoriteService } from '../services/favoriteService';
import { movieService } from '../services/movieService';
import { toMovie } from '../utils/movieAdapter';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router';
import { Heart, Loader2 } from 'lucide-react';
import type { Movie } from '../data/mockData';

export default function Favorites() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [favoriteMovies, setFavoriteMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    favoriteService.getFavorites()
      .then(async (favs) => {
        // Lấy chi tiết từng phim
        const movieDetails = await Promise.all(
          favs.map(f => movieService.getMovieById(f.movieId).catch(() => null))
        );
        setFavoriteMovies(movieDetails.filter(Boolean).map(m => toMovie(m!)));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />

      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1 h-8 bg-red-600 rounded-full" />
          <h1 className="text-3xl font-bold">Phim yêu thích</h1>
          {favoriteMovies.length > 0 && (
            <span className="ml-2 text-sm text-gray-400 bg-gray-800 px-2 py-1 rounded">
              {favoriteMovies.length} phim
            </span>
          )}
        </div>

        {!isAuthenticated ? (
          <div className="text-center py-20">
            <Heart className="h-16 w-16 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Đăng nhập để xem danh sách yêu thích</p>
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
        ) : favoriteMovies.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {favoriteMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Heart className="h-16 w-16 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Bạn chưa có phim yêu thích nào</p>
            <p className="text-gray-500 mt-2">Khám phá và thêm phim yêu thích của bạn</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}