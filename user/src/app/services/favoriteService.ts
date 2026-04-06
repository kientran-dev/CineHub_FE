import api from './api';

export interface FavoriteResponse {
  id: number;
  movieId: number;
  movieTitle: string;
  movieThumbnail: string;
  addedDate: string;
}

export const favoriteService = {
  async getFavorites(): Promise<FavoriteResponse[]> {
    const res = await api.get<FavoriteResponse[]>('/favorites');
    return res.data;
  },

  async addFavorite(movieId: number): Promise<FavoriteResponse> {
    const res = await api.post<FavoriteResponse>('/favorites', { movieId });
    return res.data;
  },

  async removeFavorite(movieId: number): Promise<void> {
    await api.delete(`/favorites/${movieId}`);
  },
};
