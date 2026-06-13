import { useState } from 'react';
import { Modal } from '../common/Modal';
import { FormField, inputCls, inputStyle, selectCls, selectStyle } from '../common/FormField';
import { useApp } from '../../store/AppContext';
import type { Log, LogType } from '../../types';
import { uid } from '../../utils/uid';
import { LOG_TYPES } from '../../utils/constants';
import { today } from '../../utils/date';

interface Props {
  log?: Log;
  onClose: () => void;
}

export function LogModal({ log, onClose }: Props) {
  const { state, dispatch } = useApp();
  const [date, setDate] = useState(log?.date ?? today());
  const [type, setType] = useState<LogType>(log?.type ?? 'water');
  const [cropId, setCropId] = useState(log?.cropId ?? '');
  const [notes, setNotes] = useState(log?.notes ?? '');
  const [harvestAmount, setHarvestAmount] = useState(log?.harvestAmount?.toString() ?? '');
  const [harvestUnit, setHarvestUnit] = useState(log?.harvestUnit ?? 'kg');
  const [cost, setCost] = useState(log?.cost?.toString() ?? '');

  const fieldCrops = state.crops.filter((c) => c.fieldId === state.activeFieldId);

  const handleSave = () => {
    const base = {
      date,
      type,
      fieldId: state.activeFieldId,
      cropId: cropId || undefined,
      notes,
      harvestAmount: harvestAmount ? Number(harvestAmount) : undefined,
      harvestUnit: harvestAmount ? harvestUnit : undefined,
      cost: cost ? Number(cost) : undefined,
    };
    if (log) {
      dispatch({ type: 'LOG_UPDATE', log: { ...log, ...base } });
    } else {
      dispatch({ type: 'LOG_ADD', log: { id: uid(), ...base } });
    }
    onClose();
  };

  const handleDelete = () => {
    if (!log) return;
    if (!window.confirm('このログを削除しますか？')) return;
    dispatch({ type: 'LOG_DELETE', id: log.id });
    onClose();
  };

  return (
    <Modal title={log ? '作業ログを編集' : '作業ログを追加'} onClose={onClose}>
      <FormField label="日付" required>
        <input type="date" className={inputCls} style={inputStyle} value={date} onChange={(e) => setDate(e.target.value)} />
      </FormField>
      <FormField label="作業種別" required>
        <select className={selectCls} style={selectStyle} value={type} onChange={(e) => setType(e.target.value as LogType)}>
          {(Object.entries(LOG_TYPES) as [LogType, { label: string; icon: string }][]).map(([k, v]) => (
            <option key={k} value={k}>{v.icon} {v.label}</option>
          ))}
        </select>
      </FormField>
      <FormField label="作物">
        <select className={selectCls} style={selectStyle} value={cropId} onChange={(e) => setCropId(e.target.value)}>
          <option value="">（指定なし）</option>
          {fieldCrops.map((c) => (
            <option key={c.id} value={c.id}>{c.name}{c.variety ? ` (${c.variety})` : ''}</option>
          ))}
        </select>
      </FormField>
      {type === 'harvest' && (
        <FormField label="収穫量">
          <div className="flex gap-2">
            <input
              type="number" min="0" step="0.1"
              className={inputCls} style={{ ...inputStyle, flex: 1 }}
              value={harvestAmount} onChange={(e) => setHarvestAmount(e.target.value)}
              placeholder="0"
            />
            <input
              className={inputCls} style={{ ...inputStyle, width: '4rem' }}
              value={harvestUnit} onChange={(e) => setHarvestUnit(e.target.value)}
              placeholder="kg"
            />
          </div>
        </FormField>
      )}
      <FormField label="費用 (円)">
        <input
          type="number" min="0"
          className={inputCls} style={inputStyle}
          value={cost} onChange={(e) => setCost(e.target.value)}
          placeholder="0"
        />
      </FormField>
      <FormField label="メモ">
        <textarea className={inputCls} style={inputStyle} rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </FormField>
      <div className="flex gap-2 mt-5">
        <button onClick={handleSave} className="flex-1 rounded-md py-2 text-sm font-medium text-white"
          style={{ background: 'var(--c-accent)' }}>保存</button>
        {log && (
          <button onClick={handleDelete} className="rounded-md px-4 py-2 text-sm font-medium"
            style={{ color: 'var(--c-danger)', background: 'var(--c-hover)' }}>削除</button>
        )}
        <button onClick={onClose} className="rounded-md px-4 py-2 text-sm"
          style={{ background: 'var(--c-hover)', color: 'var(--c-muted)' }}>キャンセル</button>
      </div>
    </Modal>
  );
}
