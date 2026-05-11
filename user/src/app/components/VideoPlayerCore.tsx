import { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize,
  Settings, SkipBack, SkipForward, Loader2, AlertCircle,
} from 'lucide-react';

interface VideoPlayerCoreProps {
  src: string;
  title?: string;
  subtitle?: string;
  onEnded?: () => void;
  storageKey?: string;
}

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

function formatTime(s: number): string {
  if (isNaN(s)) return '0:00';
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

export default function VideoPlayerCore({
  src,
  title,
  subtitle,
  onEnded,
  storageKey,
}: VideoPlayerCoreProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [buffered, setBuffered] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [speed, setSpeed] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsView, setSettingsView] = useState<'main' | 'speed' | 'quality'>('main');
  const [qualityLevels, setQualityLevels] = useState<{ height: number; index: number }[]>([]);
  const [currentQuality, setCurrentQuality] = useState(-1); // -1 = Auto
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverX, setHoverX] = useState(0);

  // ── Init HLS or MP4 ─────────────────────────────────────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setError(null);
    setLoading(true);
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setBuffered(0);

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    // Detect MP4 — play natively
    const isMp4 = src.toLowerCase().endsWith('.mp4') || src.toLowerCase().includes('.mp4?');
    if (isMp4) {
      video.src = src;
      video.load();
      const onLoaded = () => {
        setLoading(false);
        if (storageKey) {
          const saved = parseFloat(localStorage.getItem(`cinehub-progress-${storageKey}`) || '0');
          if (saved > 10) video.currentTime = saved;
        }
      };
      const onErr = () => {
        setError('Không thể tải video. Vui lòng thử lại sau.');
        setLoading(false);
      };
      video.addEventListener('loadedmetadata', onLoaded, { once: true });
      video.addEventListener('error', onErr, { once: true });
      return () => {
        video.removeEventListener('loadedmetadata', onLoaded);
        video.removeEventListener('error', onErr);
      };
    }

    // HLS stream
    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
      });
      hlsRef.current = hls;

      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        const levels = data.levels
          .map((l, i) => ({ height: l.height || 0, index: i }))
          .filter(l => l.height > 0)
          .sort((a, b) => b.height - a.height);
        setQualityLevels(levels);
        setLoading(false);

        // Restore saved position
        if (storageKey) {
          const saved = parseFloat(localStorage.getItem(`cinehub-progress-${storageKey}`) || '0');
          if (saved > 10) {
            video.currentTime = saved;
          }
        }
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          setError('Không thể tải video. Vui lòng thử lại sau.');
          setLoading(false);
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari native HLS
      video.src = src;
      video.addEventListener('loadedmetadata', () => setLoading(false), { once: true });
    } else {
      setError('Trình duyệt của bạn không hỗ trợ phát video HLS.');
      setLoading(false);
    }

    return () => {
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  // ── Video event listeners ────────────────────────────────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (storageKey && video.currentTime > 5) {
        localStorage.setItem(`cinehub-progress-${storageKey}`, String(video.currentTime));
      }
    };
    const onDurationChange = () => setDuration(video.duration);
    const onWaiting = () => setLoading(true);
    const onCanPlay = () => setLoading(false);
    const onProgress = () => {
      if (video.buffered.length > 0 && video.duration > 0) {
        setBuffered((video.buffered.end(video.buffered.length - 1) / video.duration) * 100);
      }
    };
    const onEnded2 = () => {
      setPlaying(false);
      onEnded?.();
    };
    const onFsChange = () => setFullscreen(!!document.fullscreenElement);
    const onVolumeChange = () => {
      setVolume(video.volume);
      setMuted(video.muted);
    };

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('durationchange', onDurationChange);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('progress', onProgress);
    video.addEventListener('ended', onEnded2);
    video.addEventListener('volumechange', onVolumeChange);
    document.addEventListener('fullscreenchange', onFsChange);

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('durationchange', onDurationChange);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('progress', onProgress);
      video.removeEventListener('ended', onEnded2);
      video.removeEventListener('volumechange', onVolumeChange);
      document.removeEventListener('fullscreenchange', onFsChange);
    };
  }, [onEnded, storageKey]);

  // ── Keyboard shortcuts ───────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;

      const video = videoRef.current;
      if (!video) return;

      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          video.paused ? video.play() : video.pause();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          video.currentTime = Math.max(0, video.currentTime - 10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          video.currentTime = Math.min(video.duration, video.currentTime + 10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          video.volume = Math.min(1, video.volume + 0.1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          video.volume = Math.max(0, video.volume - 0.1);
          break;
        case 'm':
        case 'M':
          video.muted = !video.muted;
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
      }
    };

    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Controls auto-hide ───────────────────────────────────────────────────────
  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (!videoRef.current?.paused) setShowControls(false);
    }, 3000);
  }, []);

  useEffect(() => () => { if (hideTimer.current) clearTimeout(hideTimer.current); }, []);

  // ── Actions ─────────────────────────────────────────────────────────────────
  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    v.paused ? v.play() : v.pause();
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const v = videoRef.current;
    if (!v || !duration) return;
    v.currentTime = ratio * duration;
  };

  const onProgressHover = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    setHoverTime(ratio * duration);
    setHoverX(e.clientX - rect.left);
  };

  const setPlaybackRate = (s: number) => {
    setSpeed(s);
    if (videoRef.current) videoRef.current.playbackRate = s;
    setShowSettings(false);
    setSettingsView('main');
  };

  const setQuality = (index: number) => {
    const hls = hlsRef.current;
    if (!hls) return;
    hls.currentLevel = index;
    setCurrentQuality(index);
    setShowSettings(false);
    setSettingsView('main');
  };

  const openSettings = () => {
    setSettingsView('main');
    setShowSettings(v => !v);
  };

  const toggleFullscreen = async () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      await el.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  };

  const skip = (seconds: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(v.duration, v.currentTime + seconds));
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-black select-none"
      onMouseMove={resetHideTimer}
      onMouseLeave={() => {
        if (!videoRef.current?.paused) setShowControls(false);
        setHoverTime(null);
      }}
      onMouseEnter={resetHideTimer}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
        onClick={() => { togglePlay(); resetHideTimer(); }}
      />

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
          <Loader2 className="h-12 w-12 text-white animate-spin" />
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20 gap-3 px-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-400" />
          <p className="text-white text-base">{error}</p>
          <button
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
            onClick={() => window.location.reload()}
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Gradient overlays */}
      <div className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-black/70 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-36 bg-gradient-to-t from-black/80 to-transparent" />
      </div>

      {/* Top bar */}
      <div className={`absolute top-0 inset-x-0 px-4 py-3 z-30 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-start gap-3">
          <div>
            {title && <h2 className="text-white font-semibold text-base leading-tight drop-shadow">{title}</h2>}
            {subtitle && <p className="text-gray-300 text-sm mt-0.5 drop-shadow">{subtitle}</p>}
          </div>
        </div>
      </div>

      {/* Center play/pause overlay — clicking passes to video element */}
      {!playing && !loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div className="rounded-full bg-black/50 p-5 backdrop-blur-sm border border-white/20">
            <Play className="h-10 w-10 fill-white text-white" />
          </div>
        </div>
      )}

      {/* Bottom controls */}
      <div
        className={`absolute bottom-0 inset-x-0 px-4 pb-3 pt-8 z-30 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Progress bar */}
        <div
          ref={progressRef}
          className="relative h-1.5 rounded-full bg-white/20 cursor-pointer mb-3 group/progress"
          onClick={seek}
          onMouseMove={onProgressHover}
          onMouseLeave={() => setHoverTime(null)}
        >
          {/* Buffered */}
          <div
            className="absolute inset-y-0 left-0 bg-white/30 rounded-full pointer-events-none"
            style={{ width: `${buffered}%` }}
          />
          {/* Played */}
          <div
            className="absolute inset-y-0 left-0 bg-red-500 rounded-full pointer-events-none transition-all"
            style={{ width: `${progress}%` }}
          />
          {/* Thumb */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-3.5 w-3.5 rounded-full bg-red-500 shadow-md opacity-0 group-hover/progress:opacity-100 transition-opacity pointer-events-none"
            style={{ left: `${progress}%` }}
          />
          {/* Hover tooltip */}
          {hoverTime !== null && (
            <div
              className="absolute bottom-5 -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded pointer-events-none whitespace-nowrap"
              style={{ left: hoverX }}
            >
              {formatTime(hoverTime)}
            </div>
          )}
        </div>

        {/* Controls row */}
        <div className="flex items-center gap-2">
          {/* Skip back 10s */}
          <button
            onClick={() => skip(-10)}
            className="text-white/80 hover:text-white transition-colors p-1"
            title="Lùi 10s (←)"
          >
            <SkipBack className="h-5 w-5" />
          </button>

          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            className="text-white hover:text-red-400 transition-colors p-1"
            title="Play/Pause (Space)"
          >
            {playing ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 fill-white" />}
          </button>

          {/* Skip forward 10s */}
          <button
            onClick={() => skip(10)}
            className="text-white/80 hover:text-white transition-colors p-1"
            title="Tua 10s (→)"
          >
            <SkipForward className="h-5 w-5" />
          </button>

          {/* Volume */}
          <button
            onClick={toggleMute}
            className="text-white/80 hover:text-white transition-colors p-1"
            title="Tắt/bật âm (M)"
          >
            {muted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={muted ? 0 : volume}
            onChange={e => {
              const v = videoRef.current;
              if (!v) return;
              v.volume = Number(e.target.value);
              v.muted = Number(e.target.value) === 0;
            }}
            className="w-20 accent-red-500 cursor-pointer hidden sm:block"
          />

          {/* Time */}
          <span className="text-white text-xs font-mono ml-1 whitespace-nowrap">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          <div className="flex-1" />

          {/* Speed badge */}
          {speed !== 1 && (
            <span className="text-xs text-yellow-400 font-mono">{speed}x</span>
          )}

          {/* Settings */}
          <div className="relative">
            <button
              onClick={openSettings}
              className="text-white/80 hover:text-white transition-colors p-1"
              title="Cài đặt"
            >
              <Settings className={`h-5 w-5 transition-transform duration-300 ${showSettings ? 'rotate-45' : ''}`} />
            </button>
            {showSettings && (
              <div className="absolute bottom-10 right-0 bg-gray-900/98 border border-gray-700 rounded-xl shadow-2xl text-white text-sm z-50 backdrop-blur-sm overflow-hidden w-56">
                {settingsView === 'main' && (
                  <div className="p-1">
                    {/* Speed row */}
                    <button
                      onClick={() => setSettingsView('speed')}
                      className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <span className="text-sm text-gray-300">Tốc độ phát</span>
                      <span className="text-xs text-white font-medium bg-white/10 px-2 py-0.5 rounded">
                        {speed === 1 ? '1.0x' : `${speed}x`}
                      </span>
                    </button>
                    {/* Quality row */}
                    <button
                      onClick={() => setSettingsView('quality')}
                      className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <span className="text-sm text-gray-300">Độ phân giải</span>
                      <span className="text-xs text-white font-medium bg-white/10 px-2 py-0.5 rounded">
                        {currentQuality === -1
                          ? 'Tự động'
                          : qualityLevels.find(q => q.index === currentQuality)?.height
                            ? `${qualityLevels.find(q => q.index === currentQuality)!.height}p`
                            : 'Tự động'}
                      </span>
                    </button>
                  </div>
                )}

                {settingsView === 'speed' && (
                  <div>
                    <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-700">
                      <button
                        onClick={() => setSettingsView('main')}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        ‹
                      </button>
                      <span className="text-xs text-gray-400 font-medium">Tốc độ phát</span>
                    </div>
                    <div className="p-1">
                      {SPEEDS.map(s => (
                        <button
                          key={s}
                          onClick={() => setPlaybackRate(s)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${speed === s ? 'text-red-400 bg-red-900/20' : 'text-gray-300 hover:bg-white/10'
                            }`}
                        >
                          <span>{s === 1 ? 'Bình thường' : `${s}x`}</span>
                          {speed === s && <span className="text-xs">✓</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {settingsView === 'quality' && (
                  <div>
                    <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-700">
                      <button
                        onClick={() => setSettingsView('main')}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        ‹
                      </button>
                      <span className="text-xs text-gray-400 font-medium">Độ phân giải</span>
                    </div>
                    <div className="p-1">
                      <button
                        onClick={() => setQuality(-1)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${currentQuality === -1 ? 'text-red-400 bg-red-900/20' : 'text-gray-300 hover:bg-white/10'
                          }`}
                      >
                        <span>Tự động</span>
                        {currentQuality === -1 && <span className="text-xs">✓</span>}
                      </button>
                      {qualityLevels.map(q => (
                        <button
                          key={q.index}
                          onClick={() => setQuality(q.index)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${currentQuality === q.index ? 'text-red-400 bg-red-900/20' : 'text-gray-300 hover:bg-white/10'
                            }`}
                        >
                          <span>{q.height}p</span>
                          {currentQuality === q.index && <span className="text-xs">✓</span>}
                        </button>
                      ))}
                      {qualityLevels.length === 0 && (
                        <p className="text-xs text-gray-500 px-3 py-2">Đang tải stream...</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="text-white/80 hover:text-white transition-colors p-1"
            title="Toàn màn hình (F)"
          >
            {fullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Keyboard hint */}
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-gray-500 text-[10px] pointer-events-none opacity-0 group-hover:opacity-100">
        Space · ←→ ±10s · ↑↓ âm lượng · M tắt tiếng · F toàn màn hình
      </div>
    </div>
  );
}
