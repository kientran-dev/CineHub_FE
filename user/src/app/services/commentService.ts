import api from './api';

export interface CommentResponse {
  id: number;
  content: string;
  createdDate: string;
  username: string;
  userAvatar: string;
  replies: CommentResponse[];
}

export interface AddCommentRequest {
  movieId: number;
  content: string;
  parentId?: number;
}

export const commentService = {
  async getCommentsByMovie(movieId: number | string): Promise<CommentResponse[]> {
    const res = await api.get<CommentResponse[]>(`/comments/movie/${movieId}`);
    return res.data;
  },

  async addComment(data: AddCommentRequest): Promise<CommentResponse> {
    const res = await api.post<CommentResponse>('/comments', data);
    return res.data;
  },

  async deleteComment(id: number): Promise<void> {
    await api.delete(`/comments/${id}`);
  },
};
