import { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { FormField, inputCls, inputStyle, selectCls, selectStyle } from '../common/FormField';
import { ColorPicker, COLORS } from '../common/ColorPicker';
import { useApp } from '../../store/AppContext';
import type { Crop, CropStatus } from '../../types';
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
    if (selectedCrop) {
      dispatch({ type: 'CROP_UPDATE', crop: { ...selectedCrop, name: cropName.trim() || selectedCrop.name, variety: cropVariety, status: cropStatus, color: cropColor, notes: cropNotes } });
    } else {
      const newCrop: Crop = { id: uid(), fieldId: state.activeFieldId, name: cropName.trim() || '新しい作物', variety: cropVariety, status: cropStatus, color: cropColor, notes: cropNotes };
      dispatch({ type: 'CROP_ADD', crop: newCrop });
      dispatch({ type: 'PLOT_SET', fieldId: state.activeFieldId, key: plotKey, data: { cropId: newCrop.id, plantedDate, expectedHarvest } });
      onClose();
      return;
    }
    dispatch({ type: 'PLOT_SET', fieldId: state.activeFieldId, key: plotKey, data: { cropId: selectedCropId, plantedDate, expectedHarvest } });
    onClose();
  };

  const handleClear = () => {
    dispatch({ type: 'PLOT_CLEAR', fieldId: state.activeFieldId, key: plotKey });
    onClose();
  };

  const sectionStyle = { background: 'var(--c-bg)', border: '1px solid var(--c-border)', borderRadius: 8, padding: '12px', marginBottom: 12 };

  return (
    <Modal title={`区画 ${cellLabel(row, col)}`} onClose={onClose}>
      <FormField label="作物">
        <select className={selectCls} style={selectStyle} value={selectedCropId} onChange={(e) => handleCropChange(e.target.value)}>
          <option value="">（なし）</option>
          {fieldCrops.map((c) => (
            <option key={c.id} value={c.id}>{c.name}{c.variety ? ` (${c.variety})` : ''}</option>
          ))}
          <option value="__new__">＋ 新しく登録する</option>
        </select>
      </FormField>

      {(selectedCropId === '__new__' || selectedCrop) && (
        <div style={sectionStyle}>
          <FormField label="作物名" required>
            <input className={inputCls} style={inputStyle} value={cropName} onChange={(e) => setCropName(e.target.value)} />
          </FormField>
          <FormField label="品種">
            <input className={inputCls} style={inputStyle} value={cropVariety} onChange={(e) => setCropVariety(e.target.value)} />
          </FormField>
          <FormField label="植付け日">
            <input type="date" className={inputCls} style={inputStyle} value={plantedDate} onChange={(e) => setPlantedDate(e.target.value)} />
          </FormField>
          <FormField label="収穫予定日">
            <input type="date" className={inputCls} style={inputStyle} value={expectedHarvest} onChange={(e) => setExpectedHarvest(e.target.value)} />
          </FormField>
          <FormField label="ステータス">
            <select className={selectCls} style={selectStyle} value={cropStatus} onChange={(e) => setCropStatus(e.target.value as CropStatus)}>
              {(Object.entries(STATUS_LABELS) as [CropStatus, { label: string }][]).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </FormField>
          <FormField label="カラー">
            <ColorPicker value={cropColor} onChange={setCropColor} />
          </FormField>
          <FormField label="メモ">
            <textarea className={inputCls} style={inputStyle} rows={2} value={cropNotes} onChange={(e) => setCropNotes(e.target.value)} />
          </FormField>
        </div>
      )}

      <div className="flex gap-2">
        <button onClick={handleSave} className="flex-1 rounded-md py-2 text-sm font-medium text-white"
          style={{ background: 'var(--c-accent)' }}>保存</button>
        {plotData && (
          <button onClick={handleClear} className="rounded-md px-4 py-2 text-sm font-medium"
            style={{ color: 'var(--c-danger)', background: 'var(--c-hover)' }}>クリア</button>
        )}
        <button onClick={onClose} className="rounded-md px-4 py-2 text-sm"
          style={{ background: 'var(--c-hover)', color: 'var(--c-muted)' }}>キャンセル</button>
      </div>
    </Modal>
  );
}
