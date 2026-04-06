import { 
  Users, 
  Film, 
  TrendingUp, 
  DollarSign,
  Download,
  FileSpreadsheet
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { revenueData, genreDistribution, viewsData } from '../data/mockData';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#ef4444'];

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: string;
  trendUp: boolean;
}

function StatCard({ title, value, icon, trend, trendUp }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-2xl font-semibold mt-2">{value}</p>
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp
              size={16}
              className={trendUp ? 'text-green-500' : 'text-red-500 rotate-180'}
            />
            <span
              className={`text-sm ${trendUp ? 'text-green-500' : 'text-red-500'}`}
            >
              {trend}
            </span>
          </div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const handleExportReport = () => {
    // Mock function để xuất báo cáo
    const csvContent = `Tháng,Doanh thu,Người dùng\n${revenueData
      .map((item) => `${item.month},${item.revenue},${item.users}`)
      .join('\n')}`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `bao-cao-doanh-thu-${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportExcel = () => {
    // Mock function để xuất Excel
    alert('Xuất file Excel (tích hợp với thư viện như xlsx hoặc exceljs khi cần)');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-800">Trang chủ</h1>
          <p className="text-gray-600 mt-1">Tổng quan hệ thống quản trị</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportReport}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download size={18} />
            Xuất CSV
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FileSpreadsheet size={18} />
            Xuất Excel
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Tổng người dùng"
          value="3,780"
          icon={<Users className="text-blue-600" size={28} />}
          trend="+12.5%"
          trendUp={true}
        />
        <StatCard
          title="Tổng phim"
          value="210"
          icon={<Film className="text-purple-600" size={28} />}
          trend="+8.3%"
          trendUp={true}
        />
        <StatCard
          title="Doanh thu tháng này"
          value="89.000.000đ"
          icon={<DollarSign className="text-green-600" size={28} />}
          trend="+14.2%"
          trendUp={true}
        />
        <StatCard
          title="Người dùng Premium"
          value="2,700"
          icon={<TrendingUp className="text-orange-600" size={28} />}
          trend="+18.7%"
          trendUp={true}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Doanh thu theo tháng
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value: number) =>
                  new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(value)
                }
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorRevenue)"
                name="Doanh thu"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Genre Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Phân bố phim theo thể loại
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={genreDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {genreDistribution.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Lượt xem trong tuần
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={viewsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip
                formatter={(value: number) =>
                  new Intl.NumberFormat('vi-VN').format(value)
                }
              />
              <Bar dataKey="views" fill="#8b5cf6" name="Lượt xem" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* User Growth */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Tăng trưởng người dùng
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="users"
                stroke="#10b981"
                strokeWidth={2}
                name="Người dùng"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
