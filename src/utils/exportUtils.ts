import * as XLSX from 'xlsx';
import { SlaughterRow } from '../types';
import { CAT_MAP, MONTH_NAMES, shortMonth } from '../services/api';

export function exportExcelMultiMonth(rows: SlaughterRow[], selectedMonths: string[], catFilter: string, speciesFilter: string): void {
  if (!selectedMonths || selectedMonths.length === 0) return;

  const order = MONTH_NAMES.slice(1);
  const sorted = selectedMonths.slice().sort((a, b) => order.indexOf(a) - order.indexOf(b));
  const bulanLabel = selectedMonths.length === 1
    ? selectedMonths[0] + ' 2026'
    : selectedMonths.length === 12
      ? 'Jan-Des 2026'
      : sorted.map(m => shortMonth(m)).join('-') + ' 2026';

  const headers = [
    'Tanggal', 'Bulan', 'Jenis', 'Kategori', 'Ekor', 'Jantan', 'Betina NonProd',
    'Hidup (kg)', 'Karkas (kg)', 'Daging (kg)', 'Rendemen %', 'Jeroan (kg)', 'Produk Lainnya (kg)', 'Petugas'
  ];

  const baseRows = rows.filter(r => {
    const okCat = catFilter === 'Semua' || (CAT_MAP[r.species] || 'Ruminansia') === catFilter;
    const okSp = speciesFilter === 'Semua' || r.species === speciesFilter;
    const okMonth = selectedMonths.includes(r.month);
    return okCat && okSp && okMonth;
  });

  const wb = XLSX.utils.book_new();

  selectedMonths.forEach(m => {
    const rs = baseRows.filter(r => r.month === m).sort((a, b) => a.date.localeCompare(b.date));
    const data: any[][] = [headers];

    rs.forEach(r => {
      const cat = CAT_MAP[r.species] || 'Ruminansia';
      const rend = r.hidup ? (r.karkas / r.hidup) * 100 : 0;
      data.push([
        r.date,
        r.month,
        r.species,
        cat,
        r.ekor,
        r.male,
        r.female_nonprod,
        r.hidup,
        r.karkas,
        r.daging,
        Number(rend.toFixed(2)),
        r.jeroan || 0,
        r.produk_lainnya || 0,
        r.created_by || 'Admin'
      ]);
    });

    if (rs.length > 0) {
      const sumK = (k: keyof SlaughterRow) => rs.reduce((acc, c) => acc + Number(c[k] || 0), 0);
      const totHid = sumK('hidup');
      const totKar = sumK('karkas');
      data.push([]);
      data.push([
        'TOTAL', '', '', '',
        sumK('ekor'),
        sumK('male'),
        sumK('female_nonprod'),
        totHid,
        totKar,
        sumK('daging'),
        totHid ? Number(((totKar / totHid) * 100).toFixed(2)) : 0,
        sumK('jeroan'),
        sumK('produk_lainnya'),
        ''
      ]);
    }

    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, m.substring(0, 10));
  });

  // Summary sheet
  const allRS = baseRows.sort((a, b) => a.date.localeCompare(b.date));
  const dataAll: any[][] = [headers];
  allRS.forEach(r => {
    const cat = CAT_MAP[r.species] || 'Ruminansia';
    const rend = r.hidup ? (r.karkas / r.hidup) * 100 : 0;
    dataAll.push([
      r.date,
      r.month,
      r.species,
      cat,
      r.ekor,
      r.male,
      r.female_nonprod,
      r.hidup,
      r.karkas,
      r.daging,
      Number(rend.toFixed(2)),
      r.jeroan || 0,
      r.produk_lainnya || 0,
      r.created_by || 'Admin'
    ]);
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(dataAll), 'Rekap Semua');

  XLSX.writeFile(wb, `SMART-RPH Excel - ${bulanLabel} - UPT RPH Kota Cirebon.xlsx`);
}

