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
}) => {
  // Collapsible accordion state for optimizing screen vertical estate
  const [isExpanded, setIsExpanded] = useState(false);

  const totalSeats =
    classroom.seats.length > 0 ? classroom.seats.length : classroom.maxCapacity || 24;
  const capacityPercent = Math.round((classroom.students.length / totalSeats) * 100);
  const emptySeatsCount = Math.max(0, totalSeats - classroom.students.length);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs mb-3 no-print transition-all duration-200 overflow-hidden">
      {/* 1. SLIM PRIMARY ACTION BAR (Always visible, compact ~46px) */}
      <div className="px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2.5">
        {/* Left: Class Badge & Quick Info */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="px-2.5 py-1 rounded-xl bg-blue-600 text-white font-extrabold text-xs shadow-2xs tracking-tight">
              {classroom.name}
            </span>
            <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200/60 hidden sm:inline-block">
              {classroom.grade}
            </span>
          </div>

          <span className="text-[11px] font-semibold text-slate-600 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200/60">
            {classroom.students.length}/{totalSeats} Öğrenci
          </span>

          {/* Cloud Firestore Tiny Badge */}
          <span
            className="hidden md:inline-flex items-center gap-1 text-[10px] font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200/60"
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
        </div>

        {/* Right: Key Fast-Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* SINIFI DÜZENLE (Modal trigger for editing all students & roster) */}
          <button
            type="button"
            onClick={onOpenStudentManagement}
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            title="Öğrenci listesi, ad-soyad, numara, cinsiyet düzenleme ve toplu ekleme/silme"
          >
            <UserCog className="w-3.5 h-3.5 text-blue-100" />
            <span>Sınıfı Düzenle</span>
          </button>

          {/* PDF İNDİR */}
          <button
            type="button"
            onClick={onExportPDF}
            disabled={isExportingPDF}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
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
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
            title="Oturma Planı ve Öğrenci Notlarını Excel (.xlsx) olarak indir"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-100" />
            <span className="hidden sm:inline">
              {isExportingExcel ? 'Hazırlanıyor...' : 'Excel (.xlsx)'}
            </span>
            <Download className="w-3 h-3 text-emerald-200 sm:hidden" />
          </button>

          {/* ÖĞRENCİ RAPORLARI */}
          <button
            type="button"
            onClick={onOpenReports}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            title="Tarih bazlı öğrenci gözlem ve yorumlarını aç"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Raporlar</span>
            {classroom.observations.length > 0 && (
              <span className="bg-white/25 text-white px-1 py-0.2 rounded-full text-[9px] font-bold">
                {classroom.observations.length}
              </span>
            )}
          </button>

          {/* ACCORDION TOGGLE (Açılır-Kapanır Panel Butonu) */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              isExpanded
                ? 'bg-slate-200 text-slate-800 border-slate-300'
                : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border-slate-200'
            }`}
            title={isExpanded ? 'Yönetim araçlarını daralt' : 'Tüm yönetim araçlarını ve sınıf detaylarını göster'}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[11px] hidden md:inline">
              {isExpanded ? 'Daralt' : 'Araçlar'}
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
        <div className="border-t border-slate-200/80 bg-slate-50/70 p-3 sm:p-4 animate-in slide-in-from-top-2 duration-200">
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
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Öğretmen: {activeTeacher.name}
                </span>
              </div>

              {classroom.branchName && (
                <p className="text-[11px] text-slate-500">{classroom.branchName}</p>
              )}

              {/* Capacity Progress Bar */}
              <div className="flex items-center gap-2.5 pt-1">
                <div className="w-32 h-1.5 rounded-full bg-slate-200 overflow-hidden">
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

            {/* Additional Management Buttons */}
            <div className="flex flex-wrap items-center gap-1.5">
              {/* Sıraları Karıştır */}
              <button
                type="button"
                onClick={onShuffleSeats}
                className="px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Öğrenci sıralarını rastgele karıştır"
              >
                <Shuffle className="w-3.5 h-3.5 text-blue-600" />
                <span>Rastgele Karıştır</span>
              </button>

              {/* Numaraya Göre Sıfırla */}
              <button
                type="button"
                onClick={onResetSeats}
                className="px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Sıraları okul numarasına göre küçükten büyüğe sırala"
              >
                <RotateCcw className="w-3.5 h-3.5 text-indigo-600" />
                <span>Numaraya Göre Sırala</span>
              </button>

              {/* Tarayıcı Yazdır */}
              <button
                type="button"
                onClick={onPrint}
                className="p-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
                title="Yazıcıdan doğrudan çıktı al"
              >
                <Printer className="w-4 h-4" />
              </button>

              {/* Öğrenci Kadrosu */}
              <button
                type="button"
                onClick={onOpenStudentManagement}
                className="p-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
                title="Öğrenci Listesi Detayları"
              >
                <Users className="w-4 h-4" />
              </button>

              {/* Tüm Öğrencileri Kaldır */}
              <button
                type="button"
                onClick={onClearAllStudents}
                className="px-2.5 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                title="Sınıftaki tüm öğrencileri sıralardan kaldır"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Sınıfı Boşalt</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
