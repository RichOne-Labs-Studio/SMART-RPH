import { SlaughterRow } from '../types';
import { MONTH_NAMES } from '../services/api';

export interface BpsDayData {
  day: number;
  dateStr: string;
  // Kolom (2) s.d. (30)
  cols: (number | string | null)[];
}

export interface BpsTableData {
  speciesCategory: 'SAPI' | 'SELAIN SAPI';
  month: string;
  year: number;
  rphName: string;
  rphAddress: string;
  rphSubdistrict: string;
  days: BpsDayData[];
  totals: (number | string)[];
}

// Format angka ke format tampilan BPS (misal desimal koma jika ada desimal, jika bulat tanpa koma)
export function formatBpsNumber(val: number | null | undefined, forceEmptyIfZero = true): string {
  if (val === null || val === undefined) return '';
  if (val === 0 && forceEmptyIfZero) return '';
  
  // Jika angka desimal
  if (Number.isInteger(val)) {
    return val.toLocaleString('id-ID');
  }
  // Max 3 desimal, replace dot with comma
  const str = Number(val.toFixed(3)).toString().replace('.', ',');
  // Format ribuan untuk bagian sebelum koma
  const parts = str.split(',');
  const integerPart = parseInt(parts[0], 10).toLocaleString('id-ID');
  return parts.length > 1 ? `${integerPart},${parts[1]}` : integerPart;
}

