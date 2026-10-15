import React from 'react';
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
  const totalSeats = classroom.seats.length > 0 ? classroom.seats.length : (classroom.maxCapacity || 24);
  const capacityPercent = Math.round((classroom.students.length / totalSeats) * 100);
  const emptySeatsCount = Math.max(0, totalSeats - classroom.students.length);

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs mb-6 no-print">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Class Information & Cloud Firestore Status */}
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
              {classroom.grade}
            </span>
            <span className="text-xs font-semibold text-slate-500 font-mono">
              Öğretim Yılı: {classroom.academicYear}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Yetkili Öğretmen: {activeTeacher.name}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
              <Cloud className="w-3 h-3 text-sky-600" />
              <span>Firebase Firestore</span>
              {isFirestoreSaving ? (
                <RefreshCw className="w-2.5 h-2.5 text-amber-500 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              )}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {classroom.name} Sınıfı Oturma Düzeni
            </h1>
          </div>

          {classroom.branchName && (
            <p className="text-xs text-slate-500 mt-1">{classroom.branchName}</p>
          )}

          {/* Capacity Progress Indicator */}
          <div className="mt-3 flex items-center gap-3">
            <div className="w-36 h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
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
            <span className="text-xs font-mono font-bold text-slate-700">
              {classroom.students.length} / {totalSeats} Öğrenci
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              (Sınıf Sıra Sayısı: {totalSeats} • {emptySeatsCount > 0 ? `${emptySeatsCount} Boş Sıra` : 'Tüm Sıralar Dolu'})
            </span>
          </div>
        </div>

        {/* Right: Action Buttons Group with PDF İndir and Excel (.xlsx) İndir */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {/* Öğrenci Raporları & Gözlemler Butonu */}
          <button
            type="button"
            onClick={onOpenReports}
            className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm shadow-indigo-500/20 hover:shadow-md transition-all cursor-pointer"
            title="Tarih bazlı öğrenci gözlem ve yorumlarını yönetin"
          >
            <BookOpen className="w-4 h-4" />
            <span>Öğrenci Raporları & Gözlemler</span>
            {classroom.observations.length > 0 && (
              <span className="bg-white/20 text-white px-1.5 py-0.5 rounded-full text-[10px]">
                {classroom.observations.length}
              </span>
            )}
          </button>

          {/* PDF İNDİR BUTONU */}
          <button
            type="button"
            onClick={onExportPDF}
            disabled={isExportingPDF}
            className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            title="A4 Yatay formatında yüksek çözünürlüklü Oturma Planı PDF'i indir"
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>{isExportingPDF ? 'PDF Hazırlanıyor...' : 'PDF İndir'}</span>
            <Download className="w-3.5 h-3.5 text-slate-300" />
          </button>

          {/* EXCEL (.XLSX) İNDİR BUTONU */}
          <button
            type="button"
            onClick={onExportExcel}
            disabled={isExportingExcel}
            className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm shadow-emerald-600/20 hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
            title="Oturma Planı, Öğrenci Listesi ve Tarihli Gözlemleri Excel (.xlsx) formatında indir"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-100" />
            <span>{isExportingExcel ? 'Excel Hazırlanıyor...' : 'Excel (.xlsx) İndir'}</span>
            <Download className="w-3.5 h-3.5 text-emerald-200" />
          </button>

          {/* SINIFI DÜZENLE BUTONU */}
          <button
            type="button"
            onClick={onOpenStudentManagement}
            className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm shadow-blue-600/25 hover:shadow-md transition-all cursor-pointer"
            title="Öğrenci listesi, ad-soyad, numara, cinsiyet düzenleme ve toplu ekleme/silme"
          >
            <UserCog className="w-4 h-4 text-blue-100" />
            <span>Sınıfı Düzenle</span>
          </button>

          {/* Tarayıcı Yazdır Butonu */}
          <button
            type="button"
            onClick={onPrint}
            className="p-2.5 rounded-2xl border border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
            title="Yazıcıdan Çıktı Al"
          >
            <Printer className="w-4 h-4" />
          </button>

          {/* Öğrenci Kadrosu Butonu */}
          <button
            type="button"
            onClick={onOpenStudentManagement}
            className="p-2.5 rounded-2xl border border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
            title="Öğrenci Listesini Yönet / Ekle"
          >
            <Users className="w-4 h-4" />
          </button>

          {/* Sıraları Karıştır Butonu */}
          <button
            type="button"
            onClick={onShuffleSeats}
            className="p-2.5 rounded-2xl border border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
            title="Öğrenci Sıralarını Rastgele Karıştır"
          >
            <Shuffle className="w-4 h-4" />
          </button>

          {/* Sıralamayı Sıfırla Butonu */}
          <button
            type="button"
            onClick={onResetSeats}
            className="p-2.5 rounded-2xl border border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
            title="Sıraları Okul Numarasına Göre Sırala"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* TÜM ÖĞRENCİLERİ KALDIR BUTONU */}
          <button
            type="button"
            onClick={onClearAllStudents}
            className="p-2.5 rounded-2xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors cursor-pointer"
            title="Sınıftaki Tüm Öğrencileri Kaldır / Sınıfı Boşalt"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
