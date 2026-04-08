import { useState, useEffect } from 'react';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { episodeService, episodeVersionService, type EpisodeResponse } from '../services/adminService';

interface EpisodeManagerProps {
  movieId: number;
  movieType: string; // 'MOVIE', 'SERIES', 'TV_SHOW'
}

export default function EpisodeManager({ movieId, movieType }: EpisodeManagerProps) {
  const [episodes, setEpisodes] = useState<EpisodeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const isSingle = movieType === 'MOVIE';
  const [form, setForm] = useState({
    episodeNumber: isSingle ? 1 : (undefined as number | undefined),
    episodeName: isSingle ? 'Full' : '',
    serverName: '',
    videoUrl: ''
  });

  const fetchEpisodes = () => {
    setLoading(true);
    episodeService.getEpisodesByMovie(movieId)
      .then(setEpisodes)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEpisodes();
  }, [movieId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.videoUrl) return alert('Vui lòng nhập Link Video');
    if (!form.serverName) return alert('Vui lòng nhập Tên Server (Vietsub, Thuyết minh...)');
    
    setSaving(true);
    try {
      const epNum = form.episodeNumber || 1;
      const epName = form.episodeName || 'Full';

      // 1. Check if the episode already exists
      let targetEpisodeId: number | null = null;
      const existingEp = episodes.find(ep => ep.episodeNumber === epNum);
      
      if (existingEp) {
        targetEpisodeId = existingEp.id;
      } else {
        // 2. If episode doesn't exist, create it first
        const newEp = await episodeService.createEpisode({
          movieId,
          episodeNumber: epNum,
          episodeName: epName
        });
        targetEpisodeId = newEp.id;
      }

      // 3. Create the video version for this episode
      await episodeVersionService.createVersion({
        episodeId: targetEpisodeId,
        videoUrl: form.videoUrl,
        type: form.serverName // Here we map the literal 'serverName' to the backend's 'type' field
      });

      // Reload
      fetchEpisodes();

      // Reset form but creatively keep the next episode number
      setForm(prev => ({
        ...prev,
        serverName: '',
        videoUrl: '',
        episodeNumber: !isSingle && prev.episodeNumber ? prev.episodeNumber + 1 : prev.episodeNumber,
        episodeName: !isSingle && prev.episodeNumber ? `Tập ${prev.episodeNumber + 1}` : prev.episodeName
      }));
    } catch (e) {
      alert('Thêm video thất bại. Vui lòng kiểm tra lại');
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteVersion = async (versionId: number) => {
    if (!confirm('Bạn có chắc muốn xóa video này?')) return;
    try {
      await episodeVersionService.deleteVersion(versionId);
      // Giảm tải API: Tự cập nhật lại danh sách bằng cách lọc bỏ version vừa xóa
      setEpisodes(prev => prev.map(ep => ({
        ...ep,
        episodeVersions: ep.episodeVersions?.filter(v => v.id !== versionId)
      })));
    } catch (e) {
      alert('Xóa thất bại');
    }
  };

  // Làm phẳng danh sách Versions để hiển thị trong 1 bảng duy nhất
  const flattenedVideos = episodes.flatMap(ep => {
    const versions = ep.episodeVersions || [];
    return versions.map(v => ({
      ...v,
      episodeId: ep.id,
      episodeNumber: ep.episodeNumber,
      episodeName: ep.episodeName
    }));
  }).sort((a, b) => a.episodeNumber - b.episodeNumber);

  return (
    <div className="space-y-6">
      {/* Form thêm mới */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="text-md font-medium text-gray-800 mb-3">
          {isSingle ? 'Thêm Link Video Mới' : 'Thêm Tập Phim Mới'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {!isSingle && (
              <>
                <div className="flex flex-col justify-end">
                  <label className="block text-sm font-medium text-gray-700 mb-1 truncate">Số Tập</label>
                  <input type="number" required min="1" value={form.episodeNumber || ''} onChange={e => setForm(p => ({...p, episodeNumber: Number(e.target.value)}))}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <div className="flex flex-col justify-end">
                  <label className="block text-sm font-medium text-gray-700 mb-1 truncate">Tên Tập (VD: Tập 1)</label>
                  <input required value={form.episodeName || ''} onChange={e => setForm(p => ({...p, episodeName: e.target.value}))}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
              </>
            )}
            <div className="flex flex-col justify-end">
              <label className="block text-sm font-medium text-gray-700 mb-1 truncate" title="Tên Server (Loại: Vietsub/Thuyết minh...)">Tên Server (Loại: Vietsub/Thuyết minh...)</label>
              <input required value={form.serverName || ''} onChange={e => setForm(p => ({...p, serverName: e.target.value}))}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            <div className="flex flex-col justify-end">
              <label className="block text-sm font-medium text-gray-700 mb-1 truncate" title="Link Video (.m3u8, .mp4)">Link Video (.m3u8, .mp4)</label>
              <input required value={form.videoUrl || ''} onChange={e => setForm(p => ({...p, videoUrl: e.target.value}))}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              Thêm Video
            </button>
          </div>
        </form>
      </div>

      {/* Danh sách đã có */}
      <div>
        <h3 className="text-md font-medium text-gray-800 mb-3">Danh sách Video / Tập phim đã tải lên</h3>
        {loading ? (
          <div className="flex justify-center py-4"><Loader2 className="animate-spin text-blue-500" /></div>
        ) : flattenedVideos.length === 0 ? (
          <div className="text-center py-4 text-gray-500 text-sm bg-gray-50 rounded border border-dashed border-gray-300">
            Chưa có video nào. Hãy thêm video ở trên.
          </div>
        ) : (
          <div className="overflow-hidden border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {!isSingle && <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tập</th>}
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Server/Loại</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Link Video</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {flattenedVideos.map(video => (
                  <tr key={video.id} className="hover:bg-gray-50">
                    {!isSingle && <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 font-medium">{video.episodeName}</td>}
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                      <span className="px-2 py-0.5 bg-gray-200 text-gray-800 rounded text-xs">{video.type || 'Mặc định'}</span>
                    </td>
                    <td className="px-4 py-2 text-sm text-blue-600 truncate max-w-[200px]" title={video.videoUrl}>
                      <a href={video.videoUrl} target="_blank" rel="noreferrer" className="hover:underline">{video.videoUrl}</a>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-right text-sm">
                      <button onClick={() => handleDeleteVersion(video.id)} className="text-red-500 hover:text-red-700 p-1">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
