import React from 'react';
import { Classroom, Teacher } from '../types';
import { X, ShieldAlert, Check, UserCheck, Lock, LogIn, Sparkles, CheckCircle2 } from 'lucide-react';

interface TeacherSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  teachers: Teacher[];
  currentTeacher: Teacher;
  classrooms: Classroom[];
  onSelectTeacher: (teacher: Teacher) => void;
  onOpenGoogleLogin: () => void;
  isGoogleConnected: boolean;
  googleUser?: any;
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
  googleUser,
}) => {
  if (!isOpen) return null;

  const googleTeacher = teachers.find((t) => t.isGoogleUser);
  const demoTeachers = teachers.filter((t) => !t.isGoogleUser);

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
                Öğretmen İzolasyon ve Yetki Paneli
              </h2>
              <p className="text-xs text-slate-500">
                Aktif öğretmen profilini seçin veya izolasyonu test edin
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

        <div className="p-6 space-y-5 overflow-y-auto max-h-[60vh]">
          {/* SECTION 1: GOOGLE AUTHENTICATED TEACHER */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Google Hesabınızla Bağlı Öğretmen
              </span>
              {isGoogleConnected && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Giriş Yapıldı
                </span>
              )}
            </div>

            {googleTeacher ? (
              (() => {
                const isSelected = googleTeacher.id === currentTeacher.id;
                const teacherClasses = classrooms.filter((c) => c.teacherId === googleTeacher.id);

                return (
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTeacher(googleTeacher);
                      onClose();
                    }}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20 shadow-md'
                        : 'border-blue-200 bg-blue-50/30 hover:bg-blue-50/60 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {googleTeacher.avatar ? (
                        <img
                          src={googleTeacher.avatar}
                          alt={googleTeacher.name}
                          className="w-11 h-11 rounded-2xl border-2 border-blue-400 shadow-2xs shrink-0 object-cover"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                          {googleTeacher.name.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-slate-900 truncate">
                            {googleTeacher.name}
                          </span>
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-blue-600 text-white">
                            Google
                          </span>
                        </div>
                        <div className="text-xs text-slate-600 truncate font-mono">
                          {googleTeacher.email}
                        </div>
                        <div className="text-[11px] text-blue-700 font-medium mt-0.5">
                          Yetkili Sınıflarınız:{' '}
                          <strong>
                            {teacherClasses.map((c) => c.name).join(', ') || '9-A (Başlangıç Sınıfı)'}
                          </strong>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-1">
                      {isSelected ? (
                        <span className="px-2.5 py-1 rounded-xl bg-blue-600 text-white text-[11px] font-bold flex items-center gap-1 shadow-2xs">
                          <Check className="w-3.5 h-3.5" />
                          <span>Aktif Profil</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-xl bg-white border border-blue-300 text-blue-700 text-[11px] font-bold hover:bg-blue-100 transition-colors">
                          Bu Hesaba Geç
                        </span>
                      )}
                    </div>
                  </button>
                );
              })()
            ) : (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenGoogleLogin();
                }}
                className="w-full p-4 rounded-2xl border-2 border-dashed border-blue-300 hover:border-blue-500 bg-blue-50/40 hover:bg-blue-50/70 text-left transition-all flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                      Kendi Google Hesabınızla Giriş Yapın
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Google Drive ve E-Tablo entegrasyonu aktif hale gelir
                    </div>
                  </div>
                </div>
                <span className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-xs">
                  Giriş Yap
                </span>
              </button>
            )}
          </div>

          {/* SECTION 2: DEMO & ISOLATION TEST PERSONAS */}
          <div className="pt-2 border-t border-slate-100">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Demo & İzolasyon Testi Öğretmenleri:
            </div>
            <p className="text-[11px] text-slate-400 mb-2.5">
              Aşağıdaki öğretmenlerden birini seçerek diğer öğretmenlerin sınıflarının (9-A, 10-B, Hazırlık-A) ve öğrenci raporlarının nasıl kesin olarak gizlendiğini test edebilirsiniz.
            </p>

            <div className="space-y-2">
              {demoTeachers.map((t) => {
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
                    className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {t.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {t.name}
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
                      <span className="p-1 rounded-full bg-indigo-600 text-white shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs">
          <span className="text-slate-500 text-[11px]">
            Aktif: <strong className="text-slate-800">{currentTeacher.name}</strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
