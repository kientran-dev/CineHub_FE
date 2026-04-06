import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { User, Mail, Crown, Calendar, Gift, Loader2 } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { userService, type UserProfile } from '../services/userService';
import { useAuth } from '../contexts/AuthContext';

export default function Profile() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [birthdate, setBirthdate] = useState('');

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return; }
    userService.getMe()
      .then(data => {
        setProfile(data);
        setName(data.fullName ?? '');
        setEmail(data.email ?? '');
        setBirthdate(data.dateOfBirth ?? '');
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const handleSave = () => {
    alert('Tính năng cập nhật thông tin đang được phát triển!');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-400 text-lg mb-4">Vui lòng đăng nhập để xem hồ sơ</p>
            <Button className="bg-red-600 hover:bg-red-700" onClick={() => navigate('/auth')}>
              Đăng nhập
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-red-600" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />

      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1 h-8 bg-red-600 rounded-full" />
          <h1 className="text-3xl font-bold">Hồ sơ của tôi</h1>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="border-gray-800 bg-gray-900">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <Avatar className="h-32 w-32 mb-4">
                <AvatarImage src={profile?.avatar} alt={profile?.fullName} />
                <AvatarFallback className="text-3xl bg-gray-700">
                  {profile?.fullName?.charAt(0) ?? profile?.username?.charAt(0) ?? 'U'}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold mb-1">{profile?.fullName || profile?.username}</h2>
              <p className="text-gray-400 text-sm mb-4">@{profile?.username}</p>
              <p className="text-gray-400 mb-4">{profile?.email}</p>

              <Badge className="bg-gray-700 mb-4">Thành viên</Badge>

              {/* Reward Points */}
              <div className="w-full mt-4 p-4 rounded-lg bg-gradient-to-br from-yellow-600/20 to-red-600/20 border border-yellow-600/30">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Gift className="h-5 w-5 text-yellow-500" />
                  <span className="text-sm text-gray-300">Điểm tích lũy</span>
                </div>
                <p className="text-3xl font-bold text-yellow-500">{profile?.rewardPoints ?? 0}</p>
                <p className="text-xs text-gray-400 mt-1">Điểm</p>
              </div>

              <Button
                variant="outline"
                className="w-full mt-4 border-red-800 text-red-400 hover:bg-red-900/20"
                onClick={handleLogout}
              >
                Đăng xuất
              </Button>
            </CardContent>
          </Card>

          {/* Edit Profile */}
          <Card className="md:col-span-2 border-gray-800 bg-gray-900">
            <CardHeader>
              <CardTitle>Thông tin cá nhân</CardTitle>
              <CardDescription>Cập nhật thông tin tài khoản của bạn</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Họ và tên</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    className="pl-10 bg-gray-800 border-gray-700"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    className="pl-10 bg-gray-800 border-gray-700"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthdate">Ngày sinh</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="birthdate"
                    type="date"
                    className="pl-10 bg-gray-800 border-gray-700"
                    value={birthdate}
                    onChange={(e) => setBirthdate(e.target.value)}
                  />
                </div>
              </div>

              <div className="p-4 rounded-lg bg-gray-800 border border-gray-700">
                <div className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">Gói đăng ký</p>
                    <p className="text-xs text-gray-400">Hiện tại chưa có gói premium</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/subscription')}
                    className="border-yellow-600 text-yellow-500 hover:bg-yellow-900/20"
                  >
                    Nâng cấp
                  </Button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button className="flex-1 bg-red-600 hover:bg-red-700" onClick={handleSave}>
                  Lưu thay đổi
                </Button>
                <Button variant="outline" className="border-gray-700" onClick={() => navigate('/')}>
                  Hủy
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}