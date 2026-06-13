import { useState, useRef } from 'react';
import { Modal } from '../common/Modal';
import { FormField, inputCls, inputStyle, selectCls, selectStyle } from '../common/FormField';
import { useApp } from '../../store/AppContext';
import { today } from '../../utils/date';
import type { Photo } from '../../types';

interface Props {
  fieldId: string;
  onAdd: (partial: Omit<Photo, 'id' | 'fieldId'>) => Promise<void>;
  onClose: () => void;
}

export function PhotoModal({ fieldId, onAdd, onClose }: Props) {
  const { state } = useApp();
  const fieldCrops = state.crops.filter((c) => c.fieldId === fieldId);
  const fileRef = useRef<HTMLInputElement>(null);

  const [date, setDate] = useState(today());
  const [cropId, setCropId] = useState('');
  const [notes, setNotes] = useState('');
  const [dataUrl, setDataUrl] = useState('');
  const [preview, setPreview] = useState('');
  const [saving, setSaving] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { const r = reader.result as string; setDataUrl(r); setPreview(r); };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!dataUrl) return;
    setSaving(true);
    await onAdd({ date, dataUrl, cropId: cropId || undefined, notes });
    onClose();
  };

  return (
    <Modal title="写真を追加" onClose={onClose}>
      <FormField label="写真" required>
        <div
          className="rounded-lg p-6 text-center cursor-pointer transition-colors"
          style={{ border: '2px dashed var(--c-border)' }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--c-accent)')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--c-border)')}
          onClick={() => fileRef.current?.click()}
        >
          {preview ? (
            <img src={preview} alt="preview" className="max-h-48 mx-auto rounded object-contain" />
          ) : (
            <div style={{ color: 'var(--c-muted)' }}>
              <div className="text-3xl mb-2">📷</div>
              <div className="text-sm">クリックして写真を選択</div>
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </FormField>
      <FormField label="日付">
        <input type="date" className={inputCls} style={inputStyle} value={date} onChange={(e) => setDate(e.target.value)} />
      </FormField>
      <FormField label="関連作物">
        <select className={selectCls} style={selectStyle} value={cropId} onChange={(e) => setCropId(e.target.value)}>
          <option value="">（指定なし）</option>
          {fieldCrops.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </FormField>
      <FormField label="メモ">
        <textarea className={inputCls} style={inputStyle} rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </FormField>
      <div className="flex gap-2 mt-5">
        <button onClick={handleSave} disabled={!dataUrl || saving}
          className="flex-1 rounded-md py-2 text-sm font-medium text-white disabled:opacity-40"
          style={{ background: 'var(--c-accent)' }}>
          {saving ? '保存中...' : '保存'}
        </button>
        <button onClick={onClose} className="rounded-md px-4 py-2 text-sm"
          style={{ background: 'var(--c-hover)', color: 'var(--c-muted)' }}>キャンセル</button>
      </div>
    </Modal>
  );
}
