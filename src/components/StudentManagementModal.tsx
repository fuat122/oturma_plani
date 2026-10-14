import React, { useState } from 'react';
import { Classroom, Student } from '../types';
import { X, UserPlus, Users, Trash2, Edit2, AlertCircle, Check, FileSpreadsheet, ExternalLink } from 'lucide-react';

interface StudentManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  classroom: Classroom;
  onAddStudent: (student: Omit<Student, 'id'>) => void;
  onDeleteStudent: (studentId: string) => void;
  onClearAllStudents: () => void;
}

export const StudentManagementModal: React.FC<StudentManagementModalProps> = ({
  isOpen,
  onClose,
  classroom,
  onAddStudent,
  onDeleteStudent,
  onClearAllStudents,
}) => {
  if (!isOpen) return null;

  const [studentNumber, setStudentNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<'K' | 'E'>('E');
  const [error, setError] = useState<string | null>(null);

  const totalSeats = classroom.seats.length || 24;
  const isFull = classroom.students.length >= totalSeats;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isFull) {
      setError(`Bu sınıfın tüm sıraları (${totalSeats} sıra) dolmuştur. Yeni öğrenci eklenemez.`);
      return;
    }

    if (!studentNumber.trim() || !fullName.trim()) {
      setError('Lütfen öğrenci numarası ve ad soyad giriniz.');
      return;
    }

    const exists = classroom.students.some((s) => s.studentNumber === studentNumber.trim());
    if (exists) {
      setError(`Bu numara (#${studentNumber}) zaten başka bir öğrenciye ait.`);
      return;
    }

    onAddStudent({
      studentNumber: studentNumber.trim(),
      fullName: fullName.trim(),
      gender,
    });

    setStudentNumber('');
    setFullName('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 no-print animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                {classroom.name} Öğrenci Kadrosu
              </h2>
              <p className="text-xs text-slate-500">
                Kapasite: <strong className="text-slate-800">{classroom.students.length} / {totalSeats}</strong> Öğrenci ({totalSeats} Sıra)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Add Student Form */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/40">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <UserPlus className="w-3.5 h-3.5 text-blue-600" />
              Yeni Öğrenci Ekle
            </div>

            {error && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
              <div className="sm:col-span-3">
                <input
                  type="text"
                  value={studentNumber}
                  onChange={(e) => setStudentNumber(e.target.value)}
                  placeholder="Okul No"
                  disabled={isFull}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="sm:col-span-5">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ad Soyad"
                  disabled={isFull}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as 'K' | 'E')}
                  disabled={isFull}
                  className="w-full text-xs px-2 py-2 rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  <option value="E">Erkek</option>
                  <option value="K">Kız</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={isFull}
                  className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold disabled:opacity-40 transition-all shadow-xs flex items-center justify-center gap-1"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Ekle</span>
                </button>
              </div>
            </div>
            {isFull && (
              <p className="text-[11px] text-amber-700 font-medium">
                ⚠️ Sınıf kapasitesi sıra sayısı ({totalSeats} sıra) ile sınırlıdır.
              </p>
            )}
          </form>
        </div>

        {/* Existing Students List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <div className="flex items-center justify-between px-1 mb-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Kayıtlı Öğrenciler ({classroom.students.length})
            </div>

            {classroom.students.length > 0 && (
              <button
                type="button"
                onClick={onClearAllStudents}
                className="text-xs font-bold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                title="Sınıftaki tüm öğrencileri sil"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Tüm Öğrencileri Kaldır</span>
              </button>
            )}
          </div>

          {classroom.students.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              Bu sınıfta henüz öğrenci bulunmuyor. Yukarıdaki formdan yeni öğrenci ekleyebilir veya Google E-Tablo üzerinden senkronize edebilirsiniz.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {classroom.students.map((st) => {
                const seat = classroom.seats.find((s) => s.studentId === st.id);

                return (
                  <div
                    key={st.id}
                    className="p-2.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-2 shadow-2xs hover:border-slate-300"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        #{st.studentNumber}
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-800 truncate">
                          {st.fullName}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {seat ? `Sıra: ${seat.code}` : 'Sıraya atanmadı'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          st.gender === 'K'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {st.gender === 'K' ? 'K' : 'E'}
                      </span>
                      <button
                        type="button"
                        onClick={() => onDeleteStudent(st.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                        title="Öğrenciyi sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Google Drive Sheet Link Banner (if linked) */}
        {classroom.googleSpreadsheetUrl && (
          <div className="px-5 py-2.5 bg-emerald-50/80 border-t border-emerald-200 flex items-center justify-between text-xs text-emerald-900">
            <div className="flex items-center gap-2 min-w-0">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="truncate">
                Google E-Tablo: <strong>Sinif_Oturma_Plani_{classroom.name}</strong>
              </span>
            </div>
            <a
              href={classroom.googleSpreadsheetUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 shrink-0 transition-colors shadow-2xs"
            >
              <span>Drive'da Aç</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
