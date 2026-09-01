import React, { useState, useEffect } from 'react';
import { SlaughterRow } from '../../types';
import { MONTH_NAMES } from '../../services/api';
import { PlusCircle, Edit3, X, Save, AlertCircle, CheckCircle2 } from 'lucide-react';

interface InputDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<SlaughterRow>, editId?: string) => void;
  editingRow?: SlaughterRow | null;
}

export const InputDataModal: React.FC<InputDataModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingRow,
}) => {
  const today = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState<string>(today);
  const [month, setMonth] = useState<string>('Januari');
  const [species, setSpecies] = useState<string>('Sapi');
  const [table, setTable] = useState<string>('Sapi');
  const [group, setGroup] = useState<string>('Lokal');
  const [ekor, setEkor] = useState<string>('1');
  const [male, setMale] = useState<string>('0');
  const [femaleNonprod, setFemaleNonprod] = useState<string>('1');
  const [hidup, setHidup] = useState<string>('400');
  const [karkas, setKarkas] = useState<string>('200');
  const [daging, setDaging] = useState<string>('150');
  const [jeroan, setJeroan] = useState<string>('0');
  const [produk, setProduk] = useState<string>('0');

  useEffect(() => {
    if (editingRow) {
      setDate(editingRow.date || today);
      setMonth(editingRow.month || 'Januari');
      setSpecies(editingRow.species || 'Sapi');
      setTable(editingRow.table || (editingRow.species === 'Sapi' ? 'Sapi' : 'Selain Sapi'));
      const gKeys = Object.keys(editingRow.groups || {});
      setGroup(gKeys[0] || (editingRow.species === 'Sapi' ? 'Lokal' : editingRow.species));
      setEkor(String(editingRow.ekor || 0));
      setMale(String(editingRow.male || 0));
      setFemaleNonprod(String(editingRow.female_nonprod || 0));
      setHidup(String(editingRow.hidup || 0));
      setKarkas(String(editingRow.karkas || 0));
      setDaging(String(editingRow.daging || 0));
      setJeroan(String(editingRow.jeroan || 0));
      setProduk(String(editingRow.produk_lainnya || 0));
    } else {
      setDate(today);
      setMonth(MONTH_NAMES[new Date().getMonth() + 1] || 'Januari');
      setSpecies('Sapi');
      setTable('Sapi');
      setGroup('Lokal');
      setEkor('1');
      setMale('0');
      setFemaleNonprod('1');
      setHidup('');
      setKarkas('');
      setDaging('');
      setJeroan('');
      setProduk('');
    }
  }, [editingRow, isOpen]);

  if (!isOpen) return null;

  const numEkor = Math.max(0, parseInt(ekor, 10) || 0);
  const numMale = Math.max(0, parseInt(male, 10) || 0);
  const numFemaleNon = Math.max(0, parseInt(femaleNonprod, 10) || 0);
  const numFemaleProd = Math.max(0, numEkor - numMale - numFemaleNon);

  const numHidup = parseFloat(hidup) || 0;
  const numKarkas = parseFloat(karkas) || 0;
  const numDaging = parseFloat(daging) || 0;

  // Real-time validation checks
  const warnings: string[] = [];
  if (numEkor <= 0) warnings.push('Jumlah ekor harus lebih dari 0');
  if (numMale + numFemaleNon > numEkor) {
    warnings.push(`Jumlah Jantan (${numMale}) + Betina Non (${numFemaleNon}) melebihi Ekor (${numEkor})`);
  }
  if (numHidup > 0 && numKarkas > numHidup) {
    warnings.push('Berat karkas tidak boleh lebih besar dari berat hidup');
  }
  if (numKarkas > 0 && numDaging > numKarkas) {
    warnings.push('Berat daging tidak boleh lebih besar dari berat karkas');
  }

  const handleSpeciesChange = (newSpecies: string) => {
    setSpecies(newSpecies);
    const newTable = newSpecies === 'Sapi' ? 'Sapi' : 'Selain Sapi';
    setTable(newTable);
    if (newSpecies === 'Sapi') {
      setGroup('Lokal');
    } else {
      setGroup(newSpecies);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (warnings.length > 0) {
      alert('Periksa kembali data input:\n• ' + warnings.join('\n• '));
      return;
    }

    const payload: Partial<SlaughterRow> = {
      date,
      month,
      species,
      table,
      ekor: numEkor,
      male: numMale,
      female_nonprod: numFemaleNon,
      female_prod: numFemaleProd,
      hidup: numHidup,
      karkas: numKarkas,
      daging: numDaging,
      jeroan: parseFloat(jeroan) || 0,
      produk_lainnya: parseFloat(produk) || 0,
      kulit_basah: 0,
      daging_skeletal: 0,
      daging_variasi: 0,
      groups: {
        [group]: {
          ekor: numEkor,
          hidup: numHidup,
          karkas: numKarkas,
          daging: numDaging,
          male: numMale,
          female_prod: numFemaleProd,
          female_nonprod: numFemaleNon,
        },
      },
    };

    onSubmit(payload, editingRow?.id);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#0F1115]/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-[#161920] border border-[#2D333F] rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 my-8 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto text-[#E2E8F0]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#2D333F]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {editingRow ? <Edit3 className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#F1F5F9]">
                {editingRow ? 'Edit Data Pemotongan' : 'Input Data Pemotongan Baru'}
              </h3>
              <p className="text-xs text-[#94A3B8]">
                Formulir pencatatan administrasi harian UPT RPH Kota Cirebon
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

        <form onSubmit={handleFormSubmit} className="space-y-4">
          {/* Tanggal & Bulan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#CBD5E1]">
                Tanggal Pemotongan <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#13161C] border border-[#2D333F] rounded-xl px-3.5 py-2 text-xs font-semibold text-[#F1F5F9] focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#CBD5E1]">
                Bulan Pelaporan
              </label>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full bg-[#13161C] border border-[#2D333F] rounded-xl px-3.5 py-2 text-xs font-semibold text-[#F1F5F9] focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 focus:outline-none"
              >
                {MONTH_NAMES.slice(1).map((m) => (
                  <option key={m} value={m} className="bg-[#161920] text-[#F1F5F9]">
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Jenis Ternak & Kelompok */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#CBD5E1]">
                Jenis Ternak <span className="text-rose-400">*</span>
              </label>
              <select
                value={species}
                onChange={(e) => handleSpeciesChange(e.target.value)}
                className="w-full bg-[#13161C] border border-[#2D333F] rounded-xl px-3.5 py-2 text-xs font-semibold text-[#F1F5F9] focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 focus:outline-none"
              >
                <option value="Sapi" className="bg-[#161920] text-[#F1F5F9]">Sapi (Ruminansia Besar)</option>
                <option value="Kerbau" className="bg-[#161920] text-[#F1F5F9]">Kerbau (Ruminansia Besar)</option>
                <option value="Domba" className="bg-[#161920] text-[#F1F5F9]">Domba (Ruminansia Kecil)</option>
                <option value="Kambing" className="bg-[#161920] text-[#F1F5F9]">Kambing (Ruminansia Kecil)</option>
                <option value="Babi" className="bg-[#161920] text-[#F1F5F9]">Babi</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#CBD5E1]">
                Rumpun / Asal
              </label>
              <select
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                className="w-full bg-[#13161C] border border-[#2D333F] rounded-xl px-3.5 py-2 text-xs font-semibold text-[#F1F5F9] focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 focus:outline-none"
              >
                {species === 'Sapi' ? (
                  <>
                    <option value="Lokal" className="bg-[#161920] text-[#F1F5F9]">Sapi Lokal</option>
                    <option value="Ex-Import" className="bg-[#161920] text-[#F1F5F9]">Sapi Ex-Import (BX)</option>
                  </>
                ) : (
                  <option value={species} className="bg-[#161920] text-[#F1F5F9]">{species}</option>
                )}
              </select>
            </div>
          </div>

          {/* Rincian Ekor & Jenis Kelamin */}
          <div className="p-4 rounded-2xl bg-[#13161C] border border-[#2D333F] space-y-3">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#CBD5E1] block">
              Populasi & Distribusi Jenis Kelamin
            </span>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#94A3B8]">
                  Total Ekor <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={ekor}
                  onChange={(e) => setEkor(e.target.value)}
                  className="w-full bg-[#161920] border border-[#2D333F] rounded-xl px-3 py-1.5 text-xs font-bold text-[#F1F5F9] focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#94A3B8]">
                  Jantan
                </label>
                <input
                  type="number"
                  min="0"
                  value={male}
                  onChange={(e) => setMale(e.target.value)}
                  className="w-full bg-[#161920] border border-[#2D333F] rounded-xl px-3 py-1.5 text-xs font-medium text-[#F1F5F9] focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#94A3B8]">
                  Betina Non-Prod
                </label>
                <input
                  type="number"
                  min="0"
                  value={femaleNonprod}
                  onChange={(e) => setFemaleNonprod(e.target.value)}
                  className="w-full bg-[#161920] border border-[#2D333F] rounded-xl px-3 py-1.5 text-xs font-medium text-[#F1F5F9] focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="text-[11px] text-[#94A3B8] flex items-center justify-between pt-1 border-t border-[#2D333F]">
              <span>Betina Produktif (Otomatis):</span>
              <span className="font-extrabold text-emerald-400">
                {numFemaleProd} ekor
              </span>
            </div>
          </div>

          {/* Bobot & Timbangan */}
          <div className="p-4 rounded-2xl bg-[#13161C] border border-[#2D333F] space-y-3">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#CBD5E1] block">
              Timbangan Berat (Kg)
            </span>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#94A3B8]">
                  Berat Hidup
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="0.0"
                  value={hidup}
                  onChange={(e) => setHidup(e.target.value)}
                  className="w-full bg-[#161920] border border-[#2D333F] rounded-xl px-3 py-1.5 text-xs font-semibold text-[#F1F5F9] focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#94A3B8]">
                  Berat Karkas
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="0.0"
                  value={karkas}
                  onChange={(e) => setKarkas(e.target.value)}
                  className="w-full bg-[#161920] border border-[#2D333F] rounded-xl px-3 py-1.5 text-xs font-semibold text-[#F1F5F9] focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#94A3B8]">
                  Daging Murni
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="0.0"
                  value={daging}
                  onChange={(e) => setDaging(e.target.value)}
                  className="w-full bg-[#161920] border border-[#2D333F] rounded-xl px-3 py-1.5 text-xs font-semibold text-[#F1F5F9] focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#94A3B8]">
                  Jeroan (Kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="0.0"
                  value={jeroan}
                  onChange={(e) => setJeroan(e.target.value)}
                  className="w-full bg-[#161920] border border-[#2D333F] rounded-xl px-3 py-1.5 text-xs font-medium text-[#F1F5F9] focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#94A3B8]">
                  Produk Sampingan Lain
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="0.0"
                  value={produk}
                  onChange={(e) => setProduk(e.target.value)}
                  className="w-full bg-[#161920] border border-[#2D333F] rounded-xl px-3 py-1.5 text-xs font-medium text-[#F1F5F9] focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Validation alerts */}
          {warnings.length > 0 && (
            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertCircle className="w-4 h-4" />
                <span>Peringatan Validasi:</span>
              </div>
              <ul className="list-disc list-inside text-[11px] space-y-0.5">
                {warnings.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Submit Actions */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-950/50 transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{editingRow ? 'Simpan Perubahan' : 'Simpan Data Baru'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 rounded-xl text-xs font-bold border border-[#2D333F] bg-[#161920] hover:bg-[#1A1D23] text-[#CBD5E1] transition-colors"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
