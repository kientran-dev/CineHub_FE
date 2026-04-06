import api from './api';

export interface GenreResponse {
  id: number;
  name: string;
}

export const genreService = {
  async getAllGenres(): Promise<GenreResponse[]> {
    const res = await api.get<GenreResponse[]>('/genres');
    return res.data;
  },

  async getGenreById(id: number): Promise<GenreResponse> {
    const res = await api.get<GenreResponse>(`/genres/${id}`);
    return res.data;
  },

  async createGenre(data: { name: string }): Promise<GenreResponse> {
    const res = await api.post<GenreResponse>('/genres', data);
    return res.data;
  },

  async updateGenre(id: number, data: { name: string }): Promise<GenreResponse> {
    const res = await api.put<GenreResponse>(`/genres/${id}`, data);
    return res.data;
  },

  async deleteGenre(id: number): Promise<void> {
    await api.delete(`/genres/${id}`);
  },
};
