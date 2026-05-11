import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Shield, ArrowLeft, CheckCircle2, CreditCard, Construction, Loader2, Gift, Sparkles, Minus } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import api from '../services/api';
import { userService, type UserProfile } from '../services/userService';
import { useAuth } from '../contexts/AuthContext';

interface PremiumPackageFromDB {
  id: number;
  packageName: string;
  price: number;
  durationDays: number;
  description: string;
  rewardPoints?: number;
}

// Phương thức thanh toán
const PAYMENT_METHODS = [
  {
    id: 'vnpay',
    label: 'VNPay',
    description: 'Ví điện tử VNPay',
    logo: 'https://vnpay.vn/s1/statics.vnpay.vn/2023/6/0oxhzjmxbksr1686814746087.png',
    available: true,
  },
  {
    id: 'atm',
    label: 'Thẻ ATM nội địa',
    description: 'Các ngân hàng Việt Nam',
    icon: 'atm',
    available: false,
  },
  {
    id: 'credit',
    label: 'Thẻ quốc tế',
    description: 'Visa, MasterCard',
    icon: 'credit',
    available: false,
  },
];

function parseFeatures(description: string | null): string[] {
  if (!description) return [];
  const lines = description.split(/[|\n]/).map(s => s.trim()).filter(Boolean);
  return lines.length > 0 ? lines : [description];
}

