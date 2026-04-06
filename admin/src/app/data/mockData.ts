// Mock data cho demo hệ thống quản trị

export interface Movie {
  id: number;
  title: string;
  genre: string;
  releaseYear: number;
  duration: number;
  views: number;
  rating: number;
  thumbnail: string;
  isPremium: boolean;
  revenue: number;
}

export interface Account {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: 'admin' | 'user';
  isPremium: boolean;
  registeredDate: string;
  status: 'active' | 'inactive';
}

export interface Genre {
  id: number;
  name: string;
  movieCount: number;
  description: string;
}

export interface PremiumPackage {
  id: number;
  name: string;
  duration: number;
  price: number;
  features: string[];
  activeUsers: number;
  revenue: number;
}

export interface Invoice {
  MaTT: string; // Mã thanh toán (Payment ID)
  NgayThanhToan: string; // Ngày thanh toán
  PhuongThucThanhToan: string; // Phương thức thanh toán (VNPAY)
  TrangThai: 'Thành công' | 'Đang xử lý' | 'Thất bại' | 'Hoàn tiền'; // Trạng thái
  TongTien: number; // Tổng tiền
  username: string; // Tên người dùng
  email: string; // Email người dùng
  packageName: string; // Tên gói premium
}

export const mockMovies: Movie[] = [
  {
    id: 1,
    title: 'Hành Trình Về Phương Đông',
    genre: 'Phiêu lưu',
    releaseYear: 2024,
    duration: 120,
    views: 125000,
    rating: 4.5,
    thumbnail: '',
    isPremium: true,
    revenue: 25000000,
  },
  {
    id: 2,
    title: 'Bóng Đêm Thành Phố',
    genre: 'Hành động',
    releaseYear: 2024,
    duration: 105,
    views: 98000,
    rating: 4.2,
    thumbnail: '',
    isPremium: false,
    revenue: 15000000,
  },
  {
    id: 3,
    title: 'Tình Yêu Mùa Hè',
    genre: 'Lãng mạn',
    releaseYear: 2023,
    duration: 95,
    views: 156000,
    rating: 4.7,
    thumbnail: '',
    isPremium: true,
    revenue: 32000000,
  },
  {
    id: 4,
    title: 'Ký Ức Đảo Xa',
    genre: 'Tâm lý',
    releaseYear: 2024,
    duration: 110,
    views: 87000,
    rating: 4.3,
    thumbnail: '',
    isPremium: false,
    revenue: 12000000,
  },
  {
    id: 5,
    title: 'Cuộc Chiến Ngân Hà',
    genre: 'Khoa học viễn tưởng',
    releaseYear: 2024,
    duration: 135,
    views: 210000,
    rating: 4.8,
    thumbnail: '',
    isPremium: true,
    revenue: 45000000,
  },
];

export const mockAccounts: Account[] = [
  {
    id: 1,
    username: 'nguyenvana',
    email: 'nguyenvana@gmail.com',
    fullName: 'Nguyễn Văn A',
    role: 'user',
    isPremium: true,
    registeredDate: '2024-01-15',
    status: 'active',
  },
  {
    id: 2,
    username: 'tranthib',
    email: 'tranthib@gmail.com',
    fullName: 'Trần Thị B',
    role: 'user',
    isPremium: false,
    registeredDate: '2024-02-20',
    status: 'active',
  },
  {
    id: 3,
    username: 'adminuser',
    email: 'admin@movieplatform.com',
    fullName: 'Admin User',
    role: 'admin',
    isPremium: true,
    registeredDate: '2023-12-01',
    status: 'active',
  },
  {
    id: 4,
    username: 'phamvanc',
    email: 'phamvanc@gmail.com',
    fullName: 'Phạm Văn C',
    role: 'user',
    isPremium: true,
    registeredDate: '2024-03-10',
    status: 'active',
  },
  {
    id: 5,
    username: 'lethid',
    email: 'lethid@gmail.com',
    fullName: 'Lê Thị D',
    role: 'user',
    isPremium: false,
    registeredDate: '2024-01-25',
    status: 'inactive',
  },
];

