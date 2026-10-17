import React, { useState } from 'react';
import { Classroom, Teacher } from '../types';
import {
  FileText,
  Printer,
  FileSpreadsheet,
  Users,
  Shuffle,
  RotateCcw,
  BookOpen,
  ShieldCheck,
  Trash2,
  Cloud,
  CheckCircle2,
  RefreshCw,
  Download,
  UserCog,
  ChevronDown,
  SlidersHorizontal,
  Lock,
  Eye,
} from 'lucide-react';

interface ClassroomHeaderProps {
  classroom: Classroom;
  activeTeacher: Teacher;
  onExportPDF: () => void;
  onExportExcel: () => void;
  onPrint: () => void;
  onOpenReports: () => void;
  onOpenStudentManagement: () => void;
  onShuffleSeats: () => void;
  onResetSeats: () => void;
  onClearAllStudents: () => void;
  isExportingPDF: boolean;
  isExportingExcel?: boolean;
  isFirestoreSaving?: boolean;
  isReadOnly?: boolean;
}

export const ClassroomHeader: React.FC<ClassroomHeaderProps> = ({
  classroom,
  activeTeacher,
  onExportPDF,
  onExportExcel,
  onPrint,
  onOpenReports,
  onOpenStudentManagement,
  onShuffleSeats,
  onResetSeats,
  onClearAllStudents,
  isExportingPDF,
  isExportingExcel = false,
  isFirestoreSaving = false,
  isReadOnly = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const readOnlyActive = isReadOnly || !!classroom.isReadOnly;
  const totalSeats =
    classroom.seats.length > 0 ? classroom.seats.length : classroom.maxCapacity || 24;
  const capacityPercent = Math.round((classroom.students.length / totalSeats) * 100);
  const emptySeatsCount = Math.max(0, totalSeats - classroom.students.length);
  const teacherDisplayName = classroom.teacherName || activeTeacher.name;

  return (
    <div
      className={`rounded-2xl border shadow-sm hover:shadow-md mb-3 no-print transition-all duration-200 ease-in-out overflow-hidden backdrop-blur-md ${
        readOnlyActive ? 'bg-amber-50/70 border-amber-200/90' : 'bg-white/90 border-slate-200/80'
      }`}
    >
      {/* 1. SLIM PRIMARY ACTION BAR (Always visible, compact ~46px) */}
      <div className="px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2.5">
        {/* Left: Class Badge & Quick Info */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span
              className={`px-3 py-1 rounded-full text-white font-extrabold text-xs shadow-2xs tracking-tight transition-transform duration-200 hover:scale-[1.02] ${
                readOnlyActive ? 'bg-amber-700' : 'bg-blue-600'
              }`}
            >
              {classroom.name}
            </span>
            <span className="text-[11px] font-bold text-slate-700 bg-slate-100/90 px-2.5 py-0.5 rounded-full border border-slate-200/60 hidden sm:inline-block">
              {classroom.grade}
            </span>
          </div>

          <span className="text-[11px] font-semibold text-slate-600 bg-slate-100/90 px-2.5 py-0.5 rounded-full border border-slate-200/60 shadow-2xs">
            {classroom.students.length}/{totalSeats} Öğrenci
          </span>

          {/* Read Only Indicator Badge */}
          {readOnlyActive ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-950 bg-amber-100/90 px-2.5 py-0.5 rounded-full border border-amber-200 shadow-2xs">
              <Lock className="w-3 h-3 text-amber-700" />
              <span>Salt Okunur (Okul Sınıfı)</span>
            </span>
          ) : (
            /* Cloud Firestore Tiny Badge */
            <span
              className="hidden md:inline-flex items-center gap-1 text-[10px] font-bold text-sky-900 bg-sky-50/90 px-2.5 py-0.5 rounded-full border border-sky-200/70 shadow-2xs"
              title="Firebase Cloud Firestore ile canlı senkronize"
            >
              <Cloud className="w-3 h-3 text-sky-600" />
              <span>Firestore</span>
              {isFirestoreSaving ? (
                <RefreshCw className="w-2.5 h-2.5 text-amber-500 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              )}
            </span>
          )}
        </div>

        {/* Right: Key Fast-Action Buttons with Micro-Interactions */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* SINIFI DÜZENLE (Only shown if NOT read-only) */}
          {!readOnlyActive && (
            <button
              type="button"
              onClick={onOpenStudentManagement}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs hover:shadow-sm transition-all duration-200 ease-in-out hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer"
              title="Öğrenci listesi, ad-soyad, numara, cinsiyet düzenleme ve toplu ekleme/silme"
            >
              <UserCog className="w-3.5 h-3.5 text-blue-100" />
              <span>Sınıfı Düzenle</span>
            </button>
          )}

          {/* PDF İNDİR */}
          <button
            type="button"
            onClick={onExportPDF}
            disabled={isExportingPDF}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs hover:shadow-sm transition-all duration-200 ease-in-out hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer disabled:opacity-50"
            title="A4 Yatay formatında Oturma Planı PDF'i indir"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">
              {isExportingPDF ? 'Hazırlanıyor...' : 'PDF İndir'}
            </span>
            <Download className="w-3 h-3 text-slate-400 sm:hidden" />
          </button>

          {/* EXCEL (.XLSX) İNDİR */}
          <button
            type="button"
            onClick={onExportExcel}
            disabled={isExportingExcel}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs hover:shadow-sm transition-all duration-200 ease-in-out hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer disabled:opacity-50"
            title="Oturma Planı ve Öğrenci Listesini Excel (.xlsx) olarak indir"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-100" />
            <span className="hidden sm:inline">
              {isExportingExcel ? 'Hazırlanıyor...' : 'Excel (.xlsx)'}
            </span>
            <Download className="w-3 h-3 text-emerald-200 sm:hidden" />
          </button>

          {/* ÖĞRENCİ RAPORLARI (Strictly HIDDEN in read-only mode for non-owners) */}
          {!readOnlyActive && (
            <button
              type="button"
              onClick={onOpenReports}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs hover:shadow-sm transition-all duration-200 ease-in-out hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer"
              title="Tarih bazlı öğrenci gözlem ve yorumlarını aç"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Raporlar</span>
              {classroom.observations.length > 0 && (
                <span className="bg-white/25 text-white px-1.5 py-0.2 rounded-full text-[9px] font-bold">
                  {classroom.observations.length}
                </span>
              )}
            </button>
          )}

          {/* ACCORDION TOGGLE (Açılır-Kapanır Panel Butonu) */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 ease-in-out hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer ${
              isExpanded
                ? 'bg-slate-200 text-slate-800 border-slate-300 shadow-inner'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200/90 shadow-2xs'
            }`}
            title={isExpanded ? 'Yönetim araçlarını daralt' : 'Tüm yönetim araçlarını ve sınıf detaylarını göster'}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[11px] hidden md:inline">
              {isExpanded ? 'Daralt' : 'Detaylar'}
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${
                isExpanded ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* 2. EXPANDED ACCORDION DRAWER (Only when expanded by user) */}
      {isExpanded && (
        <div className="border-t border-slate-200/80 bg-white/95 p-3 sm:p-4 animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Class Details & Capacity Progress */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-800">
                  {classroom.name} Sınıfı Oturma Düzeni
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  Öğretim Yılı: {classroom.academicYear}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/80 shadow-2xs">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Öğretmen: {teacherDisplayName}
                </span>
                {readOnlyActive && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200 shadow-2xs">
                    <Eye className="w-3 h-3 text-amber-600" />
                    <span>Salt Okunur Mod</span>
                  </span>
                )}
              </div>

              {classroom.branchName && (
                <p className="text-[11px] text-slate-500">{classroom.branchName}</p>
              )}

              {/* Capacity Progress Bar */}
              <div className="flex items-center gap-2.5 pt-1">
                <div className="w-32 h-1.5 rounded-full bg-slate-200 overflow-hidden shadow-inner">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      capacityPercent >= 100
                        ? 'bg-rose-500'
                        : capacityPercent > 80
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(capacityPercent, 100)}%` }}
                  />
                </div>
                <span className="text-[11px] text-slate-500 font-medium">
                  {emptySeatsCount > 0 ? `${emptySeatsCount} boş sıra mevcut` : 'Tüm sıralar dolu'}
                </span>
              </div>
            </div>

            {/* Management Buttons or Read-Only Notice */}
            {readOnlyActive ? (
              <div className="flex items-center gap-2 text-xs text-amber-900 bg-amber-50 p-2.5 rounded-xl border border-amber-200/80 shadow-2xs">
                <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Bu sınıf <strong>{teacherDisplayName}</strong> tarafından yönetilmektedir. Öğrenci düzenleme ve sıra taşıma yetkisi yalnızca sınıf öğretmenine aittir.
                </span>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-1.5">
                {/* Sıraları Karıştır */}
                <button
                  type="button"
                  onClick={onShuffleSeats}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-300/80 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-all duration-200 ease-in-out hover:-translate-y-0.5 active:scale-[0.98] shadow-2xs hover:shadow-xs cursor-pointer"
                  title="Öğrenci sıralarını rastgele karıştır"
                >
                  <Shuffle className="w-3.5 h-3.5 text-blue-600" />
                  <span>Rastgele Karıştır</span>
                </button>

                {/* Numaraya Göre Sırala */}
                <button
                  type="button"
                  onClick={onResetSeats}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-300/80 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-all duration-200 ease-in-out hover:-translate-y-0.5 active:scale-[0.98] shadow-2xs hover:shadow-xs cursor-pointer"
                  title="Sıraları okul numarasına göre küçükten büyüğe sırala"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Numaraya Göre Sırala</span>
                </button>

                {/* Tarayıcı Yazdır */}
                <button
                  type="button"
                  onClick={onPrint}
                  className="p-1.5 rounded-xl border border-slate-300/80 bg-white hover:bg-slate-50 text-slate-700 transition-all duration-200 ease-in-out hover:-translate-y-0.5 active:scale-[0.98] shadow-2xs hover:shadow-xs cursor-pointer"
                  title="Yazıcıdan doğrudan çıktı al"
                >
                  <Printer className="w-4 h-4" />
                </button>

                {/* Öğrenci Kadrosu */}
                <button
                  type="button"
                  onClick={onOpenStudentManagement}
                  className="p-1.5 rounded-xl border border-slate-300/80 bg-white hover:bg-slate-50 text-slate-700 transition-all duration-200 ease-in-out hover:-translate-y-0.5 active:scale-[0.98] shadow-2xs hover:shadow-xs cursor-pointer"
                  title="Öğrenci Listesi Detayları"
                >
                  <Users className="w-4 h-4" />
                </button>

                {/* Tüm Öğrencileri Kaldır */}
                <button
                  type="button"
                  onClick={onClearAllStudents}
                  className="px-2.5 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-medium flex items-center gap-1 transition-all duration-200 ease-in-out hover:-translate-y-0.5 active:scale-[0.98] shadow-2xs hover:shadow-xs cursor-pointer"
                  title="Sınıftaki tüm öğrencileri sıralardan kaldır"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Sınıfı Boşalt</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
