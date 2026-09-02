import { AuditEntry, SlaughterRow, UserSession } from '../types';

export const CONFIG = {
  APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbwbUGMUkM6wphxdZKcMGoLRYirTP9_hxyR6OO7hRqviMdZGBBBl2NyPraIw-uSe8XtS/exec',
  SESSION_HOURS: 8,
  SYNC_INTERVAL_MS: 15000,
  STORAGE_USER: 'SMART_RPH_CURRENT_USER',
  STORAGE_THEME: 'SMART_RPH_THEME',
  STORAGE_SIDEBAR: 'SMART_RPH_SIDEBAR_HIDDEN',
  STORAGE_AUDIT: 'SMART_RPH_AUDIT_LOG',
  MAX_AUDIT_LOCAL: 200,
  APP_VERSION: 'V17-Professional'
};

export const CAT_MAP: Record<string, string> = {
  Sapi: 'Ruminansia',
  Kerbau: 'Ruminansia',
  Domba: 'Ruminansia',
  Kambing: 'Ruminansia',
  Babi: 'Babi'
};

export const MONTH_NAMES = [
  'Semua',
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember'
];

export function fmt(n: number | undefined | null, d = 1): string {
  return Number(n || 0).toLocaleString('id-ID', { maximumFractionDigits: d });
}

export function pct(a: number | undefined | null, b: number | undefined | null): string {
  if (!b || b === 0) return '0%';
  return ((Number(a || 0) / Number(b)) * 100).toLocaleString('id-ID', { maximumFractionDigits: 1 }) + '%';
}

export function uid(): string {
  return 'r_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 9);
}

export function normalizeMonth(m: string | undefined): string {
  if (!m) return 'Januari';
  const k = String(m).trim().toLowerCase();
  const map: Record<string, string> = {
    '01': 'Januari', '1': 'Januari', 'jan.': 'Januari', jan: 'Januari', januari: 'Januari',
    '02': 'Februari', '2': 'Februari', 'feb.': 'Februari', feb: 'Februari', februari: 'Februari',
    '03': 'Maret', '3': 'Maret', 'mar.': 'Maret', mar: 'Maret', maret: 'Maret',
    '04': 'April', '4': 'April', apr: 'April', april: 'April',
    '05': 'Mei', '5': 'Mei', mei: 'Mei',
    '06': 'Juni', '6': 'Juni', jun: 'Juni', juni: 'Juni',
    '07': 'Juli', '7': 'Juli', jul: 'Juli', juli: 'Juli',
    '08': 'Agustus', '8': 'Agustus', 'agu.': 'Agustus', agu: 'Agustus', agustus: 'Agustus', agt: 'Agustus',
    '09': 'September', '9': 'September', 'sep.': 'September', sep: 'September', september: 'September',
    '10': 'Oktober', 'okt.': 'Oktober', okt: 'Oktober', oktober: 'Oktober',
    '11': 'November', 'nov.': 'November', nov: 'November', november: 'November',
    '12': 'Desember', 'des.': 'Desember', des: 'Desember', desember: 'Desember'
  };
  return map[k] || String(m).trim();
}

export function shortMonth(full: string): string {
  const map: Record<string, string> = {
    Januari: 'Jan',
    Februari: 'Feb',
    Maret: 'Mar',
    April: 'Apr',
    Mei: 'Mei',
    Juni: 'Jun',
    Juli: 'Jul',
    Agustus: 'Agu',
    September: 'Sep',
    Oktober: 'Okt',
    November: 'Nov',
    Desember: 'Des'
  };
  return map[full] || (full || '').substring(0, 3);
}

export function cleanGroups(groups: any): Record<string, any> {
  if (!groups) return {};
  if (typeof groups === 'string') {
    try { groups = JSON.parse(groups); } catch (e) { return {}; }
  }
  const cg: Record<string, any> = {};
  Object.entries(groups).forEach(([k, v]) => {
    if (!k || k.includes('…') || k.trim().startsWith('.') || !k.trim()) return;
    cg[k] = v;
  });
  return cg;
}

