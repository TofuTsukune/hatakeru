import { useState } from 'react';
import { Modal } from '../common/Modal';
import { FormField, inputCls } from '../common/FormField';
import { useApp } from '../../store/AppContext';

interface Props {
  onClose: () => void;
}

export function GridResizeModal({ onClose }: Props) {
  const { state, dispatch } = useApp();
  const field = state.fields.find((f) => f.id === state.activeFieldId);

  const [cols, setCols] = useState(field?.gridCols ?? 8);
  const [rows, setRows] = useState(field?.gridRows ?? 6);

  if (!field) return null;

  const handleSave = () => {
    dispatch({ type: 'FIELD_RESIZE', id: field.id, cols, rows });
    onClose();
  };

  return (
    <Modal title="グリッドサイズ変更" onClose={onClose}>
      <p className="text-xs text-[#a0aec0] mb-4">縮小した場合、範囲外の区画データは削除されます。</p>
      <FormField label="列数 (1–16)">
        <input
          type="number"
          className={inputCls}
          value={cols}
          min={1}
          max={16}
          onChange={(e) => setCols(Math.min(16, Math.max(1, +e.target.value)))}
        />
      </FormField>
      <FormField label="行数 (1–12)">
        <input
          type="number"
          className={inputCls}
          value={rows}
          min={1}
          max={12}
          onChange={(e) => setRows(Math.min(12, Math.max(1, +e.target.value)))}
        />
      </FormField>
      <div className="flex gap-2 mt-4">
        <button
          onClick={handleSave}
          className="flex-1 bg-[#63b3ed] hover:bg-[#4299e1] text-white rounded-lg py-2 text-sm font-medium"
        >
          変更
        </button>
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
