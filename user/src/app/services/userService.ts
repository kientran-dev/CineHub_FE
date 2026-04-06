import api from './api';

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  fullName: string;
  avatar: string;
  dateOfBirth: string;
  rewardPoints: number;
}

export const userService = {
  async getMe(): Promise<UserProfile> {
    const res = await api.get<UserProfile>('/users/me');
    return res.data;
  },
};
