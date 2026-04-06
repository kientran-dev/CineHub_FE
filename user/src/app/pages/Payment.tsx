import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { CreditCard, Shield, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Header from '../components/Header';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { subscriptionPlans } from '../data/mockData';

export default function Payment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planId = searchParams.get('plan');
  const plan = subscriptionPlans.find(p => p.id === planId);

  const [paymentMethod, setPaymentMethod] = useState('vnpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      
      // Redirect after success
      setTimeout(() => {
        navigate('/profile');
      }, 3000);
    }, 2000);
  };

  if (!plan) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl mb-4">Không tìm thấy gói đăng ký</h1>
          <Button onClick={() => navigate('/subscription')}>
            Chọn gói đăng ký
          </Button>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <Card className="max-w-md mx-auto border-green-600 bg-green-950/20 text-center">
            <CardContent className="p-12">
              <CheckCircle2 className="h-20 w-20 text-green-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold mb-2">Thanh toán thành công!</h1>
              <p className="text-gray-300 mb-6">
                Cảm ơn bạn đã đăng ký {plan.name}. Tài khoản của bạn đã được nâng cấp.
              </p>
              <p className="text-sm text-gray-400">
                Đang chuyển hướng về trang cá nhân...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>

        <div className="max-w-5xl mx-auto grid lg:grid-cols-3 gap-6">
          {/* Payment Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-gray-800 bg-gray-900">
              <CardHeader>
                <CardTitle>Phương thức thanh toán</CardTitle>
                <CardDescription>Chọn phương thức thanh toán phù hợp</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="space-y-3">
                    {/* VNPay */}
                    <div className="flex items-center space-x-3 rounded-lg border border-gray-700 p-4 hover:border-red-600 transition-colors">
                      <RadioGroupItem value="vnpay" id="vnpay" />
                      <Label htmlFor="vnpay" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <img
                            src="https://vnpay.vn/s1/statics.vnpay.vn/2023/6/0oxhzjmxbksr1686814746087.png"
                            alt="VNPay"
                            className="h-8"
                          />
                          <div>
                            <p className="font-medium">VNPay</p>
                            <p className="text-sm text-gray-400">Ví điện tử VNPay</p>
                          </div>
                        </div>
                      </Label>
                    </div>

                    {/* ATM Card */}
                    <div className="flex items-center space-x-3 rounded-lg border border-gray-700 p-4 hover:border-red-600 transition-colors">
                      <RadioGroupItem value="atm" id="atm" />
                      <Label htmlFor="atm" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <CreditCard className="h-8 w-8 text-blue-500" />
                          <div>
                            <p className="font-medium">Thẻ ATM nội địa</p>
                            <p className="text-sm text-gray-400">Các ngân hàng Việt Nam</p>
                          </div>
                        </div>
                      </Label>
                    </div>

                    {/* Credit Card */}
                    <div className="flex items-center space-x-3 rounded-lg border border-gray-700 p-4 hover:border-red-600 transition-colors">
                      <RadioGroupItem value="credit" id="credit" />
                      <Label htmlFor="credit" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <CreditCard className="h-8 w-8 text-yellow-500" />
                          <div>
                            <p className="font-medium">Thẻ quốc tế</p>
                            <p className="text-sm text-gray-400">Visa, MasterCard</p>
                          </div>
                        </div>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Billing Information */}
            <Card className="border-gray-800 bg-gray-900">
              <CardHeader>
                <CardTitle>Thông tin thanh toán</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePayment} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Họ</Label>
                      <Input
                        id="firstName"
                        required
                        className="bg-gray-800 border-gray-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Tên</Label>
                      <Input
                        id="lastName"
                        required
                        className="bg-gray-800 border-gray-700"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Số điện thoại</Label>
                    <Input
                      id="phone"
                      type="tel"
                      required
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>

                  {paymentMethod === 'credit' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="cardNumber">Số thẻ</Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          required
                          className="bg-gray-800 border-gray-700"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="expiry">Ngày hết hạn</Label>
                          <Input
                            id="expiry"
                            placeholder="MM/YY"
                            required
                            className="bg-gray-800 border-gray-700"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            placeholder="123"
                            required
                            className="bg-gray-800 border-gray-700"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700"
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Đang xử lý...' : `Thanh toán ${plan.price.toLocaleString('vi-VN')}đ`}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Security Note */}
            <div className="flex items-center gap-3 rounded-lg border border-green-800 bg-green-950/20 p-4">
              <Shield className="h-6 w-6 text-green-500" />
              <p className="text-sm text-gray-300">
                Thông tin thanh toán của bạn được mã hóa và bảo mật tuyệt đối
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
                  <p className="font-semibold">
                    {plan.duration === 'monthly' ? 'Hàng tháng' : 'Hàng năm'}
                  </p>
                </div>

                <div className="border-t border-gray-700 pt-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">Tổng phụ</span>
                    <span>{plan.price.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">VAT (10%)</span>
                    <span>{(plan.price * 0.1).toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold border-t border-gray-700 pt-4">
                    <span>Tổng cộng</span>
                    <span className="text-red-500">
                      {(plan.price * 1.1).toLocaleString('vi-VN')}đ
                    </span>
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