import React from 'react';
import { SlaughterRow } from '../../types';
import { fmt, pct } from '../../services/api';
import { X, Calendar, Scale, Layers, Beef, Package } from 'lucide-react';

interface DayDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  species?: string;
  rows: SlaughterRow[];
}

export const DayDetailModal: React.FC<DayDetailModalProps> = ({
  isOpen,
  onClose,
  date,
  species,
  rows,
}) => {
  if (!isOpen) return null;

  const targetRows = rows.filter(
    (r) => r.date === date && (!species || r.species === species)
  );

  const total = targetRows.reduce(
    (acc, r) => ({
      ekor: acc.ekor + Number(r.ekor || 0),
      hidup: acc.hidup + Number(r.hidup || 0),
      karkas: acc.karkas + Number(r.karkas || 0),
      daging: acc.daging + Number(r.daging || 0),
      male: acc.male + Number(r.male || 0),
      female_prod: acc.female_prod + Number(r.female_prod || 0),
      female_nonprod: acc.female_nonprod + Number(r.female_nonprod || 0),
      jeroan: acc.jeroan + Number(r.jeroan || 0),
      produk: acc.produk + Number(r.produk_lainnya || 0),
    }),
    { ekor: 0, hidup: 0, karkas: 0, daging: 0, male: 0, female_prod: 0, female_nonprod: 0, jeroan: 0, produk: 0 }
  );

  const groupsAgg: Record<string, { ekor: number; hidup: number; karkas: number; daging: number; male: number; female: number }> = {};
  targetRows.forEach((r) => {
    Object.entries(r.groups || {}).forEach(([k, v]) => {
      const g = v as any;
      if (!groupsAgg[k]) {
        groupsAgg[k] = { ekor: 0, hidup: 0, karkas: 0, daging: 0, male: 0, female: 0 };
      }
      groupsAgg[k].ekor += Number(g.ekor || 0);
      groupsAgg[k].hidup += Number(g.hidup || 0);
      groupsAgg[k].karkas += Number(g.karkas || 0);
      groupsAgg[k].daging += Number(g.daging || 0);
      groupsAgg[k].male += Number(g.male || 0);
      groupsAgg[k].female += Number(g.female_nonprod || 0) + Number(g.female_prod || 0);
    });
  });

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
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#F1F5F9]">
                Rincian Harian: {date}
              </h3>
              <p className="text-xs text-[#94A3B8]">
                {species ? `Komoditas: ${species}` : 'Semua Komoditas'}
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

        {/* Summary metric grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-2xl bg-[#13161C] border border-[#2D333F]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
              Total Potong
            </span>
            <div className="text-xl font-black text-[#F1F5F9] mt-0.5">
              {fmt(total.ekor, 0)} <span className="text-xs font-normal text-[#64748B]">ekor</span>
            </div>
            <div className="text-[11px] text-[#94A3B8] mt-1">
              Jantan: {fmt(total.male, 0)} • Betina: {fmt(total.female_prod + total.female_nonprod, 0)}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#13161C] border border-[#2D333F]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
              Rendemen Karkas
            </span>
            <div className="text-xl font-black text-emerald-400 mt-0.5">
              {pct(total.karkas, total.hidup)}
            </div>
            <div className="text-[11px] text-[#94A3B8] mt-1">
              {fmt(total.karkas, 1)} kg dari {fmt(total.hidup, 1)} kg
            </div>
          </div>
        </div>

        {/* Breakdown by origin / groups */}
        <div className="space-y-2.5">
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#CBD5E1]">
            Rincian Berdasarkan Asal / Rumpun
          </span>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {Object.keys(groupsAgg).length > 0 ? (
              Object.entries(groupsAgg).map(([gName, gVal], idx) => (
                <div
                  key={`${gName}-${idx}`}
                  className="p-3 rounded-xl bg-[#13161C] border border-[#2D333F] flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-extrabold text-[#F1F5F9] block">
                      {gName}
                    </span>
                    <span className="text-[11px] text-[#94A3B8]">
                      {fmt(gVal.ekor, 0)} ekor (J: {fmt(gVal.male, 0)}, B: {fmt(gVal.female, 0)})
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-[#F1F5F9] block">
                      {fmt(gVal.karkas, 1)} kg karkas
                    </span>
                    <span className="text-[11px] text-emerald-400">
                      Daging: {fmt(gVal.daging, 1)} kg
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-xs text-[#64748B]">
                Tidak ada rincian sub-kelompok
              </div>
            )}
          </div>
        </div>

        {/* Byproducts info if available */}
        {(total.jeroan > 0 || total.produk > 0) && (
          <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/40 flex items-center justify-between text-xs text-amber-200">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-400" />
              <span>Sampingan (Jeroan & Produk Lain)</span>
            </div>
            <span className="font-bold">
              {fmt(total.jeroan + total.produk, 1)} kg
            </span>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-[#1A1D23] hover:bg-[#242832] border border-[#2D333F] text-[#F1F5F9] transition-colors"
        >
          Tutup Rincian
        </button>
      </div>
    </div>
  );
};
