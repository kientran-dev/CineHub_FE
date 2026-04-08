import { 
  Users, 
  Film, 
  TrendingUp, 
  DollarSign,
  Download,
  FileSpreadsheet,
  Loader2
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
import { useState, useEffect } from 'react';
import { 
  dashboardService, 
  type DashboardResponse, 
  type DashboardChartData 
} from '../services/adminService';
import * as XLSX from 'xlsx';

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
  const [stats, setStats] = useState<DashboardResponse>({
    totalUsers: 0,
    totalMovies: 0,
    premiumUsers: 0,
    totalRevenue: 0
  });

  const [chartData, setChartData] = useState<DashboardChartData>({
    revenueByMonth: [],
    genreDistribution: [],
    viewsByDay: [],
    userGrowthByMonth: []
  });

  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      dashboardService.getDashboardStats(),
      dashboardService.getChartData()
    ]).then(([statsData, charts]) => {
      setStats(statsData);
      setChartData(charts);
    }).catch(console.error)
    .finally(() => setLoading(false));
  }, []);

  const handleExportCsv = async () => {
    try {
      setExporting('csv');
      const blob = await dashboardService.exportCsv();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `bao-cao-doanh-thu-${new Date().getTime()}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export CSV failed:', error);
      alert('Xuất báo cáo CSV thất bại!');
    } finally {
      setExporting(null);
    }
  };

  const handleExportExcel = async () => {
    try {
      setExporting('excel');

      // Sheet 1: Doanh thu theo tháng
      const revenueSheet = XLSX.utils.json_to_sheet(
        chartData.revenueByMonth.map(item => ({
          'Tháng': item.month,
          'Doanh thu (VND)': item.revenue,
          'Người dùng mới': item.users
        }))
      );

      // Sheet 2: Phân bố thể loại
      const genreSheet = XLSX.utils.json_to_sheet(
        chartData.genreDistribution.map(item => ({
          'Thể loại': item.name,
          'Số phim': item.value
        }))
      );

      // Sheet 3: Lượt xem
      const viewsSheet = XLSX.utils.json_to_sheet(
        chartData.viewsByDay.map(item => ({
          'Ngày': item.day,
          'Lượt xem': item.views
        }))
      );

      // Sheet 4: Tổng quan
      const summarySheet = XLSX.utils.json_to_sheet([{
        'Tổng người dùng': stats.totalUsers,
        'Tổng phim': stats.totalMovies,
        'Người dùng Premium': stats.premiumUsers,
        'Tổng doanh thu (VND)': stats.totalRevenue
      }]);

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, summarySheet, 'Tổng quan');
      XLSX.utils.book_append_sheet(wb, revenueSheet, 'Doanh thu');
      XLSX.utils.book_append_sheet(wb, genreSheet, 'Thể loại');
      XLSX.utils.book_append_sheet(wb, viewsSheet, 'Lượt xem');

      XLSX.writeFile(wb, `bao-cao-cinehub-${new Date().getTime()}.xlsx`);
    } catch (error) {
      console.error('Export Excel failed:', error);
      alert('Xuất báo cáo Excel thất bại!');
    } finally {
      setExporting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin text-blue-600" size={48} />
        <span className="ml-3 text-gray-600 text-lg">Đang tải dữ liệu...</span>
      </div>
    );
  }

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
            onClick={handleExportCsv}
            disabled={exporting !== null}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exporting === 'csv' ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            Xuất CSV
          </button>
          <button
            onClick={handleExportExcel}
            disabled={exporting !== null}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exporting === 'excel' ? <Loader2 size={18} className="animate-spin" /> : <FileSpreadsheet size={18} />}
            Xuất Excel
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Tổng người dùng"
          value={new Intl.NumberFormat('vi-VN').format(stats.totalUsers)}
          icon={<Users className="text-blue-600" size={28} />}
          trend="Realtime"
          trendUp={true}
        />
        <StatCard
          title="Tổng phim"
          value={new Intl.NumberFormat('vi-VN').format(stats.totalMovies)}
          icon={<Film className="text-purple-600" size={28} />}
          trend="Realtime"
          trendUp={true}
        />
        <StatCard
          title="Doanh thu"
          value={new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.totalRevenue)}
          icon={<DollarSign className="text-green-600" size={28} />}
          trend="Realtime"
          trendUp={true}
        />
        <StatCard
          title="Người dùng Premium"
          value={new Intl.NumberFormat('vi-VN').format(stats.premiumUsers)}
          icon={<TrendingUp className="text-orange-600" size={28} />}
          trend="Realtime"
          trendUp={true}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Doanh thu theo tháng ({new Date().getFullYear()})
          </h3>
          {chartData.revenueByMonth.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData.revenueByMonth}>
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
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400">
              Chưa có dữ liệu doanh thu
            </div>
          )}
        </div>

        {/* Genre Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Phân bố phim theo thể loại
          </h3>
          {chartData.genreDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.genreDistribution}
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
                  {chartData.genreDistribution.map((_entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400">
              Chưa có dữ liệu thể loại
            </div>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Lượt xem 7 ngày gần nhất
          </h3>
          {chartData.viewsByDay.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.viewsByDay}>
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
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400">
              Chưa có dữ liệu lượt xem
            </div>
          )}
        </div>

        {/* User Growth */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Tăng trưởng người dùng ({new Date().getFullYear()})
          </h3>
          {chartData.userGrowthByMonth.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData.userGrowthByMonth}>
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
                  name="Người dùng mới"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400">
              Chưa có dữ liệu tăng trưởng
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
