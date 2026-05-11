import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Check, Crown, Sparkles, Loader2 } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

interface PremiumPackageFromDB {
  id: number;
  packageName: string;
  price: number;
  durationDays: number;
  description: string;
}

interface UserSubscription {
  packageName: string;
  status: string;
  endDate: string;
}

function parseFeatures(description: string | null): string[] {
  if (!description) return [];
  // Nếu description chứa dấu xuống dòng hoặc dấu |, tách ra thành features
  const lines = description.split(/[|\n]/).map(s => s.trim()).filter(Boolean);
  return lines.length > 0 ? lines : [description];
}

export default function Subscription() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [packages, setPackages] = useState<PremiumPackageFromDB[]>([]);
  const [currentSub, setCurrentSub] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch packages (public endpoint)
        const pkgRes = await api.get<PremiumPackageFromDB[]>('/premium-packages');
        setPackages(pkgRes.data);

        // Fetch current subscription nếu đã đăng nhập
        if (isAuthenticated) {
          try {
            const subRes = await api.get<UserSubscription>('/subscriptions/my/active');
            if (subRes.status === 200 && subRes.data) {
              setCurrentSub(subRes.data);
            }
          } catch {
            setCurrentSub(null);
          }
        }
      } catch (err) {
        console.error('Failed to load packages:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAuthenticated]);

  const handleSelectPlan = (packageId: number) => {
    if (!isAuthenticated) { navigate('/auth'); return; }
    navigate(`/payment?plan=${packageId}`);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />

      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-yellow-500 mb-4">
            <Sparkles className="h-8 w-8" />
            <Crown className="h-10 w-10" />
            <Sparkles className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Nâng cấp lên Premium</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Trải nghiệm xem phim đỉnh cao với CineHub Premium - Không quảng cáo, chất lượng cao, không giới hạn
          </p>
        </div>

        {/* Current Subscription */}
        {loading ? (
          <div className="flex justify-center mb-8"><Loader2 className="h-8 w-8 animate-spin text-red-600" /></div>
        ) : currentSub ? (
          <div className="max-w-4xl mx-auto mb-8 space-y-3">
            <div className="flex items-center gap-4 p-5 rounded-xl border border-yellow-600/60 bg-gradient-to-r from-yellow-950/30 to-amber-950/20">
              <div className="rounded-full bg-yellow-500/20 border border-yellow-500/40 p-3 flex-shrink-0">
                <Crown className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-white">Gói hiện tại: {currentSub.packageName}</h3>
                  <Badge className="bg-yellow-600 text-white text-xs">Đang hoạt động</Badge>
                </div>
                <p className="text-sm text-gray-300">
                  Hết hạn vào: <span className="text-yellow-400 font-medium">{new Date(currentSub.endDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                </p>
              </div>
            </div>
            <p className="text-center text-sm text-gray-400 bg-gray-800/50 rounded-lg py-2 px-4">
              💡 Mua thêm gói sẽ <span className="text-yellow-400 font-medium">cộng dồn</span> vào ngày hết hạn hiện tại của bạn
            </p>
          </div>
        ) : isAuthenticated ? (
          <p className="text-center text-gray-500 mb-8">Bạn hiện chưa có gói Premium</p>
        ) : (
          <p className="text-center text-gray-500 mb-8">
            <button onClick={() => navigate('/auth')} className="text-red-500 hover:underline">Đăng nhập</button> để xem gói đăng ký của bạn
          </p>
        )}

        {/* Plans from DB */}
        {loading ? null : (
          <div className={`grid gap-6 max-w-5xl mx-auto ${packages.length === 1 ? 'md:grid-cols-1 max-w-md' : packages.length >= 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
            {packages.map((pkg, idx) => {
              const isRecommended = packages.length > 1 && idx === packages.length - 1; // Gói cuối cùng (lớn nhất) là recommended
              const isCurrentPlan = currentSub?.packageName === pkg.packageName;
              const features = parseFeatures(pkg.description);

              return (
                <Card
                  key={pkg.id}
                  className={`relative border-2 ${
                    isRecommended
                      ? 'border-yellow-600 bg-gradient-to-br from-yellow-950/20 to-red-950/20'
                      : 'border-gray-800 bg-gray-900'
                  }`}
                >
                  {isRecommended && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="bg-yellow-600 text-white px-4 py-1">Tiết kiệm nhất</Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pb-4">
                    <div className="mb-2">
                      <Crown className={`h-12 w-12 mx-auto ${isRecommended ? 'text-yellow-500' : 'text-gray-400'}`} />
                    </div>
                    <CardTitle className="text-2xl">{pkg.packageName}</CardTitle>
                    <CardDescription>
                      {pkg.durationDays <= 31 ? 'Thanh toán hàng tháng' : pkg.durationDays <= 93 ? 'Thanh toán hàng quý' : 'Thanh toán hàng năm'}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <div className="text-center">
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-4xl font-bold">{pkg.price.toLocaleString('vi-VN')}</span>
                        <span className="text-gray-400">đ</span>
                      </div>
                      <p className="text-sm text-gray-400 mt-1">
                        /{pkg.durationDays <= 31 ? 'tháng' : pkg.durationDays <= 93 ? 'quý' : 'năm'}
                      </p>
                    </div>

                    {features.length > 0 && (
                      <ul className="space-y-3">
                        {features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    <Button
                      className={`w-full ${
                        isRecommended
                          ? 'bg-yellow-600 hover:bg-yellow-700'
                          : 'bg-red-600 hover:bg-red-700'
                      }`}
                      onClick={() => handleSelectPlan(pkg.id)}
                    >
                      {isCurrentPlan ? '+ Gia hạn thêm' : 'Chọn gói này'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Benefits */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Lợi ích khi nâng cấp Premium</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '🎬', title: 'Xem tất cả phim', description: 'Truy cập toàn bộ kho phim không giới hạn' },
              { icon: '🚫', title: 'Bỏ qua quảng cáo', description: 'Xem phim liền mạch, không bị gián đoạn bởi quảng cáo' },
              { icon: '📺', title: 'Chất lượng cao nhất', description: 'Mở khóa chất lượng HD/4K tùy gói đăng ký' },
              { icon: '📱', title: 'Đa thiết bị', description: 'Xem trên TV, máy tính, điện thoại cùng lúc' },
              { icon: '⬇️', title: 'Tải xuống', description: 'Tải phim về xem offline mọi lúc mọi nơi' },
              { icon: '💬', title: 'Hỗ trợ ưu tiên', description: 'Nhận hỗ trợ khách hàng nhanh chóng và ưu tiên' },
            ].map((benefit, index) => (
              <Card key={index} className="border-gray-800 bg-gray-900">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-3">{benefit.icon}</div>
                  <h3 className="font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-sm text-gray-400">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}