// Mock data for the CineHub application

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  isPremium: boolean;
  subscriptionPlan?: 'monthly' | 'yearly';
  subscriptionEndDate?: string;
  role: 'user' | 'admin';
  birthdate?: string;
  loyaltyPoints?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Episode {
  id: string;
  episodeNumber: number;
  title: string;
  duration: number;
  thumbnail: string;
  videoUrl: string;
  description: string;
  episodeVersions?: { id: number; episodeId: number; videoUrl: string; type: string }[];
}

export interface Actor {
  id: string;
  name: string;
  avatar: string;
  role: string;
}

export interface Movie {
  id: string;
  title: string;
  englishTitle?: string;
  poster: string;
  backdrop: string;
  description: string;
  year: number;
  duration: number;
  rating: number;
  imdbRating?: number;
  totalRatings: number;
  categories: string[];
  country: string;
  type: 'movie' | 'series' | 'tv_show';
  episodes?: Episode[];
  isPremium: boolean;
  trending?: boolean;
  featured?: boolean;
  subtitleType?: 'vietsub' | 'thuyetminh' | 'longtieng';
  actors?: Actor[];
}

export interface WatchHistory {
  id: string;
  userId: string;
  movieId: string;
  episodeId?: string;
  progress: number;
  lastWatched: string;
}

export interface Comment {
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

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration: 'monthly' | 'yearly';
  features: string[];
}

export const currentUser: User = {
  id: 'user1',
  name: 'Nguyễn Văn A',
  email: 'user@example.com',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
  isPremium: true,
  subscriptionPlan: 'yearly',
  subscriptionEndDate: '2026-12-31',
  role: 'user',
  birthdate: '1995-05-15',
  loyaltyPoints: 2580,
};

export const categories: Category[] = [
  { id: '1', name: 'Hành động', slug: 'action' },
  { id: '2', name: 'Tâm lý', slug: 'drama' },
  { id: '3', name: 'Hài hước', slug: 'comedy' },
  { id: '4', name: 'Kinh dị', slug: 'horror' },
  { id: '5', name: 'Khoa học viễn tưởng', slug: 'sci-fi' },
  { id: '6', name: 'Lãng mạn', slug: 'romance' },
  { id: '7', name: 'Giật gân', slug: 'thriller' },
  { id: '8', name: 'Hoạt hình', slug: 'animation' },
  { id: '9', name: 'Tài liệu', slug: 'documentary' },
  { id: '10', name: 'Phiêu lưu', slug: 'adventure' },
  { id: '11', name: 'Chiến tranh', slug: 'war' },
  { id: '12', name: 'Âm nhạc', slug: 'music' },
  { id: '13', name: 'Gia đình', slug: 'family' },
  { id: '14', name: 'Hình sự', slug: 'crime' },
  { id: '15', name: 'Cổ trang', slug: 'historical' },
  { id: '16', name: 'Thể thao', slug: 'sports' },
];

export const countries = [
  { id: '1', name: 'Việt Nam', code: 'VN' },
  { id: '2', name: 'Hàn Quốc', code: 'KR' },
  { id: '3', name: 'Trung Quốc', code: 'CN' },
  { id: '4', name: 'Nhật Bản', code: 'JP' },
  { id: '5', name: 'Mỹ', code: 'US' },
  { id: '6', name: 'Thái Lan', code: 'TH' },
  { id: '7', name: 'Anh', code: 'GB' },
  { id: '8', name: 'Pháp', code: 'FR' },
  { id: '9', name: 'Ấn Độ', code: 'IN' },
  { id: '10', name: 'Đài Loan', code: 'TW' },
  { id: '11', name: 'Hồng Kông', code: 'HK' },
  { id: '12', name: 'Philippines', code: 'PH' },
];

const av = [
  'https://images.unsplash.com/photo-1749003659562-a1beba85eee2?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1697510364485-e900c2fe7524?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1754487629298-3d4a58a63379?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1749808210294-5c3b92acbc12?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1771894428645-4787aa167bc9?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1706824250412-42b8ba877abb?w=200&h=200&fit=crop',
];

function genEps(count: number, thumb: string): Episode[] {
  const t = ['Khởi đầu','Bí mật','Phản bội','Đối đầu','Sự thật','Tình yêu','Chiến đấu','Hy vọng','Phục thù','Kết thúc',
    'Hành trình mới','Ngã rẽ','Thử thách','Liên minh','Chia ly','Hội ngộ','Âm mưu','Giải cứu','Quyết định','Định mệnh',
    'Bóng tối','Ánh sáng','Dũng cảm','Hy sinh','Trở về','Khám phá','Nguy hiểm','Bảo vệ','Tự do','Vinh quang',
    'Truy đuổi','Đánh lừa','Đoàn tụ','Mất mát','Vượt qua','Lời hứa','Cuộc chiến','Sức mạnh','Tận cùng','Hồi sinh',
    'Cơ hội','Thay đổi','Niềm tin','Thương nhớ','Giông bão','Bình minh','Hoàng hôn','Lựa chọn','Số phận','Khai màn'];
  return Array.from({ length: count }, (_, i) => ({
    id: `e${i + 1}`,
    episodeNumber: i + 1,
    title: t[i % t.length],
    duration: 42 + Math.floor(Math.random() * 15),
    thumbnail: thumb,
    videoUrl: '#',
    description: `Tập ${i + 1}: ${t[i % t.length]}`,
  }));
}

