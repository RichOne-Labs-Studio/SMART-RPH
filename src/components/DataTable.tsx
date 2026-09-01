import React, { useState } from 'react';
import { SlaughterRow, UserSession } from '../types';
import { fmt, pct, CAT_MAP } from '../services/api';
import { Table, Edit3, Trash2, ChevronUp, ChevronDown, Calendar, Search } from 'lucide-react';

interface DataTableProps {
  rows: SlaughterRow[];
  user: UserSession | null;
  onOpenDetail: (date: string, species?: string) => void;
  onEditRow: (row: SlaughterRow) => void;
  onDeleteRow: (id: string, date: string, species: string, ekor: number) => void;
}

type SortField = 'date' | 'species' | 'ekor' | 'hidup' | 'karkas' | 'daging';

export const DataTable: React.FC<DataTableProps> = ({
  rows,
  user,
  onOpenDetail,
  onEditRow,
  onDeleteRow,
}) => {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sortedRows = [...rows].sort((a, b) => {
    let result = 0;
    if (sortField === 'date') {
      result = a.date.localeCompare(b.date);
    } else if (sortField === 'species') {
      result = a.species.localeCompare(b.species);
    } else {
      result = (Number(a[sortField]) || 0) - (Number(b[sortField]) || 0);
    }
    return sortAsc ? result : -result;
  });

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortAsc ? (
      <ChevronUp className="w-3 h-3 inline ml-1 text-emerald-600" />
    ) : (
      <ChevronDown className="w-3 h-3 inline ml-1 text-emerald-600" />
    );
  };

  const isAdmin = user && (user.role === 'admin' || user.role === 'superadmin');

  return (
    <div className="bg-[#161920] border border-[#2D333F] rounded-2xl shadow-sm overflow-hidden flex flex-col">
      {/* Header of the data table */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2D333F]">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Table className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-[#F1F5F9]">
              Data Log Harian Pemotongan
            </h2>
            <p className="text-xs text-[#94A3B8]">
              Klik baris untuk melihat rincian jenis asal & distribusi bobot
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#13161C] text-[#CBD5E1] border border-[#2D333F]">
            Total {rows.length} Catatan
          </span>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto max-h-[560px]">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-[#13161C] text-[#94A3B8] sticky top-0 z-10 backdrop-blur-sm uppercase font-extrabold text-[10px] tracking-wider border-b border-[#2D333F]">
            <tr>
              <th
                onClick={() => handleSort('date')}
                className="py-3 px-4 cursor-pointer hover:text-emerald-400 whitespace-nowrap"
              >
                Tanggal {renderSortIcon('date')}
              </th>
              <th
                onClick={() => handleSort('species')}
                className="py-3 px-4 cursor-pointer hover:text-emerald-400 whitespace-nowrap"
              >
                Jenis Ternak {renderSortIcon('species')}
              </th>
              <th className="py-3 px-4 whitespace-nowrap">Kategori</th>
              <th
                onClick={() => handleSort('ekor')}
                className="py-3 px-4 text-right cursor-pointer hover:text-emerald-400 whitespace-nowrap"
              >
                Ekor {renderSortIcon('ekor')}
              </th>
              <th className="py-3 px-4 text-right whitespace-nowrap">Jantan</th>
              <th className="py-3 px-4 text-right whitespace-nowrap">Betina Prod</th>
              <th className="py-3 px-4 text-right whitespace-nowrap">Betina Non</th>
              <th
                onClick={() => handleSort('hidup')}
                className="py-3 px-4 text-right cursor-pointer hover:text-emerald-400 whitespace-nowrap"
              >
                Hidup (kg) {renderSortIcon('hidup')}
              </th>
              <th
                onClick={() => handleSort('karkas')}
                className="py-3 px-4 text-right cursor-pointer hover:text-emerald-400 whitespace-nowrap"
              >
                Karkas (kg) {renderSortIcon('karkas')}
              </th>
              <th
                onClick={() => handleSort('daging')}
                className="py-3 px-4 text-right cursor-pointer hover:text-emerald-400 whitespace-nowrap"
              >
                Daging (kg) {renderSortIcon('daging')}
              </th>
              <th className="py-3 px-4 text-right whitespace-nowrap">Rendemen</th>
              {isAdmin && (
                <th className="py-3 px-4 text-center whitespace-nowrap">Aksi</th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-[#2D333F]/60">
            {sortedRows.length > 0 ? (
              sortedRows.map((r, i) => {
                const cat = CAT_MAP[r.species] || 'Ruminansia';
                const isBabi = cat === 'Babi';
                return (
                  <tr
                    key={`${r.id || r.date}-${r.species}-${i}`}
                    onClick={() => onOpenDetail(r.date, r.species)}
                    className="hover:bg-[#1A1E27] cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-bold text-[#F1F5F9] whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#64748B]" />
                        <span>{r.date}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-semibold text-[#E2E8F0]">
                        {r.species}
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isBabi
                            ? 'bg-rose-950/70 text-rose-300 border border-rose-800/60'
                            : 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/60'
                        }`}
                      >
                        {cat}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right font-extrabold text-[#F1F5F9] whitespace-nowrap">
                      {fmt(r.ekor, 0)}
                    </td>

                    <td className="py-3 px-4 text-right text-[#94A3B8] whitespace-nowrap">
                      {fmt(r.male, 0)}
                    </td>

                    <td className="py-3 px-4 text-right text-[#94A3B8] whitespace-nowrap">
                      {fmt(r.female_prod, 0)}
                    </td>

                    <td className="py-3 px-4 text-right text-[#94A3B8] whitespace-nowrap">
                      {fmt(r.female_nonprod, 0)}
                    </td>

                    <td className="py-3 px-4 text-right font-medium text-[#CBD5E1] whitespace-nowrap">
                      {fmt(r.hidup, 1)}
                    </td>

                    <td className="py-3 px-4 text-right font-medium text-[#CBD5E1] whitespace-nowrap">
                      {fmt(r.karkas, 1)}
                    </td>

                    <td className="py-3 px-4 text-right font-medium text-[#CBD5E1] whitespace-nowrap">
                      {fmt(r.daging, 1)}
                    </td>

                    <td className="py-3 px-4 text-right font-bold text-emerald-400 whitespace-nowrap">
                      {pct(r.karkas, r.hidup)}
                    </td>

                    {isAdmin && (
                      <td
                        className="py-3 px-4 text-center whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onEditRow(r)}
                            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-emerald-400 hover:bg-emerald-950/60 transition-colors"
                            title="Edit Data"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() =>
                              onDeleteRow(
                                r.id || `${r.date}|${r.species}`,
                                r.date,
                                r.species,
                                r.ekor
                              )
                            }
                            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-rose-400 hover:bg-rose-950/60 transition-colors"
                            title="Hapus Data"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={isAdmin ? 12 : 11}
                  className="py-12 text-center text-[#64748B]"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Search className="w-8 h-8 stroke-1 text-[#475569]" />
                    <p className="font-semibold text-xs">
                      Tidak ada data pemotongan yang sesuai dengan filter saat ini.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
