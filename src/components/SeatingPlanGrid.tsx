import React, { useState, useRef } from 'react';
import { Classroom, Student, SeatSlot } from '../types';
import { StudentDeskCard } from './StudentDeskCard';
import { Layers, ArrowLeftRight, X } from 'lucide-react';

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

  // Selected seat or unassigned student for mobile/touch Tap-to-Swap
  const [selectedSeatForSwap, setSelectedSeatForSwap] = useState<{
    seatId: string;
    studentId: string | null;
    studentName: string;
  } | null>(null);

  // Active hover target during mobile touch drag
  const [touchHoverSeatId, setTouchHoverSeatId] = useState<string | null>(null);

  // Touch drag state for unassigned students
  const [unseatedTouchPreview, setUnseatedTouchPreview] = useState<{
    student: Student;
    coords: { x: number; y: number };
  } | null>(null);
  const unseatedTouchRef = useRef<{
    student: Student;
    startX: number;
    startY: number;
    time: number;
  } | null>(null);

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

  // Handle click on a desk card (Mobile & Desktop Tap-to-Swap)
  const handleCardClick = (seat: SeatSlot, student: Student | null) => {
    if (readOnlyActive) return;

    // 1. If no seat is currently selected:
    if (!selectedSeatForSwap) {
      if (student) {
        setSelectedSeatForSwap({
          seatId: seat.id,
          studentId: student.id,
          studentName: student.fullName,
        });
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(40);
        }
      }
      return;
    }

    // 2. A seat is already selected:
    if (selectedSeatForSwap.seatId === seat.id) {
      // Tapping the same seat cancels selection
      setSelectedSeatForSwap(null);
      return;
    }

    // Tapping ANY other seat (empty or occupied) swaps/moves immediately!
    onSwapSeats(selectedSeatForSwap.seatId, seat.id);
    setSelectedSeatForSwap(null);
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(60);
    }
  };

  // Handle click on an unassigned student (Tap-to-Swap)
  const handleUnseatedClick = (st: Student) => {
    if (readOnlyActive) return;

    if (selectedSeatForSwap?.seatId === `unassigned:${st.id}`) {
      setSelectedSeatForSwap(null);
      return;
    }

    setSelectedSeatForSwap({
      seatId: `unassigned:${st.id}`,
      studentId: st.id,
      studentName: st.fullName,
    });
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(40);
    }
  };

  // Touch drag handlers for unassigned students
  const handleUnseatedTouchStart = (e: React.TouchEvent, st: Student) => {
    if (readOnlyActive) return;
    const touch = e.touches[0];
    unseatedTouchRef.current = {
      student: st,
      startX: touch.clientX,
      startY: touch.clientY,
      time: Date.now(),
    };
  };

  const handleUnseatedTouchMove = (e: React.TouchEvent) => {
    if (!unseatedTouchRef.current || readOnlyActive) return;
    const touch = e.touches[0];
    const dx = touch.clientX - unseatedTouchRef.current.startX;
    const dy = touch.clientY - unseatedTouchRef.current.startY;
    const dist = Math.hypot(dx, dy);

    if (dist > 10) {
      if (e.cancelable) e.preventDefault();
      setUnseatedTouchPreview({
        student: unseatedTouchRef.current.student,
        coords: { x: touch.clientX, y: touch.clientY },
      });

      const el = document.elementFromPoint(touch.clientX, touch.clientY);
      const targetDesk = el?.closest('[data-seat-id]') as HTMLElement;
      const targetSeatId = targetDesk?.getAttribute('data-seat-id') || null;
      setTouchHoverSeatId(targetSeatId);
    }
  };

  const handleUnseatedTouchEnd = (e: React.TouchEvent) => {
    if (!unseatedTouchRef.current) return;

    if (unseatedTouchPreview) {
      const lastTouch = e.changedTouches[0];
      const el = document.elementFromPoint(lastTouch.clientX, lastTouch.clientY);
      const targetDesk = el?.closest('[data-seat-id]') as HTMLElement;
      const targetSeatId = targetDesk?.getAttribute('data-seat-id');

      if (targetSeatId) {
        onSwapSeats(`unassigned:${unseatedTouchRef.current.student.id}`, targetSeatId);
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(60);
        }
      }
      setUnseatedTouchPreview(null);
      setTouchHoverSeatId(null);
    } else {
      // Tap
      const dt = Date.now() - unseatedTouchRef.current.time;
      if (dt < 500) {
        handleUnseatedClick(unseatedTouchRef.current.student);
      }
    }

    unseatedTouchRef.current = null;
  };

  return (
    <div key={classroom.id} className="w-full space-y-3 relative">
      {/* FLOATING TOUCH DRAG GHOST FOR UNASSIGNED STUDENTS */}
      {unseatedTouchPreview && (
        <div
          className="touch-drag-preview px-3 py-2 rounded-2xl bg-amber-900/95 text-white font-bold text-xs shadow-2xl border-2 border-amber-400 flex items-center gap-2"
          style={{
            left: `${unseatedTouchPreview.coords.x}px`,
            top: `${unseatedTouchPreview.coords.y - 45}px`,
          }}
        >
          <span className="font-mono bg-amber-500 text-white px-1.5 py-0.5 rounded text-[10px]">
            #{unseatedTouchPreview.student.studentNumber}
          </span>
          <span className="truncate max-w-[140px]">{unseatedTouchPreview.student.fullName}</span>
          <ArrowLeftRight className="w-3 h-3 text-emerald-400 animate-pulse" />
        </div>
      )}

      {/* Mobile Horizontal Scroll Hint */}
      <div className="flex lg:hidden items-center justify-between px-3 py-2 mb-2.5 bg-blue-50/90 border border-blue-200/90 rounded-2xl text-[11px] text-blue-900 font-medium shadow-2xs">
        <span className="flex items-center gap-1.5">
          <span>↔️</span>
          <span>Sıralar arasında parmağınızla yatay kaydırabilirsiniz</span>
        </span>
        <span className="text-[10px] bg-blue-200/90 text-blue-950 font-bold px-2 py-0.5 rounded-full shrink-0">
          3 Blok
        </span>
      </div>

      {/* 3 Main Desks Blocks with Horizontal Pan Support on Mobile */}
      <div className="overflow-x-auto touch-pan-x pb-4 -mx-2 px-2 sm:mx-0 sm:px-0">
        <div className="min-w-[860px] lg:min-w-0 grid grid-cols-3 gap-3.5 relative">
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
                <span className="text-[10px] font-bold text-slate-700 bg-white/80 px-2 py-0.5 rounded-full border border-slate-200/60 shadow-2xs">
                  {blockSeats.filter((s) => s.studentId).length} / {blockSeats.length} Dolu
                </span>
              </div>

              {/* Rows inside Block */}
              <div className="space-y-2">
                {rows.map((rowNum) => {
                  const rowSeats = blockSeats.filter((s) => s.row === rowNum);
                  if (rowSeats.length === 0) return null;

                  return (
                    <div key={rowNum} className="space-y-0.5">
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
                          const isSelected = selectedSeatForSwap?.seatId === seat.id;

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
                              isSelectedForSwap={isSelected}
                              hasActiveSelection={!!selectedSeatForSwap}
                              onCardClick={() => handleCardClick(seat, student)}
                              isTouchTargetHovered={touchHoverSeatId === seat.id}
                              onTouchHoverChange={setTouchHoverSeatId}
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
                    : 'Dokunarak veya parmağınızla sürükleyerek boş sıralara yerleştirebilirsiniz.'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {unseatedStudents.map((st) => {
              const isSelected = selectedSeatForSwap?.seatId === `unassigned:${st.id}`;
              return (
                <div
                  key={st.id}
                  draggable={!readOnlyActive}
                  onClick={() => handleUnseatedClick(st)}
                  onTouchStart={(e) => handleUnseatedTouchStart(e, st)}
                  onTouchMove={handleUnseatedTouchMove}
                  onTouchEnd={handleUnseatedTouchEnd}
                  onDragStart={(e) => {
                    if (readOnlyActive) return;
                    e.dataTransfer.setData(
                      'application/json',
                      JSON.stringify({
                        sourceSeatId: `unassigned:${st.id}`,
                        studentId: st.id,
                      })
                    );
                  }}
                  style={{
                    touchAction: !readOnlyActive ? 'none' : 'auto',
                  }}
                  className={`border px-2.5 py-1.5 rounded-xl shadow-2xs hover:shadow-xs flex items-center gap-1.5 transition-all duration-200 ease-in-out select-none ${
                    isSelected
                      ? 'bg-blue-100 border-blue-500 ring-2 ring-blue-500 scale-105 shadow-md'
                      : 'bg-white/95 border-amber-300/80'
                  } ${
                    readOnlyActive
                      ? 'cursor-default'
                      : 'cursor-pointer hover:border-amber-500 hover:-translate-y-0.5 active:scale-[0.98]'
                  }`}
                  title="Dokunarak veya sürükleyerek bir sıraya yerleştirin"
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
                  {!readOnlyActive && (
                    <span className="text-[9px] text-blue-600 font-bold ml-0.5">
                      {isSelected ? '✓ Seçildi' : 'Taşı'}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* FLOATING ACTION HELPER FOR MOBILE TAP-TO-SWAP */}
      {selectedSeatForSwap && !readOnlyActive && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-[92%] sm:w-auto bg-slate-900/95 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-2xl border border-blue-500/60 flex items-center justify-between gap-3 animate-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="relative flex h-3 w-3 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </span>
            <div className="text-xs truncate">
              <strong className="text-blue-300 font-black">{selectedSeatForSwap.studentName}</strong> seçildi.
              <span className="text-slate-300"> Hedef sıraya dokunun.</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSelectedSeatForSwap(null)}
            className="shrink-0 flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>İptal</span>
          </button>
        </div>
      )}
    </div>
  );
};
