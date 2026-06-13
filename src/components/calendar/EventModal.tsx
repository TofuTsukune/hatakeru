import { useState } from 'react';
import { Modal } from '../common/Modal';
import { FormField, inputCls, selectCls } from '../common/FormField';
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
    const base = {
      fieldId: state.activeFieldId,
      date,
      title: title.trim(),
      type,
      cropId: cropId || undefined,
      done: event?.done ?? false,
    };
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
        <input type="date" className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} />
      </FormField>
      <FormField label="タイトル" required>
        <input
          className={inputCls}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例: 追肥の予定"
          autoFocus
        />
      </FormField>
      <FormField label="種別">
        <select className={selectCls} value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">（なし）</option>
          {Object.entries(LOG_TYPES).map(([k, v]) => (
            <option key={k} value={k}>{v.icon} {v.label}</option>
          ))}
        </select>
      </FormField>
      <FormField label="関連作物">
        <select className={selectCls} value={cropId} onChange={(e) => setCropId(e.target.value)}>
          <option value="">（指定なし）</option>
          {fieldCrops.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </FormField>

      <div className="flex gap-2 mt-4 flex-wrap">
        <button
          onClick={handleSave}
          className="flex-1 bg-[#63b3ed] hover:bg-[#4299e1] text-white rounded-lg py-2 text-sm font-medium"
        >
          保存
        </button>
        {event && (
          <>
            <button
              onClick={handleToggleDone}
              className="bg-[#68d391] hover:bg-[#48bb78] text-[#1a1a2e] rounded-lg px-3 py-2 text-sm font-medium"
            >
              {event.done ? '未完了に戻す' : '完了'}
            </button>
            <button
              onClick={handleDelete}
              className="bg-[#fc8181] hover:bg-[#f56565] text-white rounded-lg px-3 py-2 text-sm font-medium"
            >
              削除
            </button>
          </>
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
