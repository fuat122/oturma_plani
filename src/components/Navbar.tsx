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

  // Shorten name on mobile for avatar pill
  const shortName = activeTeacher.name.split(' ')[0] || activeTeacher.name;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs no-print transition-all duration-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
        
        {/* ROW 1 ON MOBILE / LEFT ON DESKTOP: Brand & Mobile Profile Bar */}
        <div className="flex items-center justify-between gap-2 min-w-0">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-2.5 shrink-0 select-none group cursor-pointer transition-transform duration-200 hover:scale-[1.01]">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 transition-all duration-200 group-hover:shadow-blue-500/35">
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

          {/* Profile Card & Logout (Mobile View: aligned on Row 1, avatar-focused & truncated) */}
          <div className="flex sm:hidden items-center gap-1.5 shrink-0 min-w-0">
            <button
              type="button"
              onClick={onOpenTeacherSwitcher}
              className={`flex items-center gap-1.5 p-1 px-2.5 rounded-xl border text-left shadow-2xs cursor-pointer min-h-[38px] max-w-[140px] truncate ${
                activeTeacher.isGoogleUser
                  ? 'border-blue-200/90 bg-blue-50/90 text-blue-950'
                  : 'border-slate-200/90 bg-slate-50 text-slate-800'
              }`}
              title="Öğretmen Profili"
            >
              {activeTeacher.avatar ? (
                <img
                  src={activeTeacher.avatar}
                  alt={activeTeacher.name}
                  className="w-6 h-6 rounded-lg object-cover border border-blue-400 shrink-0"
                />
              ) : (
                <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                  {activeTeacher.name.charAt(0)}
                </div>
              )}
              <span className="text-[11px] font-bold truncate">{shortName}</span>
            </button>

            {isGoogleConnected && (
              <button
                type="button"
                onClick={onGoogleLogout}
                className="p-2 text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all shadow-2xs shrink-0 cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
                title="Çıkış Yap"
              >
                <LogOut className="w-4 h-4 text-rose-600" />
              </button>
            )}
          </div>
        </div>

        {/* ROW 2 & 3 ON MOBILE / CENTER & CONTROLS ON DESKTOP */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 flex-1 min-w-0 justify-between sm:justify-start">
          
          {/* Main Tab Switcher: 'Sınıflarım' vs 'Diğer Sınıflar' (Full-width on mobile with comfortable touch targets) */}
          <div className="flex items-center bg-slate-100/90 backdrop-blur-xs p-1 rounded-2xl border border-slate-200/80 shrink-0 shadow-2xs w-full sm:w-auto">
            <button
              type="button"
              onClick={() => onTabChange('my_classes')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 ease-in-out cursor-pointer min-h-[42px] sm:min-h-[36px] ${
                activeTab === 'my_classes'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
              title="Kendi sınıflarınız"
            >
              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
              <span className="whitespace-nowrap">Sınıflarım</span>
              {classrooms.length > 0 && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
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
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 ease-in-out cursor-pointer min-h-[42px] sm:min-h-[36px] ${
                activeTab === 'school_classes'
                  ? 'bg-gradient-to-r from-amber-50 to-orange-50 text-amber-950 shadow-sm border border-amber-300/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
              title="Okuldaki diğer sınıflar"
            >
              <Building2 className="w-3.5 h-3.5 text-amber-600" />
              <span className="whitespace-nowrap">Diğer Sınıflar</span>
              {schoolClassrooms.length > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-200/80 text-amber-950 shadow-2xs">
                  {schoolClassrooms.length}
                </span>
              )}
            </button>
          </div>

          {/* Active Classrooms Selector & Add Class Button */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto min-w-[140px] flex-1 max-w-full sm:max-w-[260px] md:max-w-[300px]">
            <div className="relative min-w-0 flex-1">
              <select
                value={selectedClassId}
                onChange={(e) => onSelectClass(e.target.value)}
                className={`w-full truncate appearance-none text-xs font-bold pl-2.5 pr-7 py-2.5 rounded-xl border focus:outline-hidden focus:ring-2 cursor-pointer transition-all duration-200 ease-in-out min-h-[44px] ${
                  activeTab === 'school_classes'
                    ? 'bg-amber-50/90 text-amber-950 border-amber-300/80 focus:ring-amber-500 shadow-2xs'
                    : 'bg-slate-100/90 text-slate-800 border-slate-200/90 focus:ring-blue-500 shadow-2xs'
                }`}
              >
                {currentClassList.length === 0 ? (
                  <option value="">
                    {isLoadingSchoolClasses
                      ? 'Sınıflar aranıyor...'
                      : activeTab === 'school_classes'
                      ? '(Diğer sınıf yok)'
                      : '(Sınıf Yok - Yeni Ekleyin)'}
                  </option>
                ) : (
                  currentClassList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.teacherName ? `• ${c.teacherName}` : ''} ({c.students.length} Öğr.)
                    </option>
                  ))
                )}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Yeni Sınıf Oluştur Butonu */}
            {activeTab === 'my_classes' && (
              <button
                type="button"
                onClick={onOpenNewClassModal}
                className="shrink-0 p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/60 transition-all duration-200 shadow-2xs cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                title="Yeni Sınıf Oluştur"
              >
                <Plus className="w-5 h-5" />
              </button>
            )}

            {activeTab === 'school_classes' && isLoadingSchoolClasses && (
              <RefreshCw className="w-4 h-4 text-amber-600 animate-spin shrink-0" />
            )}
          </div>
        </div>

        {/* DESKTOP-ONLY RIGHT PROFILE SECTION */}
        <div className="hidden sm:flex items-center gap-2 shrink-0 min-w-0">
          {/* Teacher Profile Box */}
          <button
            type="button"
            onClick={onOpenTeacherSwitcher}
            className={`flex items-center gap-2 p-1.5 px-3 rounded-2xl border transition-all duration-200 text-left shadow-2xs hover:shadow-md cursor-pointer min-w-0 max-w-[230px] min-h-[44px] ${
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
              className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                activeTeacher.isGoogleUser
                  ? 'bg-blue-100 text-blue-900'
                  : 'bg-indigo-100 text-indigo-700'
              }`}
            >
              <span>Yetkili</span>
              <ChevronDown className="w-3 h-3" />
            </div>
          </button>

          {/* Google Sign Out */}
          {isGoogleConnected ? (
            <button
              type="button"
              onClick={onGoogleLogout}
              className="flex items-center gap-1.5 px-3 py-2 text-rose-700 bg-rose-50/90 hover:bg-rose-100 border border-rose-200/80 rounded-xl transition-all font-bold text-xs cursor-pointer shadow-2xs shrink-0 min-h-[44px]"
              title="Hesaptan Çıkış Yap"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-600" />
              <span>Çıkış Yap</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenGoogleLogin}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer shrink-0 min-h-[44px]"
            >
              <span>Google ile Giriş</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
