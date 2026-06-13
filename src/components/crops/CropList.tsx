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
    <div>
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-base font-semibold" style={{ color: 'var(--c-text)' }}>
          作物
          <span className="ml-2 text-xs font-normal" style={{ color: 'var(--c-muted)' }}>{fieldCrops.length}件</span>
        </h1>
        <button
          onClick={() => setEditCrop('new')}
          className="text-xs font-medium px-3 py-1.5 rounded-md text-white"
          style={{ background: 'var(--c-accent)' }}
        >
          ＋ 追加
        </button>
      </div>

      {fieldCrops.length === 0 ? (
        <EmptyState icon="🥬" message="作物が登録されていません" />
      ) : (
        <div className="space-y-1">
          {fieldCrops.map((crop) => {
            const st = STATUS_LABELS[crop.status];
            return (
              <div
                key={crop.id}
                className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer group"
                style={{ background: 'var(--c-surface)' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--c-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--c-surface)')}
                onClick={() => setEditCrop(crop)}
              >
                {/* Color dot */}
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: crop.color }} />

                {/* Name + variety */}
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>{crop.name}</span>
                  {crop.variety && (
                    <span className="ml-2 text-xs" style={{ color: 'var(--c-muted)' }}>{crop.variety}</span>
                  )}
                  {crop.notes && (
                    <p className="text-xs truncate mt-0.5" style={{ color: 'var(--c-muted)' }}>{crop.notes}</p>
                  )}
                </div>

                {/* Status badge */}
                <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${st.color}`}>
                  {st.label}
                </span>

                {/* Edit hint */}
                <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--c-muted)' }}>
                  編集 →
                </span>
              </div>
            );
          })}
        </div>
      )}

      {editCrop !== null && (
        <CropModal crop={editCrop === 'new' ? undefined : editCrop} onClose={() => setEditCrop(null)} />
      )}
    </div>
  );
}