export default function Payment() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const planId = searchParams.get('plan');

  const [pkg, setPkg] = useState<PremiumPackageFromDB | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingPkg, setLoadingPkg] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  // Điểm tích lũy
  const [pointsInput, setPointsInput] = useState(0);
  const [usePoints, setUsePoints] = useState(false);

  // Guard: chuyển hướng nếu chưa đăng nhập
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth', { state: { from: `/payment?plan=${planId}` }, replace: true });
    }
  }, [isAuthenticated, navigate, planId]);

  useEffect(() => {
    if (!planId) { setLoadingPkg(false); return; }
    const promises: Promise<any>[] = [
      api.get<PremiumPackageFromDB>(`/premium-packages/${planId}`),
    ];
    if (isAuthenticated) {
      promises.push(userService.getMe());
    }
    Promise.all(promises)
      .then(([pkgRes, profileRes]) => {
        setPkg(pkgRes.data);
        if (profileRes) setProfile(profileRes);
      })
      .catch(() => setPkg(null))
      .finally(() => setLoadingPkg(false));
  }, [planId, isAuthenticated]);

  // Tính toán giá cuối
  const baseAmount = pkg ? Math.round(pkg.price * 1.1) : 0;
  const maxPoints = profile?.rewardPoints ?? 0;
  // Giới hạn giảm giá tối đa 70% tổng tiền (không cho phép giảm về 0)
  const maxDiscountAmount = Math.floor(baseAmount * 0.7);
  const maxPointsUsable = Math.min(maxPoints, Math.floor(maxDiscountAmount / 1000));
  const effectivePoints = usePoints ? Math.min(pointsInput, maxPointsUsable) : 0;
  const discountAmount = effectivePoints * 1000;
  const finalAmount = Math.max(baseAmount - discountAmount, Math.ceil(baseAmount * 0.3));

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pkg) return;
    setError('');
    setIsProcessing(true);

    try {
      const res = await api.post<{ paymentUrl: string }>('/payments/create-payment', {
        premiumPackageId: pkg.id,
        amount: baseAmount,
        pointsToUse: usePoints ? effectivePoints : 0,
      });

      if (res.data?.paymentUrl) {
        window.location.href = res.data.paymentUrl;
      } else {
        throw new Error('Không nhận được link thanh toán');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi tạo thanh toán');
      setIsProcessing(false);
    }
  };

  if (loadingPkg) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <Header />
        <div className="container mx-auto px-4 py-20 flex justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-red-600" />
        </div>
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl mb-4">Không tìm thấy gói đăng ký</h1>
          <Button onClick={() => navigate('/subscription')}>Chọn gói đăng ký</Button>
        </div>
      </div>
    );
  }

  const features = parseFeatures(pkg.description);
  const durationLabel = pkg.durationDays <= 31 ? 'Hàng tháng' : pkg.durationDays <= 93 ? 'Hàng quý' : 'Hàng năm';

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>

        <div className="max-w-5xl mx-auto grid lg:grid-cols-3 gap-6">
          {/* Payment Form */}
          <div className="lg:col-span-2 space-y-6">

            {/* Phương thức thanh toán */}
            <Card className="border-gray-800 bg-gray-900">
              <CardHeader>
                <CardTitle>Phương thức thanh toán</CardTitle>
                <CardDescription>Hiện tại hỗ trợ thanh toán qua VNPay</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {PAYMENT_METHODS.map(method => (
                  <div
                    key={method.id}
                    className={`flex items-center gap-4 rounded-lg border p-4 transition-all ${
                      method.available
                        ? 'border-red-600 bg-red-950/10'
                        : 'border-gray-800 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className={`h-4 w-4 rounded-full border-2 flex-shrink-0 ${
                      method.available ? 'border-red-600 bg-red-600' : 'border-gray-600'
                    }`}>
                      {method.available && <div className="h-2 w-2 bg-white rounded-full m-auto mt-[1px]" />}
                    </div>
                    <div className="flex items-center gap-3 flex-1">
                      {method.logo ? (
                        <img src={method.logo} alt={method.label} className="h-8 object-contain" />
                      ) : (
                        <CreditCard className={`h-8 w-8 ${method.id === 'atm' ? 'text-blue-500' : 'text-yellow-500'}`} />
                      )}
                      <div>
                        <p className="font-medium">{method.label}</p>
                        <p className="text-sm text-gray-400">{method.description}</p>
                      </div>
                    </div>
                    {!method.available && (
                      <Badge variant="outline" className="border-gray-700 text-gray-500 flex items-center gap-1 flex-shrink-0">
                        <Construction className="h-3 w-3" />
                        Đang phát triển
                      </Badge>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Điểm tích lũy */}
            {isAuthenticated && maxPoints > 0 && (
              <Card className="border-amber-700/40 bg-gradient-to-br from-amber-950/20 to-yellow-950/10">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Gift className="h-5 w-5 text-amber-400" />
                    <CardTitle className="text-amber-400">Điểm tích lũy</CardTitle>
                    <Badge className="bg-amber-600/20 text-amber-300 border border-amber-600/30">
                      {maxPoints.toLocaleString('vi-VN')} điểm
                    </Badge>
                  </div>
                  <CardDescription>Dùng điểm để giảm tiền thanh toán (1 điểm = 1.000đ, tối đa giảm 70%)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div
                      onClick={() => setUsePoints(!usePoints)}
                      className={`relative w-11 h-6 rounded-full transition-colors ${usePoints ? 'bg-amber-500' : 'bg-gray-600'}`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${usePoints ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </div>
                    <span className="text-sm text-gray-300">Sử dụng điểm tích lũy</span>
                  </label>

                  {usePoints && (
                    <div className="space-y-3 pt-1">
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min={0}
                          max={maxPointsUsable}
                          value={pointsInput}
                          onChange={e => setPointsInput(Number(e.target.value))}
                          className="flex-1 accent-amber-500"
                        />
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min={0}
                            max={maxPointsUsable}
                            value={pointsInput}
                            onChange={e => setPointsInput(Math.min(Number(e.target.value), maxPointsUsable))}
                            className="w-20 px-2 py-1 text-sm bg-gray-800 border border-gray-700 rounded text-center"
                          />
                          <span className="text-xs text-gray-400">điểm</span>
                        </div>
                      </div>
                      {effectivePoints > 0 && (
                        <div className="flex items-center gap-2 text-sm text-amber-400 bg-amber-900/20 rounded-lg px-3 py-2">
                          <Sparkles className="h-4 w-4 flex-shrink-0" />
                          Giảm <span className="font-bold mx-1">{discountAmount.toLocaleString('vi-VN')}đ</span> từ {effectivePoints} điểm
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Xác nhận thanh toán */}
            <Card className="border-gray-800 bg-gray-900">
              <CardHeader>
                <CardTitle>Xác nhận thanh toán</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePayment} className="space-y-4">
                  <p className="text-gray-300 text-sm mb-4">
                    Thông tin tài khoản của bạn sẽ được tự động liên kết với giao dịch VNPay.
                  </p>

                  {error && (
                    <p className="text-red-500 text-sm">{error}</p>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700 gap-2 h-12 text-base font-semibold"
                    disabled={isProcessing}
                  >
                    {isProcessing
                      ? <><Loader2 className="h-4 w-4 animate-spin" /> Đang chuyển hướng đến VNPay...</>
                      : `Thanh toán qua VNPay — ${finalAmount.toLocaleString('vi-VN')}đ`
                    }
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="flex items-center gap-3 rounded-lg border border-green-800 bg-green-950/20 p-4">
              <Shield className="h-6 w-6 text-green-500 flex-shrink-0" />
              <p className="text-sm text-gray-300">
                Thanh toán được xử lý qua VNPay — an toàn và bảo mật
              </p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="border-gray-800 bg-gray-900 sticky top-24">
              <CardHeader>
                <CardTitle>Thông tin đơn hàng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400">Gói đăng ký</p>
                  <p className="font-semibold">{pkg.packageName}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-400">Chu kỳ</p>
                  <p className="font-semibold">{durationLabel}</p>
                </div>

                <div className="border-t border-gray-700 pt-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">Tổng phụ</span>
                    <span>{pkg.price.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">VAT (10%)</span>
                    <span>{Math.round(pkg.price * 0.1).toLocaleString('vi-VN')}đ</span>
                  </div>
                  {effectivePoints > 0 && (
                    <div className="flex justify-between mb-2 text-amber-400">
                      <span className="flex items-center gap-1">
                        <Minus className="h-3 w-3" />
                        Điểm tích lũy ({effectivePoints} điểm)
                      </span>
                      <span>-{discountAmount.toLocaleString('vi-VN')}đ</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xl font-bold border-t border-gray-700 pt-4">
                    <span>Tổng cộng</span>
                    <span className="text-red-500">{finalAmount.toLocaleString('vi-VN')}đ</span>
                  </div>
                </div>

                {/* Điểm thưởng sau khi mua */}
                {(pkg.rewardPoints ?? 0) > 0 && (
                  <div className="border-t border-gray-700 pt-4">
                    <div className="flex items-center gap-2 bg-amber-900/20 rounded-lg px-3 py-2 border border-amber-700/30">
                      <Gift className="h-4 w-4 text-amber-400 flex-shrink-0" />
                      <p className="text-sm text-amber-300">
                        Nhận <span className="font-bold">{pkg.rewardPoints?.toLocaleString('vi-VN')} điểm</span> sau khi đăng ký thành công
                      </p>
                    </div>
                  </div>
                )}

                {features.length > 0 && (
                  <div className="border-t border-gray-700 pt-4 space-y-2">
                    <h4 className="font-semibold">Bạn sẽ nhận được:</h4>
                    <ul className="space-y-2 text-sm">
                      {features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}