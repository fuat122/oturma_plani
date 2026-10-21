import React from 'react';
import {
  GraduationCap,
  ShieldCheck,
  Lock,
  Cloud,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  Users,
  Sparkles,
} from 'lucide-react';

interface LoginWelcomeScreenProps {
  onGoogleLogin: () => Promise<void> | void;
  isLoading?: boolean;
}

export const LoginWelcomeScreen: React.FC<LoginWelcomeScreenProps> = ({
  onGoogleLogin,
  isLoading = false,
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100 relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white">
                Akıllı Sınıf
              </span>
              <p className="text-[10px] text-slate-400 font-medium">
                Oturma Planı & Öğrenci Takip Sistemi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1.5 rounded-xl">
            <Cloud className="w-3.5 h-3.5 text-emerald-400" />
            <span>Firebase Cloud Firestore</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        </div>
      </header>

      {/* Main Hero & Login Container */}
      <main className="flex-1 relative z-10 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-xl">
          {/* Main Login Card */}
          <div className="bg-slate-800/90 backdrop-blur-xl rounded-3xl border border-slate-700/80 shadow-2xl p-6 sm:p-8 text-center">
            {/* Shield Icon */}
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center mx-auto mb-5 shadow-xl shadow-blue-500/25">
              <ShieldCheck className="w-8 h-8" />
            </div>

            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Güvenli Öğretmen Girişi</span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Lütfen Giriş Yapın
            </h1>

            {/* Description */}
            <p className="text-sm text-slate-300 mt-2.5 max-w-md mx-auto leading-relaxed">
              Sınıf oturma planınızı yönetmek, öğrenci yerleşimini düzenlemek ve tarih bazlı gözlemlerinizi güvenli bulutta saklamak için lütfen öğretmen hesabınızla giriş yapın.
            </p>

            {/* Strict Data Isolation Security Alert */}
            <div className="mt-6 p-4 rounded-2xl bg-slate-900/70 border border-slate-700/80 text-left flex items-start gap-3">
              <Lock className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <span className="font-bold text-slate-200">
                  Tam Veri İzolasyonu & Güvenlik Güvencesi:
                </span>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Oturum kapalıyken hiçbir öğrenci ve sınıf verisi gösterilmez. Giriş yaptığınızda verileriniz yalnızca size ait özel Firestore alanında (<code className="text-blue-300">teachers/{'{uid}'}/classes</code>) saklanır ve oturumu kapattığınızda cihaz hafızasından anında tamamen silinir.
                </p>
              </div>
            </div>

            {/* Google Sign In Button */}
            <div className="mt-7">
              <button
                type="button"
                onClick={onGoogleLogin}
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm flex items-center justify-center gap-3 shadow-xl shadow-white/10 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer disabled:opacity-50"
              >
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
                <span>{isLoading ? 'Giriş Yapılıyor...' : 'Google ile Giriş Yap'}</span>
              </button>
              <p className="text-[11px] text-slate-400 mt-2.5 font-medium">
                ℹ️ Sadece kurumsal okul e-posta adresleri kabul edilmektedir.
              </p>
            </div>

            {/* Features List */}
            <div className="grid grid-cols-3 gap-2.5 mt-6 pt-6 border-t border-slate-700/60 text-left">
              <div className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-700/40">
                <Users className="w-4 h-4 text-blue-400 mb-1" />
                <div className="text-[11px] font-bold text-slate-200">3 Bloklu Düzen</div>
                <div className="text-[10px] text-slate-400">Sürükle-bırak sıra yönetimi</div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-700/40">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400 mb-1" />
                <div className="text-[11px] font-bold text-slate-200">Excel & PDF</div>
                <div className="text-[10px] text-slate-400">Tek tıkla resmi çıktılar</div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-700/40">
                <CheckCircle2 className="w-4 h-4 text-sky-400 mb-1" />
                <div className="text-[11px] font-bold text-slate-200">Tarihli Gözlem</div>
                <div className="text-[10px] text-slate-400">Öğrenci gelişim takibi</div>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <p className="text-center text-xs text-slate-500 mt-6">
            Akıllı Sınıf Oturma Düzeni &bull; Firebase Cloud Firestore Altyapısı
          </p>
        </div>
      </main>
    </div>
  );
};
