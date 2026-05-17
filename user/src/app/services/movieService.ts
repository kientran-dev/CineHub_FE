import api from './api';

export interface GenreResponse {
  id: number;
  name: string;
}

export interface EpisodeVersionResponse {
  id: number;
  episodeId: number;
  videoUrl: string;
  type: string; // "VIETSUB" | "THUYET_MINH" | "LONG_TIENG"
}

export interface EpisodeResponse {
  id: number;
  movieId: number;
  episodeNumber: number;
  episodeName: string;
  episodeVersions?: EpisodeVersionResponse[];
}

export interface ActorResponse {
  id: number;
  fullName: string;
  imageUrl: string;
}

export interface MovieResponse {
  id: number;
  title: string;
  englishTitle?: string;
  thumbnail?: string;
  poster?: string;
  description?: string;
  director?: string;
  releaseYear?: number;
  duration?: number;
  country?: string;
  status?: string;
  type?: string; // "MOVIE" | "SERIES" | "TV_SHOW"
  subtitleType?: string; // "VIETSUB" | "THUYET_MINH" | "LONG_TIENG"
  imdbScore?: number;
  trailerUrl?: string;
  averageRating?: number;
  totalRatings?: number;
  genres?: GenreResponse[];
  episodes?: EpisodeResponse[];
  actors?: ActorResponse[];
}

export const movieService = {
  async getAllMovies(): Promise<MovieResponse[]> {
    const res = await api.get<MovieResponse[]>('/movies');
    return res.data;
  },

  async getMovieById(id: number | string): Promise<MovieResponse> {
    const res = await api.get<MovieResponse>(`/movies/${id}`);
    return res.data;
  },

  async createMovie(data: Partial<MovieResponse>): Promise<MovieResponse> {
    const res = await api.post<MovieResponse>('/movies', data);
    return res.data;
  },

  async updateMovie(id: number, data: Partial<MovieResponse>): Promise<MovieResponse> {
    const res = await api.put<MovieResponse>(`/movies/${id}`, data);
    return res.data;
  },

  async deleteMovie(id: number): Promise<void> {
    await api.delete(`/movies/${id}`);
  },

  // Recommendation System APIs
  async getRecommendations(): Promise<MovieResponse[]> {
    const res = await api.get<MovieResponse[]>('/recommendations');
    return res.data;
  },

  async getSimilarMovies(movieId: number | string): Promise<MovieResponse[]> {
    const res = await api.get<MovieResponse[]>(`/recommendations/similar/${movieId}`);
    return res.data;
  },
};
