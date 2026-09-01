import React, { useState, useEffect } from 'react';
import { Users, X, UserPlus, Trash2, Shield, RefreshCw } from 'lucide-react';
import { apiGet, apiPost, pushAudit } from '../../services/api';

interface AdminManageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string, type: 'ok' | 'err' | 'warn') => void;
}

interface UserItem {
  username: string;
  role: string;
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

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await apiGet('getUsers');
      if (res.json && Array.isArray(res.json.users)) {
        setUsers(res.json.users);
      } else {
        // Fallback standard accounts
        setUsers([
          { username: 'superadmin', role: 'superadmin' },
          { username: 'admin_rph', role: 'admin' },
        ]);
      }
    } catch {
      setUsers([
        { username: 'superadmin', role: 'superadmin' },
        { username: 'admin_rph', role: 'admin' },
      ]);
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
    if (!newUser.trim() || !newPass) {
      alert('Isi username dan password');
      return;
    }
    if (newPass.length < 6) {
      alert('Password minimal 6 karakter');
      return;
    }

    try {
      await apiPost({ action: 'addUser', username: newUser.trim(), password: newPass, role: 'admin' });
      pushAudit('addUser', { username: newUser.trim() });
      onShowToast(`User ${newUser} berhasil ditambahkan`, 'ok');
      setNewUser('');
      setNewPass('');
      fetchUsers();
    } catch {
      onShowToast('Gagal menambahkan user di server', 'err');
    }
  };

  const handleDeleteUser = async (username: string) => {
    if (username === 'superadmin') {
      alert('Superadmin utama tidak dapat dihapus');
      return;
    }
    if (!confirm(`Hapus akun admin ${username}?`)) return;

    try {
      await apiPost({ action: 'deleteUser', username });
      pushAudit('deleteUser', { username });
      onShowToast(`User ${username} dihapus`, 'ok');
      fetchUsers();
    } catch {
      onShowToast('Gagal menghapus user di server', 'err');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#0F1115]/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#161920] border border-[#2D333F] rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 text-[#E2E8F0]"
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
                Kelola Akun Petugas
              </h3>
              <p className="text-xs text-[#94A3B8]">
                Manajemen akses petugas pencatat RPH
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
            <span>Daftar Akun Terdaftar</span>
            <button
              onClick={fetchUsers}
              className="text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1 text-[11px]"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              <span>Muat Ulang</span>
            </button>
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {users.map((u, idx) => (
              <div
                key={`${u.username}-${idx}`}
                className="p-3 rounded-xl bg-[#13161C] border border-[#2D333F] flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <Shield className="w-4 h-4 text-purple-400" />
                  <div>
                    <span className="font-extrabold text-[#F1F5F9] block">
                      {u.username}
                    </span>
                    <span className="text-[10px] text-[#94A3B8] uppercase font-semibold">
                      Peran: {u.role}
                    </span>
                  </div>
                </div>

                {u.username !== 'superadmin' && (
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
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#CBD5E1] block">
            Tambah Petugas Baru
          </span>

          <div className="grid grid-cols-2 gap-2.5">
            <input
              type="text"
              required
              value={newUser}
              onChange={(e) => setNewUser(e.target.value)}
              placeholder="Username baru"
              className="w-full px-3 py-2 bg-[#13161C] border border-[#2D333F] rounded-xl text-xs font-semibold text-[#F1F5F9] placeholder:text-[#64748B] focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 focus:outline-none"
            />
            <input
              type="password"
              required
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              placeholder="Password min 6 kar"
              className="w-full px-3 py-2 bg-[#13161C] border border-[#2D333F] rounded-xl text-xs font-semibold text-[#F1F5F9] placeholder:text-[#64748B] focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-sm shadow-purple-950/50 transition-colors flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Akun Petugas</span>
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
