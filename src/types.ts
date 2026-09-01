export interface GroupRecord {
  male?: number;
  female_prod?: number;
  female_nonprod?: number;
  ekor?: number;
  hidup?: number;
  karkas?: number;
  daging?: number;
}

export interface SlaughterRow {
  id?: string;
  date: string;
  month: string;
  table: string;
  species: string;
  ekor: number;
  hidup: number;
  karkas: number;
  daging: number;
  jeroan?: number;
  kulit_basah?: number;
  daging_skeletal?: number;
  daging_variasi?: number;
  produk_lainnya?: number;
  male: number;
  female_prod: number;
  female_nonprod: number;
  groups: Record<string, GroupRecord>;
  created_at?: string | null;
  updated_at?: string | null;
  created_by?: string | null;
}

export interface ExtraProduct {
  date: string;
  jeroan: number;
  kulit_basah: number;
  daging_skeletal: number;
  daging_variasi: number;
  produk_lainnya: number;
}

export interface DatabaseState {
  data: SlaughterRow[];
  extras?: ExtraProduct[];
  source?: string;
  period?: string;
  rph?: string;
  address?: string;
}

export interface UserSession {
  username: string;
  role: 'admin' | 'superadmin' | string;
  token?: string | null;
  loginAt: number;
  expiresAt: number;
  serverAuth?: boolean;
}

export interface AuditEntry {
  ts: string;
  user: string;
  role: string;
  action: string;
  detail: Record<string, any>;
}

export type CategoryFilter = 'Semua' | 'Ruminansia' | 'Babi';
export type MetricType = 'ekor' | 'hidup' | 'karkas' | 'daging';

export interface ToastMessage {
  id: string;
  text: string;
  type: 'ok' | 'err' | 'warn' | 'info';
}
