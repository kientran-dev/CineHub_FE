import { useState } from 'react';
import { Users, Film, TrendingUp, DollarSign, Plus, Edit, Trash2, Eye } from 'lucide-react';
import Header from '../components/Header';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import { movies, allUsers, categories, subscriptionPlans } from '../data/mockData';

export default function AdminDashboard() {
  const [isAddMovieOpen, setIsAddMovieOpen] = useState(false);

  const stats = [
    {
      title: 'Tổng người dùng',
      value: allUsers.length.toString(),
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Tổng phim',
      value: movies.length.toString(),
      icon: Film,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Lượt xem tháng này',
      value: '12,543',
      icon: TrendingUp,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Doanh thu tháng này',
      value: '125,000,000đ',
      icon: DollarSign,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Quản trị hệ thống</h1>
          <p className="text-gray-400">Tổng quan và quản lý hệ thống CineHub</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="border-gray-800 bg-gray-900">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">{stat.title}</p>
                      <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="movies" className="space-y-4">
          <TabsList className="bg-gray-900">
            <TabsTrigger value="movies">Quản lý phim</TabsTrigger>
            <TabsTrigger value="users">Quản lý người dùng</TabsTrigger>
            <TabsTrigger value="categories">Thể loại</TabsTrigger>
            <TabsTrigger value="plans">Gói dịch vụ</TabsTrigger>
          </TabsList>

          {/* Movies Management */}
          <TabsContent value="movies" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Danh sách phim</h2>
              <Dialog open={isAddMovieOpen} onOpenChange={setIsAddMovieOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-red-600 hover:bg-red-700 gap-2">
                    <Plus className="h-4 w-4" />
                    Thêm phim mới
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-900 border-gray-800 max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Thêm phim mới</DialogTitle>
                    <DialogDescription>Điền thông tin phim mới vào form bên dưới</DialogDescription>
                  </DialogHeader>
                  <form className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Tên phim</Label>
                      <Input id="title" className="bg-gray-800 border-gray-700" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Mô tả</Label>
                      <Textarea id="description" className="bg-gray-800 border-gray-700" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="year">Năm</Label>
                        <Input id="year" type="number" className="bg-gray-800 border-gray-700" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="duration">Thời lượng (phút)</Label>
                        <Input id="duration" type="number" className="bg-gray-800 border-gray-700" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Loại phim</Label>
                      <Select>
                        <SelectTrigger className="bg-gray-800 border-gray-700">
                          <SelectValue placeholder="Chọn loại phim" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="movie">Phim lẻ</SelectItem>
                          <SelectItem value="series">Phim bộ</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-3">
                      <Button type="submit" className="bg-red-600 hover:bg-red-700">
                        Thêm phim
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setIsAddMovieOpen(false)}>
                        Hủy
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card className="border-gray-800 bg-gray-900">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-800 hover:bg-gray-800">
                      <TableHead>Phim</TableHead>
                      <TableHead>Loại</TableHead>
                      <TableHead>Năm</TableHead>
                      <TableHead>Đánh giá</TableHead>
                      <TableHead>Premium</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movies.map((movie) => (
                      <TableRow key={movie.id} className="border-gray-800 hover:bg-gray-800">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img
                              src={movie.poster}
                              alt={movie.title}
                              className="h-12 w-8 object-cover rounded"
                            />
                            <span className="font-medium">{movie.title}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {movie.type === 'movie' ? 'Phim lẻ' : 'Phim bộ'}
                          </Badge>
                        </TableCell>
                        <TableCell>{movie.year}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            ⭐ {movie.rating.toFixed(1)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {movie.isPremium ? (
                            <Badge className="bg-yellow-600">Premium</Badge>
                          ) : (
                            <Badge variant="outline">Miễn phí</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-red-500">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Management */}
          <TabsContent value="users" className="space-y-4">
            <h2 className="text-xl font-semibold">Danh sách người dùng</h2>
            <Card className="border-gray-800 bg-gray-900">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-800 hover:bg-gray-800">
                      <TableHead>Người dùng</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Gói dịch vụ</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allUsers.map((user) => (
                      <TableRow key={user.id} className="border-gray-800 hover:bg-gray-800">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{user.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          {user.isPremium ? (
                            <Badge className="bg-yellow-600">
                              {user.subscriptionPlan === 'monthly' ? 'Tháng' : 'Năm'}
                            </Badge>
                          ) : (
                            <Badge variant="outline">Miễn phí</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-green-600">Hoạt động</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-red-500">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Categories Management */}
          <TabsContent value="categories" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Danh sách thể loại</h2>
              <Button className="bg-red-600 hover:bg-red-700 gap-2">
                <Plus className="h-4 w-4" />
                Thêm thể loại
              </Button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <Card key={category.id} className="border-gray-800 bg-gray-900">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{category.name}</h3>
                        <p className="text-sm text-gray-400">{category.slug}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Subscription Plans Management */}
          <TabsContent value="plans" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Gói dịch vụ</h2>
              <Button className="bg-red-600 hover:bg-red-700 gap-2">
                <Plus className="h-4 w-4" />
                Thêm gói mới
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {subscriptionPlans.map((plan) => (
                <Card key={plan.id} className="border-gray-800 bg-gray-900">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{plan.name}</CardTitle>
                        <CardDescription>
                          {plan.duration === 'monthly' ? 'Hàng tháng' : 'Hàng năm'}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-3xl font-bold">
                        {plan.price.toLocaleString('vi-VN')}đ
                      </p>
                    </div>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <span className="text-green-500">✓</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}