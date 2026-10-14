import React from 'react';
import { Classroom } from '../types';
import { Sparkles, Calendar, Users, CheckCircle2 } from 'lucide-react';

interface BlackboardHeaderProps {
  classroom: Classroom;
}

export const BlackboardHeader: React.FC<BlackboardHeaderProps> = ({ classroom }) => {
  const seatedCount = classroom.seats.filter((s) => s.studentId !== null).length;
  const emptyCount = classroom.seats.length - seatedCount;

  return (
    <div className="w-full mb-6 no-print">
      <div className="grid grid-cols-12 gap-3 items-stretch">
        {/* Left: Entrance Door */}
        <div className="col-span-2 hidden md:flex flex-col items-center justify-center p-3 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-900 shadow-xs">
          <div className="text-2xl mb-1">🚪</div>
          <span className="text-xs font-bold uppercase tracking-wider">Sınıf Kapısı</span>
          <span className="text-[10px] text-amber-700/80 font-medium">Ön Koridor Girişi</span>
        </div>

        {/* Center: Smart Blackboard & Teacher Podium */}
        <div className="col-span-12 md:col-span-8 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-4 sm:p-5 text-white shadow-lg border border-slate-700/80 relative overflow-hidden">
          {/* Subtle wood frame border top */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 opacity-90" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/60 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                AKILLI TAHTA
              </span>
              <span className="text-xs text-slate-300 font-medium">
                {classroom.name} • {classroom.grade}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-blue-400" />
                {seatedCount} Yerleşik / {classroom.students.length} Kayıtlı
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Center Chalk Text */}
            <div className="text-center sm:text-left flex-1">
              <p className="text-sm font-medium text-slate-200 tracking-wide font-mono italic">
                "Hayatta en hakiki mürşit ilimdir, fendir."
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Ön Cephe: Öğrenci sıraları tahtaya dönüktür. Sürükle-bırak ile sıraları anında değiştirin.
              </p>
            </div>

            {/* Teacher's Desk / Kürsü visual representation */}
            <div className="flex items-center gap-3 bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-600/60">
              <div className="w-9 h-9 rounded-lg bg-amber-600/30 border border-amber-500/40 flex items-center justify-center text-lg">
                👨‍🏫
              </div>
              <div>
                <div className="text-xs font-bold text-amber-200 uppercase tracking-wider">
                  Öğretmen Kürsüsü
                </div>
                <div className="text-[10px] text-slate-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Masa & Akıllı Ekran
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Windows */}
        <div className="col-span-2 hidden md:flex flex-col items-center justify-center p-3 rounded-2xl bg-sky-50/80 border border-sky-200/80 text-sky-900 shadow-xs">
          <div className="text-2xl mb-1">🪟</div>
          <span className="text-xs font-bold uppercase tracking-wider">Cam Kenarı</span>
        </div>
      </div>
    </div>
  );
};
