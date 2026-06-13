import type { AppState, Field, Crop, Log, HatakeEvent, PlotData } from '../types';

export type Action =
  // Field
  | { type: 'FIELD_ADD'; field: Field }
  | { type: 'FIELD_UPDATE'; field: Field }
  | { type: 'FIELD_DELETE'; id: string }
  | { type: 'FIELD_SET_ACTIVE'; id: string }
  | { type: 'FIELD_RESIZE'; id: string; cols: number; rows: number }
  // Plot
  | { type: 'PLOT_SET'; fieldId: string; key: string; data: PlotData }
  | { type: 'PLOT_CLEAR'; fieldId: string; key: string }
  // Crop
  | { type: 'CROP_ADD'; crop: Crop }
  | { type: 'CROP_UPDATE'; crop: Crop }
  | { type: 'CROP_DELETE'; id: string }
  // Log
  | { type: 'LOG_ADD'; log: Log }
  | { type: 'LOG_UPDATE'; log: Log }
  | { type: 'LOG_DELETE'; id: string }
  // Event
  | { type: 'EVENT_ADD'; event: HatakeEvent }
  | { type: 'EVENT_UPDATE'; event: HatakeEvent }
  | { type: 'EVENT_DELETE'; id: string }
  // Import
  | { type: 'IMPORT'; state: AppState };

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'FIELD_ADD':
      return { ...state, fields: [...state.fields, action.field], activeFieldId: action.field.id };

    case 'FIELD_UPDATE':
      return {
        ...state,
        fields: state.fields.map((f) => (f.id === action.field.id ? action.field : f)),
      };

    case 'FIELD_DELETE': {
      const remaining = state.fields.filter((f) => f.id !== action.id);
      const newActive =
        state.activeFieldId === action.id ? (remaining[0]?.id ?? '') : state.activeFieldId;
      return {
        ...state,
        fields: remaining,
        activeFieldId: newActive,
        crops: state.crops.filter((c) => c.fieldId !== action.id),
        logs: state.logs.filter((l) => l.fieldId !== action.id),
        events: state.events.filter((e) => e.fieldId !== action.id),
      };
    }

    case 'FIELD_SET_ACTIVE':
      return { ...state, activeFieldId: action.id };

    case 'FIELD_RESIZE': {
      const fields = state.fields.map((f) => {
        if (f.id !== action.id) return f;
        const plots: Record<string, PlotData> = {};
        Object.entries(f.plots).forEach(([key, data]) => {
          const [r, c] = key.split('-').map(Number);
          if (r < action.rows && c < action.cols) plots[key] = data;
        });
        return { ...f, gridCols: action.cols, gridRows: action.rows, plots };
      });
      return { ...state, fields };
    }

    case 'PLOT_SET': {
      const fields = state.fields.map((f) => {
        if (f.id !== action.fieldId) return f;
        return { ...f, plots: { ...f.plots, [action.key]: action.data } };
      });
      return { ...state, fields };
    }

    case 'PLOT_CLEAR': {
      const fields = state.fields.map((f) => {
        if (f.id !== action.fieldId) return f;
        const plots = { ...f.plots };
        delete plots[action.key];
        return { ...f, plots };
      });
      return { ...state, fields };
    }

    case 'CROP_ADD':
      return { ...state, crops: [...state.crops, action.crop] };

    case 'CROP_UPDATE':
      return {
        ...state,
        crops: state.crops.map((c) => (c.id === action.crop.id ? action.crop : c)),
      };

    case 'CROP_DELETE': {
      // Remove crop, its logs, events, and plot assignments
      const fields = state.fields.map((f) => {
        const plots = { ...f.plots };
        Object.keys(plots).forEach((key) => {
          if (plots[key].cropId === action.id) delete plots[key];
        });
        return { ...f, plots };
      });
      return {
        ...state,
        fields,
        crops: state.crops.filter((c) => c.id !== action.id),
        logs: state.logs.map((l) =>
          l.cropId === action.id ? { ...l, cropId: undefined } : l
        ),
        events: state.events.map((e) =>
          e.cropId === action.id ? { ...e, cropId: undefined } : e
        ),
      };
    }

    case 'LOG_ADD':
      return { ...state, logs: [...state.logs, action.log] };

    case 'LOG_UPDATE':
      return {
        ...state,
        logs: state.logs.map((l) => (l.id === action.log.id ? action.log : l)),
      };

    case 'LOG_DELETE':
      return { ...state, logs: state.logs.filter((l) => l.id !== action.id) };

    case 'EVENT_ADD':
      return { ...state, events: [...state.events, action.event] };

    case 'EVENT_UPDATE':
      return {
        ...state,
        events: state.events.map((e) => (e.id === action.event.id ? action.event : e)),
      };

    case 'EVENT_DELETE':
      return { ...state, events: state.events.filter((e) => e.id !== action.id) };

    case 'IMPORT':
      return action.state;

    default:
      return state;
  }
}
