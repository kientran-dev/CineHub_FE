import { useState, useEffect } from 'react';
import { Loader2, Plus, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { episodeService, episodeVersionService, type EpisodeResponse } from '../services/adminService';

interface EpisodeManagerProps {
  movieId: number;
  movieType: string; // 'MOVIE', 'SERIES', 'TV_SHOW'
}

/**
 * Parse bulk text format:
 *   - Phim lẻ: "Full|https://....m3u8"
 *   - Phim bộ:
 *       "1|https://....m3u8"
 *       "2|https://....m3u8"
 * Returns array of { episodeNumber, episodeName, videoUrl }
 */
function parseBulkInput(text: string, isSingle: boolean): { episodeNumber: number; episodeName: string; videoUrl: string }[] {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const results: { episodeNumber: number; episodeName: string; videoUrl: string }[] = [];

  for (const line of lines) {
    const pipeIndex = line.indexOf('|');
    if (pipeIndex === -1) {
      // Không có "|" → coi toàn bộ dòng là URL
      if (line.startsWith('http')) {
        results.push({
          episodeNumber: isSingle ? 1 : results.length + 1,
          episodeName: isSingle ? 'Full' : `Tập ${results.length + 1}`,
          videoUrl: line
        });
      }
      continue;
    }

    const prefix = line.substring(0, pipeIndex).trim();
    const url = line.substring(pipeIndex + 1).trim();

    if (!url.startsWith('http')) continue;

    if (prefix.toLowerCase() === 'full') {
      results.push({ episodeNumber: 1, episodeName: 'Full', videoUrl: url });
    } else {
      const epNum = parseInt(prefix);
      if (!isNaN(epNum)) {
        results.push({ episodeNumber: epNum, episodeName: `Tập ${epNum}`, videoUrl: url });
      }
    }
  }

  return results;
}

export default function EpisodeManager({ movieId, movieType }: EpisodeManagerProps) {
  const [episodes, setEpisodes] = useState<EpisodeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Mode: 'single' = thêm 1 cái, 'bulk' = nhập hàng loạt
  const [mode, setMode] = useState<'single' | 'bulk'>('single');
  const [bulkText, setBulkText] = useState('');
  const [bulkProgress, setBulkProgress] = useState<{ done: number; total: number } | null>(null);

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

  // ── Thêm đơn lẻ ─────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.videoUrl) { toast.warning('Vui lòng nhập Link Video'); return; }
    if (!form.serverName) { toast.warning('Vui lòng chọn Phiên bản (Vietsub, Thuyết minh...)'); return; }
    
    setSaving(true);
    try {
      const epNum = form.episodeNumber || 1;
      const epName = form.episodeName || 'Full';

      // Parse videoUrl: strip prefix nếu có (e.g. "Full|https://..." → "https://...")
      let videoUrl = form.videoUrl;
      const pipeIdx = videoUrl.indexOf('|');
      if (pipeIdx !== -1 && videoUrl.substring(pipeIdx + 1).startsWith('http')) {
        videoUrl = videoUrl.substring(pipeIdx + 1).trim();
      }

      let targetEpisodeId: number | null = null;
      const existingEp = episodes.find(ep => ep.episodeNumber === epNum);
      
      if (existingEp) {
        targetEpisodeId = existingEp.id;
      } else {
        const newEp = await episodeService.createEpisode({
          movieId,
          episodeNumber: epNum,
          episodeName: epName
        });
        targetEpisodeId = newEp.id;
      }

      await episodeVersionService.createVersion({
        episodeId: targetEpisodeId,
        videoUrl,
        type: form.serverName
      });

      fetchEpisodes();
      setForm(prev => ({
        ...prev,
        serverName: prev.serverName, // Giữ lại phiên bản đã chọn
        videoUrl: '',
        episodeNumber: !isSingle && prev.episodeNumber ? prev.episodeNumber + 1 : prev.episodeNumber,
        episodeName: !isSingle && prev.episodeNumber ? `Tập ${prev.episodeNumber + 1}` : prev.episodeName
      }));
      toast.success('Thêm video thành công!');
    } catch (e) {
      toast.error('Thêm video thất bại. Vui lòng kiểm tra lại');
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  // ── Nhập hàng loạt ──────────────────────────────────────────────────────
  const handleBulkImport = async () => {
    if (!form.serverName) { toast.warning('Vui lòng chọn Phiên bản trước khi nhập hàng loạt'); return; }
    
    const parsed = parseBulkInput(bulkText, isSingle);
    if (parsed.length === 0) { toast.error('Không tìm thấy link video hợp lệ.\nĐịnh dạng: số_tập|link_video (mỗi dòng 1 tập)'); return; }

    const confirmMsg = isSingle
      ? `Xác nhận nhập 1 video?`
      : `Xác nhận nhập ${parsed.length} tập phim?\n(Tập ${parsed[0].episodeNumber} → ${parsed[parsed.length - 1].episodeNumber})`;
    if (!confirm(confirmMsg)) return;

    setSaving(true);
    setBulkProgress({ done: 0, total: parsed.length });

    try {
      // Refresh episodes list to get current state
      const currentEpisodes = await episodeService.getEpisodesByMovie(movieId);

      for (let i = 0; i < parsed.length; i++) {
        const item = parsed[i];
        
        // Check if episode exists
        let targetEpisodeId: number | null = null;
        const existingEp = currentEpisodes.find(ep => ep.episodeNumber === item.episodeNumber);
        
        if (existingEp) {
          targetEpisodeId = existingEp.id;
        } else {
          const newEp = await episodeService.createEpisode({
            movieId,
            episodeNumber: item.episodeNumber,
            episodeName: item.episodeName
          });
          targetEpisodeId = newEp.id;
          currentEpisodes.push(newEp); // update local list to avoid creating duplicates
        }

        await episodeVersionService.createVersion({
          episodeId: targetEpisodeId,
          videoUrl: item.videoUrl,
          type: form.serverName
        });

        setBulkProgress({ done: i + 1, total: parsed.length });
      }

      fetchEpisodes();
      setBulkText('');
      setBulkProgress(null);
      toast.success(`✅ Đã nhập thành công ${parsed.length} video!`);
    } catch (e) {
      toast.error('Có lỗi xảy ra khi nhập hàng loạt. Vui lòng kiểm tra lại.');
      console.error(e);
      fetchEpisodes();
    } finally {
      setSaving(false);
      setBulkProgress(null);
    }
  };

  const handleDeleteVersion = async (versionId: number) => {
    if (!confirm('Bạn có chắc muốn xóa video này?')) return;
    try {
      await episodeVersionService.deleteVersion(versionId);
      setEpisodes(prev => prev.map(ep => ({
        ...ep,
        episodeVersions: ep.episodeVersions?.filter(v => v.id !== versionId)
      })));
      toast.success('Xóa video thành công!');
    } catch (e) {
      toast.error('Xóa video thất bại');
    }
  };

  // Preview bulk input
  const bulkParsed = mode === 'bulk' ? parseBulkInput(bulkText, isSingle) : [];

  // Flatten videos list for display
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
        {/* Header with mode toggle */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-md font-medium text-gray-800">
            {isSingle ? 'Thêm Link Video' : 'Thêm Tập Phim'}
          </h3>
          <div className="flex gap-1 bg-gray-200 rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => setMode('single')}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                mode === 'single' ? 'bg-white text-blue-700 shadow-sm font-medium' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Thêm đơn lẻ
            </button>
            <button
              type="button"
              onClick={() => setMode('bulk')}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                mode === 'bulk' ? 'bg-white text-blue-700 shadow-sm font-medium' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <span className="flex items-center gap-1">
                <Upload size={12} />
                Nhập hàng loạt
              </span>
            </button>
          </div>
        </div>

        {/* Phiên bản selector — shared between both modes */}
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Phiên bản</label>
          <select required value={form.serverName || ''} onChange={e => setForm(p => ({...p, serverName: e.target.value}))}
            className="w-full max-w-xs px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500">
            <option value="">-- Chọn phiên bản --</option>
            <option value="Vietsub">Vietsub</option>
            <option value="Thuyết minh">Thuyết minh</option>
            <option value="Lồng tiếng">Lồng tiếng</option>
          </select>
        </div>

        {/* ── Mode: Thêm đơn lẻ ─────────────────────────────────── */}
        {mode === 'single' && (
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
              <div className="flex flex-col justify-end col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1 truncate" title="Link Video (.m3u8, .mp4)">Link Video (.m3u8, .mp4)</label>
                <input required value={form.videoUrl || ''} onChange={e => setForm(p => ({...p, videoUrl: e.target.value}))}
                  placeholder="VD: Full|https://... hoặc https://..."
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" />
                <p className="text-xs text-gray-400 mt-1">Hỗ trợ: paste trực tiếp dạng Full|url hoặc chỉ url</p>
              </div>
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={saving} className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                Thêm Video
              </button>
            </div>
          </form>
        )}

        {/* ── Mode: Nhập hàng loạt ─────────────────────────────── */}
        {mode === 'bulk' && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dán danh sách link video (mỗi dòng 1 tập)
              </label>
              <textarea
                rows={8}
                value={bulkText}
                onChange={e => setBulkText(e.target.value)}
                placeholder={isSingle
                  ? 'Full|https://vip.opstream11.com/.../index.m3u8'
                  : '1|https://vip.opstream12.com/.../index.m3u8\n2|https://vip.opstream12.com/.../index.m3u8\n3|https://vip.opstream12.com/.../index.m3u8\n...'
                }
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono resize-y"
              />
              <p className="text-xs text-gray-400 mt-1">
                Định dạng: <code className="bg-gray-200 px-1 rounded">số_tập|link_video</code> — 
                VD: <code className="bg-gray-200 px-1 rounded">1|https://...m3u8</code> hoặc <code className="bg-gray-200 px-1 rounded">Full|https://...m3u8</code>
              </p>
            </div>

            {/* Preview */}
            {bulkParsed.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Xem trước: <span className="text-blue-600">{bulkParsed.length} video</span> sẽ được tạo
                </p>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {bulkParsed.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded font-medium min-w-[50px] text-center">
                        {item.episodeName}
                      </span>
                      <span className="text-gray-500 truncate">{item.videoUrl}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Progress */}
            {bulkProgress && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Loader2 size={14} className="animate-spin text-blue-600" />
                  <span className="text-sm text-blue-700 font-medium">
                    Đang nhập... {bulkProgress.done}/{bulkProgress.total}
                  </span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-1.5">
                  <div
                    className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${(bulkProgress.done / bulkProgress.total) * 100}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleBulkImport}
                disabled={saving || bulkParsed.length === 0}
                className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                Nhập {bulkParsed.length > 0 ? `${bulkParsed.length} video` : 'hàng loạt'}
              </button>
            </div>
          </div>
        )}
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
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {!isSingle && <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tập</th>}
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Phiên bản</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Link Video</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase w-20">Thao tác</th>
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
                      <a href={video.videoUrl} target="_blank" rel="noreferrer" className="hover:underline break-all">{video.videoUrl}</a>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-right text-sm w-20">
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
