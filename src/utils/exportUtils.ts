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

import { generateBpsTableData } from './bpsFormatHelper';

export function exportBpsOfficial(rows: SlaughterRow[], selectedMonths: string[]): void {
  if (!selectedMonths || selectedMonths.length === 0) return;

  const wb = XLSX.utils.book_new();
  const year = 2026;

  selectedMonths.forEach(m => {
    const sapiData = generateBpsTableData(rows, m, 'SAPI', year);
    const selainSapiData = generateBpsTableData(rows, m, 'SELAIN SAPI', year);

    // Fungsi pembantu menambahkan 1 blok tabel BPS (Kop, Header Kuning, 31 Hari, Jumlah, Footer)
    const buildTableBlock = (
      tableData: ReturnType<typeof generateBpsTableData>,
      startRow: number,
      ws_data: any[][],
      merges: XLSX.Range[]
    ) => {
      const isSapi = tableData.speciesCategory === 'SAPI';
      const catLabel = isSapi ? 'SAPI' : 'SELAIN SAPI';

      // 1. KOP ATAS
      ws_data[startRow][0] = 'BADAN PUSAT STATISTIK';
      ws_data[startRow][6] = `KALENDER PENCATATAN PEMOTONGAN TERNAK ${year}`;
      ws_data[startRow][27] = 'DAFTAR KPPT';

      ws_data[startRow + 1][0] = 'Pelopor Data Statistik Terpercaya untuk Semua';
      ws_data[startRow + 1][6] = 'Tujuan pencatatan adalah untuk memperoleh data pemotongan ternak yang akurat dan tepat waktu sebagai bahan perencanaan pembangunan';

      ws_data[startRow + 2][0] = 'Jl. dr. Sutomo No. 6-8, Jakarta-10710';
      ws_data[startRow + 2][18] = 'K I P (diisi oleh BPS)';
      ws_data[startRow + 2][22] = ': ';

      ws_data[startRow + 3][0] = 'Telp. (021) 3841195, 3842508, 3810291-4 Fax. (021) 3857046';
      ws_data[startRow + 3][10] = `BULAN ${m.toUpperCase()}`;
      ws_data[startRow + 3][18] = 'NAMA RPH/TPH/DINAS';
      ws_data[startRow + 3][22] = ': UPT RPH Kota Cirebon';

      ws_data[startRow + 4][0] = 'Homepage: http://www.bps.go.id  E-mail: bpshq@bps.go.id';
      ws_data[startRow + 4][18] = 'ALAMAT';
      ws_data[startRow + 4][22] = ': Jl. Kalijaga, Pegambiran';

      ws_data[startRow + 5][0] = 'Info lebih lanjut, hubungi: Subdirektorat Statistik Peternakan Ext. 5210-3 E-mail: peternakan@bps.go.id';
      ws_data[startRow + 5][10] = `JENIS TERNAK YANG DIPOTONG : ${catLabel}`;
      ws_data[startRow + 5][22] = '  Kec. Lemahwungkuk';

      // 2. HEADER TABEL KUNING
      const hRow = startRow + 7;
      ws_data[hRow][0] = 'Tanggal';
      ws_data[hRow][1] = 'Jumlah Ternak yang Dipotong Menurut Jenis Rumpun / Jenis Ternak (Ekor)\n[Untuk sapi tuliskan jenis rumpun, sedangkan untuk selain sapi tuliskan jenis ternak pada titik-titik \'......\' yang tersedia di atas judul kolom]';
      ws_data[hRow][13] = 'Total Berat Ternak yang Dipotong Menurut Jenis Rumpun / Jenis Ternak (Kg)\n[Untuk sapi tuliskan jenis rumpun, sedangkan untuk selain sapi tuliskan jenis ternak pada titik-titik \'......\' yang tersedia dan sesuaikan isiannya dengan kolom (2) s.d. (13)]';
      ws_data[hRow][25] = 'Berat Lainnya';

      // Sub-kelompok rumpun / jenis ternak
      if (isSapi) {
        ws_data[hRow + 1][1] = 'Ex-Import';
        ws_data[hRow + 1][4] = 'Lokal';
        ws_data[hRow + 1][7] = '.............';
        ws_data[hRow + 1][10] = '.............';
        ws_data[hRow + 1][13] = 'Ex-Import';
        ws_data[hRow + 1][16] = 'Lokal';
        ws_data[hRow + 1][19] = '.............';
        ws_data[hRow + 1][22] = '.............';
      } else {
        ws_data[hRow + 1][1] = 'BAB';
        ws_data[hRow + 1][4] = 'KER';
        ws_data[hRow + 1][7] = '.............';
        ws_data[hRow + 1][10] = '.............';
        ws_data[hRow + 1][13] = 'BAB';
        ws_data[hRow + 1][16] = 'KER';
        ws_data[hRow + 1][19] = '.............';
        ws_data[hRow + 1][22] = '.............';
      }

      // Sex & Berat columns
      for (let offset = 0; offset < 12; offset += 3) {
        ws_data[hRow + 2][1 + offset] = 'Jantan';
        ws_data[hRow + 2][2 + offset] = 'Betina';
        ws_data[hRow + 3][2 + offset] = 'Produktif';
        ws_data[hRow + 3][3 + offset] = 'Tidak Produktif';
      }

      for (let offset = 0; offset < 12; offset += 3) {
        ws_data[hRow + 2][13 + offset] = 'Ternak Hidup';
        ws_data[hRow + 2][14 + offset] = 'Karkas';
        ws_data[hRow + 2][15 + offset] = 'Daging';
      }

      ws_data[hRow + 2][25] = 'Jeroan';
      ws_data[hRow + 2][26] = 'Kulit Basah';
      ws_data[hRow + 2][27] = 'Daging Skeletal';
      ws_data[hRow + 2][28] = 'Daging Variasi';
      ws_data[hRow + 2][29] = 'Produk lainnya';

      // Baris Nomor Kolom (1) s.d. (30)
      for (let c = 0; c < 30; c++) {
        ws_data[hRow + 4][c] = `(${c + 1})`;
      }

      // 3. BARIS DATA 1 s.d. 31
      const dataStartRow = hRow + 5;
      for (let d = 0; d < 31; d++) {
        const rIdx = dataStartRow + d;
        const dayItem = tableData.days[d];
        ws_data[rIdx][0] = d + 1;

        for (let colIdx = 2; colIdx <= 30; colIdx++) {
          const val = dayItem.cols[colIdx];
          ws_data[rIdx][colIdx - 1] = val !== null && val !== undefined ? val : null;
        }
      }

      // 4. BARIS JUMLAH
      const sumRowIdx = dataStartRow + 31;
      ws_data[sumRowIdx][0] = 'JUMLAH';
      for (let colIdx = 2; colIdx <= 30; colIdx++) {
        const tot = tableData.totals[colIdx];
        ws_data[sumRowIdx][colIdx - 1] = tot !== '' && tot !== null && tot !== undefined ? tot : null;
      }

      // 5. FOOTER
      const footerRowIdx = sumRowIdx + 2;
      ws_data[footerRowIdx][0] = 'PARTISIPASI ANDA DALAM MELENGKAPI DATA INI MEMBANTU PERENCANAAN PEMBANGUNAN';

      // Merges
      merges.push(
        { s: { r: startRow, c: 0 }, e: { r: startRow, c: 5 } },
        { s: { r: startRow, c: 6 }, e: { r: startRow, c: 24 } },
        { s: { r: startRow, c: 27 }, e: { r: startRow, c: 29 } },
        { s: { r: startRow + 1, c: 0 }, e: { r: startRow + 1, c: 5 } },
        { s: { r: startRow + 1, c: 6 }, e: { r: startRow + 1, c: 24 } },
        { s: { r: startRow + 3, c: 10 }, e: { r: startRow + 3, c: 15 } },
        { s: { r: startRow + 5, c: 10 }, e: { r: startRow + 5, c: 17 } },
        // Header Table Merges
        { s: { r: hRow, c: 0 }, e: { r: hRow + 3, c: 0 } }, // Tanggal
        { s: { r: hRow, c: 1 }, e: { r: hRow, c: 12 } }, // Jumlah Ekor
        { s: { r: hRow, c: 13 }, e: { r: hRow, c: 24 } }, // Total Berat
        { s: { r: hRow, c: 25 }, e: { r: hRow + 1, c: 29 } }, // Berat Lainnya
        // Sub Rumpun
        { s: { r: hRow + 1, c: 1 }, e: { r: hRow + 1, c: 3 } },
        { s: { r: hRow + 1, c: 4 }, e: { r: hRow + 1, c: 6 } },
        { s: { r: hRow + 1, c: 7 }, e: { r: hRow + 1, c: 9 } },
        { s: { r: hRow + 1, c: 10 }, e: { r: hRow + 1, c: 12 } },
        { s: { r: hRow + 1, c: 13 }, e: { r: hRow + 1, c: 15 } },
        { s: { r: hRow + 1, c: 16 }, e: { r: hRow + 1, c: 18 } },
        { s: { r: hRow + 1, c: 19 }, e: { r: hRow + 1, c: 21 } },
        { s: { r: hRow + 1, c: 22 }, e: { r: hRow + 1, c: 24 } },
        // Betina
        { s: { r: hRow + 2, c: 2 }, e: { r: hRow + 2, c: 3 } },
        { s: { r: hRow + 2, c: 5 }, e: { r: hRow + 2, c: 6 } },
        { s: { r: hRow + 2, c: 8 }, e: { r: hRow + 2, c: 9 } },
        { s: { r: hRow + 2, c: 11 }, e: { r: hRow + 2, c: 12 } },
        // Footer Baris Abu-abu
        { s: { r: footerRowIdx, c: 0 }, e: { r: footerRowIdx, c: 29 } }
      );

      return footerRowIdx + 4; // baris akhir untuk tabel berikutnya
    };

    // Alokasi matriks worksheet (110 baris x 30 kolom)
    const ws_data: any[][] = [];
    for (let i = 0; i < 115; i++) {
      ws_data.push(new Array(30).fill(null));
    }
    const merges: XLSX.Range[] = [];

    // Bangun Tabel 1: SAPI
    const nextRow = buildTableBlock(sapiData, 0, ws_data, merges);

    // Bangun Tabel 2: SELAIN SAPI (Tepat di bawah tabel Sapi dengan Kop & Footer lengkap)
    buildTableBlock(selainSapiData, nextRow, ws_data, merges);

    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    ws['!merges'] = merges;
    ws['!cols'] = [
      { wch: 8 }, // Tanggal
      { wch: 7 }, { wch: 8 }, { wch: 9 }, // Ex-Import / BAB
      { wch: 7 }, { wch: 8 }, { wch: 9 }, // Lokal / KER
      { wch: 7 }, { wch: 8 }, { wch: 9 }, // Rumpun 3 / DOM
      { wch: 7 }, { wch: 8 }, { wch: 9 }, // Rumpun 4 / KAM
      { wch: 10 }, { wch: 9 }, { wch: 9 }, // Berat Ex-Import / BAB
      { wch: 10 }, { wch: 9 }, { wch: 9 }, // Berat Lokal / KER
      { wch: 10 }, { wch: 9 }, { wch: 9 }, // Berat Rumpun 3 / DOM
      { wch: 10 }, { wch: 9 }, { wch: 9 }, // Berat Rumpun 4 / KAM
      { wch: 9 }, { wch: 9 }, { wch: 10 }, { wch: 10 }, { wch: 11 } // Berat Lainnya
    ];

    XLSX.utils.book_append_sheet(wb, ws, `BPS ${shortMonth(m)}`);
  });

  XLSX.writeFile(wb, `BPS Resmi 2026 - UPT RPH Kota Cirebon (${selectedMonths.join('-')}).xlsx`);
}
