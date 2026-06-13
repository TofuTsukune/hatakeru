import { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { FormField, inputCls, selectCls } from '../common/FormField';
import { ColorPicker, COLORS } from '../common/ColorPicker';
import { useApp } from '../../store/AppContext';
import type { Crop, CropStatus, PlotData } from '../../types';
import { uid } from '../../utils/uid';
import { cellLabel } from '../../utils/cellLabel';
import { STATUS_LABELS } from '../../utils/constants';

interface Props {
  row: number;
  col: number;
  onClose: () => void;
}

export function CellModal({ row, col, onClose }: Props) {
  const { state, dispatch } = useApp();
  const field = state.fields.find((f) => f.id === state.activeFieldId)!;
  const plotKey = `${row}-${col}`;
  const plotData = field.plots[plotKey];
  const fieldCrops = state.crops.filter((c) => c.fieldId === state.activeFieldId);

  const [selectedCropId, setSelectedCropId] = useState(plotData?.cropId ?? '');
  const [plantedDate, setPlantedDate] = useState(plotData?.plantedDate ?? '');
  const [expectedHarvest, setExpectedHarvest] = useState(plotData?.expectedHarvest ?? '');

  // Crop edit fields
  const [cropName, setCropName] = useState('');
  const [cropVariety, setCropVariety] = useState('');
  const [cropStatus, setCropStatus] = useState<CropStatus>('growing');
  const [cropColor, setCropColor] = useState(COLORS[0]);
  const [cropNotes, setCropNotes] = useState('');

  const selectedCrop = fieldCrops.find((c) => c.id === selectedCropId);

  useEffect(() => {
    if (selectedCrop) {
      setCropName(selectedCrop.name);
      setCropVariety(selectedCrop.variety);
      setCropStatus(selectedCrop.status);
      setCropColor(selectedCrop.color);
      setCropNotes(selectedCrop.notes);
    } else {
      setCropName('');
      setCropVariety('');
      setCropStatus('growing');
      setCropColor(COLORS[state.crops.length % COLORS.length]);
      setCropNotes('');
    }
  }, [selectedCropId]);

  const handleCropChange = (newId: string) => {
    setSelectedCropId(newId);
    setPlantedDate('');
    setExpectedHarvest('');
  };

  const handleSave = () => {
    if (!selectedCropId) {
      dispatch({ type: 'PLOT_CLEAR', fieldId: state.activeFieldId, key: plotKey });
      onClose();
      return;
    }

    // Save crop edits
    if (selectedCrop) {
      dispatch({
        type: 'CROP_UPDATE',
        crop: {
          ...selectedCrop,
          name: cropName.trim() || selectedCrop.name,
          variety: cropVariety,
          status: cropStatus,
          color: cropColor,
          notes: cropNotes,
        },
      });
    } else {
      // New crop created inline
      const newCrop: Crop = {
        id: uid(),
        fieldId: state.activeFieldId,
        name: cropName.trim() || '新しい作物',
        variety: cropVariety,
        status: cropStatus,
        color: cropColor,
        notes: cropNotes,
      };
      dispatch({ type: 'CROP_ADD', crop: newCrop });
      const plotDataNew: PlotData = { cropId: newCrop.id, plantedDate, expectedHarvest };
      dispatch({ type: 'PLOT_SET', fieldId: state.activeFieldId, key: plotKey, data: plotDataNew });
      onClose();
      return;
    }

    const data: PlotData = { cropId: selectedCropId, plantedDate, expectedHarvest };
    dispatch({ type: 'PLOT_SET', fieldId: state.activeFieldId, key: plotKey, data });
    onClose();
  };

  const handleClear = () => {
    dispatch({ type: 'PLOT_CLEAR', fieldId: state.activeFieldId, key: plotKey });
    onClose();
  };

  return (
    <Modal title={`区画 ${cellLabel(row, col)}`} onClose={onClose}>
      <FormField label="作物">
        <select
          className={selectCls}
          value={selectedCropId}
          onChange={(e) => handleCropChange(e.target.value)}
        >
          <option value="">（なし）</option>
          {fieldCrops.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
              {c.variety ? ` (${c.variety})` : ''}
            </option>
          ))}
          <option value="__new__">＋ 新しく登録する</option>
        </select>
      </FormField>

      {(selectedCropId === '__new__' || selectedCrop) && (
        <div className="border border-[#2d3748] rounded-lg p-3 mb-3 space-y-2">
          <FormField label="作物名" required>
            <input className={inputCls} value={cropName} onChange={(e) => setCropName(e.target.value)} />
          </FormField>
          <FormField label="品種">
            <input className={inputCls} value={cropVariety} onChange={(e) => setCropVariety(e.target.value)} />
          </FormField>
          <FormField label="植付け日">
            <input type="date" className={inputCls} value={plantedDate} onChange={(e) => setPlantedDate(e.target.value)} />
          </FormField>
          <FormField label="収穫予定日">
            <input type="date" className={inputCls} value={expectedHarvest} onChange={(e) => setExpectedHarvest(e.target.value)} />
          </FormField>
          <FormField label="ステータス">
            <select className={selectCls} value={cropStatus} onChange={(e) => setCropStatus(e.target.value as CropStatus)}>
              {(Object.entries(STATUS_LABELS) as [CropStatus, { label: string }][]).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </FormField>
          <FormField label="カラー">
            <ColorPicker value={cropColor} onChange={setCropColor} />
          </FormField>
          <FormField label="メモ">
            <textarea className={inputCls} rows={2} value={cropNotes} onChange={(e) => setCropNotes(e.target.value)} />
          </FormField>
        </div>
      )}

      <div className="flex gap-2 mt-2">
        <button
          onClick={handleSave}
          className="flex-1 bg-[#63b3ed] hover:bg-[#4299e1] text-white rounded-lg py-2 text-sm font-medium"
        >
          保存
        </button>
        {plotData && (
          <button
            onClick={handleClear}
            className="bg-[#fc8181] hover:bg-[#f56565] text-white rounded-lg px-4 py-2 text-sm font-medium"
          >
            クリア
          </button>
        )}
        <button
          onClick={onClose}
          className="bg-[#2d3748] hover:bg-[#4a5568] text-[#a0aec0] rounded-lg px-4 py-2 text-sm"
        >
          キャンセル
        </button>
      </div>
    </Modal>
  );
}
