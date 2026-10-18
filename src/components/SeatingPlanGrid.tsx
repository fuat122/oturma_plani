import React from 'react';
import { Classroom, Student } from '../types';
import { StudentDeskCard } from './StudentDeskCard';
import { Layers } from 'lucide-react';

interface SeatingPlanGridProps {
  classroom: Classroom;
  onSwapSeats: (sourceSeatId: string, targetSeatId: string) => void;
  onOpenStudentReport: (student: Student) => void;
  onRemoveStudentFromSeat?: (seatId: string) => void;
  onAssignStudentToSeat?: (studentId: string, seatId: string) => void;
  isReadOnly?: boolean;
}

export const SeatingPlanGrid: React.FC<SeatingPlanGridProps> = ({
  classroom,
  onSwapSeats,
  onOpenStudentReport,
  onRemoveStudentFromSeat,
  isReadOnly = false,
}) => {
  const readOnlyActive = isReadOnly || !!classroom.isReadOnly;

  // Extract blocks dynamically
  const uniqueBlockKeys = Array.from(new Set(classroom.seats.map((s) => s.block)));

  const blockMetadata: Record<string, { name: string; icon: string; border: string; bg: string }> = {
    duvar: {
      name: 'Duvar Kenarı Sıraları',
      icon: '🧱',
      border: 'border-amber-200/90',
      bg: 'bg-amber-50/40',
    },
    orta: {
      name: 'Orta Blok Sıraları',
      icon: '🏛️',
      border: 'border-emerald-200/90',
      bg: 'bg-emerald-50/40',
    },
    cam: {
      name: 'Cam Kenarı Sıraları',
      icon: '🪟',
      border: 'border-sky-200/90',
      bg: 'bg-sky-50/40',
    },
  };

  // Find students not currently in any seat
  const seatedStudentIds = new Set(
    classroom.seats.map((s) => s.studentId).filter((id): id is string => !!id)
  );
  const unseatedStudents = classroom.students.filter((st) => !seatedStudentIds.has(st.id));

  return (
    <div key={classroom.id} className="w-full space-y-3">
      {/* 3 Main Desks Blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 relative">
        {uniqueBlockKeys.map((blockKey, blockIndex) => {
          const meta = blockMetadata[blockKey] || {
            name: `${blockKey.toUpperCase()} Bloku`,
            icon: '🪑',
            border: 'border-slate-200/90',
            bg: 'bg-slate-50/40',
          };

          const blockSeats = classroom.seats.filter((s) => s.block === blockKey);
          const maxRows = Math.max(...blockSeats.map((s) => s.row), 4);
          const rows = Array.from({ length: maxRows }, (_, i) => i + 1);

          return (
            <div
              key={blockKey}
              className={`rounded-2xl border ${meta.border} ${meta.bg} backdrop-blur-md p-3 sm:p-3.5 shadow-sm hover:shadow-md transition-all duration-200 ease-in-out relative`}
            >
              {/* Block Header */}
              <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-200/80">
                <div className="flex items-center gap-1.5">
                  <span className="text-base select-none">{meta.icon}</span>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-800 tracking-tight">
                      {meta.name}
                    </h3>
                  </div>
                </div>

                <span className="text-[10px] font-mono font-bold bg-white/90 px-2 py-0.5 rounded-full text-slate-600 border border-slate-200 shadow-2xs">
                  Blok {blockIndex + 1}
                </span>
              </div>

              {/* Rows within this block: compact row spacing */}
              <div className="space-y-2">
                {rows.map((rowNum) => {
                  const rowSeats = blockSeats
                    .filter((s) => s.row === rowNum)
                    .sort((a, b) => a.col - b.col);

                  return (
                    <div key={rowNum} className="relative">
                      {/* Row Label Indicator */}
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium mb-1 px-0.5">
                        <span className="font-medium text-slate-500">{rowNum}. Sıra</span>
                      </div>

                      {/* 2 Desks / Seats Side-by-Side */}
                      <div className="grid grid-cols-2 gap-2">
                        {rowSeats.map((seat, seatIndex) => {
                          const student = seat.studentId
                            ? classroom.students.find((st) => st.id === seat.studentId) || null
                            : null;

                          // Stagger entrance animation across the entire classroom in an organic wave
                          const staggerIndex = blockIndex * 8 + (rowNum - 1) * 2 + seatIndex;

                          return (
                            <StudentDeskCard
                              key={seat.id}
                              seat={seat}
                              student={student}
                              observations={classroom.observations}
                              onSwapSeats={onSwapSeats}
                              onOpenStudentReport={onOpenStudentReport}
                              onRemoveStudentFromSeat={onRemoveStudentFromSeat}
                              isReadOnly={readOnlyActive}
                              staggerIndex={staggerIndex}
                            />
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Unassigned Students Dock (if any) */}
      {unseatedStudents.length > 0 && (
        <div className="bg-amber-50/90 backdrop-blur-md border border-amber-200/90 rounded-2xl p-3 shadow-sm transition-all duration-200 ease-in-out">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-amber-200/80 text-amber-900 shadow-2xs">
                <Layers className="w-3.5 h-3.5" />
              </span>
              <div>
                <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                  Sıraya Yerleştirilmemiş Öğrenciler ({unseatedStudents.length})
                </h4>
                <p className="text-[10px] text-amber-800">
                  {readOnlyActive
                    ? 'Bu sınıfa kayıtlı olup henüz sıraya atanmamış öğrenciler'
                    : 'Bu öğrencileri yukarıdaki boş sıralara sürükleyerek atayabilirsiniz.'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {unseatedStudents.map((st) => (
              <div
                key={st.id}
                draggable={!readOnlyActive}
                onDragStart={(e) => {
                  if (readOnlyActive) return;
                  e.dataTransfer.setData(
                    'application/json',
                    JSON.stringify({
                      sourceSeatId: 'unassigned',
                      studentId: st.id,
                    })
                  );
                }}
                className={`bg-white/95 border border-amber-300/80 px-2.5 py-1.5 rounded-xl shadow-2xs hover:shadow-xs flex items-center gap-1.5 transition-all duration-200 ease-in-out ${
                  readOnlyActive
                    ? 'cursor-default'
                    : 'cursor-grab active:cursor-grabbing hover:border-amber-500 hover:-translate-y-0.5 active:scale-[0.98]'
                }`}
              >
                <span className="font-mono text-xs font-bold text-amber-900">
                  #{st.studentNumber}
                </span>
                <span className="text-xs font-semibold text-slate-800">
                  {st.fullName}
                </span>
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full border shadow-2xs ${
                    st.gender === 'K'
                      ? 'bg-rose-100 text-rose-800 border-rose-200'
                      : 'bg-blue-100 text-blue-800 border-blue-200'
                  }`}
                >
                  {st.gender === 'K' ? 'Kız' : 'Erkek'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
