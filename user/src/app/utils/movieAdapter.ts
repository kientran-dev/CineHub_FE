/**
 * Adapter: chuyển đổi MovieResponse (API) sang Movie (mock type) để tương thích với các components hiện có.
 * Các field không có trong API sẽ được set giá trị mặc định.
 * type từ BE: MOVIE | SERIES | TV_SHOW
 */
import type { MovieResponse } from '../services/movieService';
import type { Movie } from '../data/mockData';

function mapType(apiType?: string): 'movie' | 'series' | 'tv_show' {
  const t = apiType?.toUpperCase();
  if (t === 'SERIES') return 'series';
  if (t === 'TV_SHOW') return 'tv_show';
  return 'movie';
}

export function toMovie(m: MovieResponse): Movie {
  // thumbnail: ảnh ngang (backdrop cho banner)
  // poster: ảnh đứng (card dọc). Nếu không có poster riêng, dùng thumbnail
  const backdrop = m.thumbnail ?? m.poster ?? '';
  const poster = m.poster ?? m.thumbnail ?? '';

  // Derive subtitleType from real episode version data
  let subtitleType: 'vietsub' | 'thuyetminh' | 'longtieng' | undefined;
  const firstVersionType = m.episodes?.[0]?.episodeVersions?.[0]?.type?.toUpperCase();
  if (firstVersionType === 'VIETSUB') subtitleType = 'vietsub';
  else if (firstVersionType === 'THUYET_MINH') subtitleType = 'thuyetminh';
  else if (firstVersionType === 'LONG_TIENG') subtitleType = 'longtieng';

  return {
    id: String(m.id),
    title: m.title ?? '',
    englishTitle: m.englishTitle,
    poster,
    backdrop,
    description: m.description ?? '',
    year: m.releaseYear ?? 0,
    duration: m.duration ?? 0,
    rating: m.averageRating ?? 0,
    imdbRating: m.imdbScore,
    totalRatings: m.totalRatings ?? 0,
    categories: m.genres?.map(g => g.name.toLowerCase().replace(/\s+/g, '-')) ?? [],
    country: m.country ?? '',
    type: mapType(m.type) as any,
    isPremium: false,
    trending: false,
    featured: false,
    subtitleType,
    episodes: m.episodes?.map(e => {
      // Strip prefix like "Full|" or "1|" from URL if present
      const rawUrl = e.episodeVersions?.[0]?.videoUrl ?? '';
      const pipeIdx = rawUrl.indexOf('|');
      const cleanUrl = (pipeIdx !== -1 && rawUrl.substring(pipeIdx + 1).startsWith('http'))
        ? rawUrl.substring(pipeIdx + 1).trim()
        : rawUrl;

      return {
        id: String(e.id),
        episodeNumber: e.episodeNumber ?? 0,
        title: e.episodeName ?? '',
        duration: 0,
        thumbnail: m.thumbnail ?? '',
        videoUrl: cleanUrl,
        description: e.episodeName ?? '',
        episodeVersions: e.episodeVersions,
      };
    }),
    actors: m.actors?.map(a => ({
      id: String(a.id),
      name: a.fullName ?? '',
      avatar: a.imageUrl ?? '',
      role: '',
    })),
  };
}


export function toMovieList(list: MovieResponse[]): Movie[] {
  return list.map(toMovie);
}
