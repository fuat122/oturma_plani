import React from 'react';
import { Classroom } from '../types';
import { Sparkles } from 'lucide-react';

interface BlackboardHeaderProps {
  classroom: Classroom;
}

export const BlackboardHeader: React.FC<BlackboardHeaderProps> = ({ classroom }) => {
  const seatedCount = classroom.seats.filter((s) => s.studentId !== null).length;

  return (
    <div className="w-full mb-3 no-print">
      <div className="grid grid-cols-12 gap-2 items-center">
        {/* Left: Entrance Door */}
        <div className="col-span-2 hidden md:flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-amber-50/90 border border-amber-200/80 text-amber-900 shadow-2xs text-[11px] font-bold">
          <span className="text-sm">🚪</span>
          <span className="uppercase tracking-wider">Kapı</span>
        </div>

        {/* Center: Smart Blackboard Ribbon (Sleek, low-profile ~36px height) */}
        <div className="col-span-12 md:col-span-8 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-xl px-3 py-1.5 text-white shadow-sm border border-slate-700/80 flex items-center justify-between gap-2 overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 opacity-80" />

          <div className="flex items-center gap-2 min-w-0">
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 shrink-0">
              <Sparkles className="w-3 h-3" />
              <span>AKILLI TAHTA</span>
            </span>
            <span className="text-[11px] text-slate-300 font-medium italic truncate hidden sm:inline">
              "Hayatta en hakiki mürşit ilimdir, fendir."
            </span>
          </div>

          <div className="flex items-center gap-2.5 text-[11px] shrink-0">
            <span className="text-slate-400 font-medium">
              {seatedCount}/{classroom.students.length} Yerleşik
            </span>
            <span className="text-amber-300 font-bold flex items-center gap-1 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
              <span>👨‍🏫</span>
              <span className="text-[10px] uppercase">Kürsü</span>
            </span>
          </div>
        </div>

        {/* Right: Windows */}
        <div className="col-span-2 hidden md:flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-sky-50/90 border border-sky-200/80 text-sky-900 shadow-2xs text-[11px] font-bold">
          <span className="text-sm">🪟</span>
          <span className="uppercase tracking-wider">Cam</span>
        </div>
      </div>
    </div>
  );
};
