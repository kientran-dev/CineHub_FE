import { useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router';
import { ArrowLeft, Play } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import VideoPlayerCore from '../components/VideoPlayerCore';
import { movies } from '../data/mockData';

// Link .m3u8 test — thay bằng URL thực từ API khi có backend
const TEST_HLS_URL = 'https://vip.opstream12.com/20260331/32622_61cd29e0/index.m3u8';

export default function VideoPlayer() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const episodeId = searchParams.get('episode');

  const movie = movies.find(m => m.id === id);
  const [selectedEpisode, setSelectedEpisode] = useState(
    episodeId || movie?.episodes?.[0]?.id
  );

  const currentEpisode = movie?.episodes?.find(e => e.id === selectedEpisode);

  const handleSelectEpisode = (epId: string) => {
    setSelectedEpisode(epId);
  };

  const handleNextEpisode = () => {
    if (movie?.episodes) {
      const currentIndex = movie.episodes.findIndex(e => e.id === selectedEpisode);
      if (currentIndex < movie.episodes.length - 1) {
        handleSelectEpisode(movie.episodes[currentIndex + 1].id);
      }
    }
  };

  if (!movie) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl mb-4">Không tìm thấy phim</h1>
          <Button onClick={() => navigate('/')}>Về trang chủ</Button>
        </div>
      </div>
    );
  }

  // Subtitle label cho tiêu đề player
  const subtitleLabel = currentEpisode
    ? `Tập ${currentEpisode.episodeNumber}: ${currentEpisode.title}`
    : undefined;

  return (
    <div className="h-screen bg-black text-white flex flex-col overflow-hidden">
      {/* Back button overlay */}
      <div className="absolute top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>

      {/* Video Area */}
      <div className="flex-1 min-h-0 relative overflow-hidden">
        <div className="absolute inset-0">
          <VideoPlayerCore
            src={TEST_HLS_URL}
            title={movie.title}
            subtitle={subtitleLabel}
            onEnded={movie.type === 'series' ? handleNextEpisode : undefined}
            storageKey={`${movie.id}-${selectedEpisode ?? 'movie'}`}
          />
        </div>
      </div>

      {/* Episodes List for Series */}
      {movie.type === 'series' && movie.episodes && (
        <div className="h-56 flex-shrink-0 overflow-y-auto border-t border-gray-800 bg-[#0f0f0f]">
          <div className="p-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm text-gray-200">
                Danh sách tập ({movie.episodes.length} tập)
              </h3>
              {currentEpisode && (
                <span className="text-xs text-red-400">
                  Đang xem: Tập {currentEpisode.episodeNumber}
                </span>
              )}
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {movie.episodes.map(episode => {
                const isActive = selectedEpisode === episode.id;
                return (
                  <Card
                    key={episode.id}
                    className={`cursor-pointer transition-all duration-200 border ${
                      isActive
                        ? 'border-red-600 bg-red-950/30 shadow-md shadow-red-900/30'
                        : 'border-gray-800 bg-gray-900/80 hover:border-gray-600 hover:bg-gray-800/80'
                    }`}
                    onClick={() => handleSelectEpisode(episode.id)}
                  >
                    <CardContent className="p-2.5">
                      <div className="flex gap-2.5 items-center">
                        <div className="relative h-14 w-24 flex-shrink-0 overflow-hidden rounded-md">
                          <img
                            src={episode.thumbnail}
                            alt={episode.title}
                            className="h-full w-full object-cover"
                          />
                          <div className={`absolute inset-0 flex items-center justify-center ${
                            isActive ? 'bg-black/60' : 'bg-black/20 hover:bg-black/40'
                          } transition-colors`}>
                            {isActive && (
                              <div className="rounded-full bg-red-600/90 p-1">
                                <Play className="h-3 w-3 fill-white" />
                              </div>
                            )}
                          </div>
                          {isActive && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`text-xs font-semibold truncate ${isActive ? 'text-red-400' : 'text-gray-200'}`}>
                            Tập {episode.episodeNumber}
                          </h4>
                          <p className="text-xs text-gray-400 line-clamp-2 mt-0.5 leading-tight">
                            {episode.title}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">{episode.duration} phút</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}