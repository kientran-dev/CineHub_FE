import { Link } from 'react-router';
import { Play } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Movie } from '../data/mockData';

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  const subtitle = movie.subtitleType
    ? movie.subtitleType === 'vietsub'    ? { type: 'Vietsub',      color: 'bg-gray-600/90' }
      : movie.subtitleType === 'longtieng' ? { type: 'Lồng tiếng',   color: 'bg-green-700/90' }
      :                                      { type: 'Thuyết minh',  color: 'bg-blue-700/90' }
    : null;

  return (
    <Card className="group relative overflow-hidden border-gray-800/60 bg-gray-900/50 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-red-600/60 hover:shadow-xl hover:shadow-red-600/10">
      <Link to={`/movie/${movie.id}`}>
        <div className="relative aspect-[2/3] overflow-hidden">
          <img
            src={movie.poster}
            alt={movie.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          
          {/* Subtle vignette always visible */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-center justify-center">
            <Button size="lg" className="gap-2 bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/30">
              <Play className="h-5 w-5" />
              Xem ngay
            </Button>
          </div>

          {/* Subtitle Badge */}
          {subtitle && (
            <div className="absolute top-2 left-2">
              <Badge className={`${subtitle.color} text-white backdrop-blur-sm text-[10px] px-1.5 py-0.5`}>
                {subtitle.type}
              </Badge>
            </div>
          )}

          {/* IMDb Rating */}
          {movie.imdbRating && (
            <div className="absolute top-2 right-2 flex items-center gap-1 rounded bg-yellow-500/90 backdrop-blur-sm px-1.5 py-0.5">
              <span className="text-[10px] font-bold text-black">IMDb</span>
              <span className="text-[10px] font-bold text-black">{movie.imdbRating.toFixed(1)}</span>
            </div>
          )}
        </div>

        <CardContent className="p-3">
          <h3 className="line-clamp-1 font-bold text-sm">{movie.title}</h3>
          {movie.englishTitle && (
            <p className="line-clamp-1 text-xs text-gray-500 mt-0.5">{movie.englishTitle}</p>
          )}
          <div className="mt-1.5 flex items-center gap-2 text-xs text-gray-500">
            <span>{movie.year}</span>
            <span className="w-1 h-1 rounded-full bg-gray-600" />
            <span>{movie.type === 'movie' ? 'Phim lẻ' : movie.type === 'tv_show' ? 'TV Show' : 'Phim bộ'}</span>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
