import api from './api';

export interface WatchHistoryResponse {
  id: number;
  episodeVersionId: number;
  episodeId: number;
  movieId: number;
  movieTitle: string;
  episodeName: string;
  versionType: string; // "VIETSUB" | "THUYET_MINH" | "LONG_TIENG"
  watchTime: number;
  currentEpisode: number;
  watchDate: string;
}

export interface SaveHistoryRequest {
  episodeVersionId: number;
  watchTime: number;
  currentEpisode?: number;
}

export const historyService = {
  async getHistory(): Promise<WatchHistoryResponse[]> {
    const res = await api.get<WatchHistoryResponse[]>('/history');
    return res.data;
  },

  async saveHistory(data: SaveHistoryRequest): Promise<WatchHistoryResponse> {
    const res = await api.post<WatchHistoryResponse>('/history', data);
    return res.data;
  },

  async deleteHistory(id: number): Promise<void> {
    await api.delete(`/history/${id}`);
  },
};
