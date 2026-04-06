import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Film, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useAuth } from '../contexts/AuthContext';

export default function Auth() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    const form = e.currentTarget;
    const username = (form.elements.namedItem('username') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    try {
      await login({ username, password });
      navigate('/');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Sai tên đăng nhập hoặc mật khẩu';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const username = (form.elements.namedItem('reg-username') as HTMLInputElement).value;
    const fullName = (form.elements.namedItem('reg-fullname') as HTMLInputElement).value;
    const email = (form.elements.namedItem('reg-email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('reg-password') as HTMLInputElement).value;
    const confirm = (form.elements.namedItem('reg-confirm') as HTMLInputElement).value;

    if (password !== confirm) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    setIsLoading(true);
    try {
      await register({ username, fullName, email, password });
      navigate('/');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Đăng ký thất bại. Vui lòng thử lại.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-4">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-950/30 via-[#0a0a0a] to-[#0a0a0a]" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1574267432644-f74afa4de8b8?w=1920')] bg-cover bg-center opacity-5" />
      </div>

      {/* Auth Form */}
      <Card className="relative z-10 w-full max-w-md border-gray-800 bg-gray-900/95 backdrop-blur">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-2 text-red-600">
              <Film className="h-10 w-10" />
              <span className="text-3xl font-bold">CineHub</span>
            </div>
          </div>
          <CardTitle>Chào mừng trở lại</CardTitle>
          <CardDescription>Đăng nhập hoặc tạo tài khoản mới</CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-900/40 border border-red-800 px-4 py-3 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Tabs defaultValue="login" className="w-full" onValueChange={() => setError(null)}>
            <TabsList className="grid w-full grid-cols-2 bg-gray-800">
              <TabsTrigger value="login">Đăng nhập</TabsTrigger>
              <TabsTrigger value="register">Đăng ký</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Tên đăng nhập</Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="username"
                    required
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Mật khẩu</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700"
                  disabled={isLoading}
                >
                  {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </Button>

                <div className="text-center text-sm">
                  <a href="#" className="text-red-600 hover:underline">
                    Quên mật khẩu?
                  </a>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reg-username">Tên đăng nhập</Label>
                  <Input
                    id="reg-username"
                    name="reg-username"
                    type="text"
                    placeholder="username"
                    required
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-fullname">Họ và tên</Label>
                  <Input
                    id="reg-fullname"
                    name="reg-fullname"
                    type="text"
                    placeholder="Nguyễn Văn A"
                    required
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-email">Email</Label>
                  <Input
                    id="reg-email"
                    name="reg-email"
                    type="email"
                    placeholder="your@email.com"
                    required
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-password">Mật khẩu</Label>
                  <Input
                    id="reg-password"
                    name="reg-password"
                    type="password"
                    placeholder="••••••••"
                    required
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-confirm">Xác nhận mật khẩu</Label>
                  <Input
                    id="reg-confirm"
                    name="reg-confirm"
                    type="password"
                    placeholder="••••••••"
                    required
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700"
                  disabled={isLoading}
                >
                  {isLoading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
                </Button>

                <p className="text-xs text-center text-gray-400">
                  Bằng cách đăng ký, bạn đồng ý với{' '}
                  <a href="#" className="text-red-600 hover:underline">
                    Điều khoản dịch vụ
                  </a>{' '}
                  và{' '}
                  <a href="#" className="text-red-600 hover:underline">
                    Chính sách bảo mật
                  </a>
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}