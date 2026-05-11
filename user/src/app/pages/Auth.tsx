import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { toast } from 'sonner';
import { Film, AlertCircle, Eye, EyeOff, UserPlus, LogIn, Mail, Lock, User, Popcorn, X } from 'lucide-react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, loginWithGoogle } = useAuth();
  // Lấy URL gốc nếu user bị redirect từ trang khác (ví dụ /watch/123)
  const from = (location.state as { from?: string })?.from || '/';
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');

  // Forgot password: step 0=closed, 1=email, 2=otp, 3=newpass
  const [fpStep, setFpStep] = useState(0);
  const [fpEmail, setFpEmail] = useState('');
  const [fpOtp, setFpOtp] = useState('');
  const [fpNewPass, setFpNewPass] = useState('');
  const [fpLoading, setFpLoading] = useState(false);

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      toast.error('Đăng nhập Google thất bại.');
      return;
    }
    setIsLoading(true);
    try {
      await loginWithGoogle(credentialResponse.credential);
      toast.success('Chào mừng! Đăng nhập Google thành công 👋');
      navigate(from, { replace: true });
    } catch {
      toast.error('Đăng nhập Google thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFpSendOtp = async () => {
    if (!fpEmail) return;
    setFpLoading(true);
    try {
      await authService.forgotPassword(fpEmail);
      toast.success('Ma OTP da duoc gui ve email!');
      setFpStep(2);
    } catch {
      toast.error('Khong tim thay tai khoan voi email nay.');
    } finally {
      setFpLoading(false);
    }
  };

  const handleFpResetPassword = async () => {
    if (!fpNewPass || fpNewPass.length < 6) {
      toast.error('Mat khau moi phai co it nhat 6 ky tu.');
      return;
    }
    setFpLoading(true);
    try {
      await authService.resetPassword(fpEmail, fpOtp, fpNewPass);
      toast.success('Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.');
      setFpStep(0); setFpEmail(''); setFpOtp(''); setFpNewPass('');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Ma OTP khong dung hoac da het han.';
      toast.error(msg);
    } finally {
      setFpLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    const form = e.currentTarget;
    const username = (form.elements.namedItem('username') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    try {
      await login({ username, password });
      toast.success('Đăng nhập thành công!');
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Sai tên đăng nhập hoặc mật khẩu';
      setError(msg);
      toast.error(msg || 'Đăng nhập thất bại!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const fullName = (form.elements.namedItem('reg-fullname') as HTMLInputElement).value;
    const email = (form.elements.namedItem('reg-email') as HTMLInputElement).value;

    if (regUsername.includes(' ')) {
      setError('Tên đăng nhập không được chứa khoảng trắng');
      toast.error('Tên đăng nhập không hợp lệ');
      return;
    }
    if (regPassword !== regConfirm) {
      setError('Mật khẩu xác nhận không khớp');
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }
    if (regPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    setIsLoading(true);
    try {
      await register({ username: regUsername, fullName, email, password: regPassword });
      toast.success('Đăng ký tài khoản thành công!');
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Đăng ký thất bại. Vui lòng thử lại.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-[#0a0a0a] text-white flex">
        {/* Left Side — Branding + Illustration */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          {/* Background image */}
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1920&q=80"
              alt="Cinema"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-[#0a0a0a]/60" />
          </div>

          {/* Content overlay */}
          <div className="relative z-10 flex flex-col justify-between p-12 w-full">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="bg-red-600 p-2.5 rounded-xl">
                <Film className="h-7 w-7 text-white" />
              </div>
              <span className="text-3xl font-bold tracking-tight">CineHub</span>
            </div>

            {/* Main text */}
            <div className="space-y-6 max-w-lg">
              <h1 className="text-5xl font-bold leading-tight">
                Khám phá thế giới
                <span className="block bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                  điện ảnh
                </span>
                không giới hạn
              </h1>
              <p className="text-gray-300 text-lg leading-relaxed">
                Hàng nghìn bộ phim chất lượng cao, phụ đề Việt, cập nhật liên tục. Xem mọi lúc, mọi nơi.
              </p>

              {/* Feature highlights */}
              <div className="flex flex-wrap gap-4 pt-2">
                {[
                  { icon: '🎬', text: 'Top phim mới' },
                  { icon: '🍿', text: 'Không quảng cáo' },
                  { icon: '📱', text: 'Đa thiết bị' },
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2">
                    <span>{f.icon}</span>
                    <span className="text-sm font-medium">{f.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom social proof */}
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <div className="flex -space-x-2">
                {['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500'].map((bg, i) => (
                  <div key={i} className={`w-8 h-8 rounded-full ${bg} border-2 border-[#0a0a0a] flex items-center justify-center text-[10px] font-bold text-white`}>
                    {['K', 'M', 'T', 'H'][i]}
                  </div>
                ))}
              </div>
              <span>Hàng nghìn người dùng đang xem phim cùng bạn</span>
            </div>
          </div>
        </div>

        {/* Right Side — Auth Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-md space-y-8">
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center justify-center gap-2 mb-4">
              <div className="bg-red-600 p-2 rounded-lg">
                <Film className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold">CineHub</span>
            </div>

            {/* Header */}
            <div className="text-center lg:text-left">
              <h2 className="text-3xl font-bold">
                {isLogin ? 'Chào mừng trở lại!' : 'Tạo tài khoản mới'}
              </h2>
              <p className="text-gray-400 mt-2">
                {isLogin
                  ? 'Đăng nhập để tiếp tục hành trình điện ảnh'
                  : 'Đăng ký miễn phí để bắt đầu xem phim'}
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-3 rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Toggle between Login / Register */}
            <div className="flex bg-gray-800/50 rounded-xl p-1">
              <button
                onClick={() => { setIsLogin(true); setError(null); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${isLogin ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-gray-400 hover:text-white'
                  }`}
              >
                <LogIn className="h-4 w-4" />
                Đăng nhập
              </button>
              <button
                onClick={() => { setIsLogin(false); setError(null); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${!isLogin ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-gray-400 hover:text-white'
                  }`}
              >
                <UserPlus className="h-4 w-4" />
                Đăng ký
              </button>
            </div>

            {isLogin ? (
              <div className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-sm text-gray-300">Tên đăng nhập</Label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        id="username"
                        name="username"
                        type="text"
                        placeholder="Nhập tên đăng nhập"
                        required
                        className="pl-10 h-12 bg-gray-800/50 border-gray-700/50 rounded-xl focus:border-red-500 focus:ring-red-500/20 placeholder:text-gray-600"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm text-gray-300">Mật khẩu</Label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        required
                        className="pl-10 pr-10 h-12 bg-gray-800/50 border-gray-700/50 rounded-xl focus:border-red-500 focus:ring-red-500/20 placeholder:text-gray-600"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-end text-sm">
                    <button type="button" onClick={() => setFpStep(1)} className="text-red-500 hover:text-red-400 transition-colors">Quên mật khẩu?</button>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-red-600 hover:bg-red-700 rounded-xl text-base font-semibold shadow-lg shadow-red-600/20 transition-all hover:shadow-red-600/30"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Đang đăng nhập...
                      </div>
                    ) : (
                      <span className="flex items-center gap-2"><LogIn className="h-5 w-5" /> Đăng nhập</span>
                    )}
                  </Button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-3 my-2">
                  <div className="flex-1 h-px bg-gray-800" />
                  <span className="text-xs text-gray-600">hoặc</span>
                  <div className="flex-1 h-px bg-gray-800" />
                </div>

                {/* Google Sign-In */}
                <div className="flex justify-center w-full">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => toast.error('Đăng nhập Google thất bại.')}
                    theme="filled_black"
                    shape="rectangular"
                    text="signin_with"
                  />
                </div>
              </div>
            ) : (
              /* Register Form */
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-username" className="text-sm text-gray-300">Tên đăng nhập</Label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        id="reg-username" name="reg-username" type="text"
                        placeholder="username"
                        required
                        value={regUsername}
                        onChange={(e) => setRegUsername(e.target.value)}
                        className="pl-10 h-11 bg-gray-800/50 border-gray-700/50 rounded-xl focus:border-red-500 placeholder:text-gray-600"
                      />
                    </div>
                    {regUsername.includes(' ') && (
                      <p className="text-xs text-red-500 mt-1">Tên đăng nhập không có dấu cách</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-fullname" className="text-sm text-gray-300">Họ và tên</Label>
                    <div className="relative">
                      <Popcorn className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        id="reg-fullname" name="reg-fullname" type="text"
                        placeholder="Nguyễn Văn A"
                        required
                        className="pl-10 h-11 bg-gray-800/50 border-gray-700/50 rounded-xl focus:border-red-500 placeholder:text-gray-600"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-email" className="text-sm text-gray-300">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      id="reg-email" name="reg-email" type="email"
                      placeholder="your@email.com"
                      required
                      className="pl-10 h-11 bg-gray-800/50 border-gray-700/50 rounded-xl focus:border-red-500 placeholder:text-gray-600"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-password" className="text-sm text-gray-300">Mật khẩu</Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      id="reg-password" name="reg-password" type={showPassword ? 'text' : 'password'}
                      placeholder="Tối thiểu 6 ký tự"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className={`pl-10 pr-10 h-11 bg-gray-800/50 border-gray-700/50 rounded-xl focus:border-red-500 placeholder:text-gray-600 ${regPassword && regPassword.length < 6 ? 'border-red-500 focus:ring-red-500/20' : ''}`}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {regPassword && regPassword.length < 6 && (
                    <p className="text-xs text-red-500">Mật khẩu phải có ít nhất 6 ký tự</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-confirm" className="text-sm text-gray-300">Xác nhận mật khẩu</Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      id="reg-confirm" name="reg-confirm" type={showConfirm ? 'text' : 'password'}
                      placeholder="Nhập lại mật khẩu"
                      required
                      value={regConfirm}
                      onChange={(e) => setRegConfirm(e.target.value)}
                      className={`pl-10 pr-10 h-11 bg-gray-800/50 border-gray-700/50 rounded-xl focus:border-red-500 placeholder:text-gray-600 ${regConfirm && regPassword !== regConfirm ? 'border-red-500 focus:ring-red-500/20' : ''}`}
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {regConfirm && regPassword !== regConfirm && (
                    <p className="text-xs text-red-500">Mật khẩu không khớp. Vui lòng kiểm tra lại.</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-red-600 hover:bg-red-700 rounded-xl text-base font-semibold shadow-lg shadow-red-600/20"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Đang tạo tài khoản...
                    </div>
                  ) : (
                    <span className="flex items-center gap-2"><UserPlus className="h-5 w-5" /> Tạo tài khoản</span>
                  )}
                </Button>

                <p className="text-xs text-center text-gray-500">
                  Bằng cách đăng ký, bạn đồng ý với{' '}
                  <button type="button" onClick={() => toast.info('Điều khoản dịch vụ sẽ được cập nhật sau')} className="text-red-500 hover:underline">Điều khoản dịch vụ</button>{' '}
                  và <button type="button" onClick={() => toast.info('Chính sách bảo mật sẽ được cập nhật sau')} className="text-red-500 hover:underline">Chính sách bảo mật</button>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {fpStep > 0 && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[#141414] border border-gray-800 rounded-2xl p-8 w-full max-w-sm relative shadow-2xl">
            <button onClick={() => { setFpStep(0); setFpEmail(''); setFpOtp(''); setFpNewPass(''); }} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
              <X className="h-5 w-5" />
            </button>

            {fpStep === 1 && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-lg font-bold text-white">Quên mật khẩu</h3>
                  <p className="text-sm text-gray-400 mt-1">Nhập email để nhận mã OTP</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-gray-300">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      type="email" placeholder="email@example.com"
                      value={fpEmail} onChange={e => setFpEmail(e.target.value)}
                      className="pl-10 h-11 bg-gray-800/50 border-gray-700/50 rounded-xl"
                    />
                  </div>
                </div>
                <Button onClick={handleFpSendOtp} disabled={fpLoading || !fpEmail} className="w-full h-11 bg-red-600 hover:bg-red-700 rounded-xl">
                  {fpLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Gửi mã OTP'}
                </Button>
              </div>
            )}

            {fpStep === 2 && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-lg font-bold text-white">Nhập mã OTP</h3>
                  <p className="text-sm text-gray-400 mt-1">Kiểm tra email <span className="text-red-400">{fpEmail}</span></p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-gray-300">Mã OTP (6 số)</Label>
                  <Input
                    type="text" placeholder="123456" maxLength={6}
                    value={fpOtp} onChange={e => setFpOtp(e.target.value)}
                    className="h-12 text-center text-xl tracking-[0.5em] bg-gray-800/50 border-gray-700/50 rounded-xl"
                  />
                </div>
                <Button onClick={() => setFpStep(3)} disabled={fpOtp.length !== 6} className="w-full h-11 bg-red-600 hover:bg-red-700 rounded-xl">
                  Xác nhận mã
                </Button>
                <button onClick={() => setFpStep(1)} className="w-full text-sm text-gray-500 hover:text-gray-300 transition-colors">
                  Gửi lại mã OTP
                </button>
              </div>
            )}

            {fpStep === 3 && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-lg font-bold text-white">Đặt mật khẩu mới</h3>
                  <p className="text-sm text-gray-400 mt-1">Mật khẩu mới phải có ít nhất 6 ký tự</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-gray-300">Mật khẩu mới</Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      type="password" placeholder="••••••••"
                      value={fpNewPass} onChange={e => setFpNewPass(e.target.value)}
                      className="pl-10 h-11 bg-gray-800/50 border-gray-700/50 rounded-xl"
                    />
                  </div>
                </div>
                <Button onClick={handleFpResetPassword} disabled={fpLoading || fpNewPass.length < 6} className="w-full h-11 bg-red-600 hover:bg-red-700 rounded-xl">
                  {fpLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Đặt lại mật khẩu'}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}