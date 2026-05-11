import { useState, useEffect } from 'react';
import {
  Search, Eye, Printer, FileText, CreditCard, Loader2,
  CheckCircle, XCircle, AlertCircle, RefreshCw, X, Edit2, FileSpreadsheet
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { paymentService, type PaymentResponse } from '../services/adminService';

// ─── VNPay Logo (inline SVG thực tế) ───────────────────────────────────────
function VNPayBadge() {
  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md border border-blue-200 bg-gradient-to-r from-blue-600 to-blue-700 shadow-sm">
      {/* Chữ VN màu đỏ + PAY màu trắng giống logo gốc */}
      <span className="font-extrabold text-xs tracking-tight leading-none">
        <span className="text-red-300">VN</span>
        <span className="text-white">PAY</span>
      </span>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="rgba(255,255,255,0.2)" />
        <path d="M6 12l4 4 8-8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

// ─── Status helpers ─────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  SUCCESS: {
    label: 'Thành công',
    bgClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    dotClass: 'bg-emerald-500',
    icon: CheckCircle,
  },
  PENDING: {
    label: 'Đang xử lý',
    bgClass: 'bg-amber-50 text-amber-700 border border-amber-200',
    dotClass: 'bg-amber-400',
    icon: AlertCircle,
  },
  FAILED: {
    label: 'Thất bại',
    bgClass: 'bg-red-50 text-red-700 border border-red-200',
    dotClass: 'bg-red-500',
    icon: XCircle,
  },
} as const;

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
  if (!cfg) return <span className="text-gray-500 text-xs">{status}</span>;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bgClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotClass}`} />
      <Icon size={12} />
      {cfg.label}
    </span>
  );
}

// ─── Format helpers ─────────────────────────────────────────────────────────
const fmtCurrency = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const fmtDate = (dateStr: string) =>
  new Date(dateStr).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

const fmtCompact = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { notation: 'compact', compactDisplay: 'short' }).format(amount) + 'đ';

// ─── Thông tin công ty ─────────────────────────────────────────────────────
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

// ─── Print PDF Report ───────────────────────────────────────────────────────
function printInvoiceReport(invoices: PaymentResponse[]) {
  const now = new Date();
  const exportDate = now.toLocaleString('vi-VN', {
    weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
  const period = `Tháng ${now.getMonth() + 1}/${now.getFullYear()}`;

  const successInvoices = invoices.filter(i => i.status === 'SUCCESS');
  const pendingInvoices = invoices.filter(i => i.status === 'PENDING');
  const failedInvoices  = invoices.filter(i => i.status === 'FAILED');
  const totalRevenue    = successInvoices.reduce((s, i) => s + i.amount, 0);
  const avgAmount       = successInvoices.length ? totalRevenue / successInvoices.length : 0;
  const successRate     = invoices.length ? ((successInvoices.length / invoices.length) * 100).toFixed(1) : '0';

  const statusLabel = (s: string) => STATUS_CONFIG[s as keyof typeof STATUS_CONFIG]?.label ?? s;

  const rows = invoices.map((inv, idx) => `<tr>
    <td>${idx + 1}</td>
    <td>#${inv.paymentId}</td>
    <td>${fmtDate(inv.paymentDate)}</td>
    <td>${inv.username || '-'}</td>
    <td>${inv.packageName || '-'}</td>
    <td>VNPAY</td>
    <td style="text-align:right">${inv.amount.toLocaleString('vi-VN')}</td>
    <td><span class="status-${inv.status.toLowerCase()}">${statusLabel(inv.status)}</span></td>
  </tr>`).join('');

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Báo cáo giao dịch - CineHub</title>
<style>
  @page { size: landscape; margin: 15mm 15mm; }
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

<h1>BÁO CÁO GIAO DỊCH THANH TOÁN ONLINE</h1>
<h2>CineHub — Tháng ${now.getMonth() + 1}/${now.getFullYear()}</h2>

<div class="divider-thin"></div>

<h3>I. TỔNG QUAN</h3>
<table class="summary-table">
  <tr>
    <td>
      <div class="bold text-center">TỔNG GIAO DỊCH</div>
      <div class="summary-value text-center">${invoices.length}</div>
    </td>
    <td>
      <div class="bold text-center">GIAO DỊCH THÀNH CÔNG</div>
      <div class="summary-value text-center">${successInvoices.length} (${successRate}%)</div>
    </td>
    <td>
      <div class="bold text-center">ĐANG XỬ LÝ / THẤT BẠI</div>
      <div class="summary-value text-center">${pendingInvoices.length} / ${failedInvoices.length}</div>
    </td>
    <td>
      <div class="bold text-center">TỔNG DOANH THU (VNĐ)</div>
      <div class="summary-value text-center">${fmtCurrency(totalRevenue)}</div>
    </td>
  </tr>
</table>

<h3>II. CHI TIẾT GIAO DỊCH</h3>
<table>
  <thead>
    <tr>
      <th style="width: 5%">STT</th>
      <th style="width: 10%">Mã GD</th>
      <th style="width: 15%">Thời gian</th>
      <th style="width: 20%">Khách hàng</th>
      <th style="width: 15%">Gói Premium</th>
      <th style="width: 10%">Phương thức</th>
      <th style="width: 15%">Số tiền (VNĐ)</th>
      <th style="width: 10%">Trạng thái</th>
    </tr>
  </thead>
  <tbody>
    ${invoices.map((inv, idx) => `<tr>
      <td class="text-center">${idx + 1}</td>
      <td class="text-center">#${inv.paymentId}</td>
      <td class="text-center">${fmtDate(inv.paymentDate)}</td>
      <td>${inv.username || '-'}</td>
      <td class="text-center">${inv.packageName || '-'}</td>
      <td class="text-center">VNPAY</td>
      <td class="text-right">${inv.amount.toLocaleString('vi-VN')} đ</td>
      <td class="text-center">${statusLabel(inv.status)}</td>
    </tr>`).join('')}
    <tr>
      <td colspan="6" class="bold text-center">TỔNG DOANH THU (GIAO DỊCH THÀNH CÔNG)</td>
      <td class="bold text-right">${totalRevenue.toLocaleString('vi-VN')} đ</td>
      <td></td>
    </tr>
  </tbody>
</table>

<div class="signature-area">
  <div class="signature-box"></div>
  <div class="signature-box">
    <div class="italic">Ngày ${now.getDate().toString().padStart(2, '0')} tháng ${(now.getMonth() + 1).toString().padStart(2, '0')} năm ${now.getFullYear()}</div>
    <div class="bold" style="margin-top: 5px; margin-bottom: 60px;">NGƯỜI LẬP BÁO CÁO</div>
    <div class="bold">Admin CineHub</div>
  </div>
</div>

<div class="footer">
  <p>Báo cáo được tạo tự động bởi hệ thống CineHub Admin v2.0 | Hotline: ${COMPANY_INFO.hotline} | Email: ${COMPANY_INFO.email}</p>
  <p>https://cinehub.vn/admin/invoices</p>
</div>
</body></html>`;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => { printWindow.print(); };
  }
}

