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

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  };

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const field = state.fields.find((f) => f.id === state.activeFieldId);
  const fieldCrops = state.crops.filter((c) => c.fieldId === state.activeFieldId);
  const fieldLogs = state.logs.filter((l) => l.fieldId === state.activeFieldId);
  const fieldEvents = state.events.filter((e) => e.fieldId === state.activeFieldId);



  const getDayContent = (dateStr: string) => {
    const items: { text: string; color: string; id?: string; event?: HatakeEvent }[] = [];

    // Plot dates
    if (field) {
      Object.entries(field.plots).forEach(([key, plotData]) => {
        const [r, c] = key.split('-').map(Number);
        const lbl = cellLabel(r, c);
        const crop = fieldCrops.find((cr) => cr.id === plotData.cropId);
        if (!crop) return;
        if (plotData.plantedDate === dateStr)
          items.push({ text: `🌱 植付け: ${crop.name} (${lbl})`, color: 'text-[#68d391]' });
        if (plotData.expectedHarvest === dateStr)
          items.push({ text: `🌾 収穫予定: ${crop.name} (${lbl})`, color: 'text-[#f6ad55]' });
      });
    }

    // Work logs
    fieldLogs
      .filter((l) => l.date === dateStr)
      .forEach((l) => {
        const lt = LOG_TYPES[l.type] ?? { icon: '📝', label: l.type };
        items.push({ text: `${lt.icon} ${lt.label}`, color: 'text-[#9ae6b4]' });
      });

    // Events
    fieldEvents
      .filter((e) => e.date === dateStr)
      .forEach((e) => {
        items.push({
          text: e.title,
          color: e.done ? 'text-[#a0aec0] line-through' : 'text-[#63b3ed]',
          event: e,
        });
      });

    return items;
  };

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="text-[#a0aec0] hover:text-[#e2e8f0] px-3 py-1.5 bg-[#0f3460] border border-[#2d3748] rounded-lg text-sm"
        >
          ◀
        </button>
        <h2 className="text-base font-semibold text-[#e2e8f0]">
          {year}年 {month + 1}月
        </h2>
        <button
          onClick={nextMonth}
          className="text-[#a0aec0] hover:text-[#e2e8f0] px-3 py-1.5 bg-[#0f3460] border border-[#2d3748] rounded-lg text-sm"
        >
          ▶
        </button>
      </div>

      <div className="mb-2">
        <button
          onClick={() => setClickedDate(todayStr)}
          className="text-xs text-[#63b3ed] hover:text-[#90cdf4]"
        >
          ＋ 予定を追加
        </button>
      </div>

      <div className="grid grid-cols-7 gap-px bg-[#2d3748] rounded-lg overflow-hidden">
        {['日', '月', '火', '水', '木', '金', '土'].map((d) => (
          <div key={d} className="bg-[#16213e] text-center text-xs text-[#a0aec0] py-2">
            {d}
          </div>
        ))}
        {cells.map((day, idx) => {
          if (!day) return <div key={idx} className="bg-[#16213e] min-h-[80px]" />;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isToday = dateStr === todayStr;
          const items = getDayContent(dateStr);
          return (
            <div
              key={idx}
              className="bg-[#16213e] min-h-[80px] p-1 cursor-pointer hover:bg-[#0f3460] transition-colors"
              onClick={() => setClickedDate(dateStr)}
            >
              <div
                className={`text-xs w-6 h-6 flex items-center justify-center rounded-full mb-1 ${
                  isToday
                    ? 'bg-[#63b3ed] text-white font-bold'
                    : 'text-[#e2e8f0]'
                }`}
              >
                {day}
              </div>
              <div className="space-y-0.5">
                {items.map((item, i) => (
                  <div
                    key={i}
                    className={`text-[10px] leading-tight truncate ${item.color} cursor-pointer`}
                    onClick={(e) => {
                      if (item.event) {
                        e.stopPropagation();
                        setEditEvent(item.event);
                      }
                    }}
                  >
                    {item.text}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {clickedDate && (
        <EventModal
          initialDate={clickedDate}
          onClose={() => setClickedDate(null)}
        />
      )}
      {editEvent && (
        <EventModal
          event={editEvent}
          onClose={() => setEditEvent(null)}
        />
      )}
    </div>
  );
}
