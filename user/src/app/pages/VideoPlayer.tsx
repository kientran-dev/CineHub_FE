import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router';
import { ArrowLeft, Play, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import VideoPlayerCore from '../components/VideoPlayerCore';
import { movieService, type MovieResponse } from '../services/movieService';
import { historyService } from '../services/historyService';
import { userService } from '../services/userService';
import { useAuth } from '../contexts/AuthContext';
import { useRef } from 'react';

export default function VideoPlayer() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const episodeParam = searchParams.get('episode');
  const viewRecordedRef = useRef<number | null>(null);

  const [movie, setMovie] = useState<MovieResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<number | null>(null);
  const [selectedVersionType, setSelectedVersionType] = useState<string>('');

  // Ad states
  const [isPremium, setIsPremium] = useState<boolean | null>(null);
  const [isAdPlaying, setIsAdPlaying] = useState<boolean>(false);
  const [adTimeLeft, setAdTimeLeft] = useState<number>(5);
  // Thay đổi link này thành '/cinehub-ad.mp4' nếu bạn để file trong public/cinehub-ad.mp4
  const demoAdUrl = "/cinehub-ad.mp4";

  // Fetch user profile to check Premium status
  useEffect(() => {
    if (isAuthenticated) {
      userService.getMe().then(user => {
        setIsPremium(user.isPremium);
      }).catch(err => {
        console.error('Failed to get user profile', err);
        setIsPremium(false); // Default to false if error
      });
    }
  }, [isAuthenticated]);

  // Fetch movie data from API
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    movieService.getMovieById(Number(id))
      .then((data) => {
        setMovie(data);

        // Determine which episode to play
        if (data.type?.toUpperCase() === 'MOVIE') {
          // Phim lẻ: chọn episode đầu tiên
          const firstEp = data.episodes?.[0];
          if (firstEp) {
            setSelectedEpisodeId(firstEp.id);
            setSelectedVersionType(firstEp.episodeVersions?.[0]?.type || '');
          }
        } else {
          // Phim bộ: chọn theo param hoặc episode đầu
          const epId = episodeParam ? Number(episodeParam) : data.episodes?.[0]?.id;
          if (epId) {
            setSelectedEpisodeId(epId);
            const ep = data.episodes?.find(e => e.id === epId);
            setSelectedVersionType(ep?.episodeVersions?.[0]?.type || '');
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id, episodeParam]);

  // Get current episode and video URL
  const currentEpisode = movie?.episodes?.find(e => e.id === selectedEpisodeId);
  const availableVersions = currentEpisode?.episodeVersions || [];
  const currentVersion = availableVersions.find(v => v.type === selectedVersionType) || availableVersions[0];
  // Strip prefix like "Full|" or "1|" from URL if present
  const rawUrl = currentVersion?.videoUrl || '';
  const pipeIdx = rawUrl.indexOf('|');
  const videoUrl = (pipeIdx !== -1 && rawUrl.substring(pipeIdx + 1).startsWith('http'))
    ? rawUrl.substring(pipeIdx + 1).trim()
    : rawUrl;

  const handleSelectEpisode = (epId: number) => {
    setSelectedEpisodeId(epId);
    // Khi đổi tập, chọn version đầu tiên hoặc giữ type hiện tại nếu có
    const ep = movie?.episodes?.find(e => e.id === epId);
    const versions = ep?.episodeVersions || [];
    const sameType = versions.find(v => v.type === selectedVersionType);
    setSelectedVersionType(sameType ? sameType.type : (versions[0]?.type || ''));

    // Phát lại quảng cáo nếu chưa có Premium
    if (isPremium === false) {
      setIsAdPlaying(true);
      setAdTimeLeft(5);
    }
  };

  const handleNextEpisode = () => {
    if (movie?.episodes && currentEpisode) {
      const currentIndex = movie.episodes.findIndex(e => e.id === currentEpisode.id);
      if (currentIndex < movie.episodes.length - 1) {
        handleSelectEpisode(movie.episodes[currentIndex + 1].id);
      }
    }
  };

  // ── Watch progress sync ──────────────────────────────────────────────────────
  // Ghi nhận lần đầu (watchTime = 0) khi video bắt đầu phát
  useEffect(() => {
    if (!isAuthenticated || !currentVersion || viewRecordedRef.current === currentVersion.id) return;
    if (isAdPlaying) return;

    const recordView = async () => {
      try {
        await historyService.saveHistory({
          episodeVersionId: currentVersion.id,
          watchTime: 0,
          currentEpisode: currentEpisode?.episodeNumber
        });
        viewRecordedRef.current = currentVersion.id;
      } catch (err) {
        console.error('Failed to record watch history:', err);
      }
    };

    recordView();
  }, [currentVersion, isAuthenticated, currentEpisode, isAdPlaying]);

  // Sync tiến trình thực tế lên backend mỗi 30 giây
  useEffect(() => {
    if (!isAuthenticated || !currentVersion || isAdPlaying || !movie) return;

    const storageKey = `${movie.id}-${selectedEpisodeId ?? 'movie'}-${selectedVersionType}`;

    const syncProgress = async () => {
      const savedTime = parseFloat(
        localStorage.getItem(`cinehub-progress-${storageKey}`) || '0'
      );
      if (savedTime < 5) return; // Chưa xem đủ để ghi nhận
      try {
        await historyService.saveHistory({
          episodeVersionId: currentVersion.id,
          watchTime: Math.floor(savedTime),
          currentEpisode: currentEpisode?.episodeNumber
        });
      } catch {
        // Bỏ qua lỗi sync âm thầm
      }
    };

    const interval = setInterval(syncProgress, 30_000); // mỗi 30 giây

    // Lưu khi unmount (user bấm quay lại hoặc chuyển trang)
    return () => {
      clearInterval(interval);
      syncProgress(); // Lưu lần cuối khi rời khỏi trang
    };
  }, [isAuthenticated, currentVersion, currentEpisode, isAdPlaying, movie, selectedEpisodeId, selectedVersionType]);

  // Initial trigger for Ad when first loading the movie/episode
  useEffect(() => {
    if (selectedEpisodeId && isPremium === false && videoUrl && !isAdPlaying && viewRecordedRef.current !== currentVersion?.id) {
      setIsAdPlaying(true);
      setAdTimeLeft(5);
    }
  }, [selectedEpisodeId, isPremium, videoUrl]);

  // Ad countdown timer
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isAdPlaying && adTimeLeft > 0) {
      timer = setInterval(() => {
        setAdTimeLeft(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isAdPlaying, adTimeLeft]);

  if (loading || authLoading || isPremium === null) {
    return (
      <div className="h-screen bg-black text-white flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-red-600" />
      </div>
    );
  }

  // Chặn xem phim nếu chưa đăng nhập
  if (!isAuthenticated) {
    return (
      <div className="h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          {/* Icon khóa */}
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-600/20 to-red-900/20 border border-red-600/30 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold mb-3">Đăng nhập để xem phim</h1>
          <p className="text-gray-400 mb-8 leading-relaxed">
            Bạn cần đăng nhập tài khoản CineHub để có thể xem phim. 
            Đăng ký hoàn toàn miễn phí!
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              className="gap-2 bg-red-600 hover:bg-red-700 text-white px-8"
              onClick={() => navigate('/auth', { state: { from: `/watch/${id}` } })}
            >
              <Play className="h-5 w-5" />
              Đăng nhập ngay
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="gap-2 border-gray-600 text-gray-300 hover:bg-gray-800"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-5 w-5" />
              Quay lại
            </Button>
          </div>
        </div>
      </div>
    );
  }

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

  const isSeries = movie.type?.toUpperCase() === 'SERIES' || movie.type?.toUpperCase() === 'TV_SHOW';
  const sortedEpisodes = [...(movie.episodes || [])].sort((a, b) => a.episodeNumber - b.episodeNumber);

  // Subtitle label
  const subtitleLabel = currentEpisode
    ? isSeries
      ? `Tập ${currentEpisode.episodeNumber}: ${currentEpisode.episodeName}`
      : undefined
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
        {isAdPlaying ? (
          <div className="absolute inset-0 bg-black flex items-center justify-center">
            {/* Quảng cáo UI */}
            <div className="absolute inset-0 z-10 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]" />
            
            <div className="absolute top-6 left-6 z-20 flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-full border border-gray-600/50 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
              <span className="text-sm font-medium text-gray-200">Quảng cáo tài trợ</span>
            </div>

            <video 
              src={demoAdUrl} 
              autoPlay 
              muted={false} // Có thể set true nếu muốn mute mặc định
              className="w-full h-full object-contain"
              onEnded={() => setIsAdPlaying(false)}
            />

            <div className="absolute bottom-16 right-8 z-20">
              <Button
                variant={adTimeLeft > 0 ? "secondary" : "default"}
                className={`gap-2 text-sm font-medium rounded-full shadow-lg transition-all px-6 py-5 ${
                  adTimeLeft > 0 
                    ? 'bg-black/80 hover:bg-black/80 text-gray-400 cursor-not-allowed border border-gray-700/50' 
                    : 'bg-white hover:bg-gray-200 text-black border border-white hover:scale-105'
                }`}
                disabled={adTimeLeft > 0}
                onClick={() => setIsAdPlaying(false)}
              >
                {adTimeLeft > 0 ? (
                  `Bỏ qua sau ${adTimeLeft}s`
                ) : (
                  <>
                    Bỏ qua quảng cáo <Play className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
            
            <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center">
              <p className="text-gray-400 text-sm bg-black/50 px-4 py-2 rounded-full backdrop-blur-md cursor-pointer hover:text-white transition-colors">
                Nâng cấp Premium để không bao giờ phải xem quảng cáo
              </p>
            </div>
          </div>
        ) : videoUrl ? (
          <div className="absolute inset-0 animate-in fade-in duration-1000">
            <VideoPlayerCore
              src={videoUrl}
              title={movie.title}
              subtitle={subtitleLabel}
              onEnded={isSeries ? handleNextEpisode : undefined}
              storageKey={`${movie.id}-${selectedEpisodeId ?? 'movie'}-${selectedVersionType}`}
            />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-center text-gray-400">
              <Play className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Chưa có video cho phim này</p>
              <p className="text-sm mt-1">Vui lòng quay lại sau</p>
            </div>
          </div>
        )}
      </div>

      {/* Version selector + Episode list */}
      {(availableVersions.length > 1 || isSeries) && (
        <div className="flex-shrink-0 border-t border-gray-800 bg-[#0f0f0f]">
          {/* Phiên bản (Vietsub / Thuyết minh) */}
          {availableVersions.length > 1 && (
            <div className="px-3 pt-3 flex items-center gap-2">
              <span className="text-xs text-gray-400 mr-1">Phiên bản:</span>
              {availableVersions.map(v => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVersionType(v.type)}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    selectedVersionType === v.type
                      ? 'bg-red-600 text-white border-red-600'
                      : 'border-gray-600 text-gray-300 hover:border-gray-400'
                  }`}
                >
                  {v.type || 'Mặc định'}
                </button>
              ))}
            </div>
          )}

          {/* Episodes List for Series */}
          {isSeries && sortedEpisodes.length > 0 && (
            <div className="max-h-52 overflow-y-auto">
              <div className="p-3">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm text-gray-200">
                    Danh sách tập ({sortedEpisodes.length} tập)
                  </h3>
                  {currentEpisode && (
                    <span className="text-xs text-red-400">
                      Đang xem: Tập {currentEpisode.episodeNumber}
                    </span>
                  )}
                </div>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {sortedEpisodes.map(episode => {
                    const isActive = selectedEpisodeId === episode.id;
                    const hasVideo = episode.episodeVersions && episode.episodeVersions.length > 0;
                    return (
                      <Card
                        key={episode.id}
                        className={`cursor-pointer transition-all duration-200 border ${
                          isActive
                            ? 'border-red-600 bg-red-950/30 shadow-md shadow-red-900/30'
                            : hasVideo
                              ? 'border-gray-800 bg-gray-900/80 hover:border-gray-600 hover:bg-gray-800/80'
                              : 'border-gray-800 bg-gray-900/40 opacity-50'
                        }`}
                        onClick={() => hasVideo && handleSelectEpisode(episode.id)}
                      >
                        <CardContent className="p-2.5">
                          <div className="flex gap-2.5 items-center">
                            <div className="relative h-14 w-24 flex-shrink-0 overflow-hidden rounded-md bg-gray-800">
                              {movie.thumbnail && (
                                <img
                                  src={movie.thumbnail}
                                  alt={episode.episodeName}
                                  className="h-full w-full object-cover"
                                />
                              )}
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
                                {episode.episodeName}
                              </p>
                              {!hasVideo && (
                                <p className="text-xs text-yellow-600 mt-0.5">Chưa có video</p>
                              )}
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
      )}
    </div>
  );
}