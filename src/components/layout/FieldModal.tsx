import { useState } from 'react';
import { Modal } from '../common/Modal';
import { FormField, inputCls, inputStyle } from '../common/FormField';
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
          style={inputStyle}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例: 市民農園A区画"
          autoFocus
        />
      </FormField>
      <div className="flex gap-2 mt-5">
        <button onClick={handleSave} className="flex-1 rounded-md py-2 text-sm font-medium text-white"
          style={{ background: 'var(--c-accent)' }}>
          保存
        </button>
        {field && (
          <button onClick={handleDelete} className="rounded-md px-4 py-2 text-sm font-medium"
            style={{ color: 'var(--c-danger)', background: 'var(--c-hover)' }}>
            削除
          </button>
        )}
        <button onClick={onClose} className="rounded-md px-4 py-2 text-sm"
          style={{ background: 'var(--c-hover)', color: 'var(--c-muted)' }}>
          キャンセル
        </button>
      </div>
    </Modal>
  );
}
