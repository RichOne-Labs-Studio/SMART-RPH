import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  SlaughterRow, 
  CategoryFilter, 
  MetricType, 
  UserSession, 
  ToastMessage 
} from './types';
import { INITIAL_DB } from './data/embeddedData';
import { 
  CONFIG, 
  CAT_MAP, 
  ensureRowMeta, 
  getSession, 
  setSession, 
  clearSession, 
  pushAudit, 
  dataSignature, 
  apiGet, 
  apiPost, 
  uid 
} from './services/api';
import { exportExcelMultiMonth, exportBpsOfficial } from './utils/exportUtils';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { KpiGrid } from './components/KpiGrid';
import { AnalysisCards } from './components/AnalysisCards';
import { TrendChart } from './components/TrendChart';
import { DataTable } from './components/DataTable';
import { DayDetailModal } from './components/modals/DayDetailModal';
import { InputDataModal } from './components/modals/InputDataModal';
import { LoginModal } from './components/modals/LoginModal';
import { AdminManageModal } from './components/modals/AdminManageModal';
import { ExcelExportModal } from './components/modals/ExcelExportModal';
import { BpsExportModal } from './components/modals/BpsExportModal';
import { AuditLogModal } from './components/modals/AuditLogModal';
import { Toast } from './components/Toast';