// ─── Export Excel (SheetJS) ─────────────────────────────────────────────────
function exportToExcel(invoices: PaymentResponse[]) {
  const now = new Date();
  const exportDate = now.toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
  const period = `Tháng ${now.getMonth() + 1}/${now.getFullYear()}`;

  const successInvoices = invoices.filter(i => i.status === 'SUCCESS');
  const pendingInvoices = invoices.filter(i => i.status === 'PENDING');
  const failedInvoices  = invoices.filter(i => i.status === 'FAILED');
  const totalRevenue    = successInvoices.reduce((s, i) => s + i.amount, 0);
  const avgAmount       = successInvoices.length ? Math.round(totalRevenue / successInvoices.length) : 0;

  const wb = XLSX.utils.book_new();

  // ────────────────────────────────────────────────────
  // SHEET 1: Chi tiết giao dịch
  // ────────────────────────────────────────────────────
  const detailData: (string | number)[][] = [
    // Row 1–9: Header công ty
    [`🎬 ${COMPANY_INFO.name}`],
    [`${COMPANY_INFO.nameEn}`],
    [`MST: ${COMPANY_INFO.taxCode}   |   ĐC: ${COMPANY_INFO.address}`],
    [`Hotline: ${COMPANY_INFO.hotline}   |   Email: ${COMPANY_INFO.email}   |   Web: ${COMPANY_INFO.website}`],
    [''],
    ['BÁO CÁO GIAO DỊCH THANH TOÁN ONLINE'],
    [`Kỳ báo cáo: ${period}   |   Ngày xuất: ${exportDate}`],
    [''],
    // Row 9: Thống kê nhanh
    ['Tổng GD', invoices.length, 'Thành công', successInvoices.length, 'Đang xử lý', pendingInvoices.length, 'Thất bại', failedInvoices.length, 'Tổng doanh thu (VND)', totalRevenue],
    [''],
    // Row 11: Header bảng
    [
      'STT', 'Mã GD', 'Thời gian', 'Khách hàng',
      'Gói Premium', 'Tổng thanh toán', 'Trạng thái', 'Ghi chú',
    ],
    // Data rows
    ...invoices.map((inv, idx) => {
      const statusLabel = STATUS_CONFIG[inv.status as keyof typeof STATUS_CONFIG]?.label ?? inv.status;
      const duration    = inv.packageName?.includes('Năm') || inv.packageName?.includes('year') ? ' (12 tháng)'
                        : inv.packageName?.includes('Tháng') || inv.packageName?.includes('month') ? ' (1 tháng)' : '';
      const note        = inv.status === 'PENDING' ? 'Chờ xác nhận'
                        : inv.status === 'FAILED' ? 'GD thất bại' : 'Đã xuất HĐ VAT';
      const customerStr = `${inv.username || '-'}\n${(inv.username || 'user').toLowerCase()}@cinehub`;
      const packageStr  = `${inv.packageName || '-'}${duration}`;

      return [
        idx + 1,
        `#${inv.paymentId}`,
        fmtDate(inv.paymentDate),
        customerStr,
        packageStr,
        inv.amount,
        statusLabel,
        note,
      ];
    }),
    // Tổng cộng
    [''],
    ['', '', '', '', 'TỔNG DOANH THU:', totalRevenue, '', ''],
    ['', '', '', '', 'GD TRUNG BÌNH:', avgAmount, '', ''],
    ['', '', '', '', `TỶ LỆ THÀNH CÔNG:`, `${invoices.length ? ((successInvoices.length / invoices.length) * 100).toFixed(1) : 0}%`, '', ''],
  ];

  const ws1 = XLSX.utils.aoa_to_sheet(detailData);

  // Column widths
  ws1['!cols'] = [
    { wch: 5  },  // STT
    { wch: 10 },  // Mã GD
    { wch: 20 },  // Ngày
    { wch: 25 },  // Khách hàng
    { wch: 25 },  // Gói
    { wch: 18 },  // Tổng thanh toán
    { wch: 15 },  // Trạng thái
    { wch: 18 },  // Ghi chú
  ];

  // Freeze header rows
  ws1['!freeze'] = { xSplit: 0, ySplit: 11 };

  // Print Setup to make it look beautiful and fit in pages
  ws1['!pageSetup'] = { paperSize: 9, orientation: 'landscape', scale: 80, fitToWidth: 1, fitToHeight: 0 };
  ws1['!margins'] = { left: 0.25, right: 0.25, top: 0.5, bottom: 0.5, header: 0.2, footer: 0.2 };

  // Merge cells: tiêu đề công ty
  ws1['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } },  // Tên công ty
    { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } },  // Tên EN
    { s: { r: 2, c: 0 }, e: { r: 2, c: 7 } },  // Địa chỉ
    { s: { r: 3, c: 0 }, e: { r: 3, c: 7 } },  // Liên hệ
    { s: { r: 5, c: 0 }, e: { r: 5, c: 7 } },  // Tiêu đề báo cáo
    { s: { r: 6, c: 0 }, e: { r: 6, c: 7 } },  // Kỳ báo cáo
  ];

  XLSX.utils.book_append_sheet(wb, ws1, 'Chi tiết giao dịch');

  // ────────────────────────────────────────────────────
  // SHEET 2: Tổng hợp theo gói
  // ────────────────────────────────────────────────────
  const packageMap: Record<string, { count: number; revenue: number }> = {};
  for (const inv of successInvoices) {
    const key = inv.packageName || 'Không xác định';
    if (!packageMap[key]) packageMap[key] = { count: 0, revenue: 0 };
    packageMap[key].count++;
    packageMap[key].revenue += inv.amount;
  }

  const summaryData: (string | number)[][] = [
    [`🎬 ${COMPANY_INFO.name}`],
    ['TỔNG HỢP DOANH THU THEO GÓI'],
    [`Kỳ: ${period}   |   Ngày xuất: ${exportDate}`],
    [''],
    ['STT', 'Tên gói Premium', 'Số GD thành công', 'Doanh thu (VND)', 'Tỷ trọng (%)'],
    ...Object.entries(packageMap).map(([name, { count, revenue }], idx) => [
      idx + 1,
      name,
      count,
      revenue,
      totalRevenue ? +((revenue / totalRevenue) * 100).toFixed(2) : 0,
    ]),
    [''],
    ['', 'TỔNG CỘNG', successInvoices.length, totalRevenue, 100],
  ];

  const ws2 = XLSX.utils.aoa_to_sheet(summaryData);
  ws2['!cols'] = [
    { wch: 5 }, { wch: 25 }, { wch: 18 }, { wch: 22 }, { wch: 15 },
  ];
  ws2['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 4 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 4 } },
  ];
  ws2['!pageSetup'] = { paperSize: 9, orientation: 'landscape', scale: 65, fitToWidth: 1, fitToHeight: 0 };
  ws2['!margins'] = { left: 0.1, right: 0.1, top: 0.2, bottom: 0.2, header: 0.1, footer: 0.1 };

  XLSX.utils.book_append_sheet(wb, ws2, 'Tổng hợp theo gói');

  // ────────────────────────────────────────────────────
  // SHEET 3: Thống kê theo trạng thái
  // ────────────────────────────────────────────────────
  const statusData: (string | number)[][] = [
    [`🎬 ${COMPANY_INFO.name}`],
    ['THỐNG KÊ THEO TRẠNG THÁI GIAO DỊCH'],
    [`Kỳ: ${period}   |   Ngày xuất: ${exportDate}`],
    [''],
    ['Trạng thái', 'Số giao dịch', 'Doanh thu (VND)', 'Tỷ lệ (%)'],
    ['Thành công', successInvoices.length, totalRevenue, invoices.length ? +((successInvoices.length / invoices.length) * 100).toFixed(2) : 0],
    ['Đang xử lý', pendingInvoices.length, pendingInvoices.reduce((s, i) => s + i.amount, 0), invoices.length ? +((pendingInvoices.length / invoices.length) * 100).toFixed(2) : 0],
    ['Thất bại',   failedInvoices.length,  0, invoices.length ? +((failedInvoices.length  / invoices.length) * 100).toFixed(2) : 0],
    [''],
    ['TỔNG', invoices.length, totalRevenue, 100],
  ];
  const ws3 = XLSX.utils.aoa_to_sheet(statusData);
  ws3['!cols'] = [{ wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 15 }];
  ws3['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 3 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 3 } },
  ];
  ws3['!pageSetup'] = { paperSize: 9, orientation: 'landscape', scale: 65, fitToWidth: 1, fitToHeight: 0 };
  ws3['!margins'] = { left: 0.1, right: 0.1, top: 0.2, bottom: 0.2, header: 0.1, footer: 0.1 };

  XLSX.utils.book_append_sheet(wb, ws3, 'Thống kê trạng thái');

  // Xuất file
  const ymd = now.toISOString().slice(0, 10);
  XLSX.writeFile(wb, `CineHub_BaoCaoGiaoDich_${ymd}.xlsx`);
}

