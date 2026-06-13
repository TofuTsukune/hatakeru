import { useState } from 'react';
import { useApp } from '../../store/AppContext';
import type { HatakeEvent } from '../../types';
import { EventModal } from './EventModal';
import { cellLabel } from '../../utils/cellLabel';
import { LOG_TYPES } from '../../utils/constants';

export function CalendarView() {
  const { state } = useApp();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [clickedDate, setClickedDate] = useState<string | null>(null);
  const [editEvent, setEditEvent] = useState<HatakeEvent | null>(null);

  const todayStr = now.toISOString().slice(0, 10);

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear((y) => y - 1); } else setMonth((m) => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear((y) => y + 1); } else setMonth((m) => m + 1); };

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const field = state.fields.find((f) => f.id === state.activeFieldId);
  const fieldCrops = state.crops.filter((c) => c.fieldId === state.activeFieldId);
  const fieldLogs = state.logs.filter((l) => l.fieldId === state.activeFieldId);
  const fieldEvents = state.events.filter((e) => e.fieldId === state.activeFieldId);

  const getDayContent = (dateStr: string) => {
    const items: { text: string; style: string; event?: HatakeEvent }[] = [];

    if (field) {
      Object.entries(field.plots).forEach(([key, plotData]) => {
        const [r, c] = key.split('-').map(Number);
        const lbl = cellLabel(r, c);
        const crop = fieldCrops.find((cr) => cr.id === plotData.cropId);
        if (!crop) return;
        if (plotData.plantedDate === dateStr)
          items.push({ text: `🌱 ${crop.name} (${lbl})`, style: 'color:#6dbb8a' });
        if (plotData.expectedHarvest === dateStr)
          items.push({ text: `🌾 ${crop.name} (${lbl})`, style: 'color:#c9a84c' });
      });
    }
    fieldLogs.filter((l) => l.date === dateStr).forEach((l) => {
      const lt = LOG_TYPES[l.type] ?? { icon: '📝', label: l.type };
      items.push({ text: `${lt.icon} ${lt.label}`, style: 'color:var(--c-muted)' });
    });
    fieldEvents.filter((e) => e.date === dateStr).forEach((e) => {
      items.push({
        text: e.title,
        style: e.done ? 'color:var(--c-faint);text-decoration:line-through' : 'color:#6faed4',
        event: e,
      });
    });

    return items;
  };

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const btnCls = 'text-xs px-3 py-1.5 rounded-md transition-colors';
  const btnStyle = { background: 'var(--c-surface)', color: 'var(--c-muted)', border: '1px solid var(--c-border)' };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <button className={btnCls} style={btnStyle}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--c-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--c-surface)')}
            onClick={prevMonth}>◀</button>
          <h1 className="text-base font-semibold" style={{ color: 'var(--c-text)' }}>
            {year}年 {month + 1}月
          </h1>
          <button className={btnCls} style={btnStyle}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--c-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--c-surface)')}
            onClick={nextMonth}>▶</button>
        </div>
        <button onClick={() => setClickedDate(todayStr)} className="text-xs font-medium px-3 py-1.5 rounded-md text-white"
          style={{ background: 'var(--c-accent)' }}>
          ＋ 予定を追加
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {['日', '月', '火', '水', '木', '金', '土'].map((d, i) => (
          <div key={d} className="text-center text-xs py-2 font-medium"
            style={{ color: i === 0 ? '#c07070' : i === 6 ? '#6faed4' : 'var(--c-muted)' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px" style={{ background: 'var(--c-border)', borderRadius: 8, overflow: 'hidden' }}>
        {cells.map((day, idx) => {
          if (!day) return <div key={idx} style={{ background: 'var(--c-bg)', minHeight: 88 }} />;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isToday = dateStr === todayStr;
          const items = getDayContent(dateStr);
          return (
            <div key={idx}
              className="p-2 cursor-pointer transition-colors"
              style={{ background: 'var(--c-bg)', minHeight: 88 }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--c-surface)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--c-bg)')}
              onClick={() => setClickedDate(dateStr)}
            >
              <div className={`text-xs w-6 h-6 flex items-center justify-center rounded-full mb-1 font-medium`}
                style={isToday
                  ? { background: 'var(--c-accent)', color: '#fff' }
                  : { color: 'var(--c-text)' }}>
                {day}
              </div>
              <div className="space-y-0.5">
                {items.map((item, i) => (
                  <div key={i} className="text-[10px] leading-tight truncate cursor-pointer"
                    style={{ cssText: item.style } as React.CSSProperties}
                    onClick={(e) => { if (item.event) { e.stopPropagation(); setEditEvent(item.event); } }}>
                    {item.text}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {clickedDate && <EventModal initialDate={clickedDate} onClose={() => setClickedDate(null)} />}
      {editEvent && <EventModal event={editEvent} onClose={() => setEditEvent(null)} />}
    </div>
  );
}
