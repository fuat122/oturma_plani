import React from 'react';
import { Classroom, Student, SeatSlot } from '../types';
import { StudentDeskCard } from './StudentDeskCard';
import { UserCheck, Sparkles, Layers } from 'lucide-react';

interface SeatingPlanGridProps {
  classroom: Classroom;
  onSwapSeats: (sourceSeatId: string, targetSeatId: string) => void;
  onOpenStudentReport: (student: Student) => void;
  onRemoveStudentFromSeat?: (seatId: string) => void;
  onAssignStudentToSeat?: (studentId: string, seatId: string) => void;
}

export const SeatingPlanGrid: React.FC<SeatingPlanGridProps> = ({
  classroom,
  onSwapSeats,
  onOpenStudentReport,
  onRemoveStudentFromSeat,
  onAssignStudentToSeat,
}) => {
  // Extract blocks dynamically
  const uniqueBlockKeys = Array.from(new Set(classroom.seats.map((s) => s.block)));

  const blockMetadata: Record<string, { name: string; icon: string; border: string; bg: string }> = {
    duvar: {
      name: 'Duvar Kenarı Sıraları',
      icon: '🧱',
      border: 'border-amber-200/90',
      bg: 'bg-amber-50/30',
    },
    orta: {
      name: 'Orta Blok Sıraları',
      icon: '🏛️',
      border: 'border-emerald-200/90',
      bg: 'bg-emerald-50/30',
    },
    cam: {
      name: 'Cam Kenarı Sıraları',
      icon: '🪟',
      border: 'border-sky-200/90',
      bg: 'bg-sky-50/30',
    },
  };

  // Find students not currently in any seat
  const seatedStudentIds = new Set(
    classroom.seats.map((s) => s.studentId).filter((id): id is string => !!id)
  );
  const unseatedStudents = classroom.students.filter((st) => !seatedStudentIds.has(st.id));

  return (
    <div className="w-full space-y-6">
      {/* 3 Main Desks Blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
        {uniqueBlockKeys.map((blockKey, blockIndex) => {
          const meta = blockMetadata[blockKey] || {
            name: `${blockKey.toUpperCase()} Bloku`,
            icon: '🪑',
            border: 'border-slate-200',
            bg: 'bg-slate-50/40',
          };

          const blockSeats = classroom.seats.filter((s) => s.block === blockKey);
          const maxRows = Math.max(...blockSeats.map((s) => s.row), 4);
          const rows = Array.from({ length: maxRows }, (_, i) => i + 1);

          return (
            <div
              key={blockKey}
              className={`rounded-2xl border ${meta.border} ${meta.bg} p-4 sm:p-5 shadow-xs transition-all relative`}
            >
              {/* Block Header */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200/80">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{meta.icon}</span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 tracking-tight">
                      {meta.name}
                    </h3>
                  </div>
                </div>

                <span className="text-[10px] font-mono font-bold bg-white px-2 py-1 rounded-md text-slate-600 border border-slate-200 shadow-2xs">
                  Blok {blockIndex + 1}
                </span>
              </div>

              {/* Rows within this block */}
              <div className="space-y-4">
                {rows.map((rowNum) => {
                  const rowSeats = blockSeats
                    .filter((s) => s.row === rowNum)
                    .sort((a, b) => a.col - b.col);

                  return (
                    <div key={rowNum} className="relative">
                      {/* Row Label Indicator */}
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium mb-1.5 px-1">
                        <span>{rowNum}. Sıra</span>
                      </div>

                      {/* 2 Desks / Seats Side-by-Side */}
                      <div className="grid grid-cols-2 gap-3">
                        {rowSeats.map((seat) => {
                          const student = seat.studentId
                            ? classroom.students.find((st) => st.id === seat.studentId) || null
                            : null;

                          return (
                            <StudentDeskCard
                              key={seat.id}
                              seat={seat}
                              student={student}
                              observations={classroom.observations}
                              onSwapSeats={onSwapSeats}
                              onOpenStudentReport={onOpenStudentReport}
                              onRemoveStudentFromSeat={onRemoveStudentFromSeat}
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
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-200 text-amber-900">
                <Layers className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                  Sıraya Yerleştirilmemiş Öğrenciler ({unseatedStudents.length})
                </h4>
                <p className="text-[11px] text-amber-800">
                  Bu öğrencileri yukarıdaki boş sıralara sürükleyerek veya sıraya tıklayarak atayabilirsiniz.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {unseatedStudents.map((st) => (
              <div
                key={st.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData(
                    'application/json',
                    JSON.stringify({
                      sourceSeatId: 'unassigned',
                      studentId: st.id,
                    })
                  );
                }}
                className="bg-white border border-amber-300 px-3 py-2 rounded-xl shadow-xs flex items-center gap-2 cursor-grab active:cursor-grabbing hover:border-amber-500 hover:shadow-md transition-all"
              >
                <span className="font-mono text-xs font-bold text-amber-800">
                  #{st.studentNumber}
                </span>
                <span className="text-xs font-semibold text-slate-800">
                  {st.fullName}
                </span>
                <span
                  className={`text-[9px] font-bold px-1 rounded ${
                    st.gender === 'K' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {st.gender === 'K' ? 'Kız' : 'Erk'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
