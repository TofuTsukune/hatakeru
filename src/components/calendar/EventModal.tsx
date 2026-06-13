import { useState } from 'react';
import { Modal } from '../common/Modal';
import { FormField, inputCls, inputStyle, selectCls, selectStyle } from '../common/FormField';
import { useApp } from '../../store/AppContext';
import type { HatakeEvent } from '../../types';
import { uid } from '../../utils/uid';
import { LOG_TYPES } from '../../utils/constants';

interface Props {
  event?: HatakeEvent;
  initialDate?: string;
  onClose: () => void;
}

export function EventModal({ event, initialDate, onClose }: Props) {
  const { state, dispatch } = useApp();
  const fieldCrops = state.crops.filter((c) => c.fieldId === state.activeFieldId);

  const [date, setDate] = useState(event?.date ?? initialDate ?? '');
  const [title, setTitle] = useState(event?.title ?? '');
  const [type, setType] = useState(event?.type ?? '');
  const [cropId, setCropId] = useState(event?.cropId ?? '');

  const handleSave = () => {
    if (!date || !title.trim()) return;
    const base = { fieldId: state.activeFieldId, date, title: title.trim(), type, cropId: cropId || undefined, done: event?.done ?? false };
    if (event) {
      dispatch({ type: 'EVENT_UPDATE', event: { ...event, ...base } });
    } else {
      dispatch({ type: 'EVENT_ADD', event: { id: uid(), ...base } });
    }
    onClose();
  };

  const handleDelete = () => {
    if (!event) return;
    if (!window.confirm('この予定を削除しますか？')) return;
    dispatch({ type: 'EVENT_DELETE', id: event.id });
    onClose();
  };

  const handleToggleDone = () => {
    if (!event) return;
    dispatch({ type: 'EVENT_UPDATE', event: { ...event, done: !event.done } });
    onClose();
  };

  return (
    <Modal title={event ? '予定を編集' : '予定を追加'} onClose={onClose}>
      <FormField label="日付" required>
        <input type="date" className={inputCls} style={inputStyle} value={date} onChange={(e) => setDate(e.target.value)} />
      </FormField>
      <FormField label="タイトル" required>
        <input className={inputCls} style={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)}
          placeholder="例: 追肥の予定" autoFocus />
      </FormField>
      <FormField label="種別">
        <select className={selectCls} style={selectStyle} value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">（なし）</option>
          {Object.entries(LOG_TYPES).map(([k, v]) => (
            <option key={k} value={k}>{v.icon} {v.label}</option>
          ))}
        </select>
      </FormField>
      <FormField label="関連作物">
        <select className={selectCls} style={selectStyle} value={cropId} onChange={(e) => setCropId(e.target.value)}>
          <option value="">（指定なし）</option>
          {fieldCrops.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </FormField>

      <div className="flex gap-2 mt-5 flex-wrap">
        <button onClick={handleSave} className="flex-1 rounded-md py-2 text-sm font-medium text-white"
          style={{ background: 'var(--c-accent)' }}>保存</button>
        {event && (
          <>
            <button onClick={handleToggleDone} className="rounded-md px-3 py-2 text-sm font-medium"
              style={{ background: 'var(--c-hover)', color: 'var(--c-text)' }}>
              {event.done ? '未完了に戻す' : '✓ 完了'}
            </button>
            <button onClick={handleDelete} className="rounded-md px-3 py-2 text-sm font-medium"
              style={{ color: 'var(--c-danger)', background: 'var(--c-hover)' }}>削除</button>
          </>
        )}
        <button onClick={onClose} className="rounded-md px-4 py-2 text-sm"
          style={{ background: 'var(--c-hover)', color: 'var(--c-muted)' }}>キャンセル</button>
      </div>
    </Modal>
  );
}
