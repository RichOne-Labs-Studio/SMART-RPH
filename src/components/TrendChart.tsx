import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { MetricType, SlaughterRow } from '../types';
import { fmt, shortMonth, MONTH_NAMES, CAT_MAP } from '../services/api';
import { TrendingUp, MousePointerClick } from 'lucide-react';

Chart.register(...registerables);

interface TrendChartProps {
  rows: SlaughterRow[];
  allRows: SlaughterRow[];
  selectedMonth: string;
  selectedMetric: MetricType;
  category: string;
  species: string;
  theme: 'light' | 'dark';
  onDrilldownMonth: (m: string) => void;
  onOpenDayDetail: (date: string, species?: string) => void;
}

export const TrendChart: React.FC<TrendChartProps> = ({
  rows,
  allRows,
  selectedMonth,
  selectedMetric,
  category,
  species,
  theme,
  onDrilldownMonth,
  onOpenDayDetail
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  const metricLabelMap: Record<MetricType, { title: string; unit: string }> = {
    ekor: { title: 'Jumlah Ternak Dipotong', unit: 'ekor' },
    hidup: { title: 'Total Berat Hidup', unit: 'kg' },
    karkas: { title: 'Total Berat Karkas', unit: 'kg' },
    daging: { title: 'Estimasi Daging Bersih', unit: 'kg' }
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }

    let labels: string[] = [];
    let values: number[] = [];
    let titleDates: string[] = [];

    if (selectedMonth === 'Semua') {
      const monthRows = MONTH_NAMES.slice(1)
        .map((m) => {
          const matching = allRows.filter((x) => {
            const okMonth = x.month === m;
            const okCat = category === 'Semua' || (CAT_MAP[x.species] || 'Ruminansia') === category;
            const okSp = species === 'Semua' || x.species === species;
            return okMonth && okCat && okSp;
          });
          return { month: m, rows: matching };
        })
        .filter((x) => x.rows.length > 0);

      labels = monthRows.map((x) => shortMonth(x.month));
      values = monthRows.map((x) =>
        x.rows.reduce((acc, r) => acc + Number(r[selectedMetric] || 0), 0)
      );
      titleDates = monthRows.map((x) => x.month);
    } else {
      // Daily map for the selected month
      const dm: Record<string, number> = {};
      rows.forEach((r) => {
        dm[r.date] = (dm[r.date] || 0) + Number(r[selectedMetric] || 0);
      });
      const dates = Object.keys(dm).sort();
      labels = dates.map((d) => {
        const parts = d.split('-');
        return `${parts[2]}/${parts[1]}`;
      });
      values = dates.map((d) => dm[d]);
      titleDates = dates;
    }

    const isDark = theme === 'dark' || true;
    const gridColor = 'rgba(45, 51, 63, 0.7)';
    const textColor = '#94a3b8';
    const valueTextColor = '#e2e8f0';

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Gradient fill
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    if (category === 'Babi') {
      gradient.addColorStop(0, 'rgba(225, 29, 72, 0.9)');
      gradient.addColorStop(1, 'rgba(244, 63, 94, 0.5)');
    } else {
      gradient.addColorStop(0, 'rgba(16, 185, 129, 0.95)');
      gradient.addColorStop(1, 'rgba(5, 150, 105, 0.5)');
    }

    const newChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: gradient,
            hoverBackgroundColor: category === 'Babi' ? '#f43f5e' : '#34d399',
            borderRadius: 6,
            maxBarThickness: selectedMonth === 'Semua' ? 48 : 32
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#161920',
            titleColor: '#f8fafc',
            bodyColor: '#94a3b8',
            borderColor: '#2d333f',
            borderWidth: 1,
            padding: 10,
            cornerRadius: 10,
            callbacks: {
              title: (items) => {
                const idx = items[0]?.dataIndex ?? 0;
                return titleDates[idx] || '';
              },
              label: (context) => {
                const val = context.raw as number;
                return `${metricLabelMap[selectedMetric].title}: ${fmt(val, selectedMetric === 'ekor' ? 0 : 1)} ${metricLabelMap[selectedMetric].unit}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: gridColor },
            ticks: {
              color: textColor,
              font: { family: 'Plus Jakarta Sans', size: 11 },
              callback: (val) => fmt(val as number, 0)
            }
          },
          x: {
            grid: { display: false },
            ticks: {
              color: textColor,
              font: { family: 'Plus Jakarta Sans', size: 11, weight: 600 }
            }
          }
        },
        onClick: (_, elements) => {
          if (!elements.length) return;
          const idx = elements[0].index;
          const key = titleDates[idx];
          if (!key) return;

          if (selectedMonth === 'Semua') {
            onDrilldownMonth(key);
          } else {
            onOpenDayDetail(key, species === 'Semua' ? undefined : species);
          }
        }
      },
      plugins: [
        {
          id: 'barValueLabels',
          afterDatasetsDraw: (chart) => {
            const { ctx: c } = chart;
            c.save();
            c.font = '700 10px Plus Jakarta Sans, sans-serif';
            c.fillStyle = valueTextColor;
            c.textAlign = 'center';
            c.textBaseline = 'bottom';

            chart.data.datasets.forEach((dataset, datasetIdx) => {
              const meta = chart.getDatasetMeta(datasetIdx);
              meta.data.forEach((bar, index) => {
                const val = dataset.data[index] as number;
                if (val && val > 0) {
                  const label = selectedMetric === 'ekor' ? fmt(val, 0) : fmt(val, 0);
                  c.fillText(label, bar.x, bar.y - 4);
                }
              });
            });
            c.restore();
          }
        }
      ]
    });

    chartInstanceRef.current = newChart;

    return () => {
      newChart.destroy();
    };
  }, [rows, allRows, selectedMonth, selectedMetric, category, species, theme]);

  return (
    <div className="bg-[#161920] border border-[#2D333F] rounded-2xl p-5 shadow-sm space-y-4">
      {/* Header of the chart */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-[#2D333F]">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-[#F1F5F9]">
              {selectedMonth === 'Semua'
                ? `Tren Bulanan — ${metricLabelMap[selectedMetric].title}`
                : `Tren Harian Bulan ${selectedMonth} — ${metricLabelMap[selectedMetric].title}`}
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
              <MousePointerClick className="w-3 h-3 text-emerald-400" />
              <span>
                {selectedMonth === 'Semua'
                  ? 'Klik pada batang bulan untuk melihat rincian harian'
                  : 'Klik pada batang tanggal untuk melihat detail jenis & bobot'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#13161C] text-[#CBD5E1] border border-[#2D333F]">
            Komoditas: {category}
          </span>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-950/70 text-emerald-300 border border-emerald-800/60">
            {selectedMonth === 'Semua' ? 'Jan–Des 2026' : `Bulan ${selectedMonth}`}
          </span>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="h-[360px] sm:h-[400px] w-full relative">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};
