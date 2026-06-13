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
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base font-semibold text-[#e2e8f0]">写真 ({photos.length})</h2>
        <button
          onClick={() => setShowAdd(true)}
          className="text-sm bg-[#63b3ed] hover:bg-[#4299e1] text-white px-3 py-1.5 rounded-lg"
        >
          ＋ 写真を追加
        </button>
      </div>

      {photos.length === 0 ? (
        <EmptyState icon="📷" message="写真がありません" />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="bg-[#16213e] border border-[#2d3748] rounded-xl overflow-hidden cursor-pointer hover:border-[#63b3ed] transition-colors"
              onClick={() => setViewPhoto(photo)}
            >
              <img
                src={photo.dataUrl}
                alt={photo.notes || photo.date}
                className="w-full h-32 object-cover"
              />
              <div className="p-2">
                <div className="text-xs text-[#a0aec0]">{photo.date}</div>
                {photo.cropId && (
                  <div className="text-xs text-[#68d391] truncate">{getCropName(photo.cropId)}</div>
                )}
                {photo.notes && (
                  <div className="text-xs text-[#e2e8f0] truncate mt-0.5">{photo.notes}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full-size view */}
      {viewPhoto && (
        <div
          className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-50 p-4"
          onClick={() => setViewPhoto(null)}
        >
          <div
            className="bg-[#16213e] border border-[#2d3748] rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={viewPhoto.dataUrl}
              alt={viewPhoto.notes}
              className="w-full rounded-t-xl object-contain max-h-64"
            />
            <div className="p-4 space-y-1">
              <div className="text-xs text-[#a0aec0]">{viewPhoto.date}</div>
              {viewPhoto.cropId && (
                <div className="text-xs text-[#68d391]">{getCropName(viewPhoto.cropId)}</div>
              )}
              {viewPhoto.notes && (
                <div className="text-sm text-[#e2e8f0] whitespace-pre-wrap">{viewPhoto.notes}</div>
              )}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => handleDelete(viewPhoto.id)}
                  className="bg-[#fc8181] hover:bg-[#f56565] text-white rounded-lg px-4 py-1.5 text-sm"
                >
                  削除
                </button>
                <button
                  onClick={() => setViewPhoto(null)}
                  className="bg-[#2d3748] hover:bg-[#4a5568] text-[#a0aec0] rounded-lg px-4 py-1.5 text-sm"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAdd && (
        <PhotoModal
          fieldId={state.activeFieldId}
          onAdd={addPhoto}
          onClose={() => setShowAdd(false)}
        />
      )}
    </div>
  );
}
