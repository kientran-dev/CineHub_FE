import api from './api';

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  fullName: string;
  avatar: string;
  dateOfBirth: string;
  rewardPoints: number;
  lastBirthdayRewardYear: number | null;
  isPremium: boolean;
  premiumPackageName: string | null;
  premiumEndDate: string | null;
}

export interface UserUpdateData {
  fullName?: string;
  avatar?: string;
  dateOfBirth?: string;
}

export interface PaymentHistory {
  paymentId: number;
  amount: number;
  status: string;
  paymentDate: string;
  packageName: string | null;
  username: string | null;
}

export const userService = {
  async getMe(): Promise<UserProfile> {
    const res = await api.get<UserProfile>('/users/me');
    return res.data;
  },

  async updateProfile(data: UserUpdateData): Promise<UserProfile> {
    const res = await api.put<UserProfile>('/users/me', data);
    return res.data;
  },

  async claimBirthdayReward(): Promise<UserProfile> {
    const res = await api.post<UserProfile>('/users/me/claim-birthday-reward');
    return res.data;
  },

  async getMyPayments(): Promise<PaymentHistory[]> {
    const res = await api.get<PaymentHistory[]>('/payments/my');
    return res.data;
  },
};
