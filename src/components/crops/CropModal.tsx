import { useState } from 'react';
import { Modal } from '../common/Modal';
import { FormField, inputCls, inputStyle, selectCls, selectStyle } from '../common/FormField';
import { ColorPicker, COLORS } from '../common/ColorPicker';
import { useApp } from '../../store/AppContext';
import type { Crop, CropStatus } from '../../types';
import { uid } from '../../utils/uid';
import { STATUS_LABELS } from '../../utils/constants';

interface Props {
  crop?: Crop;
  onClose: () => void;
}

export function CropModal({ crop, onClose }: Props) {
  const { state, dispatch } = useApp();
  const [name, setName] = useState(crop?.name ?? '');
  const [variety, setVariety] = useState(crop?.variety ?? '');
  const [status, setStatus] = useState<CropStatus>(crop?.status ?? 'growing');
  const [color, setColor] = useState(crop?.color ?? COLORS[state.crops.length % COLORS.length]);
  const [notes, setNotes] = useState(crop?.notes ?? '');

  const handleSave = () => {
    if (!name.trim()) return;
    if (crop) {
      dispatch({ type: 'CROP_UPDATE', crop: { ...crop, name: name.trim(), variety, status, color, notes } });
    } else {
      const newCrop: Crop = { id: uid(), fieldId: state.activeFieldId, name: name.trim(), variety, status, color, notes };
      dispatch({ type: 'CROP_ADD', crop: newCrop });
    }
    onClose();
  };

  const handleDelete = () => {
    if (!crop) return;
    if (!window.confirm(`「${crop.name}」を削除しますか？関連データもすべて削除されます。`)) return;
    dispatch({ type: 'CROP_DELETE', id: crop.id });
    onClose();
  };

  return (
    <Modal title={crop ? '作物を編集' : '作物を追加'} onClose={onClose}>
      <FormField label="作物名" required>
        <input className={inputCls} style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="例: トマト" autoFocus />
      </FormField>
      <FormField label="品種">
        <input className={inputCls} style={inputStyle} value={variety} onChange={(e) => setVariety(e.target.value)} placeholder="例: ミニトマト" />
      </FormField>
      <FormField label="ステータス">
        <select className={selectCls} style={selectStyle} value={status} onChange={(e) => setStatus(e.target.value as CropStatus)}>
          {(Object.entries(STATUS_LABELS) as [CropStatus, { label: string }][]).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </FormField>
      <FormField label="カラー">
        <ColorPicker value={color} onChange={setColor} />
      </FormField>
      <FormField label="メモ">
        <textarea className={inputCls} style={inputStyle} rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </FormField>
      <div className="flex gap-2 mt-5">
        <button onClick={handleSave} className="flex-1 rounded-md py-2 text-sm font-medium text-white"
          style={{ background: 'var(--c-accent)' }}>保存</button>
        {crop && (
          <button onClick={handleDelete} className="rounded-md px-4 py-2 text-sm font-medium"
            style={{ color: 'var(--c-danger)', background: 'var(--c-hover)' }}>削除</button>
        )}
        <button onClick={onClose} className="rounded-md px-4 py-2 text-sm"
          style={{ background: 'var(--c-hover)', color: 'var(--c-muted)' }}>キャンセル</button>
      </div>
    </Modal>
  );
}