// ─── Status Update Modal ────────────────────────────────────────────────────
interface StatusModalProps {
  invoice: PaymentResponse;
  onClose: () => void;
  onSuccess: (updated: PaymentResponse) => void;
}

function StatusUpdateModal({ invoice, onClose, onSuccess }: StatusModalProps) {
  const [newStatus, setNewStatus] = useState<'SUCCESS' | 'FAILED'>('SUCCESS');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canUpdate = invoice.status === 'PENDING';

  const handleUpdate = async () => {
    setLoading(true);
    setError(null);
    try {
      const updated = await paymentService.updatePaymentStatus(invoice.paymentId, newStatus);
      onSuccess(updated);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Có lỗi xảy ra khi cập nhật trạng thái.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center">
              <Edit2 size={18} className="text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Cập nhật trạng thái</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Info */}
        <div className="bg-gray-50 rounded-xl p-4 mb-5 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Mã giao dịch</span>
            <span className="font-semibold text-gray-800">#{invoice.paymentId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Người dùng</span>
            <span className="font-medium text-gray-800">{invoice.username || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Số tiền</span>
            <span className="font-semibold text-blue-600">{fmtCurrency(invoice.amount)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Trạng thái hiện tại</span>
            <StatusBadge status={invoice.status} />
          </div>
        </div>

        {!canUpdate ? (
          <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm mb-5">
            <AlertCircle size={18} className="flex-shrink-0" />
            <span>
              Chỉ có thể cập nhật giao dịch ở trạng thái <strong>Đang xử lý</strong>.
              Giao dịch đã <strong>{STATUS_CONFIG[invoice.status as keyof typeof STATUS_CONFIG]?.label}</strong> không thể thay đổi.
            </span>
          </div>
        ) : (
          <>
            {/* Status selector */}
            <div className="mb-5">
              <p className="text-sm font-medium text-gray-700 mb-3">Chuyển sang trạng thái:</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setNewStatus('SUCCESS')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${newStatus === 'SUCCESS'
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 bg-white hover:border-emerald-300'
                    }`}
                >
                  <CheckCircle size={24} className={newStatus === 'SUCCESS' ? 'text-emerald-600' : 'text-gray-400'} />
                  <span className={`text-sm font-medium ${newStatus === 'SUCCESS' ? 'text-emerald-700' : 'text-gray-600'}`}>
                    Thành công
                  </span>
                  <span className="text-[10px] text-gray-400 text-center">Kích hoạt gói Premium</span>
                </button>
                <button
                  onClick={() => setNewStatus('FAILED')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${newStatus === 'FAILED'
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 bg-white hover:border-red-300'
                    }`}
                >
                  <XCircle size={24} className={newStatus === 'FAILED' ? 'text-red-600' : 'text-gray-400'} />
                  <span className={`text-sm font-medium ${newStatus === 'FAILED' ? 'text-red-700' : 'text-gray-600'}`}>
                    Thất bại
                  </span>
                  <span className="text-[10px] text-gray-400 text-center">Đánh dấu thất bại</span>
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-4">
                <XCircle size={16} />
                {error}
              </div>
            )}

            {/* Warning for SUCCESS */}
            {newStatus === 'SUCCESS' && (
              <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-xs mb-4">
                <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                <span>Xác nhận thành công sẽ <strong>kích hoạt gói Premium</strong> cho người dùng ngay lập tức.</span>
              </div>
            )}

            <button
              onClick={handleUpdate}
              disabled={loading}
              className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${newStatus === 'SUCCESS'
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
                } disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {loading ? 'Đang cập nhật...' : `Xác nhận chuyển sang "${STATUS_CONFIG[newStatus].label}"`}
            </button>
          </>
        )}

        {!canUpdate && (
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Đóng
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function InvoicesManagement() {
  const [invoices, setInvoices] = useState<PaymentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'SUCCESS' | 'FAILED' | 'PENDING'>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<PaymentResponse | null>(null);
  const [statusModalInvoice, setStatusModalInvoice] = useState<PaymentResponse | null>(null);

  const fetchInvoices = () => {
    setLoading(true);
    paymentService.getAllPayments()
      .then(setInvoices)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchInvoices(); }, []);

  const handleStatusUpdated = (updated: PaymentResponse) => {
    setInvoices(prev => prev.map(inv => inv.paymentId === updated.paymentId ? { ...inv, status: updated.status } : inv));
    if (selectedInvoice?.paymentId === updated.paymentId) {
      setSelectedInvoice(prev => prev ? { ...prev, status: updated.status } : null);
    }
    setStatusModalInvoice(null);
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.paymentId.toString().includes(searchTerm) ||
      (invoice.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (invoice.packageName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || invoice.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = invoices.filter(i => i.status === 'SUCCESS').reduce((s, i) => s + i.amount, 0);
  const successCount = invoices.filter(i => i.status === 'SUCCESS').length;
  const pendingCount = invoices.filter(i => i.status === 'PENDING').length;
  const failedCount = invoices.filter(i => i.status === 'FAILED').length;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-800">Quản lý hóa đơn</h1>
          <p className="text-gray-500 mt-1 text-sm">Xem và quản lý tất cả giao dịch thanh toán</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchInvoices}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            <RefreshCw size={16} />
            Làm mới
          </button>
          <button
            onClick={() => printInvoiceReport(filteredInvoices)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium"
            title="In báo cáo giao dịch dạng PDF"
          >
            <Printer size={16} />
            In báo cáo
          </button>
          <button
            onClick={() => exportToExcel(filteredInvoices)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
            title="Xuất báo cáo Excel (.xlsx) đẹp với 3 sheet: Chi tiết, Tổng hợp theo gói, Thống kê trạng thái"
          >
            <FileSpreadsheet size={16} />
            Xuất Excel
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Tổng doanh thu',
            value: fmtCompact(totalRevenue),
            icon: CreditCard,
            color: 'from-blue-500 to-blue-600',
            bg: 'bg-blue-50',
            iconColor: 'text-blue-600',
          },
          {
            label: 'Thành công',
            value: successCount.toString(),
            icon: CheckCircle,
            color: 'from-emerald-500 to-emerald-600',
            bg: 'bg-emerald-50',
            iconColor: 'text-emerald-600',
          },
          {
            label: 'Đang xử lý',
            value: pendingCount.toString(),
            icon: AlertCircle,
            color: 'from-amber-500 to-amber-600',
            bg: 'bg-amber-50',
            iconColor: 'text-amber-600',
          },
          {
            label: 'Thất bại',
            value: failedCount.toString(),
            icon: XCircle,
            color: 'from-red-500 to-red-600',
            bg: 'bg-red-50',
            iconColor: 'text-red-600',
          },
        ].map(({ label, value, icon: Icon, bg, iconColor }) => (
          <div key={label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">{label}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1.5">{value}</p>
              </div>
              <div className={`${bg} p-3 rounded-xl`}>
                <Icon className={iconColor} size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Tìm theo mã GD, tên người dùng, gói..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {(['all', 'SUCCESS', 'PENDING', 'FAILED'] as const).map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${filterStatus === s
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {s === 'all' ? 'Tất cả' : STATUS_CONFIG[s].label}
                {s !== 'all' && (
                  <span className="ml-1.5 opacity-70">
                    ({invoices.filter(i => i.status === s).length})
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="flex items-center text-sm text-gray-500 whitespace-nowrap">
            <FileText size={14} className="mr-1.5" />
            <span className="font-semibold text-gray-700">{filteredInvoices.length}</span>&nbsp;kết quả
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 className="h-10 w-10 animate-spin text-blue-500 mb-3" />
            <p className="text-sm">Đang tải dữ liệu...</p>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <FileText size={40} className="mb-3 opacity-40" />
            <p className="text-sm">Không tìm thấy giao dịch nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Mã GD', 'Ngày thanh toán', 'Người dùng', 'Gói Premium', 'Phương thức', 'Số tiền', 'Trạng thái', 'Thao tác'].map((h, i) => (
                    <th
                      key={h}
                      className={`px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider ${i === 7 ? 'text-right' : 'text-left'}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.paymentId} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="text-sm font-mono font-medium text-gray-700">#{invoice.paymentId}</span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="text-sm text-gray-700">{fmtDate(invoice.paymentDate)}</span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {(invoice.username || '?')[0].toUpperCase()}
                        </div>
                        <span className="text-sm text-gray-700">{invoice.username || '-'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="text-sm text-gray-700 font-medium">{invoice.packageName || '-'}</span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <VNPayBadge />
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-800">
                        {fmtCurrency(invoice.amount)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <StatusBadge status={invoice.status} />
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        {invoice.status === 'PENDING' && (
                          <button
                            onClick={() => setStatusModalInvoice(invoice)}
                            className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Cập nhật trạng thái"
                          >
                            <Edit2 size={15} />
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedInvoice(invoice)}
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Status Update Modal ── */}
      {statusModalInvoice && (
        <StatusUpdateModal
          invoice={statusModalInvoice}
          onClose={() => setStatusModalInvoice(null)}
          onSuccess={handleStatusUpdated}
        />
      )}

      {/* ── Detail Modal ── */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden animate-fade-in">
            {/* Modal header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-white font-semibold text-lg">Chi tiết hóa đơn</h2>
                <p className="text-blue-200 text-xs mt-0.5">Mã giao dịch #{selectedInvoice.paymentId}</p>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-blue-200 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Company header */}
              <div className="text-center pb-4 border-b border-dashed border-gray-200">
                <p className="font-bold text-gray-800 text-base">🎬 CineHub Entertainment JSC</p>
                <p className="text-gray-500 text-xs mt-0.5">63 Lê Đức Thọ, Hà Nội</p>
                <p className="text-gray-400 text-xs">support@cinehub.vn · MST: 0123456789</p>
              </div>

              {/* Fields */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Mã giao dịch', value: `#${selectedInvoice.paymentId}` },
                  { label: 'Ngày thanh toán', value: fmtDate(selectedInvoice.paymentDate) },
                  { label: 'Người dùng', value: selectedInvoice.username || '-' },
                  { label: 'Gói Premium', value: selectedInvoice.packageName || '-' },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">{label}</p>
                    <p className="text-sm font-semibold text-gray-800">{value}</p>
                  </div>
                ))}
              </div>

              {/* Payment method + status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">Phương thức</p>
                  <VNPayBadge />
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">Trạng thái</p>
                  <StatusBadge status={selectedInvoice.status} />
                </div>
              </div>

              {/* Amount */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
                <p className="text-xs text-blue-400 uppercase tracking-wide mb-1">Tổng tiền thanh toán</p>
                <p className="text-2xl font-bold text-blue-700">{fmtCurrency(selectedInvoice.amount)}</p>
              </div>

              {/* Footer buttons */}
              <div className="flex gap-3 pt-1">
                {selectedInvoice.status === 'PENDING' && (
                  <button
                    onClick={() => {
                      setStatusModalInvoice(selectedInvoice);
                      setSelectedInvoice(null);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-medium transition-colors"
                  >
                    <Edit2 size={15} />
                    Cập nhật trạng thái
                  </button>
                )}
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}