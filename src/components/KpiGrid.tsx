import React from 'react';
import { fmt, pct } from '../services/api';
import { Activity, Scale, Percent, Beef, Layers } from 'lucide-react';

interface KpiGridProps {
  totalEkor: number;
  totalHidup: number;
  totalKarkas: number;
  totalDaging: number;
  rowCount: number;
}

export const KpiGrid: React.FC<KpiGridProps> = ({
  totalEkor,
  totalHidup,
  totalKarkas,
  totalDaging,
  rowCount
}) => {
  const rendemen = pct(totalKarkas, totalHidup);
  const avgHidup = totalEkor > 0 ? (totalHidup / totalEkor).toFixed(1) : '0';

  const kpiItems = [
    {
      id: 'kpi-ekor',
      label: 'Total Pemotongan',
      value: `${fmt(totalEkor, 0)}`,
      unit: 'ekor',
      hint: `${rowCount} hari operasional`,
      icon: Activity,
      iconBg: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
    },
    {
      id: 'kpi-hidup',
      label: 'Total Berat Hidup',
      value: `${fmt(totalHidup, 1)}`,
      unit: 'kg',
      hint: `Rata-rata: ${avgHidup} kg / ekor`,
      icon: Scale,
      iconBg: 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
    },
    {
      id: 'kpi-karkas',
      label: 'Total Berat Karkas',
      value: `${fmt(totalKarkas, 1)}`,
      unit: 'kg',
      hint: 'Karkas standar RPH',
      icon: Layers,
      iconBg: 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
    },
    {
      id: 'kpi-daging',
      label: 'Estimasi Daging',
      value: `${fmt(totalDaging, 1)}`,
      unit: 'kg',
      hint: 'Daging murni konsumsi',
      icon: Beef,
      iconBg: 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
    },
    {
      id: 'kpi-rendemen',
      label: 'Rendemen Karkas',
      value: `${rendemen}`,
      unit: '',
      hint: 'Rasio Karkas ÷ Hidup',
      icon: Percent,
      iconBg: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
      {kpiItems.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.id}
            id={item.id}
            className="bg-[#161920] border border-[#2D333F] hover:border-[#3D4556] rounded-2xl p-4 sm:p-4.5 shadow-sm transition-all flex flex-col justify-between"
          >
            {/* Top row */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#94A3B8]">
                {item.label}
              </span>
              <div className={`p-2 rounded-xl ${item.iconBg}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            {/* Middle value */}
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-[26px] font-black text-[#F1F5F9] tracking-tight">
                  {item.value}
                </span>
                {item.unit && (
                  <span className="text-xs font-bold text-[#64748B]">
                    {item.unit}
                  </span>
                )}
              </div>
              <p className="text-[11px] font-medium text-[#94A3B8] mt-1 truncate">
                {item.hint}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
