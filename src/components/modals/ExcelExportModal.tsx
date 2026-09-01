import React, { useState } from 'react';
import { FileSpreadsheet, X, CheckSquare, Square, Download } from 'lucide-react';
import { MONTH_NAMES } from '../../services/api';

interface ExcelExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (months: string[]) => void;
}

export const ExcelExportModal: React.FC<ExcelExportModalProps> = ({
  isOpen,
  onClose,
  onExport,
}) => {
  const allMonths = MONTH_NAMES.slice(1);
  const [selectedMonths, setSelectedMonths] = useState<string[]>(allMonths);

  if (!isOpen) return null;

  const toggleMonth = (m: string) => {
    if (selectedMonths.includes(m)) {
      setSelectedMonths(selectedMonths.filter((x) => x !== m));
    } else {
      setSelectedMonths([...selectedMonths, m]);
    }
  };

  const handleSelectAll = (select: boolean) => {
    setSelectedMonths(select ? allMonths : []);
  };

  const handleDoExport = () => {
    if (selectedMonths.length === 0) {
      alert('Pilih minimal 1 bulan untuk diekspor');
      return;
    }
    onExport(selectedMonths);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#0F1115]/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#161920] border border-[#2D333F] rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 text-[#E2E8F0]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#2D333F]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#F1F5F9]">
                Ekspor Laporan Excel
              </h3>
              <p className="text-xs text-[#94A3B8]">
                Pilih periode bulan yang akan dimasukkan ke dalam workbook Excel
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#94A3B8] hover:text-[#F1F5F9] rounded-xl hover:bg-[#1A1D23] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selection buttons */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#CBD5E1]">
            Pilih Bulan ({selectedMonths.length} / {allMonths.length} dipilih)
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => handleSelectAll(true)}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 hover:underline"
            >
              Pilih Semua
            </button>
            <span className="text-[#2D333F]">•</span>
            <button
              onClick={() => handleSelectAll(false)}
              className="text-xs font-bold text-[#94A3B8] hover:text-[#CBD5E1] hover:underline"
            >
              Bersihkan
            </button>
          </div>
        </div>

        {/* Month grid checkboxes */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto p-1">
          {allMonths.map((m, idx) => {
            const isChecked = selectedMonths.includes(m);
            return (
              <button
                key={`${m}-${idx}`}
                type="button"
                onClick={() => toggleMonth(m)}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all text-left ${
                  isChecked
                    ? 'bg-emerald-950/50 border-emerald-700/80 text-emerald-200'
                    : 'bg-[#13161C] border-[#2D333F] text-[#94A3B8] hover:border-[#3D4556] hover:text-[#CBD5E1]'
                }`}
              >
                {isChecked ? (
                  <CheckSquare className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-[#64748B] flex-shrink-0" />
                )}
                <span className="truncate">{m}</span>
              </button>
            );
          })}
        </div>

        {/* Footer info & action */}
        <div className="p-3 rounded-xl bg-[#13161C] border border-[#2D333F] text-[11px] text-[#94A3B8] leading-relaxed">
          File yang dihasilkan mencakup sheet terpisah per bulan terpilih serta sheet rangkuman total & rendemen otomatis.
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDoExport}
            className="flex-1 py-3 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-950/50 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Unduh File Excel (.xlsx)</span>
          </button>
          <button
            onClick={onClose}
            className="py-3 px-4 rounded-xl text-xs font-bold border border-[#2D333F] bg-[#161920] hover:bg-[#1A1D23] text-[#CBD5E1] transition-colors"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
};
