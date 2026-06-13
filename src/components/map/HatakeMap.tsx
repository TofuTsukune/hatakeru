import { useState } from 'react';
import { useApp } from '../../store/AppContext';
import { cellLabel } from '../../utils/cellLabel';
import { fmtShort } from '../../utils/date';
import { CellModal } from './CellModal';
import { GridResizeModal } from './GridResizeModal';
import { EmptyState } from '../common/EmptyState';

export function HatakeMap() {
  const { state } = useApp();
  const field = state.fields.find((f) => f.id === state.activeFieldId);
  const [cellModal, setCellModal] = useState<{ row: number; col: number } | null>(null);
  const [showResize, setShowResize] = useState(false);

  if (!field) return <EmptyState icon="🌾" message="畑が登録されていません" />;

  const fieldCrops = state.crops.filter((c) => c.fieldId === state.activeFieldId);
  const usedCropIds = new Set(Object.values(field.plots).map((p) => p.cropId));
  const legendCrops = fieldCrops.filter((c) => usedCropIds.has(c.id));

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-base font-semibold" style={{ color: 'var(--c-text)' }}>{field.name}</h1>
        <button
          onClick={() => setShowResize(true)}
          className="text-xs px-3 py-1.5 rounded-md transition-colors"
          style={{ background: 'var(--c-surface)', color: 'var(--c-muted)', border: '1px solid var(--c-border)' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--c-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--c-surface)')}
        >
          グリッドサイズ変更
        </button>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-grid gap-1.5" style={{ gridTemplateColumns: `repeat(${field.gridCols}, 72px)` }}>
          {Array.from({ length: field.gridRows }, (_, r) =>
            Array.from({ length: field.gridCols }, (_, c) => {
              const key = `${r}-${c}`;
              const plotData = field.plots[key];
              const crop = plotData ? fieldCrops.find((cr) => cr.id === plotData.cropId) : null;
              return (
                <button
                  key={key}
                  onClick={() => setCellModal({ row: r, col: c })}
                  className="w-[72px] h-[96px] rounded-lg text-left p-1.5 relative transition-all hover:scale-[1.02]"
                  style={
                    crop
                      ? { backgroundColor: crop.color + '22', border: `1px solid ${crop.color}66` }
                      : { backgroundColor: 'var(--c-surface)', border: '1px solid var(--c-border)' }
                  }
                >
                  <span className="text-[9px] absolute top-1.5 left-1.5" style={{ color: 'var(--c-faint)' }}>
                    {cellLabel(r, c)}
                  </span>
                  {crop ? (
                    <div className="flex flex-col items-center justify-center h-full gap-0.5">
                      <span className="text-lg">🌱</span>
                      <span className="text-[10px] text-center leading-tight line-clamp-2 font-medium"
                        style={{ color: 'var(--c-text)' }}>
                        {crop.name}
                      </span>
                      {plotData?.plantedDate && (
                        <span className="text-[9px]" style={{ color: 'var(--c-muted)' }}>植:{fmtShort(plotData.plantedDate)}</span>
                      )}
                      {plotData?.expectedHarvest && (
                        <span className="text-[9px]" style={{ color: 'var(--c-muted)' }}>収:{fmtShort(plotData.expectedHarvest)}</span>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <span className="text-lg opacity-10">＋</span>
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {legendCrops.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-3">
          {legendCrops.map((c) => (
            <div key={c.id} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--c-muted)' }}>
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: c.color }} />
              {c.name}
            </div>
          ))}
        </div>
      )}

      {cellModal && <CellModal row={cellModal.row} col={cellModal.col} onClose={() => setCellModal(null)} />}
      {showResize && <GridResizeModal onClose={() => setShowResize(false)} />}
    </div>
  );
}
