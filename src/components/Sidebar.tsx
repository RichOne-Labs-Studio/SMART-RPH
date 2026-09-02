import React from 'react';
import { CategoryFilter, MetricType, UserSession } from '../types';
import { MONTH_NAMES } from '../services/api';
import { 
  Filter, 
  RotateCcw, 
  FileSpreadsheet, 
  BarChart3, 
  Printer, 
  PlusCircle, 
  Users, 
  History, 
  Search,
  Check,
  LogIn,
  LogOut,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  category: CategoryFilter;
  onSetCategory: (cat: CategoryFilter) => void;
  selectedMonth: string;
  onSetMonth: (m: string) => void;
  selectedSpecies: string;
  onSetSpecies: (s: string) => void;
  availableSpecies: string[];
  selectedMetric: MetricType;
  onSetMetric: (m: MetricType) => void;
  searchQuery: string;
  onSetSearchQuery: (q: string) => void;
  onResetFilters: () => void;
  onExportExcel: () => void;
  onExportBps: () => void;
  onPrint: () => void;
  onSync?: () => void;
  syncStatus?: { text: string; ok: boolean };
  user: UserSession | null;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenInput: () => void;
  onOpenAdmin: () => void;
  onOpenAudit: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  category,
  onSetCategory,
  selectedMonth,
  onSetMonth,
  selectedSpecies,
  onSetSpecies,
  availableSpecies,
  selectedMetric,
  onSetMetric,
  searchQuery,
  onSetSearchQuery,
  onResetFilters,
  onExportExcel,
  onExportBps,
  onPrint,
  user,
  onOpenLogin,
  onLogout,
  onOpenInput,
  onOpenAdmin,
  onOpenAudit,
}) => {
  if (!isOpen) return null;

  return (
    <aside
      id="sidebar-container"
      className="w-full lg:w-72 xl:w-80 flex-shrink-0 bg-[#161920] border-r border-[#2D333F] p-4 sm:p-5 space-y-5 lg:sticky lg:top-18 lg:h-[calc(100vh-4.5rem)] overflow-y-auto"
    >
      {/* 1. User & Admin Access Panel */}
      {user ? (
        <div className="p-3.5 rounded-2xl bg-indigo-950/20 border border-indigo-900/40 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <UserCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-extrabold text-[#F1F5F9] block truncate">
                  {user.username}
                </span>
                <span className="text-[10px] uppercase font-bold text-indigo-300">
                  Peran: {user.role}
                </span>
              </div>
            </div>
            <button
              id="btn-sidebar-logout"
              onClick={onLogout}
              className="p-1.5 rounded-lg text-[#94A3B8] hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
              title="Keluar / Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1.5 pt-1">
            <button
              id="btn-sidebar-input"
              onClick={onOpenInput}
              className="w-full py-2.5 px-3 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center justify-center gap-2 shadow-sm shadow-emerald-950/50"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Input Data Potong Baru</span>
            </button>

            {user.role === 'superadmin' && (
              <button
                id="btn-sidebar-admin-manage"
                onClick={onOpenAdmin}
                className="w-full py-2 px-3 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center justify-center gap-2 shadow-sm shadow-indigo-950/50"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Kelola Akun Petugas</span>
              </button>
            )}

            <button
              id="btn-sidebar-audit"
              onClick={onOpenAudit}
              className="w-full py-2 px-3 text-xs font-bold rounded-xl border border-[#2D333F] bg-[#161920] hover:bg-[#1A1D23] text-[#CBD5E1] transition-colors flex items-center justify-center gap-1.5"
            >
              <History className="w-3.5 h-3.5 text-[#94A3B8]" />
              <span>Riwayat Aktivitas (Audit)</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="p-3.5 rounded-2xl bg-[#13161C] border border-[#2D333F] space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-extrabold text-[#F1F5F9] block">
                Akses Petugas & Admin
              </span>
              <span className="text-[10px] text-[#94A3B8]">
                Kelola data & administrasi RPH
              </span>
            </div>
          </div>

          <button
            id="btn-sidebar-login"
            onClick={onOpenLogin}
            className="w-full py-2.5 px-3 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all flex items-center justify-center gap-2 shadow-sm shadow-emerald-950/50"
          >
            <LogIn className="w-4 h-4" />
            <span>Login Petugas / Admin</span>
          </button>
        </div>
      )}

      {/* 3. Category Segment */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#94A3B8]">
            Kategori Komoditas
          </span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#1A1D23] text-[#94A3B8] border border-[#2D333F]">
            {category}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#13161C] rounded-xl border border-[#2D333F]">
          {(['Semua', 'Ruminansia', 'Babi'] as CategoryFilter[]).map((cat) => {
            const isActive = category === cat;
            return (
              <button
                key={cat}
                id={`cat-btn-${cat.toLowerCase()}`}
                onClick={() => onSetCategory(cat)}
                className={`py-2 px-2 text-xs font-bold rounded-lg transition-all text-center flex items-center justify-center gap-1 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-950/50'
                    : 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#1A1D23]'
                }`}
              >
                {isActive && <Check className="w-3 h-3 stroke-[3]" />}
                <span>{cat}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Filter Controls */}
      <div className="space-y-3.5 pt-1">
        <div className="flex items-center gap-1.5 pb-1 border-b border-[#2D333F]">
          <Filter className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#94A3B8]">
            Parameter Filter
          </span>
        </div>

        {/* Periode filter */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#CBD5E1]">
            Periode Bulan
          </label>
          <select
            id="select-month"
            value={selectedMonth}
            onChange={(e) => onSetMonth(e.target.value)}
            className="w-full bg-[#13161C] border border-[#2D333F] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#F1F5F9] focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 focus:outline-none transition-all cursor-pointer"
          >
            {MONTH_NAMES.map((m) => (
              <option key={m} value={m} className="bg-[#161920] text-[#F1F5F9]">
                {m === 'Semua' ? '📅 Semua Periode (Jan–Des 2026)' : `Bulan ${m} 2026`}
              </option>
            ))}
          </select>
        </div>

        {/* Species filter */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#CBD5E1]">
            Jenis Ternak
          </label>
          <select
            id="select-species"
            value={selectedSpecies}
            onChange={(e) => onSetSpecies(e.target.value)}
            disabled={category === 'Babi' && availableSpecies.length <= 1}
            className="w-full bg-[#13161C] border border-[#2D333F] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#F1F5F9] focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 focus:outline-none transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {category !== 'Babi' && <option value="Semua" className="bg-[#161920] text-[#F1F5F9]">Semua Jenis Ternak</option>}
            {availableSpecies.map((s) => (
              <option key={s} value={s} className="bg-[#161920] text-[#F1F5F9]">
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Metric Switcher */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#CBD5E1]">
            Fokus Metrik Grafik
          </label>
          <select
            id="select-metric"
            value={selectedMetric}
            onChange={(e) => onSetMetric(e.target.value as MetricType)}
            className="w-full bg-[#13161C] border border-[#2D333F] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#F1F5F9] focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 focus:outline-none transition-all cursor-pointer"
          >
            <option value="ekor" className="bg-[#161920] text-[#F1F5F9]">Jumlah Pemotongan (Ekor)</option>
            <option value="hidup" className="bg-[#161920] text-[#F1F5F9]">Total Berat Hidup (Kg)</option>
            <option value="karkas" className="bg-[#161920] text-[#F1F5F9]">Total Berat Karkas (Kg)</option>
            <option value="daging" className="bg-[#161920] text-[#F1F5F9]">Estimasi Daging Bersih (Kg)</option>
          </select>
        </div>

        {/* Table search filter */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#CBD5E1]">
            Pencarian Cepat
          </label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <input
              id="input-search"
              type="text"
              value={searchQuery}
              onChange={(e) => onSetSearchQuery(e.target.value)}
              placeholder="Cari tanggal atau jenis ternak..."
              className="w-full pl-9 pr-3.5 py-2.5 bg-[#13161C] border border-[#2D333F] rounded-xl text-xs font-medium text-[#F1F5F9] placeholder:text-[#64748B] focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Reset button */}
        <button
          id="btn-reset-filters"
          onClick={onResetFilters}
          className="w-full py-2 px-3 text-xs font-bold rounded-xl border border-[#2D333F] bg-[#161920] hover:bg-[#1A1D23] text-[#CBD5E1] hover:text-[#F1F5F9] transition-colors flex items-center justify-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#94A3B8]" />
          <span>Reset Semua Filter</span>
        </button>
      </div>

      {/* 5. Export & Tools Section */}
      <div className="space-y-2.5 pt-2 border-t border-[#2D333F]">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#94A3B8] block mb-1">
          Ekspor & Pelaporan
        </span>

        <button
          id="btn-export-excel"
          onClick={onExportExcel}
          className="w-full py-2.5 px-3.5 text-xs font-bold rounded-xl bg-[#13221C] hover:bg-[#182C24] text-emerald-300 border border-emerald-800/60 transition-colors flex items-center justify-center gap-2"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <span>Ekspor Excel (Multi-Bulan)</span>
        </button>

        <button
          id="btn-export-bps"
          onClick={onExportBps}
          className="w-full py-2.5 px-3.5 text-xs font-bold rounded-xl bg-[#141C2B] hover:bg-[#1A2538] text-sky-300 border border-sky-800/60 transition-colors flex items-center justify-center gap-2"
        >
          <BarChart3 className="w-4 h-4 text-sky-400" />
          <span>Format Resmi BPS (KOP Lengkap)</span>
        </button>

        <button
          id="btn-print-report"
          onClick={onPrint}
          className="w-full py-2 px-3 text-xs font-bold rounded-xl border border-[#2D333F] bg-[#161920] hover:bg-[#1A1D23] text-[#CBD5E1] transition-colors flex items-center justify-center gap-1.5"
        >
          <Printer className="w-3.5 h-3.5 text-[#94A3B8]" />
          <span>Cetak PDF / Laporan</span>
        </button>
      </div>
    </aside>
  );
};

