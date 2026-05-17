import { useState, useCallback, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, Reply, ChevronDown, ChevronUp, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { useAuth } from '../contexts/AuthContext';
import { commentService, type CommentResponse } from '../services/commentService';
import { userService } from '../services/userService';

export interface CommentItem {
  id: string;
  userId: string;
  movieId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: string;
  rating?: number;
  parentId?: string;
  likes: number;
  dislikes: number;
}

function apiToCommentItem(c: CommentResponse, movieId: string): CommentItem {
  return {
    id: String(c.id),
    userId: c.username,
    movieId,
    userName: c.fullName || c.username,
    userAvatar: c.userAvatar ?? '',
    content: c.content,
    createdAt: c.createdDate,
    likes: c.likes ?? 0,
    dislikes: c.dislikes ?? 0,
  };
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return `${diff} giây trước`;
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)} ngày trước`;
  if (diff < 31536000) return `${Math.floor(diff / 2592000)} tháng trước`;
  return `${Math.floor(diff / 31536000)} năm trước`;
}

const INITIAL_ROOT_COUNT = 5;
const LOAD_MORE_COUNT = 5;
const INITIAL_REPLY_COUNT = 3;

interface SingleCommentProps {
  comment: CommentItem;
  allComments: CommentItem[];
  depth: number;
  onAddReply: (parentId: string, content: string) => void;
  liked: Set<string>;
  disliked: Set<string>;
  onLike: (id: string) => void;
  onDislike: (id: string) => void;
}

function SingleComment({
  comment,
  allComments,
  depth,
  onAddReply,
  liked,
  disliked,
  onLike,
  onDislike,
}: SingleCommentProps) {
  const { user } = useAuth();
  const displayName = user?.fullName || user?.username || 'Khách';
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [repliesExpanded, setRepliesExpanded] = useState(true);
  const [visibleRepliesCount, setVisibleRepliesCount] = useState(INITIAL_REPLY_COUNT);

  const directReplies = allComments.filter(c => c.parentId === comment.id);
  const visibleReplies = directReplies.slice(0, visibleRepliesCount);
  const hasMoreReplies = directReplies.length > visibleRepliesCount;

  const handleSubmitReply = () => {
    if (!replyText.trim()) return;
    onAddReply(comment.id, replyText.trim());
    setReplyText('');
    setReplyOpen(false);
    setRepliesExpanded(true);
  };

  const isLiked = liked.has(comment.id);
  const isDisliked = disliked.has(comment.id);

  return (
    <div className={`flex gap-3 ${depth > 0 ? 'ml-10 mt-3' : ''}`}>
      <Avatar className={depth > 0 ? 'h-8 w-8 flex-shrink-0' : 'h-10 w-10 flex-shrink-0'}>
        <AvatarImage src={comment.userAvatar} />
        <AvatarFallback className="bg-gray-700 text-white text-sm">
          {comment.userName.charAt(0)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        {/* Bubble */}
        <div className="bg-gray-800/60 rounded-2xl rounded-tl-sm px-4 py-3 border border-gray-700/50">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-semibold text-sm text-white">{comment.userName}</span>
            <span className="text-xs text-gray-400 ml-auto">{timeAgo(comment.createdAt)}</span>
          </div>
          <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap break-words">
            {comment.content}
          </p>
        </div>

        {/* Action row */}
        <div className="flex items-center gap-4 mt-1.5 ml-1">
          <button
            onClick={() => onLike(comment.id)}
            className={`flex items-center gap-1 text-xs transition-colors ${
              isLiked ? 'text-blue-400' : 'text-gray-400 hover:text-blue-400'
            }`}
          >
            <ThumbsUp className={`h-3.5 w-3.5 ${isLiked ? 'fill-blue-400' : ''}`} />
            <span>{comment.likes}</span>
          </button>

          <button
            onClick={() => onDislike(comment.id)}
            className={`flex items-center gap-1 text-xs transition-colors ${
              isDisliked ? 'text-red-400' : 'text-gray-400 hover:text-red-400'
            }`}
          >
            <ThumbsDown className={`h-3.5 w-3.5 ${isDisliked ? 'fill-red-400' : ''}`} />
            <span>{comment.dislikes}</span>
          </button>

          {depth < 2 && (
            <button
              onClick={() => setReplyOpen(v => !v)}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
            >
              <Reply className="h-3.5 w-3.5" />
              Trả lời
            </button>
          )}

          {directReplies.length > 0 && (
            <button
              onClick={() => setRepliesExpanded(v => !v)}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors ml-auto"
            >
              {repliesExpanded ? (
                <>
                  <ChevronUp className="h-3.5 w-3.5" />
                  Ẩn {directReplies.length} trả lời
                </>
              ) : (
                <>
                  <ChevronDown className="h-3.5 w-3.5" />
                  Xem {directReplies.length} trả lời
                </>
              )}
            </button>
          )}
        </div>

        {/* Inline reply form */}
        {replyOpen && (
          <div className="flex gap-2 mt-3 ml-1">
            <Avatar className="h-7 w-7 flex-shrink-0">
              <AvatarImage src={user?.avatar ?? ''} />
              <AvatarFallback className="bg-red-700 text-white text-xs">{displayName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 relative">
              <Textarea
                placeholder={`Trả lời ${comment.userName}...`}
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmitReply();
                }}
                className="min-h-16 bg-gray-800 border-gray-600 text-sm resize-none pr-10 rounded-2xl"
                autoFocus
              />
              <button
                onClick={handleSubmitReply}
                disabled={!replyText.trim()}
                className="absolute right-3 bottom-3 text-gray-400 hover:text-red-400 disabled:opacity-30 transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Nested replies */}
        {repliesExpanded && directReplies.length > 0 && (
          <div className="mt-2 space-y-3">
            {visibleReplies.map(reply => (
              <SingleComment
                key={reply.id}
                comment={reply}
                allComments={allComments}
                depth={depth + 1}
                onAddReply={onAddReply}
                liked={liked}
                disliked={disliked}
                onLike={onLike}
                onDislike={onDislike}
              />
            ))}
            {hasMoreReplies && (
              <button
                onClick={() => setVisibleRepliesCount(v => v + INITIAL_REPLY_COUNT)}
                className="ml-10 text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
              >
                <ChevronDown className="h-3.5 w-3.5" />
                Xem thêm {directReplies.length - visibleRepliesCount} trả lời
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main CommentSection ───────────────────────────────────────────────────────

interface CommentSectionProps {
  movieId: string;
  initialComments: CommentItem[];
}

export default function CommentSection({ movieId, initialComments }: CommentSectionProps) {
  const { user, isAuthenticated } = useAuth();
  const displayName = user?.fullName || user?.username || 'Khách';
  const [userAvatar, setUserAvatar] = useState<string>('');
  const [comments, setComments] = useState<CommentItem[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [visibleRootCount, setVisibleRootCount] = useState(INITIAL_ROOT_COUNT);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [disliked, setDisliked] = useState<Set<string>>(new Set());
  const [loadingComments, setLoadingComments] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch avatar từ API (không phụ thuộc vào AuthContext)
  useEffect(() => {
    if (!isAuthenticated) return;
    userService.getMe()
      .then(profile => setUserAvatar(profile.avatar ?? ''))
      .catch(() => {});
  }, [isAuthenticated]);

  // Fetch comments từ API khi mount
  useEffect(() => {
    setLoadingComments(true);
    commentService.getCommentsByMovie(movieId)
      .then(apiComments => {
        // Flatten cây comment (root + replies)
        const flat: CommentItem[] = [];
        const flattenComments = (list: CommentResponse[], parentId?: string) => {
          list.forEach(c => {
            flat.push({ ...apiToCommentItem(c, movieId), parentId: parentId ? String(parentId) : undefined });
            if (c.replies?.length) flattenComments(c.replies, String(c.id));
          });
        };
        flattenComments(apiComments);
        setComments(flat);
      })
      .catch(() => setComments([]))
      .finally(() => setLoadingComments(false));
  }, [movieId]);

  const rootComments = comments.filter(c => !c.parentId);
  const visibleRoots = rootComments.slice(0, visibleRootCount);
  const hasMore = rootComments.length > visibleRootCount;

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    if (!isAuthenticated) { toast.info('Vui lòng đăng nhập để bình luận'); return; }
    setSubmitting(true);
    try {
      const res = await commentService.addComment({ movieId: Number(movieId), content: newComment.trim() });
      const c: CommentItem = apiToCommentItem(res, movieId);
      setComments(prev => [c, ...prev]);
      setNewComment('');
      setVisibleRootCount(v => v + 1);
    } catch {
      toast.error('Gửi bình luận thất bại!');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddReply = useCallback(async (parentId: string, content: string) => {
    if (!isAuthenticated) { toast.info('Vui lòng đăng nhập để trả lời'); return; }
    try {
      const res = await commentService.addComment({ movieId: Number(movieId), content, parentId: Number(parentId) });
      const r: CommentItem = { ...apiToCommentItem(res, movieId), parentId };
      setComments(prev => [...prev, r]);
    } catch {
      toast.error('Gửi trả lời thất bại!');
    }
  }, [movieId, isAuthenticated]);

  const handleLike = useCallback(async (id: string) => {
    if (!isAuthenticated) { toast.info('Vui lòng đăng nhập để thích bình luận'); return; }
    try {
      await commentService.toggleReaction(Number(id), 'LIKE');
      // Update local state
      setComments(prev => prev.map(c => {
        if (c.id !== id) return c;
        const wasLiked = liked.has(id);
        const wasDisliked = disliked.has(id);
        return {
          ...c,
          likes: wasLiked ? c.likes - 1 : c.likes + 1,
          dislikes: wasDisliked ? c.dislikes - 1 : c.dislikes,
        };
      }));
      setLiked(prev => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id); else next.add(id);
        return next;
      });
      setDisliked(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } catch (e) {
      console.error('Like failed:', e);
    }
  }, [isAuthenticated, liked, disliked]);

  const handleDislike = useCallback(async (id: string) => {
    if (!isAuthenticated) { toast.info('Vui lòng đăng nhập để thích bình luận'); return; }
    try {
      await commentService.toggleReaction(Number(id), 'DISLIKE');
      // Update local state
      setComments(prev => prev.map(c => {
        if (c.id !== id) return c;
        const wasDisliked = disliked.has(id);
        const wasLiked = liked.has(id);
        return {
          ...c,
          dislikes: wasDisliked ? c.dislikes - 1 : c.dislikes + 1,
          likes: wasLiked ? c.likes - 1 : c.likes,
        };
      }));
      setDisliked(prev => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id); else next.add(id);
        return next;
      });
      setLiked(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } catch (e) {
      console.error('Dislike failed:', e);
    }
  }, [isAuthenticated, liked, disliked]);

  return (
    <div className="space-y-6">
      {/* Compose box */}
      <div className="bg-gray-900/60 rounded-2xl border border-gray-700/50 p-5 space-y-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarImage src={userAvatar} />
            <AvatarFallback className="bg-red-700 text-white">{displayName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold text-white">{displayName}</p>
            <p className="text-xs text-gray-400">
              {isAuthenticated ? 'Viết bình luận của bạn' : 'Đăng nhập để bình luận'}
            </p>
          </div>
        </div>

        <div className="relative">
          <Textarea
            placeholder="Chia sẻ cảm nhận của bạn... (Ctrl+Enter để gửi)"
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleAddComment();
            }}
            className="min-h-24 bg-gray-800 border-gray-600 text-sm resize-none rounded-xl"
          />
        </div>
        <div className="flex justify-end">
          <Button
            onClick={handleAddComment}
            disabled={!newComment.trim() || submitting}
            className="bg-red-600 hover:bg-red-700 gap-2 disabled:opacity-40"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Gửi bình luận
          </Button>
        </div>
      </div>

      {/* Comment count */}
      <div className="flex items-center gap-2">
        {loadingComments
          ? <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          : <span className="font-semibold text-white">{rootComments.length} bình luận</span>
        }
        <div className="flex-1 h-px bg-gray-700/50" />
      </div>

      {/* Comments list */}
      <div className="space-y-5">
        {visibleRoots.length > 0 ? (
          visibleRoots.map(c => (
            <SingleComment
              key={c.id}
              comment={c}
              allComments={comments}
              depth={0}
              onAddReply={handleAddReply}
              liked={liked}
              disliked={disliked}
              onLike={handleLike}
              onDislike={handleDislike}
            />
          ))
        ) : (
          <div className="text-center py-10 text-gray-400">
            <p className="text-lg">Chưa có bình luận nào.</p>
            <p className="text-sm mt-1">Hãy là người đầu tiên chia sẻ cảm nhận!</p>
          </div>
        )}
      </div>

      {/* Load more */}
      {hasMore && (
        <div className="text-center">
          <Button
            variant="outline"
            className="border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 gap-2"
            onClick={() => setVisibleRootCount(v => v + LOAD_MORE_COUNT)}
          >
            <ChevronDown className="h-4 w-4" />
            Xem thêm ({rootComments.length - visibleRootCount} bình luận)
          </Button>
        </div>
      )}
    </div>
  );
}
