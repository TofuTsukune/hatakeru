import { useState } from 'react';
import { useApp } from '../../store/AppContext';
import type { Log } from '../../types';
import { LogModal } from './LogModal';
import { EmptyState } from '../common/EmptyState';
import { LOG_TYPES } from '../../utils/constants';

export function LogList() {
  const { state } = useApp();
  const [editLog, setEditLog] = useState<Log | null | 'new'>(null);

  const fieldLogs = state.logs
    .filter((l) => l.fieldId === state.activeFieldId)
    .sort((a, b) => b.date.localeCompare(a.date));

  const cropMap = Object.fromEntries(state.crops.map((c) => [c.id, c]));

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-base font-semibold" style={{ color: 'var(--c-text)' }}>
          作業ログ
          <span className="ml-2 text-xs font-normal" style={{ color: 'var(--c-muted)' }}>{fieldLogs.length}件</span>
        </h1>
        <button
          onClick={() => setEditLog('new')}
          className="text-xs font-medium px-3 py-1.5 rounded-md text-white"
          style={{ background: 'var(--c-accent)' }}
        >
          ＋ 追加
        </button>
      </div>

      {fieldLogs.length === 0 ? (
        <EmptyState icon="📋" message="作業ログが登録されていません" />
      ) : (
        <div className="space-y-1">
          {fieldLogs.map((log) => {
            const logType = LOG_TYPES[log.type];
            const crop = log.cropId ? cropMap[log.cropId] : null;
            return (
              <div
                key={log.id}
                className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer group"
                style={{ background: 'var(--c-surface)' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--c-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--c-surface)')}
                onClick={() => setEditLog(log)}
              >
                <span className="text-base shrink-0">{logType.icon}</span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>{logType.label}</span>
                    {crop && (
                      <span className="text-xs" style={{ color: 'var(--c-muted)' }}>
                        {crop.color && <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ background: crop.color }} />}
                        {crop.name}
                      </span>
                    )}
                  </div>
                  {log.notes && (
                    <p className="text-xs truncate mt-0.5" style={{ color: 'var(--c-muted)' }}>{log.notes}</p>
                  )}
                  {log.harvestAmount != null && (
                    <p className="text-xs mt-0.5" style={{ color: 'var(--c-muted)' }}>
                      収穫: {log.harvestAmount}{log.harvestUnit}
                    </p>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs" style={{ color: 'var(--c-muted)' }}>{log.date}</span>
                  {log.cost != null && (
                    <p className="text-xs mt-0.5" style={{ color: 'var(--c-muted)' }}>¥{log.cost.toLocaleString()}</p>
                  )}
                </div>

                <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--c-muted)' }}>
                  編集 →
                </span>
              </div>
            );
          })}
        </div>
      )}

      {editLog !== null && (
        <LogModal log={editLog === 'new' ? undefined : editLog} onClose={() => setEditLog(null)} />
      )}
    </div>
  );
}