export const mockGenres: Genre[] = [
  { id: 1, name: 'Hành động', movieCount: 45, description: 'Phim hành động gay cấn' },
  { id: 2, name: 'Lãng mạn', movieCount: 32, description: 'Phim tình cảm lãng mạn' },
  { id: 3, name: 'Phiêu lưu', movieCount: 28, description: 'Phim phiêu lưu mạo hiểm' },
  { id: 4, name: 'Khoa học viễn tưởng', movieCount: 23, description: 'Phim khoa học viễn tưởng' },
  { id: 5, name: 'Kinh dị', movieCount: 19, description: 'Phim kinh dị, ma quỷ' },
  { id: 6, name: 'Hài hước', movieCount: 38, description: 'Phim hài, giải trí' },
  { id: 7, name: 'Tâm lý', movieCount: 25, description: 'Phim tâm lý, kịch tính' },
];

export const mockPremiumPackages: PremiumPackage[] = [
  {
    id: 1,
    name: 'Gói 1 Tháng',
    duration: 30,
    price: 50000,
    features: ['Xem không giới hạn', 'Chất lượng HD', 'Không quảng cáo'],
    activeUsers: 1250,
    revenue: 62500000,
  },
  {
    id: 2,
    name: 'Gói 3 Tháng',
    duration: 90,
    price: 120000,
    features: ['Xem không giới hạn', 'Chất lượng Full HD', 'Không quảng cáo', 'Tải xuống offline'],
    activeUsers: 850,
    revenue: 102000000,
  },
  {
    id: 3,
    name: 'Gói 6 Tháng',
    duration: 180,
    price: 200000,
    features: ['Xem không giới hạn', 'Chất lượng 4K', 'Không quảng cáo', 'Tải xuống offline', 'Xem trên 4 thiết bị'],
    activeUsers: 620,
    revenue: 124000000,
  },
  {
    id: 4,
    name: 'Gói 1 Năm',
    duration: 365,
    price: 350000,
    features: ['Xem không giới hạn', 'Chất lượng 4K', 'Không quảng cáo', 'Tải xuống offline', 'Xem không giới hạn thiết bị', 'Nội dung độc quyền'],
    activeUsers: 980,
    revenue: 343000000,
  },
];

// Dữ liệu cho biểu đồ doanh thu theo tháng
export const revenueData = [
  { month: 'T1', revenue: 45000000, users: 2100 },
  { month: 'T2', revenue: 52000000, users: 2350 },
  { month: 'T3', revenue: 48000000, users: 2280 },
  { month: 'T4', revenue: 61000000, users: 2650 },
  { month: 'T5', revenue: 58000000, users: 2580 },
  { month: 'T6', revenue: 67000000, users: 2890 },
  { month: 'T7', revenue: 73000000, users: 3150 },
  { month: 'T8', revenue: 69000000, users: 3020 },
  { month: 'T9', revenue: 75000000, users: 3280 },
  { month: 'T10', revenue: 82000000, users: 3560 },
  { month: 'T11', revenue: 78000000, users: 3420 },
  { month: 'T12', revenue: 89000000, users: 3780 },
];

// Dữ liệu cho biểu đồ phân loại phim theo thể loại
export const genreDistribution = [
  { name: 'Hành động', value: 45 },
  { name: 'Hài', value: 38 },
  { name: 'Lãng mạn', value: 32 },
  { name: 'Phiêu lưu', value: 28 },
  { name: 'Tâm lý', value: 25 },
  { name: 'Khoa học VT', value: 23 },
  { name: 'Kinh dị', value: 19 },
];

// Dữ liệu cho biểu đồ lượt xem theo ngày
export const viewsData = [
  { day: 'CN', views: 45000 },
  { day: 'T2', views: 38000 },
  { day: 'T3', views: 42000 },
  { day: 'T4', views: 51000 },
  { day: 'T5', views: 49000 },
  { day: 'T6', views: 62000 },
  { day: 'T7', views: 68000 },
];

