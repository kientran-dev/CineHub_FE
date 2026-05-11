import { useState, useEffect } from 'react';
import { Search, Trash2, Crown, Shield, Loader2, Gift, Edit2, X, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { userService, type UserResponse } from '../services/adminService';

export default function AccountsManagement() {
  const [accounts, setAccounts] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'user'>('all');
  const [roleModalAccount, setRoleModalAccount] = useState<UserResponse | null>(null);

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
      toast.success('Xóa tài khoản thành công!');
    } catch {
      toast.error('Xóa tài khoản thất bại!');
    }
  };

  const handleRoleChange = async (account: UserResponse, makeAdmin: boolean) => {
    try {
      if (makeAdmin) {
        await userService.grantAdmin(account.id);
        toast.success(`Đã cấp quyền Admin cho ${account.username}`);
      } else {
        await userService.revokeAdmin(account.id);
        toast.success(`Đã thu hồi quyền Admin của ${account.username}`);
      }
      // Cập nhật local state
      setAccounts(prev => prev.map(a => {
        if (a.id !== account.id) return a;
        const newRoles = makeAdmin
          ? [...new Set([...(a.roles || []), 'ROLE_ADMIN'])]
          : (a.roles || []).filter(r => r !== 'ROLE_ADMIN');
        return { ...a, roles: newRoles };
      }));
      setRoleModalAccount(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Cập nhật quyền thất bại!');
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
                    Điểm tích lũy
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="flex items-center gap-1.5 text-sm font-semibold text-amber-600">
                        <Gift size={14} className="text-amber-500" />
                        {(account.rewardPoints ?? 0).toLocaleString('vi-VN')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {account.registeredDate ? new Date(account.registeredDate).toLocaleDateString('vi-VN') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setRoleModalAccount(account)}
                          className="text-blue-600 hover:text-blue-800 p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Sửa quyền"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(account.id)}
                          className="text-red-600 hover:text-red-800 p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa tài khoản"
                        >
                          <Trash2 size={16} />
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

      {filteredAccounts.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500">
          Không tìm thấy tài khoản nào
        </div>
      )}

      {/* ── Role Update Modal ── */}
      {roleModalAccount && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-purple-100 rounded-full flex items-center justify-center">
                  <Shield size={18} className="text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Sửa quyền tài khoản</h3>
              </div>
              <button onClick={() => setRoleModalAccount(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* User Info */}
            <div className="bg-gray-50 rounded-xl p-4 mb-5 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Tên đăng nhập</span>
                <span className="font-semibold text-gray-800">{roleModalAccount.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Email</span>
                <span className="font-medium text-gray-800">{roleModalAccount.email || '-'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Vai trò hiện tại</span>
                {roleModalAccount.roles?.includes('ROLE_ADMIN') ? (
                  <span className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                    <Shield size={12} />
                    Admin
                  </span>
                ) : (
                  <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                    User
                  </span>
                )}
              </div>
            </div>

            {/* Role Selection */}
            <div className="mb-5">
              <p className="text-sm font-medium text-gray-700 mb-3">Chọn vai trò mới:</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleRoleChange(roleModalAccount, false)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    !roleModalAccount.roles?.includes('ROLE_ADMIN')
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-blue-300'
                  }`}
                >
                  <CheckCircle size={24} className={!roleModalAccount.roles?.includes('ROLE_ADMIN') ? 'text-blue-600' : 'text-gray-400'} />
                  <span className={`text-sm font-medium ${!roleModalAccount.roles?.includes('ROLE_ADMIN') ? 'text-blue-700' : 'text-gray-600'}`}>
                    User
                  </span>
                  <span className="text-[10px] text-gray-400 text-center">Quyền người dùng cơ bản</span>
                </button>
                <button
                  onClick={() => handleRoleChange(roleModalAccount, true)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    roleModalAccount.roles?.includes('ROLE_ADMIN')
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 bg-white hover:border-purple-300'
                  }`}
                >
                  <Shield size={24} className={roleModalAccount.roles?.includes('ROLE_ADMIN') ? 'text-purple-600' : 'text-gray-400'} />
                  <span className={`text-sm font-medium ${roleModalAccount.roles?.includes('ROLE_ADMIN') ? 'text-purple-700' : 'text-gray-600'}`}>
                    Admin
                  </span>
                  <span className="text-[10px] text-gray-400 text-center">Quyền quản trị viên</span>
                </button>
              </div>
            </div>

            {/* Warning */}
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-xs mb-4">
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
              <span>Thay đổi quyền sẽ có hiệu lực ngay lập tức. Quyền <strong>Admin</strong> cho phép truy cập đầy đủ hệ thống quản trị.</span>
            </div>

            <button
              onClick={() => setRoleModalAccount(null)}
              className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
