import { useState, useEffect } from 'react';
import { Search, Trash2, Crown, Shield, Loader2 } from 'lucide-react';
import { userService, type UserResponse } from '../services/adminService';

export default function AccountsManagement() {
  const [accounts, setAccounts] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'user'>('all');

  const fetchUsers = () => {
    setLoading(true);
    userService.getAllUsers()
      .then(setAccounts)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredAccounts = accounts.filter((account) => {
    const matchesSearch =
      account.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (account.email && account.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (account.fullName && account.fullName.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const isAdmin = account.roles?.includes('ROLE_ADMIN');
    let matchesRole = true;
    if (filterRole === 'admin') matchesRole = !!isAdmin;
    if (filterRole === 'user') matchesRole = !isAdmin;

    return matchesSearch && matchesRole;
  });

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tài khoản này?')) return;
    try {
      await userService.deleteUser(id);
      setAccounts(accounts.filter((a) => a.id !== id));
    } catch {
      alert('Xóa thất bại!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-800">Quản lý tài khoản</h1>
          <p className="text-gray-600 mt-1">Danh sách người dùng và quản trị viên</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Tìm kiếm tài khoản..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả vai trò</option>
            <option value="admin">Quản trị viên</option>
            <option value="user">Người dùng</option>
          </select>
          <div className="text-gray-600 flex items-center">
            Tổng số: <span className="font-semibold ml-2">{filteredAccounts.length} tài khoản</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
           <div className="flex justify-center py-16">
             <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
           </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên đăng nhập
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Họ và tên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vai trò
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gói dịch vụ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày đăng ký
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAccounts.map((account) => (
                  <tr key={account.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {account.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {account.avatar ? (
                          <img src={account.avatar} alt="avatar" className="h-8 w-8 rounded-full" />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                            {account.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="text-sm font-medium text-gray-900">{account.username}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {account.email || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {account.fullName || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {account.roles?.includes('ROLE_ADMIN') ? (
                        <span className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800 w-fit">
                          <Shield size={12} />
                          Admin
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                          User
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {account.isPremium ? (
                        <span className="flex items-center gap-1 text-xs text-orange-600">
                          <Crown size={14} />
                          Premium
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">Miễn phí</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {account.registeredDate ? new Date(account.registeredDate).toLocaleDateString('vi-VN') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => handleDelete(account.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Xóa tài khoản"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {filteredAccounts.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500">
          Không tìm thấy tài khoản nào
        </div>
      )}
    </div>
  );
}