// Dữ liệu hóa đơn thanh toán
export const mockInvoices: Invoice[] = [
  {
    MaTT: 'TT001',
    NgayThanhToan: '2024-03-15 14:30:25',
    PhuongThucThanhToan: 'VNPAY',
    TrangThai: 'Thành công',
    TongTien: 350000,
    username: 'nguyenvana',
    email: 'nguyenvana@gmail.com',
    packageName: 'Gói 1 Năm',
  },
  {
    MaTT: 'TT002',
    NgayThanhToan: '2024-03-16 09:15:40',
    PhuongThucThanhToan: 'VNPAY',
    TrangThai: 'Thành công',
    TongTien: 120000,
    username: 'tranthib',
    email: 'tranthib@gmail.com',
    packageName: 'Gói 3 Tháng',
  },
  {
    MaTT: 'TT003',
    NgayThanhToan: '2024-03-16 11:45:12',
    PhuongThucThanhToan: 'VNPAY',
    TrangThai: 'Đang xử lý',
    TongTien: 50000,
    username: 'phamvanc',
    email: 'phamvanc@gmail.com',
    packageName: 'Gói 1 Tháng',
  },
  {
    MaTT: 'TT004',
    NgayThanhToan: '2024-03-17 16:20:33',
    PhuongThucThanhToan: 'VNPAY',
    TrangThai: 'Thành công',
    TongTien: 200000,
    username: 'lethid',
    email: 'lethid@gmail.com',
    packageName: 'Gói 6 Tháng',
  },
  {
    MaTT: 'TT005',
    NgayThanhToan: '2024-03-17 18:55:01',
    PhuongThucThanhToan: 'VNPAY',
    TrangThai: 'Thất b���i',
    TongTien: 120000,
    username: 'hoangvane',
    email: 'hoangvane@gmail.com',
    packageName: 'Gói 3 Tháng',
  },
  {
    MaTT: 'TT006',
    NgayThanhToan: '2024-03-18 10:12:28',
    PhuongThucThanhToan: 'VNPAY',
    TrangThai: 'Thành công',
    TongTien: 350000,
    username: 'vothif',
    email: 'vothif@gmail.com',
    packageName: 'Gói 1 Năm',
  },
  {
    MaTT: 'TT007',
    NgayThanhToan: '2024-03-18 13:30:45',
    PhuongThucThanhToan: 'VNPAY',
    TrangThai: 'Hoàn tiền',
    TongTien: 50000,
    username: 'nguyenvana',
    email: 'nguyenvana@gmail.com',
    packageName: 'Gói 1 Tháng',
  },
  {
    MaTT: 'TT008',
    NgayThanhToan: '2024-03-18 15:42:17',
    PhuongThucThanhToan: 'VNPAY',
    TrangThai: 'Thành công',
    TongTien: 200000,
    username: 'tranthib',
    email: 'tranthib@gmail.com',
    packageName: 'Gói 6 Tháng',
  },
  {
    MaTT: 'TT009',
    NgayThanhToan: '2024-03-19 08:25:52',
    PhuongThucThanhToan: 'VNPAY',
    TrangThai: 'Thành công',
    TongTien: 120000,
    username: 'phamvanc',
    email: 'phamvanc@gmail.com',
    packageName: 'Gói 3 Tháng',
  },
  {
    MaTT: 'TT010',
    NgayThanhToan: '2024-03-19 12:08:34',
    PhuongThucThanhToan: 'VNPAY',
    TrangThai: 'Đang xử lý',
    TongTien: 350000,
    username: 'lethid',
    email: 'lethid@gmail.com',
    packageName: 'Gói 1 Năm',
  },
  {
    MaTT: 'TT011',
    NgayThanhToan: '2024-03-19 14:50:19',
    PhuongThucThanhToan: 'VNPAY',
    TrangThai: 'Thành công',
    TongTien: 50000,
    username: 'doivang',
    email: 'doivang@gmail.com',
    packageName: 'Gói 1 Tháng',
  },
  {
    MaTT: 'TT012',
    NgayThanhToan: '2024-03-19 16:33:41',
    PhuongThucThanhToan: 'VNPAY',
    TrangThai: 'Thành công',
    TongTien: 200000,
    username: 'buithih',
    email: 'buithih@gmail.com',
    packageName: 'Gói 6 Tháng',
  },
];