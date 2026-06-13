import { useState } from 'react';
import { useApp } from '../../store/AppContext';
import { usePhotos } from '../../hooks/usePhotos';
import type { Photo } from '../../types';
import { PhotoModal } from './PhotoModal';
import { EmptyState } from '../common/EmptyState';

export function PhotoTab() {
  const { state } = useApp();
  const { photos, addPhoto, deletePhoto } = usePhotos(state.activeFieldId);
  const [showAdd, setShowAdd] = useState(false);
  const [viewPhoto, setViewPhoto] = useState<Photo | null>(null);

  const fieldCrops = state.crops.filter((c) => c.fieldId === state.activeFieldId);
  const getCropName = (cropId?: string) => fieldCrops.find((c) => c.id === cropId)?.name ?? '';

  const handleDelete = async (id: string) => {
    if (!window.confirm('この写真を削除しますか？')) return;
    await deletePhoto(id);
    if (viewPhoto?.id === id) setViewPhoto(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-base font-semibold" style={{ color: 'var(--c-text)' }}>
          写真
          <span className="ml-2 text-xs font-normal" style={{ color: 'var(--c-muted)' }}>{photos.length}件</span>
        </h1>
        <button onClick={() => setShowAdd(true)} className="text-xs font-medium px-3 py-1.5 rounded-md text-white"
          style={{ background: 'var(--c-accent)' }}>
          ＋ 追加
        </button>
      </div>

      {photos.length === 0 ? (
        <EmptyState icon="📷" message="写真がありません" />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {photos.map((photo) => (
            <div key={photo.id}
              className="rounded-xl overflow-hidden cursor-pointer transition-transform hover:scale-[1.02]"
              style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}
              onClick={() => setViewPhoto(photo)}
            >
              <img src={photo.dataUrl} alt={photo.notes || photo.date} className="w-full h-36 object-cover" />
              <div className="px-3 py-2">
                <div className="text-xs" style={{ color: 'var(--c-muted)' }}>{photo.date}</div>
                {photo.cropId && (
                  <div className="text-xs truncate mt-0.5" style={{ color: 'var(--c-accent)' }}>
                    {getCropName(photo.cropId)}
                  </div>
                )}
                {photo.notes && (
                  <div className="text-xs truncate" style={{ color: 'var(--c-text)' }}>{photo.notes}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full-size viewer */}
      {viewPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.85)' }}
          onClick={() => setViewPhoto(null)}>
          <div className="w-full max-w-lg rounded-xl overflow-hidden"
            style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}
            onClick={(e) => e.stopPropagation()}>
            <img src={viewPhoto.dataUrl} alt="" className="w-full max-h-72 object-contain" />
            <div className="px-5 py-4">
              <div className="text-xs mb-1" style={{ color: 'var(--c-muted)' }}>{viewPhoto.date}</div>
              {viewPhoto.cropId && (
                <div className="text-xs mb-1" style={{ color: 'var(--c-accent)' }}>{getCropName(viewPhoto.cropId)}</div>
              )}
              {viewPhoto.notes && (
                <div className="text-sm whitespace-pre-wrap" style={{ color: 'var(--c-text)' }}>{viewPhoto.notes}</div>
              )}
              <div className="flex gap-2 mt-4">
                <button onClick={() => handleDelete(viewPhoto.id)} className="rounded-md px-4 py-1.5 text-sm font-medium"
                  style={{ color: 'var(--c-danger)', background: 'var(--c-hover)' }}>削除</button>
                <button onClick={() => setViewPhoto(null)} className="rounded-md px-4 py-1.5 text-sm"
                  style={{ background: 'var(--c-hover)', color: 'var(--c-muted)' }}>閉じる</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAdd && <PhotoModal fieldId={state.activeFieldId} onAdd={addPhoto} onClose={() => setShowAdd(false)} />}
    </div>
  );
}