export const movies: Movie[] = [
  {
    id: '1',
    title: 'Sứ Mệnh Nguy Hiểm',
    englishTitle: 'Mission Impossible',
    poster: 'https://images.unsplash.com/photo-1765510296004-614b6cc204da?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhY3Rpb24lMjBtb3ZpZSUyMHBvc3RlcnxlbnwxfHx8fDE3NzM3NTY5NTF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    backdrop: 'https://images.unsplash.com/photo-1765510296004-614b6cc204da?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhY3Rpb24lMjBtb3ZpZSUyMHBvc3RlcnxlbnwxfHx8fDE3NzM3NTY5NTF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Một đặc vụ bí mật thuộc lực lượng IMF phải thực hiện nhiệm vụ cứu thế giới khỏi một âm mưu khủng bố nguy hiểm nhất lịch sử. Với những pha hành động nghẹt thở, những cú lừa ngoạn mục và tình tiết bất ngờ đến phút cuối, bộ phim đưa khán giả vào cuộc phiêu lưu không thể rời mắt qua nhiều quốc gia trên thế giới. Mỗi thành viên trong đội đều mang trong mình những bí mật riêng và sự hy sinh cao cả.',
    year: 2024, duration: 142, rating: 4.5, imdbRating: 8.2, totalRatings: 1250,
    categories: ['action', 'thriller'], country: 'US', type: 'movie',
    isPremium: false, trending: true, featured: true, subtitleType: 'vietsub',
    actors: [
      { id: 'a1', name: 'Tom Cruise', avatar: av[2], role: 'Ethan Hunt' },
      { id: 'a2', name: 'Rebecca Ferguson', avatar: av[5], role: 'Ilsa Faust' },
      { id: 'a3', name: 'Simon Pegg', avatar: av[4], role: 'Benji Dunn' },
      { id: 'a4', name: 'Ving Rhames', avatar: av[0], role: 'Luther Stickell' },
    ],
  },
  {
    id: '2',
    title: 'Câu Chuyện Tình Yêu',
    englishTitle: 'Love Story',
    poster: 'https://images.unsplash.com/photo-1514846528774-8de9d4a07023?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb21hbmNlJTIwY291cGxlJTIwbG92ZXxlbnwxfHx8fDE3NzM3NTgzMDJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    backdrop: 'https://images.unsplash.com/photo-1514846528774-8de9d4a07023?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb21hbmNlJTIwY291cGxlJTIwbG92ZXxlbnwxfHx8fDE3NzM3NTgzMDJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Một câu chuyện tình yêu lãng mạn giữa hai người từ hai thế giới khác nhau. Cô gái con nhà tài phiệt và chàng trai nghèo tình cờ gặp nhau trong một đêm mưa bão, từ đó bắt đầu một mối tình đầy trắc trở nhưng cũng không kém phần ngọt ngào và cảm động. Họ phải vượt qua mọi rào cản xã hội để bảo vệ tình yêu.',
    year: 2025, duration: 118, rating: 4.2, imdbRating: 7.8, totalRatings: 890,
    categories: ['romance', 'drama'], country: 'KR', type: 'movie',
    isPremium: true, trending: true, subtitleType: 'thuyetminh',
    actors: [
      { id: 'a5', name: 'Park Seo-joon', avatar: av[0], role: 'Ji-hoon' },
      { id: 'a6', name: 'Kim Ji-won', avatar: av[1], role: 'Soo-ah' },
      { id: 'a7', name: 'Lee Do-hyun', avatar: av[4], role: 'Min-jun' },
      { id: 'a8', name: 'Han So-hee', avatar: av[3], role: 'Ye-jin' },
    ],
  },
  {
    id: '3',
    title: 'Thám Tử Lừng Danh',
    englishTitle: 'The Great Detective',
    poster: 'https://images.unsplash.com/photo-1734812070354-a0af3c243b2a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmltZSUyMGRldGVjdGl2ZSUyMGludmVzdGlnYXRpb258ZW58MXx8fHwxNzczNzA1MDUyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    backdrop: 'https://images.unsplash.com/photo-1734812070354-a0af3c243b2a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmltZSUyMGRldGVjdGl2ZSUyMGludmVzdGlnYXRpb258ZW58MXx8fHwxNzczNzA1MDUyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Một thám tử tài ba với khả năng suy luận phi thường phải đối mặt với vụ án bí ẩn nhất trong sự nghiệp. Kẻ giết người hàng loạt luôn đi trước cảnh sát một bước, để lại những manh mối rối rắm và thách thức trí tuệ của thám tử. Cuộc truy đuổi kéo dài qua 50 tập phim đầy kịch tính và bất ngờ.',
    year: 2024, duration: 50, rating: 4.7, imdbRating: 8.5, totalRatings: 2100,
    categories: ['thriller', 'drama'], country: 'VN', type: 'series',
    isPremium: false, trending: true, subtitleType: 'longtieng',
    actors: [
      { id: 'a9', name: 'Trấn Thành', avatar: av[0], role: 'Thám tử Minh' },
      { id: 'a10', name: 'Ninh Dương Lan Ngọc', avatar: av[1], role: 'Thanh Hằng' },
      { id: 'a11', name: 'Kiều Minh Tuấn', avatar: av[4], role: 'Đại úy Hùng' },
      { id: 'a12', name: 'Thu Trang', avatar: av[3], role: 'Bà Tám' },
    ],
    episodes: genEps(50, 'https://images.unsplash.com/photo-1734812070354-a0af3c243b2a?w=400'),
  },
  {
    id: '4',
    title: 'Tương Lai Tối Tăm',
    englishTitle: 'Dark Future',
    poster: 'https://images.unsplash.com/photo-1619960535025-3a06477c8ef5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzY2llbmNlJTIwZmljdGlvbiUyMGZ1dHVyaXN0aWN8ZW58MXx8fHwxNzczNjc0ODc0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    backdrop: 'https://images.unsplash.com/photo-1619960535025-3a06477c8ef5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzY2llbmNlJTIwZmljdGlvbiUyMGZ1dHVyaXN0aWN8ZW58MXx8fHwxNzczNjc0ODc0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Trong một tương lai dystopian năm 2150, loài người phải chiến đấu để tồn tại trước sự xâm lược của trí tuệ nhân tạo đã vượt ngoài tầm kiểm soát. Một nhóm kháng chiến bí mật là hy vọng cuối cùng của nhân loại trong cuộc chiến sinh tồn khốc liệt nhất lịch sử. Tình yêu và lòng dũng cảm sẽ quyết định số phận nhân loại.',
    year: 2025, duration: 156, rating: 4.8, imdbRating: 8.9, totalRatings: 3200,
    categories: ['sci-fi', 'action'], country: 'US', type: 'movie',
    isPremium: true, featured: true, subtitleType: 'vietsub',
    actors: [
      { id: 'a13', name: 'Chris Evans', avatar: av[2], role: 'Captain Rex' },
      { id: 'a14', name: 'Zendaya', avatar: av[5], role: 'Dr. Nova' },
      { id: 'a15', name: 'Oscar Isaac', avatar: av[4], role: 'Marcus' },
      { id: 'a16', name: 'Florence Pugh', avatar: av[3], role: 'Elena' },
    ],
  },
  {
    id: '5',
    title: 'Ác Mộng Kinh Hoàng',
    englishTitle: 'Nightmare',
    poster: 'https://images.unsplash.com/photo-1713065539753-7ffabcde58a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3Jyb3IlMjBkYXJrJTIwc2Nhcnl8ZW58MXx8fHwxNzczNjkxMjcxfDA&ixlib=rb-4.1.0&q=80&w=1080',
    backdrop: 'https://images.unsplash.com/photo-1713065539753-7ffabcde58a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3Jyb3IlMjBkYXJrJTIwc2Nhcnl8ZW58MXx8fHwxNzczNjkxMjcxfDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Một ngôi nhà bị ám với những bí mật đáng sợ chờ được khám phá. Gia đình nhỏ chuyển đến sống trong căn biệt thự cổ kính và bắt đầu chứng kiến những hiện tượng siêu nhiên kỳ lạ. Họ phải tìm cách giải mã lời nguyền trước khi quá muộn, khi bóng tối dần nuốt chửng mọi thứ.',
    year: 2024, duration: 98, rating: 4.0, imdbRating: 7.2, totalRatings: 750,
    categories: ['horror', 'thriller'], country: 'TH', type: 'movie',
    isPremium: false, featured: true, subtitleType: 'vietsub',
    actors: [
      { id: 'a17', name: 'Mario Maurer', avatar: av[0], role: 'Arthit' },
      { id: 'a18', name: 'Baifern Pimchanok', avatar: av[1], role: 'Namtan' },
      { id: 'a19', name: 'Sunny Suwanmethanont', avatar: av[4], role: 'Korn' },
    ],
  },
  {
    id: '6',
    title: 'Cuộc Phiêu Lưu Kỳ Diệu',
    englishTitle: 'Magical Adventure',
    poster: 'https://images.unsplash.com/photo-1758484102803-760525a244d2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYW50YXN5JTIwbWFnaWNhbCUyMGFkdmVudHVyZXxlbnwxfHx8fDE3NzM3Njc4MjZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    backdrop: 'https://images.unsplash.com/photo-1758484102803-760525a244d2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYW50YXN5JTIwbWFnaWNhbCUyMGFkdmVudHVyZXxlbnwxfHx8fDE3NzM3Njc4MjZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Một hành trình phiêu lưu đầy phép thuật và kỳ diệu qua những vùng đất huyền bí. Cô bé Yuki cùng những người bạn phải vượt qua thử thách để cứu vương quốc phép thuật khỏi bóng tối đang bao trùm. Thế giới tưởng tượng đầy màu sắc mở ra trước mắt.',
    year: 2025, duration: 132, rating: 4.6, imdbRating: 8.4, totalRatings: 1800,
    categories: ['adventure', 'animation'], country: 'JP', type: 'movie',
    isPremium: true, featured: true, subtitleType: 'vietsub',
    actors: [
      { id: 'a20', name: 'Kamiki Ryunosuke', avatar: av[0], role: 'Taki (giọng nói)' },
      { id: 'a21', name: 'Mone Kamishiraishi', avatar: av[1], role: 'Mitsuha (giọng nói)' },
    ],
  },
  {
    id: '7',
    title: 'Cuộc Đời Hoang Dã',
    englishTitle: 'Wild Life',
    poster: 'https://images.unsplash.com/photo-1719743441581-632023e3d2ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb2N1bWVudGFyeSUyMG5hdHVyZSUyMHdpbGRsaWZlfGVufDF8fHx8MTc3MzcxNDQxMXww&ixlib=rb-4.1.0&q=80&w=1080',
    backdrop: 'https://images.unsplash.com/photo-1719743441581-632023e3d2ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb2N1bWVudGFyeSUyMG5hdHVyZSUyMHdpbGRsaWZlfGVufDF8fHx8MTc3MzcxNDQxMXww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Khám phá thế giới tự nhiên và động vật hoang dã qua ống kính của những nhà làm phim tài liệu hàng đầu thế giới. Từ rừng Amazon đến sa mạc Sahara, hành trình kéo dài suốt 3 năm quay phim với những hình ảnh chưa từng thấy trước đây.',
    year: 2024, duration: 88, rating: 4.4, imdbRating: 8.1, totalRatings: 620,
    categories: ['documentary'], country: 'GB', type: 'movie',
    isPremium: false, subtitleType: 'thuyetminh',
    actors: [{ id: 'a22', name: 'David Attenborough', avatar: av[2], role: 'Người dẫn chuyện' }],
  },
  {
    id: '8',
    title: 'Miền Viễn Tây',
    englishTitle: 'The Western',
    poster: 'https://images.unsplash.com/photo-1650397306168-64d1eddcc13d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZXN0ZXJuJTIwY293Ym95JTIwZGVzZXJ0fGVufDF8fHx8MTc3MzY5MjQxNHww&ixlib=rb-4.1.0&q=80&w=1080',
    backdrop: 'https://images.unsplash.com/photo-1650397306168-64d1eddcc13d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZXN0ZXJuJTIwY293Ym95JTIwZGVzZXJ0fGVufDF8fHx8MTc3MzY5MjQxNHww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Câu chuyện về những cao bồi và cuộc sống ở miền Tây hoang dã nước Mỹ thế kỷ 19. Một cựu tội phạm cố gắng làm lại cuộc đời nhưng quá khứ không buông tha, buộc anh phải đối mặt với kẻ thù cũ trong trận đấu súng cuối cùng mang tính quyết định.',
    year: 2024, duration: 126, rating: 4.3, imdbRating: 7.6, totalRatings: 980,
    categories: ['action', 'drama'], country: 'US', type: 'movie',
    isPremium: false, subtitleType: 'vietsub',
    actors: [
      { id: 'a23', name: 'Clint Eastwood Jr.', avatar: av[2], role: 'The Stranger' },
      { id: 'a24', name: 'Margot Robbie', avatar: av[5], role: 'Sarah' },
    ],
  },
  {
    id: '9',
    title: 'Đừng Quên Kẻ Thù Của Em',
    englishTitle: 'Never Forget Your Enemy',
    poster: 'https://images.unsplash.com/photo-1583763862221-4d97d17c9381?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb3JlYW4lMjBkcmFtYSUyMHJvbWFuY2UlMjBjb3VwbGV8ZW58MXx8fHwxNzczNzcxMDE2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    backdrop: 'https://images.unsplash.com/photo-1583763862221-4d97d17c9381?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb3JlYW4lMjBkcmFtYSUyMHJvbWFuY2UlMjBjb3VwbGV8ZW58MXx8fHwxNzczNzcxMDE2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Một câu chuyện tình yêu học đường đầy cảm động và kỷ niệm. Hai người bạn thời niên thiếu gặp lại nhau sau 10 năm xa cách, nhưng giữa họ giờ đây là những bí mật và hiểu lầm cần được giải quyết trước khi tình yêu có thể nở rộ một lần nữa.',
    year: 2025, duration: 110, rating: 4.5, imdbRating: 8.3, totalRatings: 2500,
    categories: ['romance', 'drama'], country: 'KR', type: 'movie',
    isPremium: false, trending: true, subtitleType: 'vietsub',
    actors: [
      { id: 'a25', name: 'Song Joong-ki', avatar: av[0], role: 'Yoo Si-jin' },
      { id: 'a26', name: 'Song Hye-kyo', avatar: av[1], role: 'Kang Mo-yeon' },
      { id: 'a27', name: 'Jin Goo', avatar: av[4], role: 'Seo Dae-young' },
    ],
  },
  {
    id: '10',
    title: 'Cực Hạn',
    englishTitle: 'Climax',
    poster: 'https://images.unsplash.com/photo-1608120073766-c80051eccbf6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb3JlYW4lMjB0aHJpbGxlciUyMG15c3Rlcnl8ZW58MXx8fHwxNzczNzcxMDE4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    backdrop: 'https://images.unsplash.com/photo-1608120073766-c80051eccbf6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb3JlYW4lMjB0aHJpbGxlciUyMG15c3Rlcnl8ZW58MXx8fHwxNzczNzcxMDE4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Một vụ án bí ẩn đầy kịch tính và gay cấn khiến cả đất nước chấn động. Cảnh sát trưởng phải đối mặt với kẻ sát nhân hàng loạt có IQ vượt trội, trong khi đồng hồ đang đếm ngược và nhiều nạn nhân khác đang gặp nguy hiểm.',
    year: 2024, duration: 128, rating: 4.6, imdbRating: 8.6, totalRatings: 1900,
    categories: ['thriller', 'action'], country: 'KR', type: 'movie',
    isPremium: false, trending: true, subtitleType: 'thuyetminh',
    actors: [
      { id: 'a28', name: 'Hyun Bin', avatar: av[0], role: 'Thám tử Kim' },
      { id: 'a29', name: 'Son Ye-jin', avatar: av[1], role: 'Công tố viên Yoon' },
    ],
  },
  {
    id: '11',
    title: 'Mùa Rực Rỡ Của Em',
    englishTitle: 'In Your Radiant Season',
    poster: 'https://images.unsplash.com/photo-1583763862221-4d97d17c9381?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb3JlYW4lMjBkcmFtYSUyMHJvbWFuY2UlMjBjb3VwbGV8ZW58MXx8fHwxNzczNzcxMDE2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    backdrop: 'https://images.unsplash.com/photo-1583763862221-4d97d17c9381?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb3JlYW4lMjBkcmFtYSUyMHJvbWFuY2UlMjBjb3VwbGV8ZW58MXx8fHwxNzczNzcxMDE2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Thanh xuân, tình bạn và tình yêu trong trường học. Câu chuyện xoay quanh nhóm bạn trẻ trải qua những năm tháng đẹp nhất đời người, với những nụ cười, nước mắt và kỷ niệm không thể nào quên. Mỗi tập phim là một bài học về cuộc sống.',
    year: 2025, duration: 105, rating: 4.3, imdbRating: 7.9, totalRatings: 1600,
    categories: ['romance', 'drama'], country: 'KR', type: 'series',
    isPremium: true, subtitleType: 'vietsub',
    actors: [
      { id: 'a30', name: 'Ahn Hyo-seop', avatar: av[0], role: 'Kang Tae-mu' },
      { id: 'a31', name: 'Kim Se-jeong', avatar: av[1], role: 'Shin Ha-ri' },
    ],
    episodes: genEps(50, 'https://images.unsplash.com/photo-1583763862221-4d97d17c9381?w=400'),
  },
  {
    id: '12',
    title: 'Trần Tình Lệnh',
    englishTitle: 'The Untamed',
    poster: 'https://images.unsplash.com/photo-1769327779917-f2154db01705?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGluZXNlJTIwaGlzdG9yaWNhbCUyMGRyYW1hJTIwY29zdHVtZXxlbnwxfHx8fDE3NzM2Njk2MTN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    backdrop: 'https://images.unsplash.com/photo-1769327779917-f2154db01705?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGluZXNlJTIwaGlzdG9yaWNhbCUyMGRyYW1hJTIwY29zdHVtZXxlbnwxfHx8fDE3NzM2Njk2MTN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Câu chuyện kiếm hiệp đầy nghĩa khí và tình nghĩa giữa hai tay kiếm tài ba. Bối cảnh cổ trang hùng vĩ với những trận chiến võ thuật mãn nhãn và tình bạn vượt qua mọi thử thách của thời gian. Một siêu phẩm cổ trang được yêu thích nhất.',
    year: 2024, duration: 45, rating: 4.8, imdbRating: 8.7, totalRatings: 3500,
    categories: ['drama', 'adventure'], country: 'CN', type: 'series',
    isPremium: false, trending: true, subtitleType: 'vietsub',
    actors: [
      { id: 'a32', name: 'Tiêu Chiến', avatar: av[0], role: 'Ngụy Vô Tiện' },
      { id: 'a33', name: 'Vương Nhất Bác', avatar: av[4], role: 'Lam Vong Cơ' },
    ],
    episodes: genEps(50, 'https://images.unsplash.com/photo-1769327779917-f2154db01705?w=400'),
  },
  {
    id: '13',
    title: 'Hộ Tâm',
    englishTitle: 'Heart Protection',
    poster: 'https://images.unsplash.com/photo-1722411644368-3f761c6cce67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGluZXNlJTIwbWFydGlhbCUyMGFydHMlMjBhY3Rpb258ZW58MXx8fHwxNzczNzcxMDE4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    backdrop: 'https://images.unsplash.com/photo-1722411644368-3f761c6cce67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGluZXNlJTIwbWFydGlhbCUyMGFydHMlMjBhY3Rpb258ZW58MXx8fHwxNzczNzcxMDE4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Võ thuật đỉnh cao và tình nghĩa giang hồ trong thế giới cổ đại. Một kiếm khách trẻ tuổi phải bảo vệ bí kíp võ công tối thượng khỏi tay thế lực hắc ám, đồng thời tìm kiếm sự thật về cái chết bí ẩn của sư phụ mình.',
    year: 2025, duration: 134, rating: 4.7, imdbRating: 8.5, totalRatings: 2800,
    categories: ['action', 'adventure'], country: 'CN', type: 'movie',
    isPremium: true, trending: true, subtitleType: 'longtieng',
    actors: [
      { id: 'a34', name: 'Dương Dương', avatar: av[0], role: 'Trương Tiểu Phàm' },
      { id: 'a35', name: 'Triệu Lệ Dĩnh', avatar: av[1], role: 'Bích Dao' },
    ],
  },
  {
    id: '14',
    title: 'Trầu Cau Từ Sinh',
    englishTitle: 'Forever Love',
    poster: 'https://images.unsplash.com/photo-1769327779917-f2154db01705?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGluZXNlJTIwaGlzdG9yaWNhbCUyMGRyYW1hJTIwY29zdHVtZXxlbnwxfHx8fDE3NzM2Njk2MTN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    backdrop: 'https://images.unsplash.com/photo-1769327779917-f2154db01705?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGluZXNlJTIwaGlzdG9yaWNhbCUyMGRyYW1hJTIwY29zdHVtZXxlbnwxfHx8fDE3NzM2Njk2MTN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Tình yêu vượt thời gian trong bối cảnh cổ trang huy hoàng. Một hoàng tử và cô gái thường dân phải đấu tranh chống lại quy tắc triều đình để bảo vệ tình yêu của họ qua nhiều kiếp luân hồi đầy cảm động.',
    year: 2024, duration: 120, rating: 4.4, imdbRating: 8.0, totalRatings: 2100,
    categories: ['romance', 'drama'], country: 'CN', type: 'movie',
    isPremium: false, subtitleType: 'thuyetminh',
    actors: [
      { id: 'a36', name: 'Lý Hiện', avatar: av[0], role: 'Hàn Thương' },
      { id: 'a37', name: 'Dương Tử', avatar: av[1], role: 'Cẩm Mịch' },
    ],
  },
  {
    id: '15',
    title: 'Siêu Anh Hùng Trỗi Dậy',
    englishTitle: 'Heroes Rising',
    poster: 'https://images.unsplash.com/photo-1712574853710-df0993e07e2b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob2xseXdvb2QlMjBhY3Rpb24lMjBzdXBlcmhlcm98ZW58MXx8fHwxNzczNzcxMDE3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    backdrop: 'https://images.unsplash.com/photo-1712574853710-df0993e07e2b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob2xseXdvb2QlMjBhY3Rpb24lMjBzdXBlcmhlcm98ZW58MXx8fHwxNzczNzcxMDE3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Liên minh siêu anh hùng chiến đấu chống lại thế lực hắc ám đe dọa hủy diệt cả vũ trụ. Khi kẻ thù mạnh nhất xuất hiện, các anh hùng phải gác lại hiềm khích để cùng nhau bảo vệ Trái Đất trong trận chiến cuối cùng mang tính quyết định.',
    year: 2025, duration: 148, rating: 4.7, imdbRating: 8.4, totalRatings: 4200,
    categories: ['action', 'sci-fi'], country: 'US', type: 'movie',
    isPremium: true, trending: true, subtitleType: 'vietsub',
    actors: [
      { id: 'a38', name: 'Robert Downey Jr.', avatar: av[2], role: 'Tony Stark' },
      { id: 'a39', name: 'Scarlett Johansson', avatar: av[5], role: 'Natasha' },
      { id: 'a40', name: 'Chris Hemsworth', avatar: av[4], role: 'Thor' },
    ],
  },
  {
    id: '16',
    title: 'Quý Tộc Anh Quốc',
    englishTitle: 'The Crown Estate',
    poster: 'https://images.unsplash.com/photo-1683383402553-71b877c57f76?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicml0aXNoJTIwcGVyaW9kJTIwZHJhbWElMjBlbGVnYW50fGVufDF8fHx8MTc3Mzc3MTAxOHww&ixlib=rb-4.1.0&q=80&w=1080',
    backdrop: 'https://images.unsplash.com/photo-1683383402553-71b877c57f76?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicml0aXNoJTIwcGVyaW9kJTIwZHJhbWElMjBlbGVnYW50fGVufDF8fHx8MTc3Mzc3MTAxOHww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Cuộc sống xa hoa và những âm mưu quyền lực trong giới quý tộc Anh thế kỷ 19. Gia tộc Pemberton phải đối mặt với những scandal chấn động và cuộc chiến tranh giành tài sản khổng lồ. Mỗi tập phim là một sự kiện đầy kịch tính.',
    year: 2024, duration: 125, rating: 4.5, imdbRating: 8.2, totalRatings: 1800,
    categories: ['drama', 'romance'], country: 'GB', type: 'series',
    isPremium: false, subtitleType: 'vietsub',
    actors: [
      { id: 'a41', name: 'Benedict Cumberbatch', avatar: av[2], role: 'Lord Pemberton' },
      { id: 'a42', name: 'Keira Knightley', avatar: av[5], role: 'Lady Elizabeth' },
    ],
    episodes: genEps(50, 'https://images.unsplash.com/photo-1683383402553-71b877c57f76?w=400'),
  },
  {
    id: '17',
    title: 'Hành Trình Kỳ Diệu',
    englishTitle: 'Magical Journey',
    poster: 'https://images.unsplash.com/photo-1657625947315-03727763fa19?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmltYXRlZCUyMG1vdmllJTIwY29sb3JmdWwlMjBmYW50YXN5fGVufDF8fHx8MTc3Mzc3MTAxN3ww&ixlib=rb-4.1.0&q=80&w=1080',
    backdrop: 'https://images.unsplash.com/photo-1657625947315-03727763fa19?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmltYXRlZCUyMG1vdmllJTIwY29sb3JmdWwlMjBmYW50YXN5fGVufDF8fHx8MTc3Mzc3MTAxN3ww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Cuộc phiêu lưu đầy màu sắc của những nhân vật hoạt hình dễ thương qua những vùng đất kỳ diệu. Cậu bé Tí cùng chú mèo phép thuật phải tìm 7 viên ngọc rồng để cứu thế giới hoạt hình khỏi thế lực hắc ám.',
    year: 2025, duration: 95, rating: 4.6, imdbRating: 8.3, totalRatings: 2600,
    categories: ['animation', 'adventure'], country: 'US', type: 'movie',
    isPremium: false, trending: true, subtitleType: 'longtieng',
    actors: [
      { id: 'a43', name: 'Ryan Reynolds', avatar: av[2], role: 'Tí (giọng nói)' },
      { id: 'a44', name: 'Anna Kendrick', avatar: av[5], role: 'Mèo Luna (giọng nói)' },
    ],
  },
  {
    id: '18',
    title: 'Thế Giới Anime',
    englishTitle: 'Anime World',
    poster: 'https://images.unsplash.com/photo-1755756383664-af3cf523242b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmltZSUyMGFkdmVudHVyZSUyMGNvbG9yZnVsfGVufDF8fHx8MTc3Mzc3MTAxOXww&ixlib=rb-4.1.0&q=80&w=1080',
    backdrop: 'https://images.unsplash.com/photo-1755756383664-af3cf523242b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmltZSUyMGFkdmVudHVyZSUyMGNvbG9yZnVsfGVufDF8fHx8MTc3Mzc3MTAxOXww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Thế giới anime đầy màu sắc với những câu chuyện cảm động về tình bạn, lòng dũng cảm và ước mơ. Một chàng trai bình thường bất ngờ được triệu hồi đến thế giới khác và trở thành anh hùng cứu thế giới.',
    year: 2024, duration: 24, rating: 4.7, imdbRating: 8.6, totalRatings: 3100,
    categories: ['animation', 'adventure'], country: 'JP', type: 'series',
    isPremium: true, subtitleType: 'vietsub',
    actors: [
      { id: 'a45', name: 'Hanae Natsuki', avatar: av[0], role: 'Tanjiro (giọng nói)' },
      { id: 'a46', name: 'Kito Akari', avatar: av[1], role: 'Nezuko (giọng nói)' },
    ],
    episodes: genEps(50, 'https://images.unsplash.com/photo-1755756383664-af3cf523242b?w=400'),
  },
  {
    id: '19',
    title: 'Vương Quốc Phép Thuật',
    englishTitle: 'Magic Kingdom',
    poster: 'https://images.unsplash.com/photo-1657625947315-03727763fa19?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmltYXRlZCUyMG1vdmllJTIwY29sb3JmdWwlMjBmYW50YXN5fGVufDF8fHx8MTc3Mzc3MTAxN3ww&ixlib=rb-4.1.0&q=80&w=1080',
    backdrop: 'https://images.unsplash.com/photo-1657625947315-03727763fa19?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmltYXRlZCUyMG1vdmllJTIwY29sb3JmdWwlMjBmYW50YXN5fGVufDF8fHx8MTc3Mzc3MTAxN3ww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Một vương quốc phép thuật với những cuộc phiêu lưu kỳ thú, nơi phép thuật và tình bạn là sức mạnh vĩ đại nhất. Công chúa nhỏ phải học cách sử dụng phép thuật để bảo vệ vương quốc trước những kẻ xâm lược.',
    year: 2025, duration: 102, rating: 4.5, imdbRating: 8.1, totalRatings: 1900,
    categories: ['animation', 'adventure'], country: 'US', type: 'movie',
    isPremium: false, subtitleType: 'longtieng',
    actors: [
      { id: 'a47', name: 'Idina Menzel', avatar: av[5], role: 'Nữ hoàng (giọng nói)' },
      { id: 'a48', name: 'Josh Gad', avatar: av[2], role: 'Olaf (giọng nói)' },
    ],
  },
];

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: '1', name: 'Gói Tháng', price: 79000, duration: 'monthly',
    features: ['Xem không giới hạn tất cả phim','Bỏ qua quảng cáo trước video','Mở khóa chất lượng HD (1080p)','Xem trên 2 thiết bị cùng lúc','Tải xuống offline'],
  },
  {
    id: '2', name: 'Gói Năm', price: 799000, duration: 'yearly',
    features: ['Xem không giới hạn tất cả phim','Bỏ qua quảng cáo trước video','Mở khóa chất lượng 4K (2160p)','Xem trên 4 thiết bị cùng lúc','Tải xuống offline không giới hạn','Ưu tiên hỗ trợ khách hàng','Tiết kiệm 16% so với gói tháng'],
  },
];

