import { 
  Users, 
  Film, 
  TrendingUp, 
  DollarSign,
  Printer,
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
import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { 
  dashboardService, 
  type DashboardResponse, 
  type DashboardChartData 
} from '../services/adminService';
import * as XLSX from 'xlsx';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#ef4444', '#9ca3af'];

const MAX_GENRES = 7;

function groupGenreDistribution(data: { name: string; value: number }[]) {
  if (data.length <= MAX_GENRES) return data;
  const sorted = [...data].sort((a, b) => b.value - a.value);
  const top = sorted.slice(0, MAX_GENRES);
  const otherValue = sorted.slice(MAX_GENRES).reduce((sum, g) => sum + g.value, 0);
  if (otherValue > 0) top.push({ name: 'Khác', value: otherValue });
  return top;
}

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

// ─── Thông tin công ty ───────────────────────────────────────────────────────
const COMPANY_INFO = {
  name: 'CÔNG TY CỔ PHẦN GIẢI TRÍ CINEHUB',
  nameEn: 'CineHub Entertainment JSC',
  taxCode: '0123456789',
  address: '63 Lê Đức Thọ, Mỹ Đình, Nam Từ Liêm, Hà Nội',
  hotline: '1800 6868',
  email: 'support@cinehub.vn',
  website: 'www.cinehub.vn',
  bankAccount: '1234 5678 9012 3456 – Ngân hàng VietcomBank',
} as const;

const fmtVND = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

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
    userGrowthByMonth: [],
    statsByDay: []
  });

  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<string | null>(null);
  const [revenuePeriod, setRevenuePeriod] = useState<'week' | 'month' | 'year'>('month');
  const [growthPeriod, setGrowthPeriod] = useState<'week' | 'month' | 'year'>('month');

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

  // ── Filtered chart data ──────────────────────────────────────────────────
  const transformByPeriod = (data: typeof chartData.revenueByMonth, period: 'week' | 'month' | 'year', valueKey: 'revenue' | 'users') => {
    if (data.length === 0) return [];
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    if (period === 'year') {
      // Gộp theo năm
      const yearMap = new Map<string, number>();
      data.forEach(item => {
        const match = item.month.match(/T\d+\/(\d+)/);
        if (!match) return;
        const year = match[1];
        const val = (item as unknown as Record<string, unknown>)[valueKey] as number || 0;
        yearMap.set(year, (yearMap.get(year) || 0) + val);
      });
      return Array.from(yearMap.entries()).map(([year, total]) => ({ month: year, [valueKey]: total }));
    }

    if (period === 'week') {
      // Tháng hiện tại
      return data.filter(item => {
        const match = item.month.match(/T(\d+)\/(\d+)/);
        if (!match) return false;
        return parseInt(match[1]) === currentMonth && parseInt(match[2]) === currentYear;
      });
    }

    // 'month' = 3 tháng gần nhất
    return data.filter(item => {
      const match = item.month.match(/T(\d+)\/(\d+)/);
      if (!match) return false;
      const monthsDiff = (currentYear - parseInt(match[2])) * 12 + (currentMonth - parseInt(match[1]));
      return monthsDiff >= 0 && monthsDiff < 3;
    });
  };

  const filteredRevenue = useMemo(() => {
    if (revenuePeriod === 'week') {
      return chartData.statsByDay.map(d => ({ month: d.day, revenue: d.revenue, users: d.users }));
    }
    return transformByPeriod(chartData.revenueByMonth, revenuePeriod, 'revenue');
  }, [chartData.revenueByMonth, chartData.statsByDay, revenuePeriod]);

  const filteredUserGrowth = useMemo(() => {
    if (growthPeriod === 'week') {
      return chartData.statsByDay.map(d => ({ month: d.day, users: d.users, revenue: d.revenue }));
    }
    return transformByPeriod(chartData.userGrowthByMonth, growthPeriod, 'users');
  }, [chartData.userGrowthByMonth, chartData.statsByDay, growthPeriod]);

  const periodLabel = (p: 'week' | 'month' | 'year') =>
    p === 'week' ? 'tuần' : p === 'month' ? 'tháng' : 'năm';

  // ── Print PDF Report ───────────────────────────────────────────────────────
  const handlePrintReport = () => {
    try {
      setExporting('pdf');
      const now = new Date();
      const exportDate = now.toLocaleString('vi-VN', {
        weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      });
      const period = `Năm ${now.getFullYear()}`;
      const premiumRate = stats.totalUsers
        ? ((stats.premiumUsers / stats.totalUsers) * 100).toFixed(1)
        : '0';
      const avgRevPerPremium = stats.premiumUsers
        ? Math.round(stats.totalRevenue / stats.premiumUsers)
        : 0;
      const revTotal = chartData.revenueByMonth.reduce((s, r) => s + r.revenue, 0);
      const viewTotal = chartData.viewsByDay.reduce((s, v) => s + v.views, 0);
      const totalMovieCount = chartData.genreDistribution.reduce((s, g) => s + g.value, 0);
      const sorted = [...chartData.genreDistribution].sort((a, b) => b.value - a.value);

      const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Báo cáo tổng quan - CineHub</title>
<style>
  @page { size: A4 portrait; margin: 15mm 15mm; }
  body { font-family: 'Times New Roman', Times, serif; font-size: 13px; color: #000; line-height: 1.4; }
  table { width: 100%; border-collapse: collapse; margin-top: 5px; margin-bottom: 15px; }
  th, td { border: 1px solid #000; padding: 6px 8px; vertical-align: middle; }
  th { font-weight: bold; text-align: center; }
  h1 { font-size: 20px; font-weight: bold; text-align: center; margin: 15px 0 5px 0; text-transform: uppercase; }
  h2 { font-size: 14px; text-align: center; font-weight: normal; margin-bottom: 5px; font-style: italic; }
  h3 { font-size: 14px; font-weight: bold; margin-top: 15px; margin-bottom: 5px; text-transform: uppercase; }
  .text-center { text-align: center; }
  .text-right { text-align: right; }
  .bold { font-weight: bold; }
  .italic { font-style: italic; }
  
  .header-table { border: none; margin-bottom: 0; }
  .header-table th, .header-table td { border: none; padding: 0; }
  
  .divider { border-top: 2px solid #000; border-bottom: 1px solid #000; height: 3px; margin: 15px 0; box-sizing: border-box; }
  .divider-thin { border-top: 1px solid #000; margin: 15px 0; }
  
  .logo-text { font-size: 22px; font-weight: bold; margin-bottom: 2px; }
  .logo-sub { font-size: 10px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; }
  
  .summary-table th, .summary-table td { border: 1px solid #000; padding: 10px; }
  .summary-value { font-size: 18px; font-weight: bold; margin-top: 5px; }
  
  .signature-area { margin-top: 30px; display: table; width: 100%; page-break-inside: avoid; }
  .signature-box { display: table-cell; width: 50%; text-align: center; }
  
  .footer { text-align: center; font-size: 10px; color: #555; border-top: 1px solid #000; padding-top: 8px; margin-top: 30px; }
</style></head><body>

<table class="header-table">
  <tr>
    <td style="width: 50%;">
      <div class="logo-text">CINEHUB</div>
      <div class="logo-sub">ENTERTAINMENT MANAGEMENT</div>
    </td>
    <td style="width: 50%; text-align: right; vertical-align: top;">
      <div class="italic">In ngày: ${exportDate}</div>
      <div class="italic">Kỳ báo cáo: ${period}</div>
    </td>
  </tr>
</table>

<div class="divider"></div>

<h1>BÁO CÁO THỐNG KÊ TỔNG QUAN</h1>
<h2>CineHub — Năm báo cáo: ${now.getFullYear()}</h2>

<div class="divider-thin"></div>

<h3>I. TỔNG QUAN</h3>
<table class="summary-table">
  <tr>
    <td>
      <div class="bold text-center">TỔNG NGƯỜI DÙNG</div>
      <div class="summary-value text-center">${stats.totalUsers.toLocaleString('vi-VN')}</div>
    </td>
    <td>
      <div class="bold text-center">NGƯỜI DÙNG PREMIUM</div>
      <div class="summary-value text-center">${stats.premiumUsers.toLocaleString('vi-VN')} (${premiumRate}%)</div>
    </td>
    <td>
      <div class="bold text-center">TỔNG SỐ PHIM</div>
      <div class="summary-value text-center">${stats.totalMovies.toLocaleString('vi-VN')}</div>
    </td>
    <td>
      <div class="bold text-center">TỔNG DOANH THU</div>
      <div class="summary-value text-center">${fmtVND(stats.totalRevenue)}</div>
    </td>
  </tr>
</table>

<h3>II. DOANH THU THEO THÁNG — NĂM ${now.getFullYear()}</h3>
<table>
  <thead>
    <tr>
      <th style="width: 15%">Tháng</th>
      <th style="width: 35%">Doanh thu (đ)</th>
      <th style="width: 30%">Người dùng mới</th>
      <th style="width: 20%">Tỷ trọng (%)</th>
    </tr>
  </thead>
  <tbody>
    ${chartData.revenueByMonth.map((r, i) => `<tr>
      <td class="text-center">${r.month}</td>
      <td class="text-right">${r.revenue.toLocaleString('vi-VN')} đ</td>
      <td class="text-center">${((r as any).users ?? 0).toLocaleString('vi-VN')}</td>
      <td class="text-center">${revTotal ? ((r.revenue / revTotal) * 100).toFixed(1) : 0}%</td>
    </tr>`).join('')}
    <tr>
      <td class="bold text-center">Tổng cộng</td>
      <td class="bold text-right">${revTotal.toLocaleString('vi-VN')} đ</td>
      <td class="bold text-center">${chartData.revenueByMonth.reduce((s, r) => s + ((r as any).users ?? 0), 0).toLocaleString('vi-VN')}</td>
      <td class="bold text-center">100%</td>
    </tr>
  </tbody>
</table>

<h3>III. LƯỢT XEM 7 NGÀY GẦN NHẤT</h3>
<table>
  <thead>
    <tr>
      <th style="width: 15%">STT</th>
      <th style="width: 35%">Ngày</th>
      <th style="width: 30%">Lượt xem</th>
      <th style="width: 20%">Tỷ trọng (%)</th>
    </tr>
  </thead>
  <tbody>
    ${chartData.viewsByDay.map((v, i) => `<tr>
      <td class="text-center">${i + 1}</td>
      <td class="text-center">${v.day}</td>
      <td class="text-center">${v.views.toLocaleString('vi-VN')}</td>
      <td class="text-center">${viewTotal ? ((v.views / viewTotal) * 100).toFixed(1) : 0}%</td>
    </tr>`).join('')}
    <tr>
      <td colspan="2" class="bold text-center">Tổng cộng</td>
      <td class="bold text-center">${viewTotal.toLocaleString('vi-VN')}</td>
      <td class="bold text-center">100%</td>
    </tr>
  </tbody>
</table>

<h3>IV. PHÂN BỐ PHIM THEO THỂ LOẠI</h3>
<table>
  <thead>
    <tr>
      <th style="width: 15%">STT</th>
      <th style="width: 45%">Thể loại</th>
      <th style="width: 20%">Số phim</th>
      <th style="width: 20%">Tỷ trọng (%)</th>
    </tr>
  </thead>
  <tbody>
    ${sorted.map((g, i) => `<tr>
      <td class="text-center">${i + 1}</td>
      <td>${g.name}</td>
      <td class="text-center">${g.value}</td>
      <td class="text-center">${totalMovieCount ? ((g.value / totalMovieCount) * 100).toFixed(1) : 0}%</td>
    </tr>`).join('')}
    <tr>
      <td colspan="2" class="bold text-center">Tổng cộng</td>
      <td class="bold text-center">${totalMovieCount}</td>
      <td class="bold text-center">100%</td>
    </tr>
  </tbody>
</table>

<div class="signature-area">
  <div class="signature-box"></div>
  <div class="signature-box">
    <div class="italic">Ngày ${now.getDate().toString().padStart(2, '0')} tháng ${(now.getMonth() + 1).toString().padStart(2, '0')} năm ${now.getFullYear()}</div>
    <div class="bold" style="margin-top: 5px; margin-bottom: 60px;">NGƯỜI XUẤT BÁO CÁO</div>
    <div class="bold">Admin CineHub</div>
  </div>
</div>

<div class="footer">
  <p>Báo cáo được tạo tự động bởi hệ thống CineHub Admin v2.0 | Hotline: ${COMPANY_INFO.hotline} | Email: ${COMPANY_INFO.email}</p>
  <p>https://cinehub.vn/admin/dashboard</p>
</div>
</body></html>`;

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.onload = () => { printWindow.print(); };
      }
    } catch (error) {
      console.error('Print report failed:', error);
      toast.error('In báo cáo thất bại!');
    } finally {
      setExporting(null);
    }
  };

  // ── Export Excel ────────────────────────────────────────────────────────────
  const handleExportExcel = async () => {
    try {
      setExporting('excel');
      const now = new Date();
      const exportDate = now.toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
      const period = `Năm ${now.getFullYear()}`;
      const premiumRate = stats.totalUsers
        ? +((stats.premiumUsers / stats.totalUsers) * 100).toFixed(2)
        : 0;
      const avgRevPerPremium = stats.premiumUsers
        ? Math.round(stats.totalRevenue / stats.premiumUsers)
        : 0;
      const wb = XLSX.utils.book_new();

      // ── SHEET 1: Tổng quan ──────────────────────────────────────
      const overviewData: (string | number)[][] = [
        [`🎬 ${COMPANY_INFO.name}`],
        [COMPANY_INFO.nameEn],
        [`MST: ${COMPANY_INFO.taxCode}   |   ĐC: ${COMPANY_INFO.address}`],
        [`Hotline: ${COMPANY_INFO.hotline}   |   Email: ${COMPANY_INFO.email}   |   Web: ${COMPANY_INFO.website}`],
        [''],
        ['BÁO CÁO TỔNG QUAN HỆ THỐNG QUẢN TRỊ'],
        [`Kỳ báo cáo: ${period}   |   Ngày xuất: ${exportDate}`],
        [''],
        ['CHỈ SỐ', 'GIÁ TRỊ'],
        ['Tổng người dùng', stats.totalUsers],
        ['Người dùng Premium', stats.premiumUsers],
        ['Tỷ lệ Premium (%)', premiumRate],
        ['Tổng số phim', stats.totalMovies],
        ['Tổng doanh thu (VND)', stats.totalRevenue],
        ['Doanh thu TB / User Premium (VND)', avgRevPerPremium],
        ['Tổng lượt xem (7 ngày)', chartData.viewsByDay.reduce((s, v) => s + v.views, 0)],
      ];
      const ws1 = XLSX.utils.aoa_to_sheet(overviewData);
      ws1['!cols'] = [{ wch: 35 }, { wch: 25 }];
      ws1['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 1 } },
        { s: { r: 2, c: 0 }, e: { r: 2, c: 1 } },
        { s: { r: 3, c: 0 }, e: { r: 3, c: 1 } },
        { s: { r: 5, c: 0 }, e: { r: 5, c: 1 } },
        { s: { r: 6, c: 0 }, e: { r: 6, c: 1 } },
      ];
      ws1['!pageSetup'] = { paperSize: 9, orientation: 'landscape', scale: 65, fitToWidth: 1, fitToHeight: 0 };
      ws1['!margins'] = { left: 0.1, right: 0.1, top: 0.2, bottom: 0.2, header: 0.1, footer: 0.1 };

      XLSX.utils.book_append_sheet(wb, ws1, 'Tổng quan');

      // ── SHEET 2: Doanh thu theo tháng ──────────────────────────
      const revTotal = chartData.revenueByMonth.reduce((s, r) => s + r.revenue, 0);
      const revenueData: (string | number)[][] = [
        [`🎬 ${COMPANY_INFO.name}`],
        ['DOANH THU THEO THÁNG'],
        [`Kỳ: ${period}   |   Ngày xuất: ${exportDate}`],
        [''],
        ['STT', 'Tháng', 'Doanh thu (VND)', 'Người dùng mới', 'Tỷ trọng DT (%)'],
        ...chartData.revenueByMonth.map((r, i) => [
          i + 1,
          r.month,
          r.revenue,
          (r as any).users ?? 0,
          revTotal ? +((r.revenue / revTotal) * 100).toFixed(2) : 0,
        ]),
        [''],
        ['', 'TỔNG CỘNG', revTotal, chartData.revenueByMonth.reduce((s, r) => s + ((r as any).users ?? 0), 0), 100],
      ];
      const ws2 = XLSX.utils.aoa_to_sheet(revenueData);
      ws2['!cols'] = [{ wch: 5 }, { wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 15 }];
      ws2['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 4 } },
        { s: { r: 2, c: 0 }, e: { r: 2, c: 4 } },
      ];
      ws2['!freeze'] = { xSplit: 0, ySplit: 5 };
      ws2['!pageSetup'] = { paperSize: 9, orientation: 'landscape', scale: 65, fitToWidth: 1, fitToHeight: 0 };
      ws2['!margins'] = { left: 0.1, right: 0.1, top: 0.2, bottom: 0.2, header: 0.1, footer: 0.1 };

      XLSX.utils.book_append_sheet(wb, ws2, 'Doanh thu theo tháng');

      // ── SHEET 3: Tăng trưởng người dùng ────────────────────────
      let cumulative = 0;
      const growthData: (string | number)[][] = [
        [`🎬 ${COMPANY_INFO.name}`],
        ['TĂNG TRƯỞNG NGƯỜI DÙNG THEO THÁNG'],
        [`Kỳ: ${period}   |   Ngày xuất: ${exportDate}`],
        [''],
        ['STT', 'Tháng', 'Người dùng mới', 'Tổng tích lũy'],
        ...chartData.userGrowthByMonth.map((g, i) => {
          const newUsers = (g as any).users ?? 0;
          cumulative += newUsers;
          return [i + 1, g.month, newUsers, cumulative];
        }),
      ];
      const ws3 = XLSX.utils.aoa_to_sheet(growthData);
      ws3['!cols'] = [{ wch: 5 }, { wch: 15 }, { wch: 20 }, { wch: 20 }];
      ws3['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 3 } },
        { s: { r: 2, c: 0 }, e: { r: 2, c: 3 } },
      ];
      ws3['!freeze'] = { xSplit: 0, ySplit: 5 };
      ws3['!pageSetup'] = { paperSize: 9, orientation: 'landscape', scale: 65, fitToWidth: 1, fitToHeight: 0 };
      ws3['!margins'] = { left: 0.1, right: 0.1, top: 0.2, bottom: 0.2, header: 0.1, footer: 0.1 };

      XLSX.utils.book_append_sheet(wb, ws3, 'Tăng trưởng người dùng');

      // ── SHEET 4: Lượt xem 7 ngày ───────────────────────────────
      const viewTotal = chartData.viewsByDay.reduce((s, v) => s + v.views, 0);
      const viewsData: (string | number)[][] = [
        [`🎬 ${COMPANY_INFO.name}`],
        ['LƯỢT XEM 7 NGÀY GẦN NHẤT'],
        [`Ngày xuất: ${exportDate}`],
        [''],
        ['STT', 'Ngày', 'Lượt xem', 'Tỷ trọng (%)'],
        ...chartData.viewsByDay.map((v, i) => [
          i + 1,
          v.day,
          v.views,
          viewTotal ? +((v.views / viewTotal) * 100).toFixed(2) : 0,
        ]),
        [''],
        ['', 'TỔNG', viewTotal, 100],
      ];
      const ws4 = XLSX.utils.aoa_to_sheet(viewsData);
      ws4['!cols'] = [{ wch: 5 }, { wch: 20 }, { wch: 15 }, { wch: 15 }];
      ws4['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 3 } },
        { s: { r: 2, c: 0 }, e: { r: 2, c: 3 } },
      ];
      ws4['!pageSetup'] = { paperSize: 9, orientation: 'landscape', scale: 65, fitToWidth: 1, fitToHeight: 0 };
      ws4['!margins'] = { left: 0.1, right: 0.1, top: 0.2, bottom: 0.2, header: 0.1, footer: 0.1 };

      XLSX.utils.book_append_sheet(wb, ws4, 'Lượt xem 7 ngày');

      // ── SHEET 5: Phân bố thể loại ───────────────────────────────
      const totalMovieCount = chartData.genreDistribution.reduce((s, g) => s + g.value, 0);
      const sorted = [...chartData.genreDistribution].sort((a, b) => b.value - a.value);
      const genreData: (string | number)[][] = [
        [`🎬 ${COMPANY_INFO.name}`],
        ['PHÂN BỐ PHIM THEO THỂ LOẠI'],
        [`Ngày xuất: ${exportDate}`],
        [''],
        ['STT', 'Thể loại', 'Số phim', 'Tỷ trọng (%)'],
        ...sorted.map((g, i) => [
          i + 1,
          g.name,
          g.value,
          totalMovieCount ? +((g.value / totalMovieCount) * 100).toFixed(2) : 0,
        ]),
        [''],
        ['', 'TỔNG', totalMovieCount, 100],
      ];
      const ws5 = XLSX.utils.aoa_to_sheet(genreData);
      ws5['!cols'] = [{ wch: 5 }, { wch: 30 }, { wch: 15 }, { wch: 15 }];
      ws5['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 3 } },
        { s: { r: 2, c: 0 }, e: { r: 2, c: 3 } },
      ];
      ws5['!pageSetup'] = { paperSize: 9, orientation: 'landscape', scale: 65, fitToWidth: 1, fitToHeight: 0 };
      ws5['!margins'] = { left: 0.1, right: 0.1, top: 0.2, bottom: 0.2, header: 0.1, footer: 0.1 };

      XLSX.utils.book_append_sheet(wb, ws5, 'Phân bố thể loại');

      const ymd = now.toISOString().slice(0, 10);
      XLSX.writeFile(wb, `CineHub_TongQuan_${ymd}.xlsx`);
    } catch (error) {
      console.error('Export Excel failed:', error);
      toast.error('Xuất báo cáo Excel thất bại!');
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
            onClick={handlePrintReport}
            disabled={exporting !== null}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exporting === 'pdf' ? <Loader2 size={18} className="animate-spin" /> : <Printer size={18} />}
            In báo cáo
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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Doanh thu theo {periodLabel(revenuePeriod)}
            </h3>
            <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs">
              {(['week', 'month', 'year'] as const).map(p => (
                <button key={p} onClick={() => setRevenuePeriod(p)}
                  className={`px-3 py-1.5 transition-colors ${revenuePeriod === p ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                  {p === 'week' ? 'Tuần' : p === 'month' ? 'Tháng' : 'Năm'}
                </button>
              ))}
            </div>
          </div>
          {filteredRevenue.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={filteredRevenue}>
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
          {chartData.genreDistribution.length > 0 ? (() => {
            const grouped = groupGenreDistribution(chartData.genreDistribution);
            return (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={grouped}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {grouped.map((_entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            );
          })() : (
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
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Lượt xem 7 ngày gần nhất
            </h3>
          </div>
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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Tăng trưởng người dùng theo {periodLabel(growthPeriod)}
            </h3>
            <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs">
              {(['week', 'month', 'year'] as const).map(p => (
                <button key={p} onClick={() => setGrowthPeriod(p)}
                  className={`px-3 py-1.5 transition-colors ${growthPeriod === p ? 'bg-green-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                  {p === 'week' ? 'Tuần' : p === 'month' ? 'Tháng' : 'Năm'}
                </button>
              ))}
            </div>
          </div>
          {filteredUserGrowth.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={filteredUserGrowth}>
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
