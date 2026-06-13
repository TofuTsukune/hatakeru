import { useState, useRef } from 'react';
import type { Tab } from '../../types';
import { useApp } from '../../store/AppContext';
import { FieldModal } from './FieldModal';
import { exportData, importData } from '../../utils/exportImport';

interface Props {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const TABS: { id: Tab; label: string }[] = [
  { id: 'map', label: '📍 畑マップ' },
  { id: 'crops', label: '🥬 作物' },
  { id: 'logs', label: '📋 作業ログ' },
  { id: 'calendar', label: '📅 カレンダー' },
  { id: 'photos', label: '📷 写真' },
];

export function Header({ activeTab, onTabChange }: Props) {
  const { state, dispatch } = useApp();
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [editingField, setEditingField] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);

  const activeField = state.fields.find((f) => f.id === state.activeFieldId);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await importData(file);
      if (window.confirm('現在のデータを上書きしてインポートしますか？')) {
        dispatch({ type: 'IMPORT', state: data });
      }
    } catch (err) {
      alert((err as Error).message);
    }
    e.target.value = '';
  };

  return (
    <header className="bg-[#16213e] border-b border-[#2d3748] sticky top-0 z-40">
      {/* App title + Field selector row */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-[#2d3748]">
        <span className="text-base font-bold text-[#68d391] mr-2">ハタケル</span>
        <span className="text-xs text-[#a0aec0]">畑:</span>
        <select
          className="bg-[#0f3460] border border-[#2d3748] rounded text-sm text-[#e2e8f0] px-2 py-1 focus:outline-none"
          value={state.activeFieldId}
          onChange={(e) => dispatch({ type: 'FIELD_SET_ACTIVE', id: e.target.value })}
        >
          {state.fields.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
        <button
          onClick={() => { setEditingField(false); setShowFieldModal(true); }}
          className="text-xs text-[#63b3ed] hover:text-[#90cdf4] px-2"
        >
          ＋ 追加
        </button>
        {activeField && (
          <button
            onClick={() => { setEditingField(true); setShowFieldModal(true); }}
            className="text-xs text-[#a0aec0] hover:text-[#e2e8f0] px-2"
          >
            編集
          </button>
        )}
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => exportData(state)}
            className="text-xs text-[#a0aec0] hover:text-[#e2e8f0] px-2 py-1 bg-[#0f3460] rounded border border-[#2d3748]"
          >
            📤 エクスポート
          </button>
          <button
            onClick={() => importRef.current?.click()}
            className="text-xs text-[#a0aec0] hover:text-[#e2e8f0] px-2 py-1 bg-[#0f3460] rounded border border-[#2d3748]"
          >
            📥 インポート
          </button>
          <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
        </div>
      </div>

      {/* Tab row */}
      <nav className="flex overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-4 py-3 text-sm whitespace-nowrap transition-colors border-b-2 ${
              activeTab === tab.id
                ? 'border-[#63b3ed] text-[#63b3ed]'
                : 'border-transparent text-[#a0aec0] hover:text-[#e2e8f0]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {showFieldModal && (
        <FieldModal
          field={editingField ? activeField : undefined}
          onClose={() => setShowFieldModal(false)}
        />
      )}
    </header>
  );
}