export const watchHistory: WatchHistory[] = [
  { id: '1', userId: '1', movieId: '3', episodeId: 'e1', progress: 65, lastWatched: '2026-03-16T20:30:00' },
  { id: '2', userId: '1', movieId: '1', progress: 42, lastWatched: '2026-03-15T19:15:00' },
  { id: '3', userId: '1', movieId: '4', progress: 88, lastWatched: '2026-03-14T21:45:00' },
];

export const favorites: string[] = ['1', '2', '4', '6'];

export const comments: Comment[] = [
  { id: '1', userId: '1', movieId: '1', userName: 'Nguyễn Văn An', userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop', content: 'Phim rất hay và hấp dẫn! Diễn xuất tuyệt vời, cốt truyện cuốn hút từ đầu đến cuối. Không thể rời mắt!', createdAt: '2026-03-15T10:30:00', rating: 5, likes: 24, dislikes: 1 },
  { id: '1-r1', userId: '2', movieId: '1', userName: 'Trần Thị Bình', userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', content: 'Mình đồng ý! Phần hành động ở nửa sau phim thật sự đỉnh cao.', createdAt: '2026-03-15T11:10:00', parentId: '1', likes: 8, dislikes: 0 },
  { id: '1-r2', userId: '3', movieId: '1', userName: 'Lê Minh Quân', userAvatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop', content: 'Ừ nhỉ, cảnh cuối phim mình xem lại đến 3 lần rồi 😂', createdAt: '2026-03-15T12:00:00', parentId: '1', likes: 5, dislikes: 0 },
  { id: '1-r1-r1', userId: '1', movieId: '1', userName: 'Nguyễn Văn An', userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop', content: 'Haha đúng rồi bạn ơi! Mình cũng vậy 😄', createdAt: '2026-03-15T12:30:00', parentId: '1-r1', likes: 3, dislikes: 0 },
  { id: '2', userId: '2', movieId: '1', userName: 'Trần Thị Bình', userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', content: 'Cốt truyện cuốn hút, đáng xem! Chỉ tiếc phần kết hơi vội, mong có phần 2 để giải thích thêm nhiều điều bí ẩn.', createdAt: '2026-03-14T15:20:00', rating: 4, likes: 12, dislikes: 2 },
  { id: '2-r1', userId: '3', movieId: '1', userName: 'Lê Minh Quân', userAvatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop', content: 'Bạn ơi tôi nghe đồn phần 2 đang trong giai đoạn sản xuất rồi đó!', createdAt: '2026-03-14T16:05:00', parentId: '2', likes: 7, dislikes: 0 },
  { id: '3', userId: '3', movieId: '1', userName: 'Lê Minh Quân', userAvatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop', content: 'Một trong những bộ phim hay nhất năm! Không thể bỏ lỡ. Diễn xuất của dàn diễn viên cực kỳ xuất sắc.', createdAt: '2026-03-13T20:45:00', rating: 5, likes: 31, dislikes: 0 },
  { id: '4', userId: '4', movieId: '1', userName: 'Phạm Hồng Nhung', userAvatar: 'https://images.unsplash.com/photo-1548142813-c348350df52b?w=100&h=100&fit=crop', content: 'Mình thấy ổn thôi, không đặc sắc lắm so với kỳ vọng ban đầu. Nhưng vẫn đáng để xem một lần.', createdAt: '2026-03-12T09:30:00', rating: 3, likes: 5, dislikes: 3 },
  { id: '4-r1', userId: '2', movieId: '1', userName: 'Trần Thị Bình', userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', content: 'Bạn đặt kỳ vọng quá cao nên mới vậy thôi, mình thấy hay mà 😅', createdAt: '2026-03-12T10:15:00', parentId: '4', likes: 4, dislikes: 1 },
  { id: '5', userId: '5', movieId: '1', userName: 'Võ Thành Đạt', userAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop', content: 'Soundtrack của phim cũng rất hay! Nhạc nền góp phần rất lớn tạo nên không khí kịch tính.', createdAt: '2026-03-11T14:20:00', rating: 4, likes: 9, dislikes: 0 },
];

export const allUsers = [
  currentUser,
  { id: '2', name: 'Trần Thị Bình', email: 'tranthibinh@example.com', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', isPremium: false, role: 'user' as const },
  { id: '3', name: 'Lê Văn Cường', email: 'levancuong@example.com', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop', isPremium: true, subscriptionPlan: 'yearly' as const, subscriptionEndDate: '2027-01-20', role: 'user' as const },
];

export function getRecommendations(movieId: string, count: number = 6): Movie[] {
  const movie = movies.find(m => m.id === movieId);
  if (!movie) return movies.slice(0, count);
  const scored = movies.filter(m => m.id !== movieId).map(m => {
    let score = 0;
    score += m.categories.filter(c => movie.categories.includes(c)).length * 3;
    if (m.country === movie.country) score += 2;
    if (m.type === movie.type) score += 1;
    score += (m.imdbRating || m.rating) * 0.5;
    return { movie: m, score };
  }).sort((a, b) => b.score - a.score);
  return scored.slice(0, count).map(s => s.movie);
}

export function getPersonalRecommendations(count: number = 12): Movie[] {
  const watchedIds = watchHistory.map(w => w.movieId);
  const allInterested = [...new Set([...watchedIds, ...favorites])];
  const interestedMovies = allInterested.map(id => movies.find(m => m.id === id)).filter(Boolean) as Movie[];
  const catCount: Record<string, number> = {};
  const countryCount: Record<string, number> = {};
  interestedMovies.forEach(m => {
    m.categories.forEach(c => { catCount[c] = (catCount[c] || 0) + 1; });
    countryCount[m.country] = (countryCount[m.country] || 0) + 1;
  });
  const scored = movies.filter(m => !allInterested.includes(m.id)).map(m => {
    let score = 0;
    m.categories.forEach(c => { score += (catCount[c] || 0) * 2; });
    score += (countryCount[m.country] || 0) * 1.5;
    score += (m.imdbRating || m.rating) * 0.3;
    if (m.trending) score += 1;
    return { movie: m, score };
  }).sort((a, b) => b.score - a.score);
  return scored.slice(0, count).map(s => s.movie);
}
