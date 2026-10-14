import React from 'react';
import { Classroom, Teacher } from '../types';
import { X, ShieldAlert, Check, UserCheck, Lock, LogIn } from 'lucide-react';

interface TeacherSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  teachers: Teacher[];
  currentTeacher: Teacher;
  classrooms: Classroom[];
  onSelectTeacher: (teacher: Teacher) => void;
  onOpenGoogleLogin: () => void;
  isGoogleConnected: boolean;
}

export const TeacherSwitcherModal: React.FC<TeacherSwitcherModalProps> = ({
  isOpen,
  onClose,
  teachers,
  currentTeacher,
  classrooms,
  onSelectTeacher,
  onOpenGoogleLogin,
  isGoogleConnected,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 no-print animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Öğretmen İzolasyon ve Güvenlik Testi
              </h2>
              <p className="text-xs text-slate-500">
                Öğretmenler arası veri ve oturma planı izolasyonunu test edin
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

        {/* Security Rule Explanation */}
        <div className="p-4 bg-indigo-50/60 border-b border-indigo-100 text-xs text-indigo-950 flex items-start gap-2.5">
          <Lock className="w-4 h-4 text-indigo-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold">Sıkı İzolasyon & Rol Ayrımı Kuralı:</span>
            <p className="text-[11px] text-indigo-900 leading-relaxed">
              Her öğretmen yalnızca kendi oluşturduğu sınıfları, oturma planını ve öğrenci raporlarını görüntüleyebilir. 9-A öğretmeni, 10-B veya Hazırlık sınıfı verilerine ve öğrencilerine kesinlikle erişemez.
            </p>
          </div>
        </div>

        {/* Teacher Personas List */}
        <div className="p-6 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Aktif Öğretmen Profilini Değiştir:
          </div>

          <div className="space-y-2">
            {teachers.map((t) => {
              const isSelected = t.id === currentTeacher.id;
              const teacherClasses = classrooms.filter((c) => c.teacherId === t.id);

              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    onSelectTeacher(t);
                    onClose();
                  }}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {t.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {t.name}
                        </span>
                        {t.isGoogleUser && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                            Google Hesabı
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {t.branch}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Erişebildiği Sınıflar:{' '}
                        <strong className="text-slate-700">
                          {teacherClasses.map((c) => c.name).join(', ') || 'Henüz sınıfı yok'}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <span className="p-1.5 rounded-full bg-indigo-600 text-white shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Google Sign-in Alternative */}
          {!isGoogleConnected && (
            <div className="pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenGoogleLogin();
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center justify-center gap-2 transition-all shadow-2xs"
              >
                <LogIn className="w-4 h-4 text-blue-600" />
                <span>Kendi Google Hesabınızla Giriş Yapın</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
