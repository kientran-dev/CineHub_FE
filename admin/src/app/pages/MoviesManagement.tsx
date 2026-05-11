import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { movieService, genreService, type MovieResponse, type MovieRequest, type GenreResponse } from '../services/adminService';
import EpisodeManager from '../components/EpisodeManager';

export default function MoviesManagement() {
  const [movies, setMovies] = useState<MovieResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<MovieResponse | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<MovieRequest>>({});
  const [activeTab, setActiveTab] = useState<'info' | 'episodes'>('info');
  const [genresList, setGenresList] = useState<GenreResponse[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [moviesData, genresData] = await Promise.all([
        movieService.getAllMovies(),
        genreService.getAllGenres()
      ]);
      setMovies(moviesData);
      setGenresList(genresData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredMovies = movies.filter((movie) => {
    const matchesSearch = movie.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || movie.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa phim này?')) return;
    try {
      await movieService.deleteMovie(id);
      setMovies(prev => prev.filter(m => m.id !== id));
      toast.success('Xóa phim thành công!');
    } catch (e) {
      toast.error('Xóa phim thất bại!');
    }
  };

  const handleEdit = (movie: MovieResponse) => {
    setEditingMovie(movie);
    setActiveTab('info');
    setForm({
      title: movie.title,
      englishTitle: movie.englishTitle,
      thumbnail: movie.thumbnail,
      poster: movie.poster,
      director: movie.director,
      releaseYear: movie.releaseYear,
      duration: movie.duration,
      country: movie.country,
      status: movie.status,
      type: movie.type,
      imdbScore: movie.imdbScore,
      trailerUrl: movie.trailerUrl,
      genreIds: movie.genres?.map(g => g.id) || [],
    });
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingMovie(null);
    setActiveTab('info');
    setForm({ type: 'MOVIE', status: 'RELEASED', genreIds: [] });
    setIsModalOpen(true);
  };

  const handleToggleGenre = (genreId: number) => {
    setForm(prev => {
      const current = prev.genreIds || [];
      return {
        ...prev,
        genreIds: current.includes(genreId)
          ? current.filter(id => id !== genreId)
          : [...current, genreId]
      };
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingMovie) {
        const updated = await movieService.updateMovie(editingMovie.id, form as MovieRequest);
        setMovies(prev => prev.map(m => m.id === updated.id ? updated : m));
      } else {
        const created = await movieService.createMovie(form as MovieRequest);
        setMovies(prev => [...prev, created]);
      }
      setIsModalOpen(false);
      toast.success(editingMovie ? 'Cập nhật phim thành công!' : 'Thêm phim mới thành công!');
    } catch (e) {
      toast.error('Lưu phim thất bại!');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-800">Quản lý phim</h1>
          <p className="text-gray-600 mt-1">Quản lý toàn bộ phim trên nền tảng</p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          Thêm phim mới
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên phim..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả loại</option>
            <option value="MOVIE">Phim lẻ</option>
            <option value="SERIES">Phim bộ</option>
            <option value="TV_SHOW">TV Show</option>
          </select>
          <div className="text-gray-600 flex items-center">
            Tổng số: <span className="font-semibold ml-2">{filteredMovies.length} phim</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên phim</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thể loại</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Năm</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời lượng</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IMDb</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMovies.map((movie) => (
                  <tr key={movie.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{movie.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {movie.thumbnail && (
                          <img src={movie.thumbnail} alt={movie.title} className="h-12 w-8 object-cover rounded" />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{movie.title}</div>
                          {movie.englishTitle && <div className="text-xs text-gray-400">{movie.englishTitle}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {movie.genres?.slice(0, 2).map(g => (
                          <span key={g.id} className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">{g.name}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{movie.releaseYear}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{movie.duration ? `${movie.duration} phút` : '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {movie.imdbScore ? (
                        <span className="flex items-center gap-1 text-sm"><span className="text-yellow-500">★</span>{movie.imdbScore}</span>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${movie.type === 'SERIES' ? 'bg-purple-100 text-purple-700' : movie.type === 'TV_SHOW' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                        {movie.type === 'SERIES' ? 'Phim bộ' : movie.type === 'TV_SHOW' ? 'TV Show' : 'Phim lẻ'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {(() => {
                        const statusMap: Record<string, { label: string; color: string }> = {
                          RELEASED: { label: 'Đã phát hành', color: 'bg-green-100 text-green-700' },
                          ONGOING:  { label: 'Đang chiếu',   color: 'bg-blue-100 text-blue-700' },
                          UPCOMING: { label: 'Sắp chiếu',    color: 'bg-yellow-100 text-yellow-700' },
                        };
                        const s = statusMap[movie.status] ?? { label: movie.status, color: 'bg-gray-100 text-gray-700' };
                        return <span className={`px-2 py-1 rounded-full text-xs font-medium ${s.color}`}>{s.label}</span>;
                      })()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEdit(movie)} className="text-green-600 hover:text-green-800 p-1">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => handleDelete(movie.id)} className="text-red-600 hover:text-red-800 p-1">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {filteredMovies.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500">Không tìm thấy phim nào</div>
      )}

      {/* Modal Thêm/Sửa */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
            <div className="flex items-center justify-between mb-4 border-b pb-2 pr-8">
              <h2 className="text-xl font-semibold">
                {editingMovie ? 'Chỉnh sửa phim' : 'Thêm phim mới'}
              </h2>
              {editingMovie && (
                <div className="flex gap-2">
                  <button onClick={() => setActiveTab('info')} className={`px-3 py-1.5 text-sm rounded ${activeTab === 'info' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}>Thông tin chung</button>
                  <button onClick={() => setActiveTab('episodes')} className={`px-3 py-1.5 text-sm rounded ${activeTab === 'episodes' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}>Quản lý tập & Video</button>
                </div>
              )}
            </div>

            {activeTab === 'info' ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên phim *</label>
                  <input required value={form.title || ''} onChange={e => setForm(p => ({...p, title: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên tiếng Anh</label>
                  <input value={form.englishTitle || ''} onChange={e => setForm(p => ({...p, englishTitle: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL Thumbnail</label>
                <input value={form.thumbnail || ''} onChange={e => setForm(p => ({...p, thumbnail: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL Poster</label>
                <input value={form.poster || ''} onChange={e => setForm(p => ({...p, poster: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL Trailer (YouTube)</label>
                <input value={form.trailerUrl || ''} onChange={e => setForm(p => ({...p, trailerUrl: e.target.value}))}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Đạo diễn</label>
                  <input value={form.director || ''} onChange={e => setForm(p => ({...p, director: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quốc gia</label>
                  <select value={form.country || ''} onChange={e => setForm(p => ({...p, country: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Chọn quốc gia</option>
                    <option value="Mỹ">Mỹ</option>
                    <option value="Hàn Quốc">Hàn Quốc</option>
                    <option value="Trung Quốc">Trung Quốc</option>
                    <option value="Nhật Bản">Nhật Bản</option>
                    <option value="Việt Nam">Việt Nam</option>
                    <option value="Thái Lan">Thái Lan</option>
                    <option value="Anh">Anh</option>
                    <option value="Pháp">Pháp</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Năm phát hành</label>
                  <input type="number" value={form.releaseYear || ''} onChange={e => setForm(p => ({...p, releaseYear: Number(e.target.value)}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loại phim</label>
                  <select value={form.type || 'MOVIE'} onChange={e => setForm(p => ({...p, type: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="MOVIE">Phim lẻ</option>
                    <option value="SERIES">Phim bộ</option>
                    <option value="TV_SHOW">TV Show</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                  <select value={form.status || 'RELEASED'} onChange={e => setForm(p => ({...p, status: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="RELEASED">Đã phát hành</option>
                    <option value="ONGOING">Đang chiếu</option>
                    <option value="UPCOMING">Sắp chiếu</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thời lượng (phút)</label>
                  <input type="number" min="1" value={form.duration || ''} onChange={e => setForm(p => ({...p, duration: Number(e.target.value)}))}
                    placeholder="Ví dụ: 120"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">IMDb Score</label>
                  <input type="number" step="0.1" min="0" max="10" value={form.imdbScore || ''} onChange={e => setForm(p => ({...p, imdbScore: parseFloat(e.target.value)}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Thể loại phim</label>
                <div className="flex flex-wrap gap-2">
                  {genresList.map(genre => {
                    const isSelected = (form.genreIds || []).includes(genre.id);
                    return (
                      <button
                        key={genre.id}
                        type="button"
                        onClick={() => handleToggleGenre(genre.id)}
                        className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                          isSelected 
                            ? 'bg-blue-600 text-white border-blue-600' 
                            : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                        }`}
                      >
                        {genre.name}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                  Hủy
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  {editingMovie ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
            ) : editingMovie ? (
              <div>
                <EpisodeManager movieId={editingMovie.id} movieType={editingMovie.type || 'MOVIE'} />
                <div className="flex justify-end pt-4 border-t mt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Đóng</button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
