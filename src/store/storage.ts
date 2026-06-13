import type { AppState } from '../types';
import { uid } from '../utils/uid';

const STORAGE_KEY = 'hatake_v2';

export function defaultField() {
  return {
    id: uid(),
    name: '畑1',
    gridCols: 8,
    gridRows: 6,
    plots: {},
  };
}

export function defaultState(): AppState {
  const field = defaultField();
  return {
    fields: [field],
    activeFieldId: field.id,
    crops: [],
    logs: [],
    events: [],
  };
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    return JSON.parse(raw) as AppState;
  } catch {
    return defaultState();
  }
}

export function saveState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
