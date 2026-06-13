import { useState } from 'react';
import { Modal } from '../common/Modal';
import { FormField, inputCls } from '../common/FormField';
import { useApp } from '../../store/AppContext';
import type { Field } from '../../types';
import { uid } from '../../utils/uid';

interface Props {
  field?: Field;
  onClose: () => void;
}

export function FieldModal({ field, onClose }: Props) {
  const { dispatch } = useApp();
  const [name, setName] = useState(field?.name ?? '');

  const handleSave = () => {
    if (!name.trim()) return;
    if (field) {
      dispatch({ type: 'FIELD_UPDATE', field: { ...field, name: name.trim() } });
    } else {
      dispatch({
        type: 'FIELD_ADD',
        field: { id: uid(), name: name.trim(), gridCols: 8, gridRows: 6, plots: {} },
      });
    }
    onClose();
  };

  const handleDelete = () => {
    if (!field) return;
    if (!window.confirm(`「${field.name}」を削除しますか？関連データもすべて削除されます。`)) return;
    dispatch({ type: 'FIELD_DELETE', id: field.id });
    onClose();
  };

  return (
    <Modal title={field ? '畑を編集' : '畑を追加'} onClose={onClose}>
      <FormField label="畑の名前" required>
        <input
          className={inputCls}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例: 市民農園A区画"
          autoFocus
        />
      </FormField>
      <div className="flex gap-2 mt-4">
        <button
          onClick={handleSave}
          className="flex-1 bg-[#63b3ed] hover:bg-[#4299e1] text-white rounded-lg py-2 text-sm font-medium"
        >
          保存
        </button>
        {field && (
          <button
            onClick={handleDelete}
            className="bg-[#fc8181] hover:bg-[#f56565] text-white rounded-lg px-4 py-2 text-sm font-medium"
          >
            削除
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
