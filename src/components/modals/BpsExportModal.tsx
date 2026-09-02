import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  X, 
  Download, 
  Printer, 
  Calendar, 
  FileSpreadsheet, 
  Check, 
  ChevronRight,
  Maximize2
} from 'lucide-react';
import { SlaughterRow } from '../../types';
import { MONTH_NAMES } from '../../services/api';
import { generateBpsTableData } from '../../utils/bpsFormatHelper';
import { BpsOfficialDocument, BpsOfficialSingleTable } from '../BpsOfficialSheet';

interface BpsExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  rows: SlaughterRow[];
  onExport: (months: string[]) => void;
}

export const BpsExportModal: React.FC<BpsExportModalProps> = ({
  isOpen,
  onClose,
  rows,
  onExport,
}) => {
  const allMonths = MONTH_NAMES.slice(1);
  const [activePreviewMonth, setActivePreviewMonth] = useState<string>('Januari');
  const [selectedMonths, setSelectedMonths] = useState<string[]>(['Januari']);
  const [activeTab, setActiveTab] = useState<'both' | 'sapi' | 'selain_sapi'>('both');

  // Menghitung data BPS resmi untuk bulan preview yang aktif
  const sapiData = useMemo(() => {
    return generateBpsTableData(rows, activePreviewMonth, 'SAPI', 2026);
  }, [rows, activePreviewMonth]);

  const selainSapiData = useMemo(() => {
    return generateBpsTableData(rows, activePreviewMonth, 'SELAIN SAPI', 2026);
  }, [rows, activePreviewMonth]);

  if (!isOpen) return null;

  const toggleMonth = (m: string) => {
    if (selectedMonths.includes(m)) {
      if (selectedMonths.length > 1) {
        setSelectedMonths(selectedMonths.filter((x) => x !== m));
      }
    } else {
      setSelectedMonths([...selectedMonths, m]);
    }
  };

  const handleSelectAll = (select: boolean) => {
    setSelectedMonths(select ? allMonths : ['Januari']);
  };

  const handleDoExport = () => {
    if (selectedMonths.length === 0) {
      alert('Pilih minimal 1 bulan untuk diekspor ke format resmi BPS');
      return;
    }
    onExport(selectedMonths);
  };

  const handlePrintBps = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#0F1115]/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-[#161920] border border-[#2D333F] rounded-2xl w-full max-w-7xl max-h-[95vh] flex flex-col shadow-2xl text-[#E2E8F0] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Header Bar Modal */}
        <div className="flex flex-wrap items-center justify-between px-6 py-4 border-b border-[#2D333F] bg-[#1A1D24] gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-[#F1F5F9]">
                  Format Resmi BPS (KPPT) — Kalender Pencatatan Pemotongan Ternak 2026
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  Resmi BPS RI
                </span>
              </div>
              <p className="text-xs text-[#94A3B8]">
                Lengkap 2 Tabel (Sapi & Selain Sapi) • KOP Resmi BPS • Header Kuning 30 Kolom • 31 Hari Data Riil • Baris Jumlah & Footer
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintBps}
              className="py-2 px-3.5 rounded-xl text-xs font-bold border border-[#2D333F] bg-[#13161C] hover:bg-[#1E232E] text-[#CBD5E1] hover:text-[#F1F5F9] transition-colors flex items-center gap-1.5 shadow-sm"
              title="Cetak Formulir Resmi BPS ke Printer / PDF"
            >
              <Printer className="w-4 h-4 text-sky-400" />
              <span>Cetak / PDF Resmi</span>
            </button>

            <button
              onClick={handleDoExport}
              className="py-2 px-4 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white transition-colors flex items-center gap-2 shadow-md shadow-sky-950/60"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Excel Resmi ({selectedMonths.length} Bulan)</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-[#94A3B8] hover:text-[#F1F5F9] rounded-xl hover:bg-[#1E232E] transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. Sub-Header: Month Selector & Tab Navigation */}
        <div className="px-6 py-3 border-b border-[#2D333F] bg-[#14171E] flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Month Pills for Preview */}
          <div className="flex items-center gap-2 overflow-x-auto py-1 max-w-full">
            <span className="font-bold text-[#94A3B8] flex items-center gap-1 text-[11px] flex-shrink-0">
              <Calendar className="w-3.5 h-3.5 text-sky-400" /> Pratinjau Bulan:
            </span>
            <div className="flex items-center gap-1.5">
              {allMonths.map((m) => {
                const isPreviewing = activePreviewMonth === m;
                const isIncludedInExport = selectedMonths.includes(m);
                return (
                  <button
                    key={m}
                    onClick={() => setActivePreviewMonth(m)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 text-xs ${
                      isPreviewing
                        ? 'bg-sky-500 text-white shadow-md shadow-sky-900/50'
                        : 'bg-[#1A1D24] text-[#94A3B8] hover:text-[#CBD5E1] hover:bg-[#222733] border border-[#2D333F]'
                    }`}
                  >
                    <span>{m}</span>
                    {isIncludedInExport && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* View Filter: Both / Sapi / Selain Sapi */}
          <div className="flex items-center gap-1 bg-[#1A1D24] p-1 rounded-xl border border-[#2D333F]">
            <button
              onClick={() => setActiveTab('both')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                activeTab === 'both'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                  : 'text-[#94A3B8] hover:text-[#CBD5E1]'
              }`}
            >
              Semua (2 Tabel)
            </button>
            <button
              onClick={() => setActiveTab('sapi')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                activeTab === 'sapi'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                  : 'text-[#94A3B8] hover:text-[#CBD5E1]'
              }`}
            >
              Hanya Sapi
            </button>
            <button
              onClick={() => setActiveTab('selain_sapi')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                activeTab === 'selain_sapi'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                  : 'text-[#94A3B8] hover:text-[#CBD5E1]'
              }`}
            >
              Hanya Selain Sapi
            </button>
          </div>
        </div>

        {/* 3. Main Preview Container (Identical to Official BPS Document) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#0B0D11] space-y-6">
          <div className="max-w-[1300px] mx-auto space-y-6">
            {/* Info bar */}
            <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-sky-950/40 border border-sky-800/40 text-xs text-sky-200">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
                <span>
                  Menampilkan Data Riil <strong>Bulan {activePreviewMonth.toUpperCase()} 2026</strong> — Terhubung langsung dengan database pemotongan UPT RPH Kota Cirebon.
                </span>
              </div>
              <span className="text-[11px] text-sky-400/80">
                Sesuai Lampiran Resmi BPS RI (Format KPPT)
              </span>
            </div>

            {/* Document Render */}
            {activeTab === 'both' && (
              <BpsOfficialDocument
                sapiData={sapiData}
                selainSapiData={selainSapiData}
              />
            )}

            {activeTab === 'sapi' && (
              <section className="shadow-sm rounded-lg overflow-hidden border border-gray-300 bg-white">
                <BpsOfficialSingleTable data={sapiData} />
              </section>
            )}

            {activeTab === 'selain_sapi' && (
              <section className="shadow-sm rounded-lg overflow-hidden border border-gray-300 bg-white">
                <BpsOfficialSingleTable data={selainSapiData} />
              </section>
            )}
          </div>
        </div>

        {/* 4. Bottom Multi-Month Selection Footer for Excel Export */}
        <div className="px-6 py-3 border-t border-[#2D333F] bg-[#1A1D24] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#CBD5E1]">
              Pilih Bulan untuk Ekspor Excel:
            </span>
            <div className="flex flex-wrap gap-1 max-w-xl">
              {allMonths.map((m) => {
                const isChecked = selectedMonths.includes(m);
                return (
                  <button
                    key={`export-m-${m}`}
                    onClick={() => toggleMonth(m)}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-bold border transition-colors ${
                      isChecked
                        ? 'bg-sky-500/20 border-sky-500/60 text-sky-200'
                        : 'bg-[#13161C] border-[#2D333F] text-[#64748B] hover:text-[#94A3B8]'
                    }`}
                  >
                    {m.slice(0, 3)}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => handleSelectAll(selectedMonths.length !== allMonths.length)}
              className="text-[11px] text-sky-400 hover:underline font-bold ml-2"
            >
              {selectedMonths.length === allMonths.length ? 'Pilih 1 Saja' : 'Pilih Semua'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="py-2 px-4 rounded-xl text-xs font-bold border border-[#2D333F] bg-[#161920] hover:bg-[#1E232E] text-[#CBD5E1] transition-colors"
            >
              Tutup
            </button>
            <button
              onClick={handleDoExport}
              className="py-2 px-4 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white transition-colors flex items-center gap-2 shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Ekspor {selectedMonths.length} Bulan (.xlsx)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
