import React, { useState, useEffect, useCallback } from 'react';
import { SlaughterRow } from '../../types';
import { MONTH_NAMES } from '../../services/api';
import { PlusCircle, Edit3, X, Save, AlertCircle, Sparkles, RefreshCw, Calculator } from 'lucide-react';

interface InputDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<SlaughterRow>, editId?: string) => void;
  editingRow?: SlaughterRow | null;
}

// Standar estimasi rata-rata bobot hidup & rendemen per ekor
const SPECIES_PRESETS: Record<string, { avgHidup: number; rendemenKarkas: number }> = {
  'Sapi-Lokal': { avgHidup: 400, rendemenKarkas: 0.50 },
  'Sapi-Ex-Import': { avgHidup: 500, rendemenKarkas: 0.52 },
  'Kerbau': { avgHidup: 450, rendemenKarkas: 0.47 },
  'Domba': { avgHidup: 35, rendemenKarkas: 0.46 },
  'Kambing': { avgHidup: 30, rendemenKarkas: 0.47 },
  'Babi': { avgHidup: 90, rendemenKarkas: 0.72 },
};

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
  const [autoCalc, setAutoCalc] = useState<boolean>(true);

  // Populasi
  const [ekor, setEkor] = useState<string>('1');
  const [male, setMale] = useState<string>('0');
  const [femaleNonprod, setFemaleNonprod] = useState<string>('1');

  // Timbangan
  const [hidup, setHidup] = useState<string>('400');
  const [karkas, setKarkas] = useState<string>('200');
  const [daging, setDaging] = useState<string>('147');
  const [jeroan, setJeroan] = useState<string>('46.2');
  const [produk, setProduk] = useState<string>('6');

  // Hitung ulang dari nilai karkas
  const applyBpsFormulasFromKarkas = useCallback((karkasNum: number) => {
    if (karkasNum <= 0) {
      setDaging('0');
      setJeroan('0');
      setProduk('0');
      return;
    }

    // Rumus Resmi Excel BPS:
    // Kolom Q / Kolom T (Daging) = (70.7*Karkas + 2.8*Karkas)/100 = 73.5% * Karkas
    // Kolom AA (Jeroan) = Karkas * 23.1%
    // Kolom AE (Produk Lain) = Karkas * 3%
    const totalDaging = ((70.7 * karkasNum + 2.8 * karkasNum) / 100);
    const totalJeroan = karkasNum * 0.231;
    const totalProduk = karkasNum * 0.03;

    setDaging(totalDaging.toFixed(1));
    setJeroan(totalJeroan.toFixed(1));
    setProduk(totalProduk.toFixed(1));
  }, []);

  // Hitung penuh dari jumlah ekor & preset jenis ternak
  const recalculateFromEkorAndSpecies = useCallback((numEkor: number, sp: string, grp: string) => {
    const key = sp === 'Sapi' ? `Sapi-${grp}` : sp;
    const preset = SPECIES_PRESETS[key] || { avgHidup: 400, rendemenKarkas: 0.50 };

    const estimatedHidup = preset.avgHidup * numEkor;
    const estimatedKarkas = estimatedHidup * preset.rendemenKarkas;

    setHidup(estimatedHidup.toFixed(1));
    setKarkas(estimatedKarkas.toFixed(1));
    applyBpsFormulasFromKarkas(estimatedKarkas);
  }, [applyBpsFormulasFromKarkas]);

  // Load awal atau saat edit dibuka
  useEffect(() => {
    if (editingRow) {
      setDate(editingRow.date || today);
      setMonth(editingRow.month || 'Januari');
      setSpecies(editingRow.species || 'Sapi');
      setTable(editingRow.table || (editingRow.species === 'Sapi' ? 'Sapi' : 'Selain Sapi'));
      const gKeys = Object.keys(editingRow.groups || {});
      const grp = gKeys[0] || (editingRow.species === 'Sapi' ? 'Lokal' : editingRow.species);
      setGroup(grp);
      setEkor(String(editingRow.ekor || 1));
      setMale(String(editingRow.male || 0));
      setFemaleNonprod(String(editingRow.female_nonprod || 0));
      setHidup(String(editingRow.hidup || 0));
      setKarkas(String(editingRow.karkas || 0));
      setDaging(String(editingRow.daging || 0));
      setJeroan(String(editingRow.jeroan || 0));
      setProduk(String(editingRow.produk_lainnya || 0));
      setAutoCalc(false); // Saat edit data lama, biarkan manual dulu
    } else if (isOpen) {
      // Form baru: isi default otomatis standar 1 ekor sapi lokal
      const currentMonth = MONTH_NAMES[new Date().getMonth() + 1] || 'Januari';
      setDate(today);
      setMonth(currentMonth);
      setSpecies('Sapi');
      setTable('Sapi');
      setGroup('Lokal');
      setEkor('1');
      setMale('0');
      setFemaleNonprod('1');
      setAutoCalc(true);
      recalculateFromEkorAndSpecies(1, 'Sapi', 'Lokal');
    }
  }, [editingRow, isOpen, today, recalculateFromEkorAndSpecies]);

  if (!isOpen) return null;

  const numEkor = Math.max(0, parseInt(ekor, 10) || 0);
  const numMale = Math.max(0, parseInt(male, 10) || 0);
  const numFemaleNon = Math.max(0, parseInt(femaleNonprod, 10) || 0);
  const numFemaleProd = Math.max(0, numEkor - numMale - numFemaleNon);

  const numHidup = parseFloat(hidup) || 0;
  const numKarkas = parseFloat(karkas) || 0;
  const numDaging = parseFloat(daging) || 0;

  // Breakdown detail hasil rumus BPS
  const skeletalDetail = ((70.7 * numKarkas) / 100).toFixed(1);
  const variasiDetail = ((2.8 * numKarkas) / 100).toFixed(1);

  // Handlers perubahan input
  const handleSpeciesChange = (newSpecies: string) => {
    setSpecies(newSpecies);
    const newTable = newSpecies === 'Sapi' ? 'Sapi' : 'Selain Sapi';
    setTable(newTable);
    const newGroup = newSpecies === 'Sapi' ? 'Lokal' : newSpecies;
    setGroup(newGroup);

    if (autoCalc) {
      recalculateFromEkorAndSpecies(numEkor || 1, newSpecies, newGroup);
    }
  };

  const handleGroupChange = (newGroup: string) => {
    setGroup(newGroup);
    if (autoCalc) {
      recalculateFromEkorAndSpecies(numEkor || 1, species, newGroup);
    }
  };

  const handleEkorChange = (val: string) => {
    setEkor(val);
    const parsed = parseInt(val, 10) || 0;
    if (autoCalc && parsed > 0) {
      recalculateFromEkorAndSpecies(parsed, species, group);
    }
  };

  const handleHidupChange = (val: string) => {
    setHidup(val);
    const parsedHidup = parseFloat(val) || 0;
    if (autoCalc && parsedHidup > 0) {
      const key = species === 'Sapi' ? `Sapi-${group}` : species;
      const preset = SPECIES_PRESETS[key] || { rendemenKarkas: 0.50 };
      const derivedKarkas = parsedHidup * preset.rendemenKarkas;
      setKarkas(derivedKarkas.toFixed(1));
      applyBpsFormulasFromKarkas(derivedKarkas);
    }
  };

  const handleKarkasChange = (val: string) => {
    setKarkas(val);
    const parsedKarkas = parseFloat(val) || 0;
    if (autoCalc) {
      applyBpsFormulasFromKarkas(parsedKarkas);
      // Estimasi balik berat hidup jika masih kosong/nol
      if (parsedKarkas > 0 && numHidup <= 0) {
        const key = species === 'Sapi' ? `Sapi-${group}` : species;
        const preset = SPECIES_PRESETS[key] || { rendemenKarkas: 0.50 };
        setHidup((parsedKarkas / preset.rendemenKarkas).toFixed(1));
      }
    }
  };

  const triggerResetRumus = () => {
    setAutoCalc(true);
    if (numKarkas > 0) {
      applyBpsFormulasFromKarkas(numKarkas);
    } else {
      recalculateFromEkorAndSpecies(numEkor || 1, species, group);
    }
  };

  // Peringatan Validasi
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
      daging_skeletal: parseFloat(skeletalDetail) || 0,
      daging_variasi: parseFloat(variasiDetail) || 0,
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
      className="fixed inset-0 z-50 bg-[#0F1115]/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-[#161920] border border-[#2D333F] rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl space-y-4 my-6 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto text-[#E2E8F0]"
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

          {/* Jenis Ternak & Rumpun / Asal */}
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
                onChange={(e) => handleGroupChange(e.target.value)}
                className="w-full bg-[#13161C] border border-[#2D333F] rounded-xl px-3.5 py-2 text-xs font-semibold text-[#F1F5F9] focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 focus:outline-none"
              >
                {species === 'Sapi' ? (
                  <>
                    <option value="Lokal" className="bg-[#161920] text-[#F1F5F9]">Sapi Lokal (Sn)</option>
                    <option value="Ex-Import" className="bg-[#161920] text-[#F1F5F9]">Sapi Ex-Import (Pn)</option>
                  </>
                ) : (
                  <option value={species} className="bg-[#161920] text-[#F1F5F9]">{species}</option>
                )}
              </select>
            </div>
          </div>

          {/* Rincian Ekor & Jenis Kelamin */}
          <div className="p-3.5 rounded-2xl bg-[#13161C] border border-[#2D333F] space-y-3">
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
                  onChange={(e) => handleEkorChange(e.target.value)}
                  className="w-full bg-[#161920] border border-[#2D333F] rounded-xl px-3 py-1.5 text-xs font-bold text-emerald-400 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 focus:outline-none"
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

          {/* Banner Status Rumus BPS Otomatis */}
          <div className="p-3 bg-gradient-to-r from-emerald-950/40 via-[#13161C] to-[#13161C] border border-emerald-800/40 rounded-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
                <Calculator className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <span>Rumus BPS Otomatis: {autoCalc ? 'AKTIF' : 'MANUAL'}</span>
                  {autoCalc && <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />}
                </div>
                <div className="text-[10px] text-[#94A3B8] truncate">
                  Daging = 73.5% karkas | Jeroan = 23.1% | Produk Lain = 3%
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {!autoCalc && (
                <button
                  type="button"
                  onClick={triggerResetRumus}
                  className="p-1.5 rounded-lg bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-300 text-[10px] font-semibold border border-emerald-700/50 flex items-center gap-1 transition-all"
                  title="Terapkan kembali rumus BPS"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Hitung Ulang</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setAutoCalc(!autoCalc)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  autoCalc
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-900/50'
                    : 'bg-[#1E232D] hover:bg-[#252C38] text-[#CBD5E1] border border-[#2D333F]'
                }`}
              >
                {autoCalc ? 'Otomatis' : 'Manual'}
              </button>
            </div>
          </div>

          {/* Bobot & Timbangan */}
          <div className="p-3.5 rounded-2xl bg-[#13161C] border border-[#2D333F] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#CBD5E1]">
                Timbangan Berat (Kg)
              </span>
              <span className="text-[10px] text-emerald-400 font-medium">
                {autoCalc ? '⚡ Terhubung Rumus Otomatis' : '✏️ Mode Input Bebas'}
              </span>
            </div>

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
                  onChange={(e) => handleHidupChange(e.target.value)}
                  className="w-full bg-[#161920] border border-[#2D333F] rounded-xl px-3 py-1.5 text-xs font-semibold text-[#F1F5F9] focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-emerald-400 flex items-center justify-between">
                  <span>Berat Karkas ({group === 'Ex-Import' ? 'Pn' : 'Sn'})</span>
                  <span className="text-[9px] text-[#94A3B8] font-normal">Utama</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="0.0"
                  value={karkas}
                  onChange={(e) => handleKarkasChange(e.target.value)}
                  className="w-full bg-[#161920] border border-emerald-500/40 rounded-xl px-3 py-1.5 text-xs font-bold text-emerald-300 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#94A3B8]">
                  Daging Murni (73.5%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="0.0"
                  value={daging}
                  onChange={(e) => {
                    setDaging(e.target.value);
                    if (autoCalc) setAutoCalc(false);
                  }}
                  className="w-full bg-[#161920] border border-[#2D333F] rounded-xl px-3 py-1.5 text-xs font-semibold text-amber-300 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#94A3B8]">
                  Jeroan (23.1%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="0.0"
                  value={jeroan}
                  onChange={(e) => {
                    setJeroan(e.target.value);
                    if (autoCalc) setAutoCalc(false);
                  }}
                  className="w-full bg-[#161920] border border-[#2D333F] rounded-xl px-3 py-1.5 text-xs font-medium text-[#F1F5F9] focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#94A3B8]">
                  Produk Sampingan Lain (3%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="0.0"
                  value={produk}
                  onChange={(e) => {
                    setProduk(e.target.value);
                    if (autoCalc) setAutoCalc(false);
                  }}
                  className="w-full bg-[#161920] border border-[#2D333F] rounded-xl px-3 py-1.5 text-xs font-medium text-[#F1F5F9] focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Rincian Komponen BPS Real-time */}
            {numKarkas > 0 && (
              <div className="mt-2 pt-2 border-t border-[#2D333F]/70 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                <div className="p-2 rounded-lg bg-[#161920] border border-[#2D333F]">
                  <div className="text-[#94A3B8]">Daging Skeletal (70.7%)</div>
                  <div className="font-bold text-white text-xs">{skeletalDetail} kg</div>
                </div>
                <div className="p-2 rounded-lg bg-[#161920] border border-[#2D333F]">
                  <div className="text-[#94A3B8]">Daging Variasi (2.8%)</div>
                  <div className="font-bold text-white text-xs">{variasiDetail} kg</div>
                </div>
                <div className="p-2 rounded-lg bg-[#161920] border border-[#2D333F]">
                  <div className="text-[#94A3B8]">Jeroan (Kolom AA)</div>
                  <div className="font-bold text-emerald-400 text-xs">{jeroan || '0.0'} kg</div>
                </div>
                <div className="p-2 rounded-lg bg-[#161920] border border-[#2D333F]">
                  <div className="text-[#94A3B8]">Produk Lain (Kolom AE)</div>
                  <div className="font-bold text-cyan-400 text-xs">{produk || '0.0'} kg</div>
                </div>
              </div>
            )}
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
