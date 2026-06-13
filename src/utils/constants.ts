import type { LogType } from '../types';

export const LOG_TYPES: Record<LogType, { label: string; icon: string }> = {
  water:     { label: '水やり',  icon: '💧' },
  fertilize: { label: '施肥',    icon: '🌿' },
  harvest:   { label: '収穫',    icon: '🌾' },
  weed:      { label: '草取り',  icon: '🌀' },
  plant:     { label: '植付け',  icon: '🌱' },
  other:     { label: 'その他',  icon: '📝' },
};

export const STATUS_LABELS = {
  planned:   { label: '予定',     color: 'text-[#f6ad55] bg-[#f6ad5520]' },
  growing:   { label: '栽培中',   color: 'text-[#68d391] bg-[#68d39120]' },
  harvested: { label: '収穫済み', color: 'text-[#63b3ed] bg-[#63b3ed20]' },
};
