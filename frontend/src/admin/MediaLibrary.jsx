import { useEffect, useRef, useState } from 'react';
import AdminLayout from './AdminLayout';
import { getMedia, uploadMedia, deleteMedia, mediaUrl } from '../api/client';

export default function MediaLibrary() {
  const [media, setMedia] = useState(null);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const fileInput = useRef(null);

  function load() {
    getMedia().then(setMedia).catch(() => setError(true));
  }

  useEffect(load, []);

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const item = await uploadMedia(file);
      setMedia((prev) => [item, ...(prev || [])]);
    } catch {
      setError(true);
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  }

  async function handleDelete(item) {
    if (!confirm('Delete this file? Pages already using it will show a broken image.')) return;
    await deleteMedia(item.id);
    setMedia((prev) => prev.filter((m) => m.id !== item.id));
  }

  function copyUrl(item) {
    navigator.clipboard.writeText(item.url);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between">
        <h1 className="admin-page-title">Media Library</h1>
        <label className="text-sm font-semibold text-white bg-soft-orange hover:bg-[var(--soft-orange-dark)] px-5 py-2.5 rounded-sm cursor-pointer">
          {uploading ? 'Uploading…' : '+ Upload'}
          <input ref={fileInput} type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
        </label>
      </div>

      {error && <p style={{color:"#786c87",fontSize:14,marginTop:24}}>Something went wrong.</p>}
      {!error && !media && <p style={{color:"#786c87",fontSize:14,marginTop:24}}>Loading…</p>}
      {media && media.length === 0 && <p style={{color:"#786c87",fontSize:14,marginTop:24}}>No files uploaded yet.</p>}

      {media && media.length > 0 && (
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {media.map((item) => (
            <div key={item.id} className="border border-ink/10 rounded-sm overflow-hidden bg-white">
              <img src={mediaUrl(item.url)} alt={item.originalName || ''} className="w-full h-28 object-cover" />
              <div className="p-2.5">
                <p className="text-[11px] text-muted truncate" title={item.originalName}>{item.originalName}</p>
                <div className="flex items-center justify-between mt-1.5">
                  <button onClick={() => copyUrl(item)} className="text-[11px] text-teal hover:underline" style={{ color: 'var(--color-teal)' }}>
                    {copiedId === item.id ? 'Copied!' : 'Copy URL'}
                  </button>
                  <button onClick={() => handleDelete(item)} className="text-[11px] text-muted hover:text-red-500">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
