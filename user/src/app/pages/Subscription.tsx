import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Check, Crown, Sparkles, Loader2 } from 'lucide-react';
import Header from '../components/Header';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration: 'monthly' | 'yearly';
  features: string[];
}

interface UserSubscription {
  planName: string;
  status: string;
  endDate: string;
}

// Gói cứng — chỉ thay đổi nếu BE có API riêng
const PLANS: SubscriptionPlan[] = [
  {
    id: '1',
    name: 'Gói Tháng',
    price: 79000,
    duration: 'monthly',
    features: [
      'Xem không giới hạn tất cả phim',
      'Bỏ qua quảng cáo trước video',
      'Mở khóa chất lượng HD (1080p)',
      'Xem trên 2 thiết bị cùng lúc',
      'Tải xuống offline',
    ],
  },
  {
    id: '2',
    name: 'Gói Năm',
    price: 799000,
    duration: 'yearly',
    features: [
      'Xem không giới hạn tất cả phim',
      'Bỏ qua quảng cáo trước video',
      'Mở khóa chất lượng 4K (2160p)',
      'Xem trên 4 thiết bị cùng lúc',
      'Tải xuống offline không giới hạn',
      'Ưu tiên hỗ trợ khách hàng',
      'Tiết kiệm 16% so với gói tháng',
    ],
  },
];

export default function Subscription() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [currentSub, setCurrentSub] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return; }
    api.get<UserSubscription>('/subscriptions/my')
      .then(res => setCurrentSub(res.data))
      .catch(() => setCurrentSub(null))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const handleSelectPlan = (planId: string) => {
    if (!isAuthenticated) { navigate('/auth'); return; }
    navigate(`/payment?plan=${planId}`);
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
          <Card className="max-w-4xl mx-auto mb-8 border-green-600 bg-green-950/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-green-600 p-3">
                    <Crown className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Gói hiện tại của bạn</h3>
                    <p className="text-gray-300">
                      {currentSub.planName} — Hết hạn: {new Date(currentSub.endDate).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
                <Badge className="bg-green-600">{currentSub.status === 'ACTIVE' ? 'Đang hoạt động' : currentSub.status}</Badge>
              </div>
            </CardContent>
          </Card>
        ) : isAuthenticated ? (
          <p className="text-center text-gray-500 mb-8">Bạn hiện chưa có gói Premium</p>
        ) : (
          <p className="text-center text-gray-500 mb-8">
            <button onClick={() => navigate('/auth')} className="text-red-500 hover:underline">Đăng nhập</button> để xem gói đăng ký của bạn
          </p>
        )}

        {/* Plans */}
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {PLANS.map((plan) => {
            const isRecommended = plan.duration === 'yearly';
            const isCurrentPlan = currentSub?.planName === plan.name;

            return (
              <Card
                key={plan.id}
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
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>
                    {plan.duration === 'monthly' ? 'Thanh toán hàng tháng' : 'Thanh toán hàng năm'}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="text-center">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold">{plan.price.toLocaleString('vi-VN')}</span>
                      <span className="text-gray-400">đ</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">
                      {plan.duration === 'monthly' ? '/tháng' : '/năm'}
                    </p>
                  </div>

                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full ${
                      isCurrentPlan
                        ? 'bg-gray-700 cursor-not-allowed'
                        : isRecommended
                        ? 'bg-yellow-600 hover:bg-yellow-700'
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                    onClick={() => !isCurrentPlan && handleSelectPlan(plan.id)}
                    disabled={isCurrentPlan}
                  >
                    {isCurrentPlan ? 'Gói hiện tại' : 'Chọn gói này'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

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
    </div>
  );
}