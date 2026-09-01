import React, { useState } from 'react';
import { LogIn, X, KeyRound, User, Lock } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (u: string, p: string) => Promise<boolean>;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLogin,
}) => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMsg('Harap isi username dan password');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const success = await onLogin(username.trim(), password);
      if (success) {
        setUsername('');
        setPassword('');
        onClose();
      } else {
        setErrorMsg('Username atau password tidak sesuai');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Gagal menghubungi server otentikasi');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#0F1115]/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#161920] border border-[#2D333F] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 text-[#E2E8F0]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#2D333F]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#F1F5F9]">
                Login Petugas RPH
              </h3>
              <p className="text-xs text-[#94A3B8]">
                Akses manajemen data & administrasi operasional
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#CBD5E1]">
              Username Petugas
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <input
                type="text"
                required
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                className="w-full pl-10 pr-3.5 py-2.5 bg-[#13161C] border border-[#2D333F] rounded-xl text-xs font-semibold text-[#F1F5F9] placeholder:text-[#64748B] focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#CBD5E1]">
              Kata Sandi (Password)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="w-full pl-10 pr-3.5 py-2.5 bg-[#13161C] border border-[#2D333F] rounded-xl text-xs font-semibold text-[#F1F5F9] placeholder:text-[#64748B] focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <div className="p-3 rounded-xl bg-[#13161C] border border-[#2D333F] text-[11px] text-[#94A3B8] leading-relaxed">
            Sesi aman berlaku selama 8 jam setelah berhasil terautentikasi. Semua aktivitas penambahan, pengubahan, dan penghapusan dicatat ke dalam audit trail.
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-950/50 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <LogIn className="w-4 h-4" />
              <span>{isLoading ? 'Memverifikasi...' : 'Masuk Sekarang'}</span>
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
