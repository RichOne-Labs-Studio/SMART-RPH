import React from 'react';
import { UserSession } from '../types';
import { 
  Menu, 
  Moon, 
  Sun, 
  Building2,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

interface HeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  user?: UserSession | null;
  rphTitle?: string;
  rphSub?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  theme,
  onToggleTheme,
  user,
  rphTitle = 'SMART-RPH Kota Cirebon',
  rphSub = 'Sistem Monitoring & Administrasi Pemotongan Ruminansia & Babi'
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#13161C]/95 backdrop-blur-md border-b border-[#2D333F] transition-colors">
      <div className="max-w-[1600px] mx-auto px-3 sm:px-6 h-16 sm:h-18 flex items-center justify-between gap-3 sm:gap-4">
        {/* Left branding */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
          <button
            id="btn-toggle-sidebar"
            onClick={onToggleSidebar}
            className="p-2 sm:p-2.5 rounded-xl text-[#94A3B8] hover:text-[#F1F5F9] bg-[#161920] hover:bg-[#1A1D23] border border-[#2D333F] transition-colors flex-shrink-0"
            title="Sembunyikan / Tampilkan Menu Sidebar"
            aria-label="Toggle navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center font-extrabold text-base shadow-sm ring-1 ring-emerald-500/30 flex-shrink-0">
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-sm sm:text-base md:text-lg font-extrabold tracking-tight text-[#F1F5F9] truncate leading-tight">
                  {rphTitle}
                </h1>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/70 text-emerald-400 border border-emerald-800/60 flex-shrink-0">
                  Resmi UPT
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-[#94A3B8] truncate leading-tight mt-0.5">
                {rphSub}
              </p>
            </div>
          </div>
        </div>

        {/* Right quick actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Subtle user badge if logged in */}
          {user && (
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-[#161920] text-[#CBD5E1] border border-[#2D333F]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="truncate max-w-[100px]">{user.username}</span>
            </div>
          )}

          {/* Theme switcher */}
          <button
            id="btn-toggle-theme"
            onClick={onToggleTheme}
            className="p-2 sm:p-2.5 rounded-xl text-[#94A3B8] hover:text-[#F1F5F9] bg-[#161920] hover:bg-[#1A1D23] border border-[#2D333F] transition-colors"
            title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
            aria-label="Toggle color theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-[#94A3B8]" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

