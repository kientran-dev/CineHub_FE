import api from './api';

export interface GenreResponse { id: number; name: string; }
export interface EpisodeVersionResponse { id: number; episodeId: number; videoUrl: string; type: string; }
export interface EpisodeResponse { id: number; movieId: number; episodeNumber: number; episodeName: string; episodeVersions?: EpisodeVersionResponse[]; }
export interface ActorResponse { id: number; fullName: string; imageUrl: string; }

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
  type?: string;
  imdbScore?: number;
  trailerUrl?: string;
  averageRating?: number;
  totalRatings?: number;
  genres?: GenreResponse[];
  episodes?: EpisodeResponse[];
  actors?: ActorResponse[];
}

export interface MovieRequest {
  title: string;
  englishTitle?: string;
  thumbnail?: string;
  poster?: string;
  director?: string;
  releaseYear?: number;
  duration?: number;
  country?: string;
  status?: string;
  type?: string;
  imdbScore?: number;
  trailerUrl?: string;
  genreIds?: number[];
}

export const movieService = {
  async getAllMovies(): Promise<MovieResponse[]> {
    const res = await api.get<MovieResponse[]>('/movies');
    return res.data;
  },
  async getMovieById(id: number): Promise<MovieResponse> {
    const res = await api.get<MovieResponse>(`/movies/${id}`);
    return res.data;
  },
  async createMovie(data: MovieRequest): Promise<MovieResponse> {
    const res = await api.post<MovieResponse>('/movies', data);
    return res.data;
  },
  async updateMovie(id: number, data: MovieRequest): Promise<MovieResponse> {
    const res = await api.put<MovieResponse>(`/movies/${id}`, data);
    return res.data;
  },
  async deleteMovie(id: number): Promise<void> {
    await api.delete(`/movies/${id}`);
  },
};

export const genreService = {
  async getAllGenres(): Promise<GenreResponse[]> {
    const res = await api.get<GenreResponse[]>('/genres');
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

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  fullName: string;
  avatar: string;
  rewardPoints: number;
  dateOfBirth?: string;
  roles?: string[];
  isPremium?: boolean;
  registeredDate?: string;
}

export const userService = {
  async getAllUsers(): Promise<UserResponse[]> {
    const res = await api.get<UserResponse[]>('/users');
    return res.data;
  },
  async deleteUser(id: number): Promise<void> {
    await api.delete(`/users/${id}`);
  },
  async grantAdmin(id: number): Promise<void> {
    await api.post(`/users/${id}/grant-admin`);
  },
  async revokeAdmin(id: number): Promise<void> {
    await api.post(`/users/${id}/revoke-admin`);
  },
};

export interface EpisodeRequest {
  movieId: number;
  episodeNumber: number;
  episodeName: string;
}

export interface EpisodeVersionRequest {
  episodeId: number;
  videoUrl: string;
  type: string;
}

export const episodeService = {
  async getEpisodesByMovie(movieId: number): Promise<EpisodeResponse[]> {
    const res = await api.get<EpisodeResponse[]>(`/episodes/movie/${movieId}`);
    return res.data;
  },
  async createEpisode(data: EpisodeRequest): Promise<EpisodeResponse> {
    const res = await api.post<EpisodeResponse>('/episodes', data);
    return res.data;
  },
  async updateEpisode(id: number, data: EpisodeRequest): Promise<EpisodeResponse> {
    const res = await api.put<EpisodeResponse>(`/episodes/${id}`, data);
    return res.data;
  },
  async deleteEpisode(id: number): Promise<void> {
    await api.delete(`/episodes/${id}`);
  },
};

export const episodeVersionService = {
  async createVersion(data: EpisodeVersionRequest): Promise<EpisodeVersionResponse> {
    const res = await api.post<EpisodeVersionResponse>('/episode-versions', data);
    return res.data;
  },
  async deleteVersion(id: number): Promise<void> {
    await api.delete(`/episode-versions/${id}`);
  }
};

export interface PremiumPackageResponse {
  id: number;
  packageName: string;
  price: number;
  durationDays: number;
  description: string;
  rewardPoints?: number;
  activeUsers: number;
  totalRevenue: number;
}

export interface PremiumPackageRequest {
  packageName: string;
  price: number;
  durationDays: number;
  description: string;
  rewardPoints?: number;
}

export const premiumPackageService = {
  async getAllPackages(): Promise<PremiumPackageResponse[]> {
    const res = await api.get<PremiumPackageResponse[]>('/premium-packages');
    return res.data;
  },
  async createPackage(data: PremiumPackageRequest): Promise<PremiumPackageResponse> {
    const res = await api.post<PremiumPackageResponse>('/premium-packages', data);
    return res.data;
  },
  async updatePackage(id: number, data: PremiumPackageRequest): Promise<PremiumPackageResponse> {
    const res = await api.put<PremiumPackageResponse>(`/premium-packages/${id}`, data);
    return res.data;
  },
  async deletePackage(id: number): Promise<void> {
    await api.delete(`/premium-packages/${id}`);
  },
};

export interface DashboardResponse {
  totalUsers: number;
  totalMovies: number;
  premiumUsers: number;
  totalRevenue: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  users: number;
}

export interface GenreCount {
  name: string;
  value: number;
}

export interface DailyViews {
  day: string;
  views: number;
}

export interface DashboardChartData {
  revenueByMonth: MonthlyRevenue[];
  genreDistribution: GenreCount[];
  viewsByDay: DailyViews[];
  userGrowthByMonth: MonthlyRevenue[];
}

export const dashboardService = {
  async getDashboardStats(): Promise<DashboardResponse> {
    const res = await api.get<DashboardResponse>('/dashboard/stats');
    return res.data;
  },
  async getChartData(): Promise<DashboardChartData> {
    const res = await api.get<DashboardChartData>('/dashboard/charts');
    return res.data;
  },
  async exportCsv(): Promise<Blob> {
    const res = await api.get('/dashboard/export', {
      responseType: 'blob',
    });
    return res.data;
  }
};

export interface PaymentResponse {
  paymentId: number;
  paymentUrl?: string;
  amount: number;
  status: string;
  paymentDate: string;
  username?: string;
  packageName?: string;
}

export const paymentService = {
  async getAllPayments(): Promise<PaymentResponse[]> {
    const res = await api.get<PaymentResponse[]>('/payments');
    return res.data;
  },
  async updatePaymentStatus(id: number, status: string): Promise<PaymentResponse> {
    const res = await api.patch<PaymentResponse>(`/payments/${id}/status`, null, { params: { status } });
    return res.data;
  }
};
