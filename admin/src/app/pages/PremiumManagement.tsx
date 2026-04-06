import { useState } from 'react';
import { Crown, Plus, Edit, Trash2, Users, DollarSign, Calendar } from 'lucide-react';
import { mockPremiumPackages, PremiumPackage } from '../data/mockData';

export default function PremiumManagement() {
  const [packages, setPackages] = useState<PremiumPackage[]>(mockPremiumPackages);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<PremiumPackage | null>(null);

  const handleDelete = (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa gói Premium này?')) {
      setPackages(packages.filter((p) => p.id !== id));
    }
  };

  const handleEdit = (pkg: PremiumPackage) => {
    setEditingPackage(pkg);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingPackage(null);
    setIsModalOpen(true);
  };

  const totalRevenue = packages.reduce((sum, pkg) => sum + pkg.revenue, 0);
  const totalUsers = packages.reduce((sum, pkg) => sum + pkg.activeUsers, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-800">Quản lý gói Premium</h1>
          <p className="text-gray-600 mt-1">Quản lý các gói đăng ký Premium</p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          Thêm gói mới
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Tổng gói Premium</p>
              <p className="text-2xl font-semibold mt-2">{packages.length}</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <Crown className="text-orange-600" size={28} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Tổng người dùng Premium</p>
              <p className="text-2xl font-semibold mt-2">
                {new Intl.NumberFormat('vi-VN').format(totalUsers)}
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <Users className="text-blue-600" size={28} />
            </div>
          </div>
        </div>
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
              <DollarSign className="text-green-600" size={28} />
            </div>
          </div>
        </div>
      </div>

      {/* Package Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
          >
            <div className="bg-gradient-to-r from-orange-500 to-pink-500 p-6 text-white">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Crown size={24} />
                  <h3 className="text-2xl font-semibold">{pkg.name}</h3>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(pkg)}
                    className="text-white hover:bg-white/20 p-2 rounded transition-colors"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(pkg.id)}
                    className="text-white hover:bg-white/20 p-2 rounded transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">
                  {new Intl.NumberFormat('vi-VN').format(pkg.price)}
                </span>
                <span className="text-lg">VNĐ</span>
              </div>
              <div className="flex items-center gap-1 mt-2 text-white/90">
                <Calendar size={16} />
                <span className="text-sm">{pkg.duration} ngày</span>
              </div>
            </div>

            <div className="p-6">
              <h4 className="font-semibold text-gray-800 mb-3">Tính năng:</h4>
              <ul className="space-y-2 mb-6">
                {pkg.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-gray-600">
                    <span className="text-green-500">✓</span>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <p className="text-sm text-gray-500">Người dùng</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {new Intl.NumberFormat('vi-VN').format(pkg.activeUsers)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Doanh thu</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {new Intl.NumberFormat('vi-VN', {
                      notation: 'compact',
                      compactDisplay: 'short',
                    }).format(pkg.revenue)}đ
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              {editingPackage ? 'Chỉnh sửa gói Premium' : 'Thêm gói Premium mới'}
            </h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên gói
                </label>
                <input
                  type="text"
                  defaultValue={editingPackage?.name}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ví dụ: Gói 1 Tháng"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giá (VNĐ)
                  </label>
                  <input
                    type="number"
                    defaultValue={editingPackage?.price}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="50000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thời hạn (ngày)
                  </label>
                  <input
                    type="number"
                    defaultValue={editingPackage?.duration}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="30"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tính năng (mỗi dòng một tính năng)
                </label>
                <textarea
                  defaultValue={editingPackage?.features.join('\n')}
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Xem không giới hạn&#10;Chất lượng HD&#10;Không quảng cáo"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsModalOpen(false);
                  }}
                >
                  {editingPackage ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
