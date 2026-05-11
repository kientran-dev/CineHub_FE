import { useState, useEffect, useRef } from 'react';
import { Search, Plus, Edit, Trash2, Film, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { genreService, type GenreResponse } from '../services/adminService';

export default function GenresManagement() {
  const [genres, setGenres] = useState<GenreResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGenre, setEditingGenre] = useState<GenreResponse | null>(null);
  const [saving, setSaving] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  const fetchGenres = () => {
    setLoading(true);
    genreService.getAllGenres()
      .then(setGenres)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchGenres(); }, []);

  const filteredGenres = genres.filter((g) =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa thể loại này?')) return;
    try {
      await genreService.deleteGenre(id);
      setGenres(prev => prev.filter(g => g.id !== id));
      toast.success('Xóa thể loại thành công!');
    } catch {
      toast.error('Xóa thể loại thất bại!');
    }
  };

  const handleEdit = (genre: GenreResponse) => {
    setEditingGenre(genre);
    setIsModalOpen(true);
    setTimeout(() => {
      if (nameRef.current) nameRef.current.value = genre.name;
    }, 0);
  };

  const handleAddNew = () => {
    setEditingGenre(null);
    setIsModalOpen(true);
    setTimeout(() => {
      if (nameRef.current) nameRef.current.value = '';
    }, 0);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = nameRef.current?.value?.trim();
    if (!name) return;
    setSaving(true);
    try {
      if (editingGenre) {
        const updated = await genreService.updateGenre(editingGenre.id, { name });
        setGenres(prev => prev.map(g => g.id === updated.id ? updated : g));
      } else {
        const created = await genreService.createGenre({ name });
        setGenres(prev => [...prev, created]);
      }
      setIsModalOpen(false);
      toast.success(editingGenre ? 'Cập nhật thể loại thành công!' : 'Thêm thể loại mới thành công!');
    } catch {
      toast.error('Lưu thể loại thất bại!');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-800">Quản lý thể loại</h1>
          <p className="text-gray-600 mt-1">Quản lý các thể loại phim</p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          Thêm thể loại
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Tìm kiếm thể loại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="text-gray-600 flex items-center">
            Tổng số: <span className="font-semibold ml-2">{filteredGenres.length} thể loại</span>
          </div>
        </div>
      </div>

      {/* Grid Cards */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGenres.map((genre) => (
            <div key={genre.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <Film className="text-blue-600" size={24} />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(genre)} className="text-green-600 hover:text-green-800 p-1">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => handleDelete(genre.id)} className="text-red-600 hover:text-red-800 p-1">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-800">{genre.name}</h3>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">ID: {genre.id}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredGenres.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500">Không tìm thấy thể loại nào</div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingGenre ? 'Chỉnh sửa thể loại' : 'Thêm thể loại mới'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên thể loại *</label>
                <input
                  ref={nameRef}
                  required
                  type="text"
                  defaultValue={editingGenre?.name}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập tên thể loại"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  {editingGenre ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
