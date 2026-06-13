import { useState, useRef } from 'react';
import { Modal } from '../common/Modal';
import { FormField, inputCls, selectCls } from '../common/FormField';
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
    reader.onload = () => {
      const result = reader.result as string;
      setDataUrl(result);
      setPreview(result);
    };
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
          className="border-2 border-dashed border-[#2d3748] rounded-lg p-4 text-center cursor-pointer hover:border-[#63b3ed] transition-colors"
          onClick={() => fileRef.current?.click()}
        >
          {preview ? (
            <img src={preview} alt="preview" className="max-h-48 mx-auto rounded object-contain" />
          ) : (
            <div className="text-[#a0aec0]">
              <div className="text-3xl mb-2">📷</div>
              <div className="text-sm">クリックして写真を選択</div>
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </FormField>
      <FormField label="日付">
        <input type="date" className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} />
      </FormField>
      <FormField label="関連作物">
        <select className={selectCls} value={cropId} onChange={(e) => setCropId(e.target.value)}>
          <option value="">（指定なし）</option>
          {fieldCrops.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </FormField>
      <FormField label="メモ">
        <textarea className={inputCls} rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </FormField>
      <div className="flex gap-2 mt-4">
        <button
          onClick={handleSave}
          disabled={!dataUrl || saving}
          className="flex-1 bg-[#63b3ed] hover:bg-[#4299e1] disabled:opacity-50 text-white rounded-lg py-2 text-sm font-medium"
        >
          {saving ? '保存中...' : '保存'}
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
