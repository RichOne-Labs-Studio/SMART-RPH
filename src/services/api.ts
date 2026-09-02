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

export function getMonthFromDate(d: string | undefined): string {
  if (!d) return 'Januari';
  const parts = String(d).split('-');
  if (parts.length >= 2) {
    const m = parseInt(parts[1], 10);
    const names = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    if (m >= 1 && m <= 12) return names[m - 1];
  }
  return 'Januari';
}

export function normalizeMonth(m: string | undefined, fallbackDate?: string): string {
  if (!m && fallbackDate) return getMonthFromDate(fallbackDate);
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
  return map[k] || (fallbackDate ? getMonthFromDate(fallbackDate) : String(m).trim());
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
  if (!rowId || String(rowId).trim() === '') {
    rowId = r.date && r.species ? `${r.date}|${r.species}` : (idx !== undefined ? `r_${idx}_${uid()}` : uid());
  }

  const rDate = r.date || new Date().toISOString().split('T')[0];
  return {
    ...r,
    id: String(rowId),
    date: rDate,
    month: normalizeMonth(r.month || r.bulan, rDate),
    species: r.species || 'Sapi',
    table: r.table || (r.species === 'Sapi' ? 'Sapi' : 'Selain Sapi'),
    ekor: Number(r.ekor) || 0,
    hidup: Number(r.hidup) || 0,
    karkas: Number(r.karkas) || 0,
    daging: Number(r.daging) || 0,
    jeroan: Number(r.jeroan) || 0,
    kulit_basah: Number(r.kulit_basah) || 0,
    daging_skeletal: Number(r.daging_skeletal) || 0,
    daging_variasi: Number(r.daging_variasi) || 0,
    produk_lainnya: Number(r.produk_lainnya) || 0,
    male: Number(r.male) || 0,
    female_prod: Number(r.female_prod) || 0,
    female_nonprod: Number(r.female_nonprod) || 0,
    groups: cleanGroups(r.groups),
    created_at: r.created_at || null,
    updated_at: r.updated_at || null,
    created_by: r.created_by || null
  };
}

export const STORAGE_USERS_CACHE = 'SMART_RPH_USERS_CACHE';

export function getCachedUsers(): Array<{ username: string; role: string; pass?: string }> {
  try {
    const raw = localStorage.getItem(STORAGE_USERS_CACHE);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const valid = parsed.filter(
          (u: any) =>
            u &&
            typeof u.username === 'string' &&
            u.username.trim().length > 0 &&
            u.username.trim().toLowerCase() !== 'eris'
        );
        if (valid.length > 0) return valid;
      }
    }
  } catch {}
  return [
    { username: 'superadmin', role: 'superadmin' },
    { username: 'admin', role: 'admin' },
    { username: 'petugas', role: 'petugas' }
  ];
}

export function saveCachedUsers(users: Array<{ username: string; role: string; pass?: string }>): void {
  try {
    const clean = users.filter(
      (u: any) =>
        u &&
        typeof u.username === 'string' &&
        u.username.trim().length > 0 &&
        u.username.trim().toLowerCase() !== 'eris'
    );
    localStorage.setItem(STORAGE_USERS_CACHE, JSON.stringify(clean));
  } catch {}
}

export async function fetchSpreadsheetUsers(): Promise<Array<{ username: string; role: string }>> {
  try {
    const u = getSession();
    const token = u?.token && !u.token.startsWith('local_') ? u.token : '';

    if (token) {
      const res = await fetch(
        CONFIG.APPS_SCRIPT_URL +
          '?action=getUsers&token=' +
          encodeURIComponent(token) +
          '&v=' +
          Date.now(),
        { cache: 'no-store' }
      );
      const usersData = await res.json();
      if (usersData && Array.isArray(usersData.users) && usersData.users.length > 0) {
        const cleanUsers = usersData.users
          .filter((usr: any) => usr && typeof usr.username === 'string' && usr.username.trim().length > 0)
          .map((usr: any) => ({
            username: usr.username.trim(),
            role: String(usr.role || 'petugas').toLowerCase()
          }));
        if (cleanUsers.length > 0) {
          saveCachedUsers(cleanUsers);
          return cleanUsers;
        }
      }
    }
  } catch (err) {
    console.warn('Gagal mengambil daftar pengguna dari Spreadsheet:', err);
  }
  return getCachedUsers();
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
  if (u && u.token && !q.has('token')) q.set('token', u.token);
  if (u && u.username && !q.has('username')) q.set('username', u.username);
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000);

  try {
    const res = await fetch(CONFIG.APPS_SCRIPT_URL + '?' + q.toString(), { 
      mode: 'cors', 
      cache: 'no-store',
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    const text = await res.text();
    let json = null;
    try { json = JSON.parse(text); } catch (e) {}
    return { ok: res.ok, json, text };
  } catch (err: any) {
    clearTimeout(timeoutId);
    return { ok: false, json: null, text: err?.message || 'Fetch error' };
  }
}

// Helper to verify if session has a valid server token
export async function ensureServerToken(): Promise<string | null> {
  const u = getSession();
  if (u && u.token && !u.token.startsWith('local_')) {
    return u.token;
  }
  return null;
}

export async function apiPost(body: Record<string, any>): Promise<{ ok: boolean; json: any; text: string }> {
  // Jika action adalah login, kirim kredensial bersih langsung ke GAS tanpa token lama
  if (body.action === 'login') {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);
    try {
      const cleanLoginPayload = {
        clientVersion: CONFIG.APP_VERSION,
        action: 'login',
        username: String(body.username || '').trim(),
        password: String(body.password || '').trim()
      };
      const res = await fetch(CONFIG.APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(cleanLoginPayload),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      const text = await res.text();
      let json = null;
      try { json = JSON.parse(text); } catch (e) {}
      return { ok: res.ok, json, text };
    } catch (err: any) {
      clearTimeout(timeoutId);
      return { ok: false, json: null, text: err?.message || 'Fetch error' };
    }
  }

  const u = getSession();

  // Cleanly merge authentication token & caller without clobbering payload keys
  const payload: Record<string, any> = {
    clientVersion: CONFIG.APP_VERSION,
    token: u?.token && !u.token.startsWith('local_') ? u.token : null,
    caller_username: u?.username || null,
    caller_role: u?.role || null,
    ...body
  };

  // If payload does not have a username specified by the action, default to current logged in user
  if (!payload.username && u?.username) {
    payload.username = u.username;
  }
  if (!payload.role && u?.role) {
    payload.role = u.role;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000);

  try {
    const res = await fetch(CONFIG.APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    const text = await res.text();
    let json = null;
    try { json = JSON.parse(text); } catch (e) {}

    return { ok: res.ok, json, text };
  } catch (err: any) {
    clearTimeout(timeoutId);
    return { ok: false, json: null, text: err?.message || 'Fetch error' };
  }
}
