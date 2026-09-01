import React from 'react';
import { fmt, pct } from '../services/api';
import { PieChart, VenusAndMars, GitCommit, Package } from 'lucide-react';

interface AnalysisCardsProps {
  speciesDistribution: { species: string; count: number; category: string }[];
  sexStats: { male: number; female_prod: number; female_nonprod: number };
  totalHidup: number;
  totalKarkas: number;
  totalDaging: number;
  products: {
    jeroan: number;
    kulit_basah: number;
    daging_skeletal: number;
    daging_variasi: number;
    produk_lainnya: number;
  };
}

export const AnalysisCards: React.FC<AnalysisCardsProps> = ({
  speciesDistribution,
  sexStats,
  totalHidup,
  totalKarkas,
  totalDaging,
  products
}) => {
  const maxSpecies = Math.max(1, ...speciesDistribution.map(s => s.count));
  const totalSex = sexStats.male + sexStats.female_prod + sexStats.female_nonprod;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {/* 1. Komposisi Jenis Ternak */}
      <div className="bg-[#161920] border border-[#2D333F] rounded-2xl p-4.5 shadow-sm flex flex-col">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#2D333F]">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-emerald-400" />
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#F1F5F9]">
              Komposisi Rumpun
            </h2>
          </div>
          <span className="text-[10px] font-bold text-[#94A3B8]">
            {speciesDistribution.length} Jenis
          </span>
        </div>

        <div className="space-y-3 flex-1 overflow-y-auto max-h-56 pr-1">
          {speciesDistribution.length > 0 ? (
            speciesDistribution.map((item, idx) => {
              const barWidth = Math.min(100, Math.max(4, (item.count / maxSpecies) * 100));
              const isBabi = item.category === 'Babi';
              return (
                <div key={`${item.species}-${idx}`} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#E2E8F0]">{item.species}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase ${
                          isBabi
                            ? 'bg-rose-950/70 text-rose-300 border border-rose-800/60'
                            : 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/60'
                        }`}
                      >
                        {item.category}
                      </span>
                    </div>
                    <span className="font-extrabold text-[#F1F5F9]">
                      {fmt(item.count, 0)} <span className="text-[10px] font-normal text-[#64748B]">ekor</span>
                    </span>
                  </div>
                  <div className="h-2 w-full bg-[#13161C] rounded-full overflow-hidden border border-[#2D333F]/40">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isBabi
                          ? 'bg-gradient-to-r from-rose-500 to-pink-600'
                          : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                      }`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-xs text-[#64748B]">Tidak ada data ternak</div>
          )}
        </div>
      </div>

      {/* 2. Jenis Kelamin */}
      <div className="bg-[#161920] border border-[#2D333F] rounded-2xl p-4.5 shadow-sm flex flex-col">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#2D333F]">
          <div className="flex items-center gap-2">
            <VenusAndMars className="w-4 h-4 text-sky-400" />
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#F1F5F9]">
              Jenis Kelamin
            </h2>
          </div>
          <span className="text-[10px] font-bold text-[#94A3B8]">
            Total {fmt(totalSex, 0)} ekor
          </span>
        </div>

        <div className="space-y-2.5 flex-1 justify-center flex flex-col">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#13161C] border border-[#2D333F] text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
              <span className="font-semibold text-[#CBD5E1]">Jantan</span>
            </div>
            <div className="text-right">
              <span className="font-extrabold text-[#F1F5F9]">{fmt(sexStats.male, 0)} ekor</span>
              <span className="text-[10px] text-[#64748B] ml-1.5">({pct(sexStats.male, totalSex)})</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#13161C] border border-[#2D333F] text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="font-semibold text-[#CBD5E1]">Betina Produktif</span>
            </div>
            <div className="text-right">
              <span className="font-extrabold text-[#F1F5F9]">{fmt(sexStats.female_prod, 0)} ekor</span>
              <span className="text-[10px] text-[#64748B] ml-1.5">({pct(sexStats.female_prod, totalSex)})</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#13161C] border border-[#2D333F] text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="font-semibold text-[#CBD5E1]">Betina Non-Produktif</span>
            </div>
            <div className="text-right">
              <span className="font-extrabold text-[#F1F5F9]">{fmt(sexStats.female_nonprod, 0)} ekor</span>
              <span className="text-[10px] text-[#64748B] ml-1.5">({pct(sexStats.female_nonprod, totalSex)})</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Rendemen Efisiensi */}
      <div className="bg-[#161920] border border-[#2D333F] rounded-2xl p-4.5 shadow-sm flex flex-col">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#2D333F]">
          <div className="flex items-center gap-2">
            <GitCommit className="w-4 h-4 text-indigo-400" />
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#F1F5F9]">
              Rasio Rendemen
            </h2>
          </div>
          <span className="text-[10px] font-bold text-emerald-400">
            Karakteristik
          </span>
        </div>

        <div className="space-y-3 flex-1 justify-center flex flex-col">
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-[#94A3B8] font-medium">Karkas ÷ Berat Hidup</span>
              <span className="font-black text-[#F1F5F9]">{pct(totalKarkas, totalHidup)}</span>
            </div>
            <div className="h-1.5 w-full bg-[#13161C] rounded-full overflow-hidden border border-[#2D333F]/40">
              <div
                className="h-full bg-indigo-500 rounded-full"
                style={{ width: `${Math.min(100, (totalKarkas / (totalHidup || 1)) * 100)}%` }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-[#94A3B8] font-medium">Daging ÷ Berat Hidup</span>
              <span className="font-black text-[#F1F5F9]">{pct(totalDaging, totalHidup)}</span>
            </div>
            <div className="h-1.5 w-full bg-[#13161C] rounded-full overflow-hidden border border-[#2D333F]/40">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${Math.min(100, (totalDaging / (totalHidup || 1)) * 100)}%` }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-[#94A3B8] font-medium">Daging ÷ Berat Karkas</span>
              <span className="font-black text-[#F1F5F9]">{pct(totalDaging, totalKarkas)}</span>
            </div>
            <div className="h-1.5 w-full bg-[#13161C] rounded-full overflow-hidden border border-[#2D333F]/40">
              <div
                className="h-full bg-sky-500 rounded-full"
                style={{ width: `${Math.min(100, (totalDaging / (totalKarkas || 1)) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Produk Turunan */}
      <div className="bg-[#161920] border border-[#2D333F] rounded-2xl p-4.5 shadow-sm flex flex-col">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#2D333F]">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-amber-400" />
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#F1F5F9]">
              Produk Turunan
            </h2>
          </div>
          <span className="text-[10px] font-bold text-[#94A3B8]">
            Sampingan
          </span>
        </div>

        <div className="space-y-2 flex-1 justify-center flex flex-col text-xs">
          <div className="flex justify-between items-center py-1 border-b border-[#2D333F]">
            <span className="text-[#94A3B8]">Jeroan</span>
            <span className="font-extrabold text-[#F1F5F9]">{fmt(products.jeroan, 1)} kg</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-[#2D333F]">
            <span className="text-[#94A3B8]">Kulit Basah</span>
            <span className="font-extrabold text-[#F1F5F9]">{fmt(products.kulit_basah, 1)} kg</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-[#2D333F]">
            <span className="text-[#94A3B8]">Daging Skeletal / Variasi</span>
            <span className="font-extrabold text-[#F1F5F9]">{fmt(products.daging_skeletal + products.daging_variasi, 1)} kg</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-[#94A3B8]">Produk Lainnya</span>
            <span className="font-extrabold text-[#F1F5F9]">{fmt(products.produk_lainnya, 1)} kg</span>
          </div>
        </div>
      </div>
    </div>
  );
};
