import React from 'react';
import { Classroom, Teacher } from '../types';
import {
  GraduationCap,
  ShieldCheck,
  ChevronDown,
  Plus,
  Cloud,
  LogOut,
  Database,
} from 'lucide-react';

interface NavbarProps {
  activeTeacher: Teacher;
  classrooms: Classroom[];
  selectedClassId: string;
  onSelectClass: (classId: string) => void;
  onOpenNewClassModal: () => void;
  onOpenTeacherSwitcher: () => void;
  onOpenGoogleLogin: () => void;
  onGoogleLogout: () => void;
  isGoogleConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTeacher,
  classrooms,
  selectedClassId,
  onSelectClass,
  onOpenNewClassModal,
  onOpenTeacherSwitcher,
  onOpenGoogleLogin,
  onGoogleLogout,
  isGoogleConnected,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand & Class Selector */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900">
                  Akıllı Sınıf
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium hidden sm:block">
                Oturma Planı & Öğrenci Takip Sistemi
              </p>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-200 hidden md:block" />

          {/* Active Teacher's Classrooms Dropdown */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={selectedClassId}
                onChange={(e) => onSelectClass(e.target.value)}
                className="appearance-none bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs font-bold pl-3 pr-8 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer transition-all"
              >
                {classrooms.length === 0 ? (
                  <option value="">(Sınıf Yok - Yeni Oluşturun)</option>
                ) : (
                  classrooms.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.grade} - {c.students.length} Öğrenci)
                    </option>
                  ))
                )}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <button
              type="button"
              onClick={onOpenNewClassModal}
              className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors cursor-pointer"
              title="Yeni Sınıf Oluştur"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center/Right: Firestore Sync Status & Teacher Profile */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Firestore Cloud Sync Badge */}
          <div
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-sky-200 bg-sky-50/90 text-sky-900 text-xs font-semibold shadow-2xs"
            title="Tüm sınıf verileri Firebase Cloud Firestore veritabanında güvenle saklanmaktadır"
          >
            <Cloud className="w-3.5 h-3.5 text-sky-600" />
            <span>Cloud Firestore</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          {/* Teacher Profile & Yetkili Öğretmen Badge */}
          <button
            type="button"
            onClick={onOpenTeacherSwitcher}
            className={`flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl border transition-all text-left shadow-2xs cursor-pointer ${
              activeTeacher.isGoogleUser
                ? 'border-blue-300 bg-blue-50/70 hover:bg-blue-100/70'
                : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
            }`}
            title="Yetkili Öğretmen Profilini Değiştir veya Yönet"
          >
            {activeTeacher.avatar ? (
              <img
                src={activeTeacher.avatar}
                alt={activeTeacher.name}
                className="w-8 h-8 rounded-xl object-cover border border-blue-400 shrink-0"
              />
            ) : (
              <div
                className={`w-8 h-8 rounded-xl text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs ${
                  activeTeacher.isGoogleUser ? 'bg-blue-600' : 'bg-indigo-600'
                }`}
              >
                {activeTeacher.name.charAt(0)}
              </div>
            )}
            <div className="hidden lg:block min-w-0 max-w-[160px]">
              <div className="text-xs font-bold text-slate-900 truncate flex items-center gap-1">
                <span>{activeTeacher.name}</span>
                {activeTeacher.isGoogleUser ? (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-600 text-white">
                    Google
                  </span>
                ) : (
                  <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                )}
              </div>
              <div className="text-[10px] text-slate-500 truncate">
                {activeTeacher.branch}
              </div>
            </div>
            <div
              className={`hidden sm:flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md ${
                activeTeacher.isGoogleUser
                  ? 'bg-blue-200/80 text-blue-900'
                  : 'bg-indigo-100 text-indigo-700'
              }`}
            >
              <span>Yetkili Öğretmen</span>
              <ChevronDown className="w-3 h-3" />
            </div>
          </button>

          {/* Google Sign In or Logout */}
          {isGoogleConnected ? (
            <button
              type="button"
              onClick={onGoogleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 rounded-xl transition-colors font-bold text-xs cursor-pointer shadow-2xs"
              title="Hesaptan Çıkış Yap ve Verileri Temizle"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-600" />
              <span>Çıkış Yap</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenGoogleLogin}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Google ile Giriş</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
