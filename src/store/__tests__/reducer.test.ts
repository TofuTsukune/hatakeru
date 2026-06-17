import { describe, it, expect } from 'vitest';
import { reducer } from '../reducer';
import type { AppState, Field, Crop, Log, HatakeEvent } from '../../types';

// ---- helpers ----

function makeField(overrides?: Partial<Field>): Field {
  return { id: 'f1', name: '畑1', gridCols: 4, gridRows: 3, plots: {}, ...overrides };
}

function makeCrop(overrides?: Partial<Crop>): Crop {
  return {
    id: 'c1', fieldId: 'f1', name: 'トマト', variety: '', status: 'growing', color: '#e53e3e', notes: '',
    ...overrides,
  };
}

function makeLog(overrides?: Partial<Log>): Log {
  return { id: 'l1', fieldId: 'f1', date: '2026-06-01', type: 'water', notes: '', ...overrides };
}

function makeEvent(overrides?: Partial<HatakeEvent>): HatakeEvent {
  return { id: 'e1', fieldId: 'f1', date: '2026-06-10', title: '施肥', type: 'fertilize', done: false, ...overrides };
}

function baseState(overrides?: Partial<AppState>): AppState {
  return {
    fields: [makeField()],
    activeFieldId: 'f1',
    crops: [],
    logs: [],
    events: [],
    ...overrides,
  };
}

// ---- Field ----

describe('FIELD_ADD', () => {
  it('畑を追加してアクティブにする', () => {
    const newField = makeField({ id: 'f2', name: '畑2' });
    const next = reducer(baseState(), { type: 'FIELD_ADD', field: newField });
    expect(next.fields).toHaveLength(2);
    expect(next.activeFieldId).toBe('f2');
  });
});

describe('FIELD_UPDATE', () => {
  it('名前を更新する', () => {
    const updated = makeField({ name: '新畑' });
    const next = reducer(baseState(), { type: 'FIELD_UPDATE', field: updated });
    expect(next.fields[0].name).toBe('新畑');
    expect(next.fields).toHaveLength(1);
  });
});

describe('FIELD_DELETE', () => {
  it('畑と関連データをまとめて削除する', () => {
    const f2 = makeField({ id: 'f2', name: '畑2' });
    const state = baseState({
      fields: [makeField(), f2],
      activeFieldId: 'f1',
      crops: [makeCrop({ fieldId: 'f1' }), makeCrop({ id: 'c2', fieldId: 'f2' })],
      logs: [makeLog({ fieldId: 'f1' }), makeLog({ id: 'l2', fieldId: 'f2' })],
      events: [makeEvent({ fieldId: 'f1' }), makeEvent({ id: 'e2', fieldId: 'f2' })],
    });
    const next = reducer(state, { type: 'FIELD_DELETE', id: 'f1' });
    expect(next.fields).toHaveLength(1);
    expect(next.activeFieldId).toBe('f2');
    expect(next.crops).toHaveLength(1);
    expect(next.crops[0].fieldId).toBe('f2');
    expect(next.logs).toHaveLength(1);
    expect(next.events).toHaveLength(1);
  });

  it('削除後に残る畑がなければ activeFieldId が空になる', () => {
    const next = reducer(baseState(), { type: 'FIELD_DELETE', id: 'f1' });
    expect(next.fields).toHaveLength(0);
    expect(next.activeFieldId).toBe('');
  });
});

describe('FIELD_RESIZE', () => {
  it('グリッドを縮小すると範囲外の区画が削除される', () => {
    const field = makeField({
      gridCols: 4, gridRows: 4,
      plots: {
        '0-0': { cropId: 'c1', plantedDate: '2026-01-01', expectedHarvest: '2026-06-01' },
        '3-3': { cropId: 'c1', plantedDate: '2026-01-01', expectedHarvest: '2026-06-01' },
      },
    });
    const next = reducer(baseState({ fields: [field] }), {
      type: 'FIELD_RESIZE', id: 'f1', cols: 2, rows: 2,
    });
    expect(next.fields[0].plots).toHaveProperty('0-0');
    expect(next.fields[0].plots).not.toHaveProperty('3-3');
  });
});

// ---- Plot ----