export function ensureRowMeta(r: any, idx?: number): SlaughterRow {
  let rowId = r.id;
  if (!rowId || !String(rowId).startsWith('r_')) {
    rowId = rowId && idx !== undefined ? `${rowId}_${idx}` : (rowId ? `${rowId}_${uid()}` : uid());
  }

  return {
    ...r,
    id: rowId,
    month: normalizeMonth(r.month || r.bulan),
    groups: cleanGroups(r.groups),
    created_at: r.created_at || null,
    updated_at: r.updated_at || null,
    created_by: r.created_by || null
  };
}

export function getSession(): UserSession | null {
  try {
    const u = JSON.parse(localStorage.getItem(CONFIG.STORAGE_USER) || 'null');
    if (!u || !u.username) return null;
    if (u.expiresAt && Date.now() > u.expiresAt) {
      localStorage.removeItem(CONFIG.STORAGE_USER);
      return null;
    }
    return u;
  } catch (e) {
    return null;
  }
}

export function setSession(user: Partial<UserSession>): UserSession {
  const payload: UserSession = {
    username: String(user.username),
    role: String(user.role || 'admin').toLowerCase(),
    token: user.token || null,
    loginAt: Date.now(),
    expiresAt: Date.now() + CONFIG.SESSION_HOURS * 60 * 60 * 1000,
    serverAuth: true
  };
  localStorage.setItem(CONFIG.STORAGE_USER, JSON.stringify(payload));
  return payload;
}

export function clearSession(): void {
  localStorage.removeItem(CONFIG.STORAGE_USER);
}

export function readAudit(): AuditEntry[] {
  try {
    return JSON.parse(localStorage.getItem(CONFIG.STORAGE_AUDIT) || '[]');
  } catch (e) {
    return [];
  }
}

export function pushAudit(action: string, detail: Record<string, any> = {}): AuditEntry {
  const u = getSession();
  const entry: AuditEntry = {
    ts: new Date().toISOString(),
    user: u ? u.username : 'anonymous',
    role: u ? u.role : '-',
    action,
    detail
  };
  const log = readAudit();
  log.unshift(entry);
  localStorage.setItem(CONFIG.STORAGE_AUDIT, JSON.stringify(log.slice(0, CONFIG.MAX_AUDIT_LOCAL)));
  apiPost({ action: 'auditLog', entry }).catch(() => {});
  return entry;
}

export function dataSignature(data: any): string {
  const raw = JSON.stringify(data);
  let h = 2166136261;
  for (let i = 0; i < raw.length; i++) {
    h ^= raw.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16);
}

export async function apiGet(action: string, params?: Record<string, string>): Promise<{ ok: boolean; json: any; text: string }> {
  const q = new URLSearchParams({ action, v: String(Date.now()), ...(params || {}) });
  const u = getSession();
  if (u && u.token) q.set('token', u.token);
  if (u && u.username) q.set('username', u.username);
  try {
    const res = await fetch(CONFIG.APPS_SCRIPT_URL + '?' + q.toString(), { mode: 'cors', cache: 'no-store' });
    const text = await res.text();
    let json = null;
    try { json = JSON.parse(text); } catch (e) {}
    return { ok: res.ok, json, text };
  } catch (err: any) {
    return { ok: false, json: null, text: err?.message || 'Fetch error' };
  }
}

export async function apiPost(body: Record<string, any>): Promise<{ ok: boolean; json: any; text: string }> {
  const u = getSession();
  const payload = {
    ...body,
    username: u ? u.username : null,
    role: u ? u.role : null,
    token: u ? u.token : null,
    clientVersion: CONFIG.APP_VERSION
  };
  try {
    const res = await fetch(CONFIG.APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });
    const text = await res.text();
    let json = null;
    try { json = JSON.parse(text); } catch (e) {}
    return { ok: res.ok, json, text };
  } catch (err: any) {
    return { ok: false, json: null, text: err?.message || 'Fetch error' };
  }
}
