import { useState } from 'react';
import { useApp } from '../../store/AppContext';
import type { Crop } from '../../types';
import { CropModal } from './CropModal';
import { EmptyState } from '../common/EmptyState';
import { STATUS_LABELS } from '../../utils/constants';

export function CropList() {
  const { state } = useApp();
  const [editCrop, setEditCrop] = useState<Crop | null | 'new'>(null);

  const fieldCrops = state.crops.filter((c) => c.fieldId === state.activeFieldId);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base font-semibold text-[#e2e8f0]">作物 ({fieldCrops.length})</h2>
        <button
          onClick={() => setEditCrop('new')}
          className="text-sm bg-[#63b3ed] hover:bg-[#4299e1] text-white px-3 py-1.5 rounded-lg"
        >
          ＋ 作物を追加
        </button>
      </div>

      {fieldCrops.length === 0 ? (
        <EmptyState icon="🥬" message="作物が登録されていません" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {fieldCrops.map((crop) => {
            const statusStyle = STATUS_LABELS[crop.status];
            return (
              <div
                key={crop.id}
                className="bg-[#16213e] border border-[#2d3748] rounded-xl p-4"
                style={{ borderLeftColor: crop.color, borderLeftWidth: 4 }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[#e2e8f0]">{crop.name}</span>
                      {crop.variety && (
                        <span className="text-xs text-[#a0aec0]">{crop.variety}</span>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${statusStyle.color}`}>
                      {statusStyle.label}
                    </span>
                  </div>
                  <button
                    onClick={() => setEditCrop(crop)}
                    className="text-xs text-[#63b3ed] hover:text-[#90cdf4] shrink-0"
                  >
                    編集
                  </button>
                </div>
                {crop.notes && (
                  <p className="text-xs text-[#a0aec0] mt-2 whitespace-pre-wrap">{crop.notes}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {editCrop !== null && (
        <CropModal
          crop={editCrop === 'new' ? undefined : editCrop}
          onClose={() => setEditCrop(null)}
        />
      )}
    </div>
  );
}
