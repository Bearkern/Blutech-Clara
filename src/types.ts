export interface FlatMeterNode {
  id: number;
  name: string;
  parent_id: number | null;
}

export interface MeterNode extends FlatMeterNode {
  children: MeterNode[];
  isExpanded?: boolean;
}

export interface FlatOption {
  id: number;
  name: string;
  level: number;
}

export interface ApiError {
  error?: string
  success?: boolean
  [key: string]: any
}