export default function App() {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem(CONFIG.STORAGE_THEME);
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  // Sidebar toggle state
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    try {
      return localStorage.getItem(CONFIG.STORAGE_SIDEBAR) !== '1';
    } catch {
      return true;
    }
  });

  // Data rows state
  const [rows, setRows] = useState<SlaughterRow[]>(() => {
    return (INITIAL_DB.data || []).map((r, i) => ensureRowMeta(r, i));
  });

  // User session state
  const [user, setUser] = useState<UserSession | null>(() => getSession());

  // Filter states
  const [category, setCategory] = useState<CategoryFilter>('Semua');
  const [selectedMonth, setSelectedMonth] = useState<string>('Semua');
  const [selectedSpecies, setSelectedSpecies] = useState<string>('Semua');
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('ekor');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Sync state
  const [syncStatus, setSyncStatus] = useState<{ text: string; ok: boolean }>({
    text: 'Memuat data…',
    ok: true
  });
  const [lastSignature, setLastSignature] = useState<string>('');

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modals state
  const [detailModal, setDetailModal] = useState<{ open: boolean; date: string; species?: string }>({
    open: false,
    date: ''
  });
  const [inputModal, setInputModal] = useState<{ open: boolean; editingRow: SlaughterRow | null }>({
    open: false,
    editingRow: null
  });
  const [loginModalOpen, setLoginModalOpen] = useState<boolean>(false);
  const [adminModalOpen, setAdminModalOpen] = useState<boolean>(false);
  const [excelModalOpen, setExcelModalOpen] = useState<boolean>(false);
  const [bpsModalOpen, setBpsModalOpen] = useState<boolean>(false);
  const [auditModalOpen, setAuditModalOpen] = useState<boolean>(false);

  // Toast helper
  const showToast = useCallback((text: string, type: 'ok' | 'err' | 'warn' | 'info' = 'ok') => {
    const id = uid();
    setToasts(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Theme effect
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
    localStorage.setItem(CONFIG.STORAGE_THEME, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const toggleSidebar = () => {
    setSidebarOpen(prev => {
      const next = !prev;
      localStorage.setItem(CONFIG.STORAGE_SIDEBAR, next ? '0' : '1');
      return next;
    });
  };

  // Sync with Google Apps Script
  const syncWithSheet = useCallback(async (isAuto = false) => {
    setSyncStatus({
      text: isAuto ? 'Sinkronisasi otomatis…' : 'Menghubungi Spreadsheet…',
      ok: false
    });

    try {
      const res = await apiGet('getData');
      const sheetData = Array.isArray(res.json) ? res.json : res.json && Array.isArray(res.json.data) ? res.json.data : null;

      if (sheetData && sheetData.length > 0) {
        const newRows = sheetData.map((r: any, i: number) => ensureRowMeta(r, i));
        const sig = dataSignature(newRows);

        if (sig !== lastSignature) {
          setRows(newRows);
          setLastSignature(sig);
          if (!isAuto) showToast(`Data berhasil disinkronkan (${newRows.length} baris)`, 'ok');
        }

        setSyncStatus({
          text: `Tersinkron • ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} • ${sheetData.length} baris`,
          ok: true
        });
      } else {
        setSyncStatus({
          text: `Data lokal aktif (${rows.length} baris)`,
          ok: true
        });
      }
    } catch {
      setSyncStatus({
        text: 'Mode offline • Data lokal aktif',
        ok: false
      });
    }
  }, [lastSignature, rows.length, showToast]);

  // Initial load and periodic sync
  useEffect(() => {
    syncWithSheet(true);
    const interval = setInterval(() => {
      syncWithSheet(true);
    }, CONFIG.SYNC_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [syncWithSheet]);

  // Available species calculation
  const allUniqueSpecies = useMemo(() => {
    return Array.from(new Set(rows.map(r => r.species).filter(Boolean))).sort();
  }, [rows]);

  const availableSpecies = useMemo(() => {
    if (category === 'Ruminansia') {
      return allUniqueSpecies.filter(s => (CAT_MAP[s] || 'Ruminansia') === 'Ruminansia');
    }
    if (category === 'Babi') {
      const babiList = allUniqueSpecies.filter(s => CAT_MAP[s] === 'Babi');
      return babiList.length ? babiList : ['Babi'];
    }
    return allUniqueSpecies;
  }, [allUniqueSpecies, category]);

  // When category changes, auto adjust species
  const handleCategoryChange = (newCat: CategoryFilter) => {
    setCategory(newCat);
    if (newCat === 'Babi') {
      setSelectedSpecies('Babi');
    } else if (selectedSpecies === 'Babi' && newCat === 'Ruminansia') {
      setSelectedSpecies('Semua');
    }
  };

  // Filtered rows
  const filteredRows = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return rows.filter(r => {
      // Month
      const okMonth = selectedMonth === 'Semua' || r.month === selectedMonth;
      // Species
      const okSpecies = selectedSpecies === 'Semua' || r.species === selectedSpecies;
      // Category
      const cat = CAT_MAP[r.species] || 'Ruminansia';
      const okCategory = category === 'Semua' || cat === category;
      // Query
      const okQuery =
        !q ||
        r.date.includes(q) ||
        r.species.toLowerCase().includes(q) ||
        r.month.toLowerCase().includes(q);

      return okMonth && okSpecies && okCategory && okQuery;
    });
  }, [rows, selectedMonth, selectedSpecies, category, searchQuery]);

  // Aggregated totals for KPIs
  const totalEkor = useMemo(() => filteredRows.reduce((acc, r) => acc + Number(r.ekor || 0), 0), [filteredRows]);
  const totalHidup = useMemo(() => filteredRows.reduce((acc, r) => acc + Number(r.hidup || 0), 0), [filteredRows]);
  const totalKarkas = useMemo(() => filteredRows.reduce((acc, r) => acc + Number(r.karkas || 0), 0), [filteredRows]);
  const totalDaging = useMemo(() => filteredRows.reduce((acc, r) => acc + Number(r.daging || 0), 0), [filteredRows]);

  // Aggregated products
  const products = useMemo(() => {
    return {
      jeroan: filteredRows.reduce((acc, r) => acc + Number(r.jeroan || 0), 0),
      kulit_basah: filteredRows.reduce((acc, r) => acc + Number(r.kulit_basah || 0), 0),
      daging_skeletal: filteredRows.reduce((acc, r) => acc + Number(r.daging_skeletal || 0), 0),
      daging_variasi: filteredRows.reduce((acc, r) => acc + Number(r.daging_variasi || 0), 0),
      produk_lainnya: filteredRows.reduce((acc, r) => acc + Number(r.produk_lainnya || 0), 0),
    };
  }, [filteredRows]);

  // Aggregated Sex stats
  const sexStats = useMemo(() => {
    return {
      male: filteredRows.reduce((acc, r) => acc + Number(r.male || 0), 0),
      female_prod: filteredRows.reduce((acc, r) => acc + Number(r.female_prod || 0), 0),
      female_nonprod: filteredRows.reduce((acc, r) => acc + Number(r.female_nonprod || 0), 0),
    };
  }, [filteredRows]);

  // Species distribution for analysis card
  const speciesDistribution = useMemo(() => {
    const map: Record<string, number> = {};
    filteredRows.forEach(r => {
      map[r.species] = (map[r.species] || 0) + Number(r.ekor || 0);
    });
    return Object.entries(map)
      .map(([species, count]) => ({
        species,
        count,
        category: CAT_MAP[species] || 'Ruminansia'
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredRows]);

  // Reset filters
  const handleResetFilters = () => {
    setCategory('Semua');
    setSelectedMonth('Semua');
    setSelectedSpecies('Semua');
    setSelectedMetric('ekor');
    setSearchQuery('');
    showToast('Filter telah direset ke pengaturan default', 'info');
  };

  // Auth actions
  const handleLogin = async (u: string, p: string): Promise<boolean> => {
    try {
      const res = await apiPost({ action: 'login', username: u, password: p });
      if (res.json && res.json.status === 'success' && res.json.user) {
        const loggedUser = setSession({
          username: String(res.json.user.username || u),
          role: String(res.json.user.role || 'admin').toLowerCase(),
          token: res.json.token || null
        });
        setUser(loggedUser);
        pushAudit('login', { username: u, role: loggedUser.role });
        showToast(`Selamat datang, ${loggedUser.username}! (${loggedUser.role})`, 'ok');
        syncWithSheet(false);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const handleLogout = () => {
    if (user) pushAudit('logout', { username: user.username });
    clearSession();
    setUser(null);
    showToast('Berhasil logout dari sesi admin', 'info');
  };

  // Input / Update row
  const handleSaveRow = async (data: Partial<SlaughterRow>, editId?: string) => {
    const nowIso = new Date().toISOString();

    if (editId) {
      // Edit existing
      const idx = rows.findIndex(r => r.id === editId || `${r.date}|${r.species}` === editId);
      if (idx >= 0) {
        const prev = rows[idx];
        const updated = ensureRowMeta({
          ...prev,
          ...data,
          id: prev.id || uid(),
          updated_at: nowIso,
          created_by: prev.created_by || user?.username
        });

        const newRows = [...rows];
        newRows[idx] = updated;
        setRows(newRows);
        pushAudit('updateRow', { id: updated.id, date: updated.date, species: updated.species });
        showToast(`Data ${updated.date} (${updated.species}) diperbarui`, 'ok');

        // Async server update
        apiPost({ action: 'updateRow', data: updated }).catch(() => {});
      }
    } else {
      // Add new
      const newRow = ensureRowMeta({
        ...data,
        id: uid(),
        created_at: nowIso,
        updated_at: nowIso,
        created_by: user?.username || 'admin'
      });

      setRows(prev => [newRow, ...prev]);
      pushAudit('addRow', { id: newRow.id, date: newRow.date, species: newRow.species });
      showToast(`Data pemotongan baru disimpan (${newRow.species})`, 'ok');

      // Async server push
      apiPost({ action: 'addRow', data: newRow }).catch(() => {});
    }
  };

  // Delete row
  const handleDeleteRow = async (id: string, date: string, species: string, ekor: number) => {
    if (!user) {
      showToast('Akses admin diperlukan untuk menghapus', 'err');
      return;
    }
    if (!confirm(`Hapus catatan pemotongan tanggal ${date} • ${species} (${ekor} ekor)?`)) {
      return;
    }

    setRows(prev => prev.filter(r => r.id !== id && `${r.date}|${r.species}` !== id));
    pushAudit('deleteRow', { id, date, species, ekor });
    showToast(`Catatan ${date} • ${species} dihapus`, 'warn');

    // Async server delete
    apiPost({ action: 'deleteRow', id, date, species }).catch(() => {});
  };

  // Print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0F1115] text-[#E2E8F0] font-sans antialiased selection:bg-emerald-500 selection:text-white">
      {/* Top Application Bar */}
      <Header
        sidebarOpen={sidebarOpen}
        onToggleSidebar={toggleSidebar}
        theme={theme}
        onToggleTheme={toggleTheme}
        user={user}
        rphTitle={INITIAL_DB.rph || 'SMART-RPH'}
        rphSub="Sistem Monitoring & Administrasi RPH"
      />

      {/* Main Container */}
      <div className="flex-1 max-w-[1600px] w-full mx-auto flex flex-col lg:flex-row">
        {/* Left Sidebar Filter Panel */}
        <Sidebar
          isOpen={sidebarOpen}
          category={category}
          onSetCategory={handleCategoryChange}
          selectedMonth={selectedMonth}
          onSetMonth={setSelectedMonth}
          selectedSpecies={selectedSpecies}
          onSetSpecies={setSelectedSpecies}
          availableSpecies={availableSpecies}
          selectedMetric={selectedMetric}
          onSetMetric={setSelectedMetric}
          searchQuery={searchQuery}
          onSetSearchQuery={setSearchQuery}
          onResetFilters={handleResetFilters}
          onExportExcel={() => setExcelModalOpen(true)}
          onExportBps={() => setBpsModalOpen(true)}
          onPrint={handlePrint}
          user={user}
          onOpenLogin={() => setLoginModalOpen(true)}
          onLogout={handleLogout}
          onOpenInput={() => setInputModal({ open: true, editingRow: null })}
          onOpenAdmin={() => setAdminModalOpen(true)}
          onOpenAudit={() => setAuditModalOpen(true)}
        />

        {/* Right Dashboard Area */}
        <main className="flex-1 p-4 sm:p-6 space-y-6 min-w-0">
          {/* Executive KPI Metric Grid */}
          <KpiGrid
            totalEkor={totalEkor}
            totalHidup={totalHidup}
            totalKarkas={totalKarkas}
            totalDaging={totalDaging}
            rowCount={filteredRows.length}
          />

          {/* Analytical Breakdown Widgets */}
          <AnalysisCards
            speciesDistribution={speciesDistribution}
            sexStats={sexStats}
            totalHidup={totalHidup}
            totalKarkas={totalKarkas}
            totalDaging={totalDaging}
            products={products}
          />

          {/* Interactive Chart */}
          <TrendChart
            rows={filteredRows}
            allRows={rows}
            selectedMonth={selectedMonth}
            selectedMetric={selectedMetric}
            category={category}
            species={selectedSpecies}
            theme={theme}
            onDrilldownMonth={(m) => {
              setSelectedMonth(m);
              showToast(`Menampilkan tren harian bulan ${m}`, 'info');
            }}
            onOpenDayDetail={(date, sp) => {
              setDetailModal({ open: true, date, species: sp });
            }}
          />

          {/* Daily Records Data Table */}
          <DataTable
            rows={filteredRows}
            user={user}
            onOpenDetail={(date, sp) => setDetailModal({ open: true, date, species: sp })}
            onEditRow={(row) => setInputModal({ open: true, editingRow: row })}
            onDeleteRow={handleDeleteRow}
          />

          {/* Footer */}
          <footer className="pt-6 pb-4 border-t border-[#2D333F] text-center text-xs text-[#94A3B8] space-y-1">
            <p className="font-extrabold text-[#E2E8F0]">
              SMART-RPH • UPT Rumah Potong Hewan Kota Cirebon
            </p>
            <p className="text-[#64748B]">
              Jl. Kalijaga, Pegambiran, Kec. Lemahwungkuk, Kota Cirebon
            </p>
          </footer>
        </main>
      </div>

      {/* Modals Container */}
      <DayDetailModal
        isOpen={detailModal.open}
        date={detailModal.date}
        species={detailModal.species}
        rows={rows}
        onClose={() => setDetailModal({ open: false, date: '' })}
      />

      <InputDataModal
        isOpen={inputModal.open}
        editingRow={inputModal.editingRow}
        onClose={() => setInputModal({ open: false, editingRow: null })}
        onSubmit={handleSaveRow}
      />

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLogin={handleLogin}
      />

      <AdminManageModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
        onShowToast={showToast}
      />

      <ExcelExportModal
        isOpen={excelModalOpen}
        onClose={() => setExcelModalOpen(false)}
        onExport={(monthsToExport) => {
          exportExcelMultiMonth(rows, monthsToExport, category, selectedSpecies);
          pushAudit('exportExcel', { months: monthsToExport });
          showToast(`File Excel berhasil diunduh (${monthsToExport.length} bulan)`, 'ok');
        }}
      />

      <BpsExportModal
        isOpen={bpsModalOpen}
        onClose={() => setBpsModalOpen(false)}
        onExport={(monthsToExport) => {
          exportBpsOfficial(rows, monthsToExport);
          pushAudit('exportBPS', { months: monthsToExport });
          showToast(`File Format Resmi BPS berhasil diunduh (${monthsToExport.length} bulan)`, 'ok');
        }}
      />

      <AuditLogModal
        isOpen={auditModalOpen}
        onClose={() => setAuditModalOpen(false)}
      />

      {/* Toast Notification Stack */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
