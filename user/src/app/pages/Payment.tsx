import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Shield, ArrowLeft, CheckCircle2, CreditCard, Construction, Loader2 } from 'lucide-react';
import Header from '../components/Header';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import api from '../services/api';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration: 'monthly' | 'yearly';
  features: string[];
}

const PLANS: SubscriptionPlan[] = [
  {
    id: '1',
    name: 'Gói Tháng',
    price: 79000,
    duration: 'monthly',
    features: ['Xem không giới hạn', 'Bỏ qua quảng cáo', 'HD 1080p', '2 thiết bị', 'Tải xuống offline'],
  },
  {
    id: '2',
    name: 'Gói Năm',
    price: 799000,
    duration: 'yearly',
    features: ['Xem không giới hạn', 'Bỏ qua quảng cáo', '4K 2160p', '4 thiết bị', 'Tải xuống không giới hạn', 'Hỗ trợ ưu tiên'],
  },
];

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

export default function Payment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planId = searchParams.get('plan');
  const plan = PLANS.find(p => p.id === planId);

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plan) return;
    setError('');
    setIsProcessing(true);

    try {
      // Gọi BE tạo link VNPay
      const res = await api.post<{ paymentUrl: string }>('/payments/create-payment', {
        premiumPackageId: parseInt(plan.id),
        amount: Math.round(plan.price * 1.1),
      });

      if (res.data?.paymentUrl) {
        // Chuyển sang trang VNPay
        window.location.href = res.data.paymentUrl;
      } else {
        throw new Error('Không nhận được link thanh toán');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi tạo thanh toán');
      setIsProcessing(false);
    }
  };

  if (!plan) {
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
                    {/* Radio visual */}
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

            {/* Thông tin thanh toán */}
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
                    className="w-full bg-red-600 hover:bg-red-700 gap-2"
                    disabled={isProcessing}
                  >
                    {isProcessing
                      ? <><Loader2 className="h-4 w-4 animate-spin" /> Đang chuyển hướng đến VNPay...</>
                      : `Thanh toán qua VNPay — ${Math.round(plan.price * 1.1).toLocaleString('vi-VN')}đ`
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
                  <p className="font-semibold">{plan.name}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-400">Chu kỳ</p>
                  <p className="font-semibold">{plan.duration === 'monthly' ? 'Hàng tháng' : 'Hàng năm'}</p>
                </div>

                <div className="border-t border-gray-700 pt-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">Tổng phụ</span>
                    <span>{plan.price.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">VAT (10%)</span>
                    <span>{Math.round(plan.price * 0.1).toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold border-t border-gray-700 pt-4">
                    <span>Tổng cộng</span>
                    <span className="text-red-500">{Math.round(plan.price * 1.1).toLocaleString('vi-VN')}đ</span>
                  </div>
                </div>

                <div className="border-t border-gray-700 pt-4 space-y-2">
                  <h4 className="font-semibold">Bạn sẽ nhận được:</h4>
                  <ul className="space-y-2 text-sm">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}