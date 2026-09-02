import React from 'react';
import { BpsTableData, formatBpsNumber } from '../utils/bpsFormatHelper';
import { BpsLogo } from './BpsLogo';

interface BpsOfficialTableProps {
  data: BpsTableData;
}

export const BpsOfficialSingleTable: React.FC<BpsOfficialTableProps> = ({ data }) => {
  const isSapi = data.speciesCategory === 'SAPI';

  return (
    <div className="bg-white text-black p-4 font-sans text-[11px] leading-tight select-text print:p-0 print:m-0">
      {/* 1. KOP ATAS */}
      <div className="flex justify-between items-start border-b-2 border-black pb-2 mb-2 gap-4">
        {/* Kiri: Logo & Info BPS */}
        <div className="w-[32%] flex gap-2.5 items-start">
          {/* Logo BPS SVG Resmi */}
          <BpsLogo className="w-13 h-13" />
          <div className="space-y-0.5 text-[9px] leading-[1.25]">
            <h1 className="text-xs font-black tracking-tight text-black uppercase">
              Badan Pusat Statistik
            </h1>
            <p className="italic font-semibold text-gray-700">
              Pelopor Data Statistik Terpercaya untuk Semua
            </p>
            <p className="text-gray-800">
              Jl. dr. Sutomo No. 6-8, Jakarta-10710
            </p>
            <p className="text-gray-800">
              Telp. (021) 3841195, 3842508, 3810291-4 Fax. (021) 3857046
            </p>
            <p className="text-gray-800">
              Homepage: http://www.bps.go.id  E-mail: bpshq@bps.go.id
            </p>
          </div>
        </div>

        {/* Tengah: Judul & Bulan & Jenis Ternak */}
        <div className="flex-1 text-center space-y-1">
          <h2 className="text-sm font-black tracking-wide uppercase text-black">
            Kalender Pencatatan Pemotongan Ternak {data.year}
          </h2>
          <p className="text-[10px] text-gray-800 italic max-w-xl mx-auto">
            Tujuan pencatatan adalah untuk memperoleh data pemotongan ternak yang akurat dan tepat waktu sebagai bahan perencanaan pembangunan
          </p>
          <div className="pt-1">
            <span className="text-xs font-black uppercase text-black border-b border-black pb-0.5 px-2">
              BULAN {data.month}
            </span>
          </div>
          <div className="pt-0.5">
            <span className="text-xs font-black uppercase text-black">
              JENIS TERNAK YANG DIPOTONG : {data.speciesCategory}
            </span>
          </div>
        </div>

        {/* Kanan: Daftar KPPT, KIP, Identitas RPH */}
        <div className="w-[32%] space-y-1 text-[10px]">
          <div className="flex justify-end">
            <div className="border border-black px-4 py-0.5 font-bold text-[10px] uppercase">
              DAFTAR KPPT
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-bold text-[10px] whitespace-nowrap">
              K I P (diisi oleh BPS)&nbsp;&nbsp;:
            </span>
            <div className="flex border border-black divide-x divide-black h-4.5">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="w-3.5 h-full bg-white text-center text-[9px] font-mono">
                  {i < 4 ? ['3', '2', '7', '4'][i] : ''}
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-0.5 text-[10px] pt-0.5">
            <div className="flex">
              <span className="font-bold w-36">NAMA RPH/TPH/DINAS</span>
              <span className="font-bold">: {data.rphName}</span>
            </div>
            <div className="flex items-start">
              <span className="font-bold w-36">ALAMAT</span>
              <div>
                <p className="font-bold">: {data.rphAddress}</p>
                <p className="font-bold pl-2">{data.rphSubdistrict}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-[9px] text-gray-800 mb-1.5 font-semibold">
        Info lebih lanjut, hubungi: Subdirektorat Statistik Peternakan Ext. 5210-3 E-mail: peternakan@bps.go.id
      </div>

      {/* 2. TABEL KUNING RESMI BPS */}
      <div className="overflow-x-auto border-2 border-black">
        <table className="w-full border-collapse text-center text-[10px] font-sans">
          <thead>
            {/* Header Lapis 1 */}
            <tr className="bg-[#FFFF00] text-black font-black border-b border-black divide-x divide-black">
              <th rowSpan={4} className="border border-black px-1.5 py-1 w-8 text-center align-middle font-bold text-xs">
                Tanggal
              </th>
              <th colSpan={12} className="border border-black px-2 py-1 leading-tight text-center font-bold">
                Jumlah Ternak yang Dipotong Menurut Jenis Rumpun / Jenis Ternak (Ekor)
                <div className="text-[8.5px] font-normal normal-case pt-0.5">
                  [Untuk sapi tuliskan jenis rumpun, sedangkan untuk selain sapi tuliskan jenis ternak pada titik-titik '......' yang tersedia di atas judul kolom]
                </div>
              </th>
              <th colSpan={12} className="border border-black px-2 py-1 leading-tight text-center font-bold">
                Total Berat Ternak yang Dipotong Menurut Jenis Rumpun / Jenis Ternak (Kg)
                <div className="text-[8.5px] font-normal normal-case pt-0.5">
                  [Untuk sapi tuliskan jenis rumpun, sedangkan untuk selain sapi tuliskan jenis ternak pada titik-titik '......' yang tersedia dan sesuaikan isiannya dengan kolom (2) s.d. (13)]
                </div>
              </th>
              <th colSpan={5} className="border border-black px-2 py-1 text-center font-bold align-middle">
                Berat Lainnya
              </th>
            </tr>

            {/* Header Lapis 2: Sub Rumpun / Jenis Ternak */}
            <tr className="bg-[#FFFF00] text-black font-bold border-b border-black divide-x divide-black text-[9.5px]">
              {isSapi ? (
                <>
                  <th colSpan={3} className="border border-black py-0.5">Ex-Import</th>
                  <th colSpan={3} className="border border-black py-0.5">Lokal</th>
                  <th colSpan={3} className="border border-black py-0.5">.............</th>
                  <th colSpan={3} className="border border-black py-0.5">.............</th>
                  <th colSpan={3} className="border border-black py-0.5">Ex-Import</th>
                  <th colSpan={3} className="border border-black py-0.5">Lokal</th>
                  <th colSpan={3} className="border border-black py-0.5">.............</th>
                  <th colSpan={3} className="border border-black py-0.5">.............</th>
                </>
              ) : (
                <>
                  <th colSpan={3} className="border border-black py-0.5">BAB</th>
                  <th colSpan={3} className="border border-black py-0.5">KER</th>
                  <th colSpan={3} className="border border-black py-0.5">.............</th>
                  <th colSpan={3} className="border border-black py-0.5">.............</th>
                  <th colSpan={3} className="border border-black py-0.5">BAB</th>
                  <th colSpan={3} className="border border-black py-0.5">KER</th>
                  <th colSpan={3} className="border border-black py-0.5">.............</th>
                  <th colSpan={3} className="border border-black py-0.5">.............</th>
                </>
              )}
              <th rowSpan={3} className="border border-black py-0.5 align-middle">Jeroan</th>
              <th rowSpan={3} className="border border-black py-0.5 align-middle">Kulit Basah</th>
              <th rowSpan={3} className="border border-black py-0.5 align-middle">Daging Skeletal</th>
              <th rowSpan={3} className="border border-black py-0.5 align-middle">Daging Variasi</th>
              <th rowSpan={3} className="border border-black py-0.5 align-middle">Produk lainnya</th>
            </tr>

            {/* Header Lapis 3: Jantan & Betina & Berat */}
            <tr className="bg-[#FFFF00] text-black font-bold border-b border-black divide-x divide-black text-[9px]">
              {/* Ekor Groups */}
              {[1, 2, 3, 4].map((g) => (
                <React.Fragment key={`ekor-grp-${g}`}>
                  <th rowSpan={2} className="border border-black py-0.5 align-middle w-7">Jantan</th>
                  <th colSpan={2} className="border border-black py-0.5">Betina</th>
                </React.Fragment>
              ))}
              {/* Berat Groups */}
              {[1, 2, 3, 4].map((g) => (
                <React.Fragment key={`berat-grp-${g}`}>
                  <th rowSpan={2} className="border border-black py-0.5 align-middle w-9 leading-tight">Ternak Hidup</th>
                  <th rowSpan={2} className="border border-black py-0.5 align-middle w-8">Karkas</th>
                  <th rowSpan={2} className="border border-black py-0.5 align-middle w-8">Daging</th>
                </React.Fragment>
              ))}
            </tr>

            {/* Header Lapis 4: Sub Betina Produktif vs Tidak Produktif */}
            <tr className="bg-[#FFFF00] text-black font-bold border-b border-black divide-x divide-black text-[8px] leading-tight">
              {[1, 2, 3, 4].map((g) => (
                <React.Fragment key={`fem-sub-${g}`}>
                  <th className="border border-black py-0.5 w-6">Produktif</th>
                  <th className="border border-black py-0.5 w-7">Tidak Produktif</th>
                </React.Fragment>
              ))}
            </tr>

            {/* Header Lapis 5: Nomor Kolom (1) s.d. (30) */}
            <tr className="bg-[#FFFF00] text-black font-bold border-b-2 border-black divide-x divide-black text-[8.5px]">
              {Array.from({ length: 30 }).map((_, i) => (
                <th key={`col-num-${i}`} className="border border-black py-0.5">
                  ({i + 1})
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-black font-mono text-[9px]">
            {/* 31 Baris Tanggal */}
            {data.days.map((dayItem) => {
              const hasData = dayItem.cols.some((v) => v !== null && v !== '' && v !== undefined);
              return (
                <tr
                  key={`day-${dayItem.day}`}
                  className={`divide-x divide-black hover:bg-yellow-50/60 transition-colors ${
                    hasData ? 'bg-white' : 'bg-gray-50/30'
                  }`}
                >
                  <td className="border border-black py-0.5 px-1 font-bold text-center font-sans">
                    {dayItem.day}
                  </td>
                  {Array.from({ length: 29 }).map((_, cIdx) => {
                    const colNum = cIdx + 2;
                    const val = dayItem.cols[colNum];
                    return (
                      <td
                        key={`cell-${dayItem.day}-${colNum}`}
                        className="border border-black py-0.5 px-0.5 text-right whitespace-nowrap"
                      >
                        {typeof val === 'number'
                          ? formatBpsNumber(val, false)
                          : val || ''}
                      </td>
                    );
                  })}
                </tr>
              );
            })}

            {/* Baris Total / JUMLAH */}
            <tr className="bg-white font-bold divide-x divide-black border-t-2 border-b-2 border-black text-black">
              <td className="border border-black py-1 px-1 text-center font-sans font-black text-xs">
                JUMLAH
              </td>
              {Array.from({ length: 29 }).map((_, cIdx) => {
                const colNum = cIdx + 2;
                const totVal = data.totals[colNum];
                return (
                  <td
                    key={`tot-${colNum}`}
                    className="border border-black py-1 px-0.5 text-right font-mono font-bold whitespace-nowrap text-[9.5px]"
                  >
                    {typeof totVal === 'number'
                      ? formatBpsNumber(totVal, false)
                      : totVal || ''}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      {/* 3. FOOTER BARIS ABU-ABU */}
      <div className="mt-3 border border-black bg-[#E2E8F0] p-1.5 text-center text-[10px] font-black tracking-wider uppercase text-black">
        PARTISIPASI ANDA DALAM MELENGKAPI DATA INI MEMBANTU PERENCANAAN PEMBANGUNAN
      </div>
    </div>
  );
};

export const BpsOfficialDocument: React.FC<{
  sapiData: BpsTableData;
  selainSapiData: BpsTableData;
}> = ({ sapiData, selainSapiData }) => {
  return (
    <div className="space-y-8 print:space-y-0">
      {/* Tabel 1: SAPI */}
      <section className="print:break-after-page shadow-sm rounded-lg overflow-hidden border border-gray-300">
        <BpsOfficialSingleTable data={sapiData} />
      </section>

      {/* Tabel 2: SELAIN SAPI */}
      <section className="print:break-after-page shadow-sm rounded-lg overflow-hidden border border-gray-300">
        <BpsOfficialSingleTable data={selainSapiData} />
      </section>
    </div>
  );
};