export function generateBpsTableData(
  rows: SlaughterRow[],
  month: string,
  category: 'SAPI' | 'SELAIN SAPI',
  year = 2026
): BpsTableData {
  const days: BpsDayData[] = [];
  const totalsNum: number[] = new Array(31).fill(0); // index 0 unused, index 1..30

  // Filter baris untuk bulan yang bersangkutan
  const monthRows = rows.filter(r => r.month === month);

  for (let d = 1; d <= 31; d++) {
    const dayStr = String(d).padStart(2, '0');
    // Format YYYY-MM-DD
    const mIdx = MONTH_NAMES.indexOf(month);
    const mPad = mIdx > 0 ? String(mIdx).padStart(2, '0') : '01';
    const fullDate = `${year}-${mPad}-${dayStr}`;

    const cols: (number | string | null)[] = new Array(31).fill(null); // index 1 s.d. 30

    if (category === 'SAPI') {
      const daySapi = monthRows.find(
        r => r.species === 'Sapi' && (r.date === fullDate || parseInt(String(r.date).slice(-2), 10) === d)
      );

      if (daySapi) {
        const ex = daySapi.groups?.['Ex-Import'] || {
          ekor: 0, hidup: 0, karkas: 0, daging: 0,
          male: 0, female_prod: 0, female_nonprod: 0
        };
        const lo = daySapi.groups?.['Lokal'] || {
          ekor: 0, hidup: 0, karkas: 0, daging: 0,
          male: 0, female_prod: 0, female_nonprod: 0
        };

        // Jika groups tidak terpecah jenis kelaminnya secara detail di sub-object
        let exMale = Number(ex.male || 0);
        let exFemProd = Number(ex.female_prod || 0);
        let exFemNon = Number(ex.female_nonprod || 0);

        let loMale = Number(lo.male || 0);
        let loFemProd = Number(lo.female_prod || 0);
        let loFemNon = Number(lo.female_nonprod || 0);

        let exHidup = Number(ex.hidup || 0);
        let exKarkas = Number(ex.karkas || 0);
        let exDaging = Number(ex.daging || 0);

        let loHidup = Number(lo.hidup || 0);
        let loKarkas = Number(lo.karkas || 0);
        let loDaging = Number(lo.daging || 0);

        // Fallback jika grup lokal / ex-import belum terspesifikasi di groups tapi ada di baris
        if (exHidup === 0 && loHidup === 0 && (daySapi.hidup > 0 || daySapi.ekor > 0)) {
          loMale = Number(daySapi.male || 0);
          loFemProd = Number(daySapi.female_prod || 0);
          loFemNon = Number(daySapi.female_nonprod || 0);
          loHidup = Number(daySapi.hidup || 0);
          loKarkas = Number(daySapi.karkas || 0);
          loDaging = Number(daySapi.daging || 0);
        }

        const exEkor = Number(ex.ekor || 0);
        const loEkor = Number(lo.ekor || 0);
        const totMale = Number(daySapi.male || 0);
        const totFemProd = Number(daySapi.female_prod || 0);
        const totFemNon = Number(daySapi.female_nonprod || 0);

        if (exMale === 0 && exFemProd === 0 && exFemNon === 0 && loMale === 0 && loFemProd === 0 && loFemNon === 0) {
          if (exEkor > 0 && loEkor === 0) {
            exMale = totMale;
            exFemProd = totFemProd;
            exFemNon = totFemNon;
          } else if (loEkor > 0 && exEkor === 0) {
            loMale = totMale;
            loFemProd = totFemProd;
            loFemNon = totFemNon;
          } else if (exEkor > 0 && loEkor > 0) {
            // Ex-Import sapi potong impor umumnya dialokasikan ke Betina Tidak Produktif sesuai data BPS
            exFemNon = Math.min(exEkor, totFemNon);
            const remFemNon = totFemNon - exFemNon;
            loFemNon = remFemNon;
            loMale = totMale;
            loFemProd = totFemProd;
          }
        }

        // Kolom (2) s.d. (4): Ex-Import
        cols[2] = exMale > 0 ? exMale : null;
        cols[3] = exFemProd > 0 ? exFemProd : null;
        cols[4] = exFemNon > 0 ? exFemNon : null;

        // Kolom (5) s.d. (7): Lokal
        cols[5] = loMale > 0 ? loMale : null;
        cols[6] = loFemProd > 0 ? loFemProd : null;
        cols[7] = loFemNon > 0 ? loFemNon : null;

        // Kolom (8) s.d. (13): Rumpun 3 & 4 (kosong untuk Sapi)
        cols[8] = null; cols[9] = null; cols[10] = null;
        cols[11] = null; cols[12] = null; cols[13] = null;

        // Kolom (14) s.d. (16): Ex-Import Berat
        cols[14] = exHidup > 0 ? exHidup : (ex.ekor ? 0 : null);
        cols[15] = exKarkas > 0 ? exKarkas : (ex.ekor ? 0 : null);
        cols[16] = exDaging > 0 ? exDaging : (ex.ekor ? 0 : null);

        // Kolom (17) s.d. (19): Lokal Berat
        cols[17] = loHidup > 0 ? loHidup : (lo.ekor ? 0 : null);
        cols[18] = loKarkas > 0 ? loKarkas : (lo.ekor ? 0 : null);
        cols[19] = loDaging > 0 ? loDaging : (lo.ekor ? 0 : null);

        // Kolom (20) s.d. (25): Rumpun 3 & 4 Berat
        cols[20] = null; cols[21] = null; cols[22] = null;
        cols[23] = null; cols[24] = null; cols[25] = null;

        // Kolom (26) s.d. (30): Berat Lainnya
        const jeroan = Number(daySapi.jeroan || 0) || (daySapi.karkas ? daySapi.karkas * 0.231 : 0);
        const kulit = Number(daySapi.kulit_basah || 0);
        const skeletal = Number(daySapi.daging_skeletal || 0);
        const variasi = Number(daySapi.daging_variasi || 0);
        const prodLain = Number(daySapi.produk_lainnya || 0) || (daySapi.karkas ? daySapi.karkas * 0.03 : 0);

        cols[26] = jeroan > 0 ? Math.round(jeroan) : (daySapi.ekor ? 0 : null);
        cols[27] = kulit > 0 ? kulit : null;
        cols[28] = skeletal > 0 ? skeletal : null;
        cols[29] = variasi > 0 ? variasi : null;
        cols[30] = prodLain > 0 ? Math.round(prodLain) : (daySapi.ekor ? 0 : null);
      }
    } else {
      // Category: SELAIN SAPI (Babi = BAB, Kerbau = KER, Domba = DOM, Kambing = KAM)
      const dayRows = monthRows.filter(
        r => r.species !== 'Sapi' && (r.date === fullDate || parseInt(String(r.date).slice(-2), 10) === d)
      );

      const babi = dayRows.find(r => r.species === 'Babi');
      const kerbau = dayRows.find(r => r.species === 'Kerbau');
      const domba = dayRows.find(r => r.species === 'Domba');
      const kambing = dayRows.find(r => r.species === 'Kambing');

      // BAB (Babi): Kolom 2, 3, 4 & 14, 15, 16
      if (babi) {
        cols[2] = babi.male > 0 ? babi.male : null;
        cols[3] = babi.female_prod > 0 ? babi.female_prod : null;
        cols[4] = babi.female_nonprod > 0 ? babi.female_nonprod : null;
        cols[14] = babi.hidup > 0 ? babi.hidup : (babi.ekor ? 0 : null);
        cols[15] = babi.karkas > 0 ? babi.karkas : (babi.ekor ? 0 : null);
        cols[16] = babi.daging > 0 ? babi.daging : (babi.ekor ? 0 : null);
      }

      // KER (Kerbau): Kolom 5, 6, 7 & 17, 18, 19
      if (kerbau) {
        cols[5] = kerbau.male > 0 ? kerbau.male : null;
        cols[6] = kerbau.female_prod > 0 ? kerbau.female_prod : null;
        cols[7] = kerbau.female_nonprod > 0 ? kerbau.female_nonprod : null;
        cols[17] = kerbau.hidup > 0 ? kerbau.hidup : (kerbau.ekor ? 0 : null);
        cols[18] = kerbau.karkas > 0 ? kerbau.karkas : (kerbau.ekor ? 0 : null);
        cols[19] = kerbau.daging > 0 ? kerbau.daging : (kerbau.ekor ? 0 : null);
      }

      // DOM (Domba): Kolom 8, 9, 10 & 20, 21, 22
      if (domba) {
        cols[8] = domba.male > 0 ? domba.male : null;
        cols[9] = domba.female_prod > 0 ? domba.female_prod : null;
        cols[10] = domba.female_nonprod > 0 ? domba.female_nonprod : null;
        cols[20] = domba.hidup > 0 ? domba.hidup : (domba.ekor ? 0 : null);
        cols[21] = domba.karkas > 0 ? domba.karkas : (domba.ekor ? 0 : null);
        cols[22] = domba.daging > 0 ? domba.daging : (domba.ekor ? 0 : null);
      }

      // KAM (Kambing): Kolom 11, 12, 13 & 23, 24, 25
      if (kambing) {
        cols[11] = kambing.male > 0 ? kambing.male : null;
        cols[12] = kambing.female_prod > 0 ? kambing.female_prod : null;
        cols[13] = kambing.female_nonprod > 0 ? kambing.female_nonprod : null;
        cols[23] = kambing.hidup > 0 ? kambing.hidup : (kambing.ekor ? 0 : null);
        cols[24] = kambing.karkas > 0 ? kambing.karkas : (kambing.ekor ? 0 : null);
        cols[25] = kambing.daging > 0 ? kambing.daging : (kambing.ekor ? 0 : null);
      }

      // Berat lainnya (akumulasi semua selain sapi hari ini)
      if (dayRows.length > 0) {
        let totJeroan = 0;
        let totKulit = 0;
        let totSkeletal = 0;
        let totVariasi = 0;
        let totProdLain = 0;

        dayRows.forEach(r => {
          totJeroan += (Number(r.jeroan) || (r.karkas ? r.karkas * 0.231 : 0));
          totKulit += Number(r.kulit_basah || 0);
          totSkeletal += Number(r.daging_skeletal || 0);
          totVariasi += Number(r.daging_variasi || 0);
          totProdLain += (Number(r.produk_lainnya) || (r.karkas ? r.karkas * 0.03 : 0));
        });

        cols[26] = totJeroan > 0 ? Math.round(totJeroan) : 0;
        cols[27] = totKulit > 0 ? totKulit : null;
        cols[28] = totSkeletal > 0 ? totSkeletal : null;
        cols[29] = totVariasi > 0 ? totVariasi : null;
        cols[30] = totProdLain > 0 ? Math.round(totProdLain) : (dayRows.some(r => r.ekor > 0) ? Math.round(totProdLain) : null);
      }
    }

    // Akumulasi total per kolom
    for (let c = 2; c <= 30; c++) {
      const val = cols[c];
      if (typeof val === 'number') {
        totalsNum[c] += val;
      }
    }

    days.push({
      day: d,
      dateStr: fullDate,
      cols
    });
  }

  // Format array totals
  const totals: (number | string)[] = new Array(31).fill('');
  for (let c = 2; c <= 30; c++) {
    totals[c] = totalsNum[c] > 0 ? totalsNum[c] : '';
  }

  return {
    speciesCategory: category,
    month: month.toUpperCase(),
    year,
    rphName: 'UPT RPH Kota Cirebon',
    rphAddress: 'Jl. Kalijaga, Pegambiran',
    rphSubdistrict: 'Kec. Lemahwungkuk',
    days,
    totals
  };
}