describe('PLOT_SET / PLOT_CLEAR', () => {
  it('区画にデータをセットできる', () => {
    const data = { cropId: 'c1', plantedDate: '2026-04-01', expectedHarvest: '2026-07-01' };
    const next = reducer(baseState(), { type: 'PLOT_SET', fieldId: 'f1', key: '1-2', data });
    expect(next.fields[0].plots['1-2']).toEqual(data);
  });

  it('区画をクリアできる', () => {
    const data = { cropId: 'c1', plantedDate: '2026-04-01', expectedHarvest: '2026-07-01' };
    const state = baseState({ fields: [makeField({ plots: { '1-2': data } })] });
    const next = reducer(state, { type: 'PLOT_CLEAR', fieldId: 'f1', key: '1-2' });
    expect(next.fields[0].plots).not.toHaveProperty('1-2');
  });
});

// ---- Crop ----

describe('CROP_ADD', () => {
  it('作物を追加できる', () => {
    const next = reducer(baseState(), { type: 'CROP_ADD', crop: makeCrop() });
    expect(next.crops).toHaveLength(1);
    expect(next.crops[0].name).toBe('トマト');
  });
});

describe('CROP_UPDATE', () => {
  it('作物名を更新できる', () => {
    const state = baseState({ crops: [makeCrop()] });
    const next = reducer(state, { type: 'CROP_UPDATE', crop: makeCrop({ name: 'ミニトマト' }) });
    expect(next.crops[0].name).toBe('ミニトマト');
  });
});

describe('CROP_DELETE', () => {
  it('作物・関連ログのcropId・区画をまとめてクリアする', () => {
    const plot = { cropId: 'c1', plantedDate: '2026-04-01', expectedHarvest: '2026-07-01' };
    const state = baseState({
      fields: [makeField({ plots: { '0-0': plot } })],
      crops: [makeCrop()],
      logs: [makeLog({ cropId: 'c1' })],
      events: [makeEvent({ cropId: 'c1' })],
    });
    const next = reducer(state, { type: 'CROP_DELETE', id: 'c1' });
    expect(next.crops).toHaveLength(0);
    expect(next.fields[0].plots).not.toHaveProperty('0-0');
    expect(next.logs[0].cropId).toBeUndefined();
    expect(next.events[0].cropId).toBeUndefined();
  });
});

// ---- Log ----

describe('LOG_ADD / LOG_UPDATE / LOG_DELETE', () => {
  it('ログを追加できる', () => {
    const next = reducer(baseState(), { type: 'LOG_ADD', log: makeLog() });
    expect(next.logs).toHaveLength(1);
  });

  it('ログを更新できる', () => {
    const state = baseState({ logs: [makeLog()] });
    const next = reducer(state, { type: 'LOG_UPDATE', log: makeLog({ notes: '追記' }) });
    expect(next.logs[0].notes).toBe('追記');
  });

  it('ログを削除できる', () => {
    const state = baseState({ logs: [makeLog()] });
    const next = reducer(state, { type: 'LOG_DELETE', id: 'l1' });
    expect(next.logs).toHaveLength(0);
  });
});

// ---- Event ----

describe('EVENT_ADD / EVENT_UPDATE / EVENT_DELETE', () => {
  it('イベントを追加できる', () => {
    const next = reducer(baseState(), { type: 'EVENT_ADD', event: makeEvent() });
    expect(next.events).toHaveLength(1);
  });

  it('イベントを更新できる', () => {
    const state = baseState({ events: [makeEvent()] });
    const next = reducer(state, { type: 'EVENT_UPDATE', event: makeEvent({ done: true }) });
    expect(next.events[0].done).toBe(true);
  });

  it('イベントを削除できる', () => {
    const state = baseState({ events: [makeEvent()] });
    const next = reducer(state, { type: 'EVENT_DELETE', id: 'e1' });
    expect(next.events).toHaveLength(0);
  });
});

// ---- Import ----

describe('IMPORT', () => {
  it('状態を丸ごと置き換える', () => {
    const imported = baseState({ activeFieldId: 'f99', fields: [makeField({ id: 'f99' })] });
    const next = reducer(baseState(), { type: 'IMPORT', state: imported });
    expect(next.activeFieldId).toBe('f99');
  });
});