export function exportBpsOfficial(rows: SlaughterRow[], selectedMonths: string[]): void {
  if (!selectedMonths || selectedMonths.length === 0) return;

  const wb = XLSX.utils.book_new();
  const monthNames: Record<string, string> = {
    Januari: 'JANUARI', Februari: 'FEBRUARI', Maret: 'MARET', April: 'APRIL',
    Mei: 'MEI', Juni: 'JUNI', Juli: 'JULI', Agustus: 'AGUSTUS',
    September: 'SEPTEMBER', Oktober: 'OKTOBER', November: 'NOVEMBER', Desember: 'DESEMBER'
  };

  selectedMonths.forEach(m => {
    const ws_data: any[][] = [];
    for (let i = 0; i < 105; i++) ws_data.push(new Array(31).fill(null));

    ws_data[1][1] = 'KALENDER PENCATATAN PEMOTONGAN TERNAK 2026';
    ws_data[2][1] = 'BADAN PUSAT STATISTIK - UPT RPH KOTA CIREBON';
    ws_data[3][21] = 'K I P (diisi oleh BPS)';
    ws_data[3][25] = ':  ';
    ws_data[4][11] = 'BULAN ' + (monthNames[m] || m.toUpperCase());
    ws_data[4][21] = 'NAMA RPH/TPH/DINAS';
    ws_data[4][25] = ':  UPT RPH Kota Cirebon';
    ws_data[5][1] = ' Info lebih lanjut, hubungi: Subdirektorat Statistik Peternakan Ext. 5210-3';
    ws_data[5][11] = 'JENIS TERNAK YANG DIPOTONG : SAPI';
    ws_data[5][21] = 'ALAMAT';
    ws_data[5][25] = ':  Jl. Kalijaga, Pegambiran, Kec. Lemahwungkuk';

    ws_data[7][1] = 'Tanggal';
    ws_data[7][2] = 'Jumlah Ternak yang Dipotong Menurut Jenis Rumpun / Jenis Ternak (Ekor)';
    ws_data[7][14] = 'Total Berat Ternak yang Dipotong (Kg)';
    ws_data[7][26] = 'Berat Lainnya';

    ws_data[9][2] = 'Ex-Import ';
    ws_data[9][5] = 'Lokal';
    ws_data[10][2] = 'Jantan';
    ws_data[10][3] = 'Betina';
    ws_data[10][5] = 'Jantan';
    ws_data[10][6] = 'Betina';
    ws_data[10][14] = 'Ternak Hidup';
    ws_data[10][15] = 'Karkas';
    ws_data[10][16] = 'Daging';
    ws_data[10][17] = 'Ternak Hidup';
    ws_data[10][18] = 'Karkas';
    ws_data[10][19] = 'Daging';

    ws_data[12][1] = -1;
    for (let c = 2; c <= 30; c++) ws_data[12][c] = -c;

    const monthRowsSapi = rows.filter(r => r.month === m && r.species === 'Sapi');
    for (let d = 1; d <= 31; d++) {
      const rIdx = 12 + d;
      const dayData = monthRowsSapi.filter(r => parseInt(String(r.date).slice(-2), 10) === d);
      ws_data[rIdx][1] = d;
      if (dayData.length === 0) continue;

      const ex = dayData[0]?.groups?.['Ex-Import'] || { ekor: 0, hidup: 0, karkas: 0, daging: 0, male: 0, female_nonprod: 0, female_prod: 0 };
      const lo = dayData[0]?.groups?.['Lokal'] || { ekor: 0, hidup: 0, karkas: 0, daging: 0, male: 0, female_nonprod: 0, female_prod: 0 };

      ws_data[rIdx][2] = ex.male || null;
      ws_data[rIdx][3] = (ex.female_nonprod || 0) + (ex.female_prod || 0) || null;
      ws_data[rIdx][4] = ex.ekor || null;

      ws_data[rIdx][5] = lo.male || null;
      ws_data[rIdx][6] = (lo.female_nonprod || 0) + (lo.female_prod || 0) || null;
      ws_data[rIdx][7] = lo.ekor || null;

      ws_data[rIdx][14] = ex.hidup || null;
      ws_data[rIdx][15] = ex.karkas || null;
      ws_data[rIdx][16] = ex.daging || null;
      ws_data[rIdx][17] = lo.hidup || null;
      ws_data[rIdx][18] = lo.karkas || null;
      ws_data[rIdx][19] = lo.daging || null;
    }

    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    ws['!merges'] = [
      { s: { r: 1, c: 1 }, e: { r: 1, c: 10 } },
      { s: { r: 2, c: 1 }, e: { r: 2, c: 10 } },
      { s: { r: 4, c: 11 }, e: { r: 4, c: 20 } }
    ];
    ws['!cols'] = new Array(31).fill({ wch: 12 });
    XLSX.utils.book_append_sheet(wb, ws, shortMonth(m));
  });

  XLSX.writeFile(wb, `BPS RPH Kota Cirebon - ${selectedMonths.join('-')} 2026 - Resmi.xlsx`);
}
