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
  { id: 'map',      label: '畑マップ' },
  { id: 'crops',    label: '作物' },
  { id: 'logs',     label: '作業ログ' },
  { id: 'calendar', label: 'カレンダー' },
  { id: 'photos',   label: '写真' },
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
    <header style={{ background: 'var(--c-surface)', borderBottom: '1px solid var(--c-border)' }}
      className="sticky top-0 z-40">
      {/* Top bar */}
      <div className="max-w-5xl mx-auto px-4 h-12 flex items-center gap-3">
        {/* App name */}
        <span className="font-semibold text-sm" style={{ color: 'var(--c-accent)' }}>
          🌿 ハタケル
        </span>

        <span style={{ color: 'var(--c-faint)' }} className="text-xs">/</span>

        {/* Field selector */}
        <div className="flex items-center gap-1">
          <select
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--c-text)',
              fontSize: '13px',
              fontFamily: 'inherit',
              cursor: 'pointer',
              outline: 'none',
            }}
            value={state.activeFieldId}
            onChange={(e) => dispatch({ type: 'FIELD_SET_ACTIVE', id: e.target.value })}
          >
            {state.fields.map((f) => (
              <option key={f.id} value={f.id} style={{ background: '#252525' }}>
                {f.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => { setEditingField(false); setShowFieldModal(true); }}
            style={{ color: 'var(--c-muted)' }}
            className="text-xs hover:opacity-70 px-1"
            title="畑を追加"
          >
            ＋
          </button>
          {activeField && (
            <button
              onClick={() => { setEditingField(true); setShowFieldModal(true); }}
              style={{ color: 'var(--c-muted)' }}
              className="text-xs hover:opacity-70 px-1"
              title="畑を編集"
            >
              ···
            </button>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Export / Import */}
        <button
          onClick={() => exportData(state)}
          style={{ color: 'var(--c-muted)', fontSize: '12px' }}
          className="hover:opacity-70 px-2 py-1"
          title="エクスポート"
        >
          ↑ エクスポート
        </button>
        <button
          onClick={() => importRef.current?.click()}
          style={{ color: 'var(--c-muted)', fontSize: '12px' }}
          className="hover:opacity-70 px-2 py-1"
          title="インポート"
        >
          ↓ インポート
        </button>
        <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
      </div>

      {/* Tab bar */}
      <div className="max-w-5xl mx-auto px-4 flex gap-1 pb-0">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="px-3 py-2 text-xs font-medium rounded-t-md transition-colors"
            style={
              activeTab === tab.id
                ? { background: 'var(--c-bg)', color: 'var(--c-text)' }
                : { background: 'transparent', color: 'var(--c-muted)' }
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {showFieldModal && (
        <FieldModal
          field={editingField ? activeField : undefined}
          onClose={() => setShowFieldModal(false)}
        />
      )}
    </header>
  );
}
