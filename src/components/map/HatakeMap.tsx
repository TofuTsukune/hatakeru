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

  // Collect used crop IDs for legend
  const usedCropIds = new Set(Object.values(field.plots).map((p) => p.cropId));
  const legendCrops = fieldCrops.filter((c) => usedCropIds.has(c.id));

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base font-semibold text-[#e2e8f0]">{field.name}</h2>
        <button
          onClick={() => setShowResize(true)}
          className="text-xs text-[#a0aec0] hover:text-[#e2e8f0] px-3 py-1.5 bg-[#0f3460] border border-[#2d3748] rounded-lg"
        >
          グリッドサイズ変更
        </button>
      </div>

      <div className="overflow-x-auto">
        <div
          className="inline-grid gap-1"
          style={{ gridTemplateColumns: `repeat(${field.gridCols}, 68px)` }}
        >
          {Array.from({ length: field.gridRows }, (_, r) =>
            Array.from({ length: field.gridCols }, (_, c) => {
              const key = `${r}-${c}`;
              const plotData = field.plots[key];
              const crop = plotData ? fieldCrops.find((cr) => cr.id === plotData.cropId) : null;
              return (
                <button
                  key={key}
                  onClick={() => setCellModal({ row: r, col: c })}
                  className="w-[68px] h-[92px] rounded border text-left p-1 relative transition-opacity hover:opacity-80"
                  style={
                    crop
                      ? { backgroundColor: crop.color + '33', borderColor: crop.color }
                      : { backgroundColor: '#0f3460', borderColor: '#2d3748' }
                  }
                >
                  <span className="text-[9px] text-[#a0aec0] absolute top-1 left-1">
                    {cellLabel(r, c)}
                  </span>
                  {crop && (
                    <div className="flex flex-col items-center justify-center h-full gap-0.5">
                      <span className="text-base">🌱</span>
                      <span className="text-[10px] text-[#e2e8f0] text-center leading-tight line-clamp-2">
                        {crop.name}
                      </span>
                      {plotData?.plantedDate && (
                        <span className="text-[9px] text-[#a0aec0]">植:{fmtShort(plotData.plantedDate)}</span>
                      )}
                      {plotData?.expectedHarvest && (
                        <span className="text-[9px] text-[#a0aec0]">収:{fmtShort(plotData.expectedHarvest)}</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {legendCrops.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {legendCrops.map((c) => (
            <div key={c.id} className="flex items-center gap-1.5 text-xs text-[#e2e8f0]">
              <span
                className="w-3 h-3 rounded-full inline-block"
                style={{ backgroundColor: c.color }}
              />
              {c.name}
            </div>
          ))}
        </div>
      )}

      {cellModal && (
        <CellModal row={cellModal.row} col={cellModal.col} onClose={() => setCellModal(null)} />
      )}
      {showResize && <GridResizeModal onClose={() => setShowResize(false)} />}
    </div>
  );
}
