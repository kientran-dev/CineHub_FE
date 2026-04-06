import { useState } from 'react';
import { Search, Eye, Download, FileText, CreditCard } from 'lucide-react';
import { mockInvoices, Invoice } from '../data/mockData';
import { VNPayLogo } from '../components/VNPayLogo';

export default function InvoicesManagement() {
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | Invoice['TrangThai']>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.MaTT.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || invoice.TrangThai === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = invoices
    .filter((inv) => inv.TrangThai === 'Thành công')
    .reduce((sum, inv) => sum + inv.TongTien, 0);

  const successfulTransactions = invoices.filter((inv) => inv.TrangThai === 'Thành công').length;
  const pendingTransactions = invoices.filter((inv) => inv.TrangThai === 'Đang xử lý').length;
  const failedTransactions = invoices.filter((inv) => inv.TrangThai === 'Thất bại').length;

  const getStatusColor = (status: Invoice['TrangThai']) => {
    switch (status) {
      case 'Thành công':
        return 'bg-green-100 text-green-800';
      case 'Đang xử lý':
        return 'bg-yellow-100 text-yellow-800';
      case 'Thất bại':
        return 'bg-red-100 text-red-800';
      case 'Hoàn tiền':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleExportInvoices = () => {
    const csvContent = `Mã thanh toán,Ngày thanh toán,Phương thức,Trạng thái,Tổng tiền,Người dùng,Email,Gói premium\n${filteredInvoices
      .map(
        (inv) =>
          `${inv.MaTT},${inv.NgayThanhToan},${inv.PhuongThucThanhToan},${inv.TrangThai},${inv.TongTien},${inv.username},${inv.email},${inv.packageName}`
      )
      .join('\n')}`;

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `hoa-don-${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-800">Quản lý hóa đơn</h1>
          <p className="text-gray-600 mt-1">Quản lý giao dịch và thanh toán</p>
        </div>
        <button
          onClick={handleExportInvoices}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download size={18} />
          Xuất hóa đơn
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Tổng doanh thu</p>
              <p className="text-2xl font-semibold mt-2">
                {new Intl.NumberFormat('vi-VN', {
                  notation: 'compact',
                  compactDisplay: 'short',
                }).format(totalRevenue)}đ
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <CreditCard className="text-green-600" size={28} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Giao dịch thành công</p>
              <p className="text-2xl font-semibold mt-2 text-green-600">
                {successfulTransactions}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <FileText className="text-green-600" size={28} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Đang xử lý</p>
              <p className="text-2xl font-semibold mt-2 text-yellow-600">
                {pendingTransactions}
              </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <FileText className="text-yellow-600" size={28} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Thất bại</p>
              <p className="text-2xl font-semibold mt-2 text-red-600">{failedTransactions}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <FileText className="text-red-600" size={28} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Tìm kiếm theo mã, người dùng, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="Thành công">Thành công</option>
            <option value="Đang xử lý">Đang xử lý</option>
            <option value="Thất bại">Thất bại</option>
            <option value="Hoàn tiền">Hoàn tiền</option>
          </select>
          <div className="text-gray-600 flex items-center">
            Tổng số:{' '}
            <span className="font-semibold ml-2">{filteredInvoices.length} giao dịch</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã thanh toán
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày thanh toán
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người dùng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gói Premium
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phương thức
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tổng tiền
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.MaTT} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{invoice.MaTT}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(invoice.NgayThanhToan).toLocaleString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{invoice.username}</div>
                    <div className="text-xs text-gray-500">{invoice.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {invoice.packageName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <VNPayLogo />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(invoice.TongTien)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                        invoice.TrangThai
                      )}`}
                    >
                      {invoice.TrangThai}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <button
                      onClick={() => setSelectedInvoice(invoice)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredInvoices.length === 0 && (
        <div className="text-center py-12 text-gray-500">Không tìm thấy giao dịch nào</div>
      )}

      {/* Detail Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Chi tiết hóa đơn</h2>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 pb-4 border-b">
                <div>
                  <p className="text-sm text-gray-500">Mã thanh toán</p>
                  <p className="font-semibold">{selectedInvoice.MaTT}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ngày thanh toán</p>
                  <p className="font-semibold">
                    {new Date(selectedInvoice.NgayThanhToan).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pb-4 border-b">
                <div>
                  <p className="text-sm text-gray-500">Tên người dùng</p>
                  <p className="font-semibold">{selectedInvoice.username}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-semibold">{selectedInvoice.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pb-4 border-b">
                <div>
                  <p className="text-sm text-gray-500">Gói Premium</p>
                  <p className="font-semibold">{selectedInvoice.packageName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phương thức thanh toán</p>
                  <div className="flex items-center gap-2">
                    <VNPayLogo />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pb-4 border-b">
                <div>
                  <p className="text-sm text-gray-500">Tổng tiền</p>
                  <p className="text-xl font-bold text-blue-600">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(selectedInvoice.TongTien)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Trạng thái</p>
                  <span
                    className={`inline-block px-3 py-1 text-sm rounded-full ${getStatusColor(
                      selectedInvoice.TrangThai
                    )}`}
                  >
                    {selectedInvoice.TrangThai}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Đóng
              </button>
              <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                In hóa đơn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}