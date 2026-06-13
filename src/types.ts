export interface PlotData {
  cropId: string;
  plantedDate: string;
  expectedHarvest: string;
}

export interface Field {
  id: string;
  name: string;
  gridCols: number;
  gridRows: number;
  plots: Record<string, PlotData>;
}

export type CropStatus = 'planned' | 'growing' | 'harvested';

export interface Crop {
  id: string;
  fieldId: string;
  name: string;
  variety: string;
  status: CropStatus;
  color: string;
  notes: string;
}

export type LogType = 'water' | 'fertilize' | 'harvest' | 'weed' | 'plant' | 'other';

export interface Log {
  id: string;
  fieldId: string;
  date: string;
  type: LogType;
  cropId?: string;
  notes: string;
  harvestAmount?: number;
  harvestUnit?: string;
  cost?: number;
}

export interface HatakeEvent {
  id: string;
  fieldId: string;
  date: string;
  title: string;
  type: string;
  cropId?: string;
  done: boolean;
}

export interface Photo {
  id: string;
  fieldId: string;
  date: string;
  dataUrl: string;
  cropId?: string;
  plotKey?: string;
  logId?: string;
  notes: string;
}

export interface AppState {
  fields: Field[];
  activeFieldId: string;
  crops: Crop[];
  logs: Log[];
  events: HatakeEvent[];
}

export type Tab = 'map' | 'crops' | 'logs' | 'calendar' | 'photos';
