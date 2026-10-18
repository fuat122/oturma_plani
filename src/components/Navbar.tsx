import React from 'react';
import { Classroom, Teacher } from '../types';
import {
  GraduationCap,
  ShieldCheck,
  ChevronDown,
  Plus,
  LogOut,
  Building2,
  UserCheck,
  RefreshCw,
} from 'lucide-react';

interface NavbarProps {
  activeTeacher: Teacher;
  classrooms: Classroom[];
  schoolClassrooms: Classroom[];
  activeTab: 'my_classes' | 'school_classes';
  onTabChange: (tab: 'my_classes' | 'school_classes') => void;
  selectedClassId: string;
  onSelectClass: (classId: string) => void;
  onOpenNewClassModal: () => void;
  onOpenTeacherSwitcher: () => void;
  onOpenGoogleLogin: () => void;
  onGoogleLogout: () => void;
  isGoogleConnected: boolean;
  isLoadingSchoolClasses?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTeacher,
  classrooms,
  schoolClassrooms,
  activeTab,
  onTabChange,
  selectedClassId,
  onSelectClass,
  onOpenNewClassModal,
  onOpenTeacherSwitcher,
  onOpenGoogleLogin,
  onGoogleLogout,
  isGoogleConnected,
  isLoadingSchoolClasses = false,
}) => {
  const currentClassList = activeTab === 'my_classes' ? classrooms : schoolClassrooms;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs no-print transition-all duration-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 min-h-[4rem] flex flex-wrap items-center justify-between gap-3">
        {/* Left Section: Brand, Tabs & Class Selector */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-2.5 shrink-0 select-none group cursor-pointer transition-transform duration-200 hover:scale-[1.01]">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 transition-all duration-200 group-hover:shadow-blue-500/35 group-hover:-translate-y-0.5">
              <GraduationCap className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900">
                  Akıllı Sınıf
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium hidden md:block">
                Oturma Planı & Öğrenci Takip Sistemi
              </p>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-200 hidden lg:block shrink-0" />

          {/* MAIN TAB SWITCHER: 'Sınıflarım' vs 'Okul Sınıfları (Salt Okunur)' */}
          <div className="flex items-center bg-slate-100/90 backdrop-blur-xs p-1 rounded-2xl border border-slate-200/80 shrink-0 shadow-2xs">
            <button
              type="button"
              onClick={() => onTabChange('my_classes')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ease-in-out cursor-pointer ${
                activeTab === 'my_classes'
                  ? 'bg-white text-blue-700 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 active:scale-[0.98]'
              }`}
              title="Kendi oluşturduğunuz ve yönettiğiniz sınıflar"
            >
              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Sınıflarım</span>
              {classrooms.length > 0 && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                    activeTab === 'my_classes'
                      ? 'bg-blue-100/90 text-blue-800'
                      : 'bg-slate-200/80 text-slate-700'
                  }`}
                >
                  {classrooms.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => onTabChange('school_classes')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ease-in-out cursor-pointer ${
                activeTab === 'school_classes'
                  ? 'bg-gradient-to-r from-amber-50 to-orange-50 text-amber-950 shadow-sm border border-amber-300/80 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 active:scale-[0.98]'
              }`}
              title="Okuldaki diğer öğretmenlerin oluşturduğu sınıf oturma düzenleri"
            >
              <Building2 className="w-3.5 h-3.5 text-amber-600" />
              <span>Okul Sınıfları</span>
              {schoolClassrooms.length > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-950 shadow-2xs">
                  {schoolClassrooms.length}
                </span>
              )}
            </button>
          </div>

          {/* Active Classrooms Selector & Add Class Button */}
          <div className="flex items-center gap-1.5 min-w-[170px] max-w-full sm:max-w-[270px] md:max-w-[310px] flex-1">
            <div className="relative min-w-0 flex-1">
              <select
                value={selectedClassId}
                onChange={(e) => onSelectClass(e.target.value)}
                className={`w-full truncate appearance-none text-xs font-bold pl-3 pr-8 py-2 rounded-xl border focus:outline-hidden focus:ring-2 cursor-pointer transition-all duration-200 ease-in-out hover:shadow-xs hover:-translate-y-0.5 active:scale-[0.98] ${
                  activeTab === 'school_classes'
                    ? 'bg-amber-50/90 hover:bg-amber-100/90 text-amber-950 border-amber-300/80 focus:ring-amber-500 shadow-2xs'
                    : 'bg-slate-100/90 hover:bg-slate-200/70 text-slate-800 border-slate-200/90 focus:ring-blue-500 shadow-2xs'
                }`}
              >
                {currentClassList.length === 0 ? (
                  <option value="">
                    {isLoadingSchoolClasses
                      ? 'Sınıflar aranıyor...'
                      : activeTab === 'school_classes'
                      ? '(Kayıtlı okul sınıfı bulunamadı)'
                      : '(Sınıf Yok - Yeni Oluşturun)'}
                  </option>
                ) : (
                  currentClassList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.teacherName ? `• ${c.teacherName}` : ''} ({c.grade} - {c.students.length} Öğrenci)
                      {c.isReadOnly ? ' [Salt Okunur]' : ''}
                    </option>
                  ))
                )}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Yeni Sınıf Oluştur Butonu (Sadece 'Sınıflarım' sekmesinde aktiftir) */}
            {activeTab === 'my_classes' && (
              <button
                type="button"
                onClick={onOpenNewClassModal}
                className="shrink-0 p-2 rounded-xl bg-blue-50 hover:bg-blue-100/90 text-blue-700 border border-blue-200/60 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-xs active:scale-[0.98] cursor-pointer shadow-2xs"
                title="Yeni Sınıf Oluştur"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}

            {activeTab === 'school_classes' && isLoadingSchoolClasses && (
              <RefreshCw className="w-4 h-4 text-amber-600 animate-spin ml-1 shrink-0" />
            )}
          </div>
        </div>

        {/* Right Section: Teacher Profile & Auth Actions */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 shrink-0 min-w-0">

          {/* Teacher Profile Box */}
          <button
            type="button"
            onClick={onOpenTeacherSwitcher}
            className={`flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl border transition-all duration-200 ease-in-out text-left shadow-2xs hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer min-w-0 max-w-[210px] sm:max-w-[240px] ${
              activeTeacher.isGoogleUser
                ? 'border-blue-200/90 bg-blue-50/80 hover:bg-blue-100/80'
                : 'border-slate-200/90 bg-slate-50/90 hover:bg-slate-100'
            }`}
            title="Yetkili Öğretmen Profilini Değiştir veya Yönet"
          >
            {activeTeacher.avatar ? (
              <img
                src={activeTeacher.avatar}
                alt={activeTeacher.name}
                className="w-8 h-8 rounded-xl object-cover border border-blue-400/80 shrink-0 shadow-2xs"
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
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-900 truncate flex items-center gap-1">
                <span className="truncate">{activeTeacher.name}</span>
                {activeTeacher.isGoogleUser ? (
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-blue-600 text-white shrink-0">
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
              className={`hidden sm:flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                activeTeacher.isGoogleUser
                  ? 'bg-blue-100 text-blue-900'
                  : 'bg-indigo-100 text-indigo-700'
              }`}
            >
              <span>Yetkili</span>
              <ChevronDown className="w-3 h-3" />
            </div>
          </button>

          {/* Google Sign In or Logout */}
          {isGoogleConnected ? (
            <button
              type="button"
              onClick={onGoogleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-rose-700 bg-rose-50/90 hover:bg-rose-100 border border-rose-200/80 rounded-xl transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-xs active:scale-[0.98] font-bold text-xs cursor-pointer shadow-2xs shrink-0"
              title="Hesaptan Çıkış Yap ve Verileri Temizle"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-600" />
              <span className="hidden sm:inline">Çıkış Yap</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenGoogleLogin}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs hover:shadow-xs transition-all duration-200 ease-in-out hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer shrink-0"
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
