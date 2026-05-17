import api from './api';

const API_BASE_URL = 'http://localhost:8080/api/v1';

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

  /**
   * Gửi lịch sử xem bằng fetch với keepalive: true.
   * Đảm bảo request vẫn được gửi ngay cả khi tab/trình duyệt đang đóng.
   * Dùng cho visibilitychange & beforeunload events.
   */
  saveHistoryBeacon(data: SaveHistoryRequest): void {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      fetch(`${API_BASE_URL}/history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
        keepalive: true, // Đảm bảo request hoàn thành dù tab đã đóng
      });
    } catch {
      // Bỏ qua lỗi — không thể xử lý khi tab đang đóng
    }
  },

  async deleteHistory(id: number): Promise<void> {
    await api.delete(`/history/${id}`);
  },
};
