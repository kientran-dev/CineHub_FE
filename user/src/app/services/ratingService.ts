import api from './api';

export interface RatingResponse {
  id: number;
  movieId: number;
  score: number;
}

export const ratingService = {
  async rateMovie(movieId: number, score: number): Promise<RatingResponse> {
    const res = await api.post<RatingResponse>('/ratings', { movieId, score });
    return res.data;
  },

  async getMyRating(movieId: number | string): Promise<RatingResponse | null> {
    try {
      const res = await api.get<RatingResponse>(`/ratings/movie/${movieId}`);
      return res.data;
    } catch {
      return null;
    }
  },

  async deleteRating(movieId: number | string): Promise<void> {
    await api.delete(`/ratings/movie/${movieId}`);
  },
};
