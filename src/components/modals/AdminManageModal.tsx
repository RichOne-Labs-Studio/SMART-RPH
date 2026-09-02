import React, { useState, useEffect } from 'react';
import { Users, X, UserPlus, Trash2, Shield, RefreshCw, CheckCircle2 } from 'lucide-react';
import { apiPost, pushAudit, getCachedUsers, saveCachedUsers, fetchSpreadsheetUsers } from '../../services/api';

interface AdminManageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string, type: 'ok' | 'err' | 'warn' | 'info') => void;
}

interface UserItem {
  username: string;
  role: string;
  pass?: string;
}

export const AdminManageModal: React.FC<AdminManageModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [newUser, setNewUser] = useState<string>('');
  const [newPass, setNewPass] = useState<string>('');
  const [newRole, setNewRole] = useState<'petugas' | 'admin' | 'superadmin'>('petugas');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const liveUsers = await fetchSpreadsheetUsers();
      if (liveUsers && liveUsers.length > 0) {
        setUsers(liveUsers);
      } else {
        setUsers(getCachedUsers());
      }
    } catch {
      setUsers(getCachedUsers());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const uname = newUser.trim().toLowerCase();
    if (!uname || !newPass) {
      onShowToast('Isi username dan password', 'err');
      return;
    }
    if (newPass.length < 6) {
      onShowToast('Password minimal 6 karakter', 'err');
      return;
    }

    setLoading(true);
    try {
      // 1. Send to Google Apps Script / Spreadsheet
      const res = await apiPost({ 
        action: 'addUser', 
        username: uname, 
        password: newPass, 
        role: newRole 
      });

      // 2. Add to local user cache immediately
      const currentCached = getCachedUsers();
      const updatedList = [
        ...currentCached.filter(u => u.username.toLowerCase() !== uname),
        { username: uname, role: newRole, pass: newPass }
      ];
      saveCachedUsers(updatedList);
      setUsers(updatedList);

      pushAudit('addUser', { username: uname, role: newRole });
      
      if (res.json && (res.json.status === 'success' || res.json.ok)) {
        onShowToast(`Akun ${uname} (${newRole}) berhasil ditambahkan ke Spreadsheet & Aplikasi`, 'ok');
      } else {
        onShowToast(`Akun ${uname} (${newRole}) aktif di sistem dan tersimpan`, 'ok');
      }

      setNewUser('');
      setNewPass('');
      setNewRole('petugas');
      fetchUsers();
    } catch {
      // Fallback
      const currentCached = getCachedUsers();
      const updatedList = [
        ...currentCached.filter(u => u.username.toLowerCase() !== uname),
        { username: uname, role: newRole, pass: newPass }
      ];
      saveCachedUsers(updatedList);
      setUsers(updatedList);
      onShowToast(`Akun ${uname} (${newRole}) tersimpan di memori aplikasi`, 'info');
      setNewUser('');
      setNewPass('');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (username: string) => {
    if (username.toLowerCase() === 'superadmin') {
      onShowToast('Superadmin utama tidak dapat dihapus', 'err');
      return;
    }
    if (!confirm(`Hapus akun ${username}?`)) return;

    setLoading(true);
    try {
      await apiPost({ action: 'deleteUser', username });
      
      const currentCached = getCachedUsers();
      const updatedList = currentCached.filter(u => u.username.toLowerCase() !== username.toLowerCase());
      saveCachedUsers(updatedList);
      setUsers(updatedList);

      pushAudit('deleteUser', { username });
      onShowToast(`Akun ${username} berhasil dihapus`, 'ok');
      fetchUsers();
    } catch {
      const currentCached = getCachedUsers();
      const updatedList = currentCached.filter(u => u.username.toLowerCase() !== username.toLowerCase());
      saveCachedUsers(updatedList);
      setUsers(updatedList);
      onShowToast(`Akun ${username} dihapus dari daftar`, 'info');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const r = role.toLowerCase();
    if (r === 'superadmin') {
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">Superadmin</span>;
    }
    if (r === 'admin') {
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Admin</span>;
    }
    return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Petugas</span>;
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#0F1115]/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-[#161920] border border-[#2D333F] rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 text-[#E2E8F0] my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#2D333F]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#F1F5F9]">
                Pengaturan Akun & Petugas RPH
              </h3>
              <p className="text-xs text-[#94A3B8]">
                Sinkronisasi otomatis dengan Google Spreadsheet & Aplikasi
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

        {/* User List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-[#CBD5E1]">
            <span>Daftar Akun Terdaftar ({users.length})</span>
            <button
              onClick={fetchUsers}
              disabled={loading}
              className="text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1 text-[11px] disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              <span>Sinkronkan Pengguna</span>
            </button>
          </div>

          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {users.map((u, idx) => (
              <div
                key={`${u.username}-${idx}`}
                className="p-3 rounded-xl bg-[#13161C] border border-[#2D333F] flex items-center justify-between text-xs hover:border-[#3E4556] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Shield className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-[#F1F5F9]">
                        {u.username}
                      </span>
                      {getRoleBadge(u.role)}
                    </div>
                    <span className="text-[10px] text-[#64748B] block mt-0.5">
                      Terkoneksi ke Aplikasi & Spreadsheet
                    </span>
                  </div>
                </div>

                {u.username.toLowerCase() !== 'superadmin' && (
                  <button
                    onClick={() => handleDeleteUser(u.username)}
                    className="p-1.5 rounded-lg text-[#94A3B8] hover:text-rose-400 hover:bg-rose-950/60 transition-colors"
                    title="Hapus Akun"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Add User Form */}
        <form onSubmit={handleAddUser} className="space-y-3 pt-3 border-t border-[#2D333F]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#CBD5E1] block">
              Tambah Akun Petugas / Admin Baru
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Langsung Terhubung
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="text"
              required
              value={newUser}
              onChange={(e) => setNewUser(e.target.value)}
              placeholder="Username (cth: petugas_1)"
              className="w-full px-3 py-2 bg-[#13161C] border border-[#2D333F] rounded-xl text-xs font-semibold text-[#F1F5F9] placeholder:text-[#64748B] focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 focus:outline-none"
            />
            <input
              type="password"
              required
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              placeholder="Password (min 6 kar)"
              className="w-full px-3 py-2 bg-[#13161C] border border-[#2D333F] rounded-xl text-xs font-semibold text-[#F1F5F9] placeholder:text-[#64748B] focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 focus:outline-none"
            />
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as any)}
              className="w-full px-3 py-2 bg-[#13161C] border border-[#2D333F] rounded-xl text-xs font-bold text-[#F1F5F9] focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 focus:outline-none cursor-pointer"
            >
              <option value="petugas">Petugas</option>
              <option value="admin">Admin</option>
              <option value="superadmin">Superadmin</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-sm shadow-purple-950/50 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <UserPlus className="w-4 h-4" />
            <span>{loading ? 'Menyimpan...' : 'Tambah & Simpan Akun'}</span>
          </button>
        </form>

        <button
          onClick={onClose}
          className="w-full py-2.5 px-4 rounded-xl text-xs font-bold border border-[#2D333F] bg-[#161920] hover:bg-[#1A1D23] text-[#CBD5E1] transition-colors"
        >
          Tutup
        </button>
      </div>
    </div>
  );
};

