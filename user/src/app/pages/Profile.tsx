import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { toast } from 'sonner';
import { User, Mail, Crown, Calendar, Gift, Loader2, Sparkles } from 'lucide-react';
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
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [claimingBirthday, setClaimingBirthday] = useState(false);
  const [birthdayClaimed, setBirthdayClaimed] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  // === THAY URL CLOUDINARY CUA BAN VAO DAY ===
  const PRESET_AVATARS = [
    // Placeholder: thay bang 10 URL cloudinary cua ban
    'https://res.cloudinary.com/dv25wtndy/image/upload/v1753733793/avatars/avatar_1.jpg',
    'https://res.cloudinary.com/dv25wtndy/image/upload/v1753733793/avatars/avatar_2.jpg',
    'https://res.cloudinary.com/dv25wtndy/image/upload/v1753733793/avatars/avatar_3.jpg',
    'https://res.cloudinary.com/dv25wtndy/image/upload/v1753733793/avatars/avatar_4.jpg',
    'https://res.cloudinary.com/dv25wtndy/image/upload/v1753733793/avatars/avatar_5.jpg',
    'https://res.cloudinary.com/dv25wtndy/image/upload/v1753733793/avatars/avatar_6.jpg',
    'https://res.cloudinary.com/dv25wtndy/image/upload/v1753733793/avatars/avatar_7.jpg',
    'https://res.cloudinary.com/dv25wtndy/image/upload/v1753733793/avatars/avatar_8.jpg',
    'https://res.cloudinary.com/dv25wtndy/image/upload/v1753733793/avatars/avatar_9.jpg',
    'https://res.cloudinary.com/dv25wtndy/image/upload/v1745342167/samples/breakfast.jpg',
  ];
  // ==========================================

  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    if (paymentStatus === 'success') {
      setTimeout(() => {
        toast.success('🎉 Thanh toán thành công! Gói Premium của bạn đã được kích hoạt.');
      }, 100);
      searchParams.delete('payment');
      setSearchParams(searchParams, { replace: true });
    } else if (paymentStatus === 'failed') {
      setTimeout(() => {
        toast.error('Thanh toán thất bại hoặc đã bị hủy. Vui lòng thử lại.');
      }, 100);
      searchParams.delete('payment');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

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


  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const updateData: { fullName?: string; avatar?: string; dateOfBirth?: string } = {};
      if (name !== (profile.fullName ?? '')) updateData.fullName = name;
      if (birthdate !== (profile.dateOfBirth ?? '')) updateData.dateOfBirth = birthdate;
      if (avatarPreview) updateData.avatar = avatarPreview;

      const updated = await userService.updateProfile(updateData);
      setProfile(updated);
      setAvatarPreview(null);
      toast.success('Cập nhật thông tin thành công!');
    } catch (err) {
      console.error(err);
      toast.error('Cập nhật thất bại. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
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

  const displayAvatar = avatarPreview || profile?.avatar;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />

      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1 h-8 bg-red-600 rounded-full" />
          <h1 className="text-3xl font-bold">Hồ sơ của tôi</h1>
        </div>

        {/* 🎂 Birthday Banner */}
        {(() => {
          if (!profile?.dateOfBirth) return null;
          const today = new Date();
          const dob = new Date(profile.dateOfBirth);
          const isBirthday = today.getMonth() === dob.getMonth() && today.getDate() === dob.getDate();
          if (!isBirthday) return null;

          return (
            <div className="mb-8 relative overflow-hidden rounded-2xl border border-yellow-500/30 bg-gradient-to-r from-yellow-950/40 via-amber-900/30 to-orange-950/40 p-6">
              {/* Decorative elements */}
              <div className="absolute top-2 left-4 text-3xl animate-bounce" style={{ animationDelay: '0.1s' }}>🎂</div>
              <div className="absolute top-3 right-6 text-2xl animate-bounce" style={{ animationDelay: '0.5s' }}>🎉</div>
              <div className="absolute bottom-2 right-20 text-2xl animate-bounce" style={{ animationDelay: '0.3s' }}>🎈</div>

              <div className="text-center relative z-10">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Sparkles className="h-6 w-6 text-yellow-400" />
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 via-amber-300 to-orange-400 bg-clip-text text-transparent">
                    Chúc mừng sinh nhật! 🎉
                  </h2>
                  <Sparkles className="h-6 w-6 text-yellow-400" />
                </div>
                <p className="text-gray-300 text-sm mb-4">
                  CineHub chúc bạn một ngày sinh nhật thật vui vẻ và tràn đầy niềm vui! 🌟
                </p>

                {birthdayClaimed ? (
                  <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-green-600/20 border border-green-500/30 text-green-400 text-sm font-medium">
                    <Gift className="h-4 w-4" />
                    Đã nhận 20 điểm tích lũy! Cảm ơn bạn ❤️
                  </div>
                ) : (
                  <Button
                    onClick={async () => {
                      setClaimingBirthday(true);
                      try {
                        const updated = await userService.claimBirthdayReward();
                        setProfile(updated);
                        setBirthdayClaimed(true);
                        toast.success('🎁 Nhận thành công 20 điểm tích lũy! Chúc mừng sinh nhật!');
                      } catch (err: any) {
                        const msg = err?.response?.data?.message || err?.response?.data || 'Có lỗi xảy ra';
                        if (typeof msg === 'string' && msg.includes('đã nhận')) {
                          setBirthdayClaimed(true);
                        }
                        toast.error(typeof msg === 'string' ? msg : 'Không thể nhận điểm. Vui lòng thử lại.');
                      } finally {
                        setClaimingBirthday(false);
                      }
                    }}
                    disabled={claimingBirthday}
                    className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-black font-semibold px-6 py-2.5 rounded-full shadow-lg shadow-yellow-500/20 transition-all hover:scale-105"
                  >
                    {claimingBirthday ? (
                      <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Đang nhận...</>
                    ) : (
                      <><Gift className="h-4 w-4 mr-2" /> Nhận 20 điểm tích lũy 🎁</>
                    )}
                  </Button>
                )}
              </div>
            </div>
          );
        })()}

        <div className="grid md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="border-gray-800 bg-gray-900">
            <CardContent className="p-6 flex flex-col items-center text-center">
              {/* Avatar with premium ring */}
              <div className="relative group mb-4">
                <div className={`rounded-full p-[3px] ${profile?.isPremium
                  ? 'bg-gradient-to-tr from-yellow-400 via-amber-500 to-yellow-300 shadow-lg shadow-yellow-500/30'
                  : 'bg-transparent'
                  }`}>
                  <Avatar className="h-32 w-32">
                    <AvatarImage src={displayAvatar || undefined} alt={profile?.fullName} />
                    <AvatarFallback className="text-3xl bg-gray-700">
                      {profile?.fullName?.charAt(0) ?? profile?.username?.charAt(0) ?? 'U'}
                    </AvatarFallback>
                  </Avatar>
                </div>
                {profile?.isPremium && (
                  <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-1">
                    <Crown className="h-3.5 w-3.5 text-black" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setShowAvatarPicker(v => !v)}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <span className="text-xs text-white font-medium">Thay ảnh</span>
                </button>
              </div>

              {/* Avatar Picker */}
              {showAvatarPicker && (
                <div className="w-full mb-4 p-3 bg-gray-800 rounded-xl border border-gray-700">
                  <p className="text-xs text-gray-400 mb-2 text-center">Chọn ảnh đại diện</p>
                  <div className="grid grid-cols-5 gap-2 place-items-center">
                    {PRESET_AVATARS.map((url, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => { setAvatarPreview(url); setShowAvatarPicker(false); }}
                        className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all hover:scale-110 flex-shrink-0 ${
                          avatarPreview === url ? 'border-red-500 ring-2 ring-red-500/50' : 'border-transparent'
                        }`}
                      >
                        <img src={url} alt={`Avatar ${i + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <h2 className="text-xl font-bold mb-1">{profile?.fullName || profile?.username}</h2>
              <p className="text-gray-400 text-sm mb-4">@{profile?.username}</p>
              <p className="text-gray-400 mb-4">{profile?.email}</p>

              {profile?.isPremium ? (
                <div className="flex flex-col items-center gap-1 mb-4">
                  <Badge className="bg-gradient-to-r from-yellow-600 to-amber-500 text-white">
                    <Crown className="h-3 w-3 mr-1" /> Premium Member
                  </Badge>
                  <span className="text-xs text-yellow-400/70">Thành viên ưu tiên</span>
                </div>
              ) : (
                <Badge className="bg-gray-700 mb-4">Thành viên</Badge>
              )}

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
                    className="pl-10 bg-gray-800 border-gray-700 opacity-60 cursor-not-allowed"
                    value={email}
                    readOnly
                  />
                </div>
                <p className="text-xs text-gray-500">Email không thể thay đổi</p>
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

              {/* Premium Subscription Info */}
              <div className={`p-4 rounded-lg border ${profile?.isPremium
                ? 'bg-gradient-to-r from-yellow-950/30 to-amber-950/30 border-yellow-600/50'
                : 'bg-gray-800 border-gray-700'
                }`}>
                <div className="flex items-center gap-2">
                  <Crown className={`h-5 w-5 ${profile?.isPremium ? 'text-yellow-500' : 'text-gray-400'}`} />
                  <div className="flex-1">
                    <p className="font-medium text-sm">Gói đăng ký</p>
                    {profile?.isPremium ? (
                      <div>
                        <p className="text-sm text-yellow-400 font-semibold">
                          {profile.premiumPackageName || 'Premium'}
                        </p>
                        {profile.premiumEndDate && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            Có hiệu lực đến: {new Date(profile.premiumEndDate).toLocaleDateString('vi-VN', {
                              day: '2-digit', month: '2-digit', year: 'numeric',
                              hour: '2-digit', minute: '2-digit'
                            })}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400">Hiện tại chưa có gói premium</p>
                    )}
                  </div>
                  {!profile?.isPremium && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/subscription')}
                      className="border-yellow-600 text-yellow-500 hover:bg-yellow-900/20"
                    >
                      Nâng cấp
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Đang lưu...</>
                  ) : (
                    'Lưu thay đổi'
                  )}
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