import React from 'react';
import { History, X, ShieldAlert, CheckCircle } from 'lucide-react';
import { AuditEntry } from '../../types';
import { readAudit } from '../../services/api';

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const logs: AuditEntry[] = readAudit();

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'login':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/70 text-emerald-300 border border-emerald-800/60">Login</span>;
      case 'logout':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#13161C] text-[#CBD5E1] border border-[#2D333F]">Logout</span>;
      case 'addRow':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-950/70 text-blue-300 border border-blue-800/60">Tambah Data</span>;
      case 'updateRow':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/70 text-amber-300 border border-amber-800/60">Ubah Data</span>;
      case 'deleteRow':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950/70 text-rose-300 border border-rose-800/60">Hapus Data</span>;
      case 'exportExcel':
      case 'exportBPS':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-950/70 text-purple-300 border border-purple-800/60">Ekspor</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#13161C] text-[#CBD5E1] border border-[#2D333F]">{action}</span>;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#0F1115]/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#161920] border border-[#2D333F] rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 text-[#E2E8F0]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#2D333F]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#F1F5F9]">
                Riwayat Aktivitas & Audit Log
              </h3>
              <p className="text-xs text-[#94A3B8]">
                Catatan integritas transaksi data pemotongan ternak
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

        {/* Log List */}
        <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
          {logs.length > 0 ? (
            logs.map((e, idx) => {
              const dateStr = new Date(e.ts).toLocaleString('id-ID', {
                dateStyle: 'medium',
                timeStyle: 'medium',
              });
              return (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-[#13161C] border border-[#2D333F] space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getActionBadge(e.action)}
                      <span className="font-bold text-[#E2E8F0]">
                        Oleh: {e.user} ({e.role})
                      </span>
                    </div>
                    <span className="text-[10px] text-[#64748B] font-medium">
                      {dateStr}
                    </span>
                  </div>

                  {e.detail && Object.keys(e.detail).length > 0 && (
                    <div className="text-[11px] text-[#94A3B8] font-mono bg-[#161920] p-2 rounded-xl border border-[#2D333F] break-all">
                      {JSON.stringify(e.detail)}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-10 text-xs text-[#64748B]">
              Belum ada riwayat aktivitas tercatat di perangkat ini.
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-[#1A1D23] hover:bg-[#242832] border border-[#2D333F] text-[#F1F5F9] transition-colors"
        >
          Tutup Audit Log
        </button>
      </div>
    </div>
  );
};
