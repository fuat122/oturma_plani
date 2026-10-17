import React, { useState } from 'react';
import { SeatSlot, Student, StudentObservation } from '../types';
import { MessageSquare, UserX } from 'lucide-react';

interface StudentDeskCardProps {
  seat: SeatSlot;
  student: Student | null;
  observations: StudentObservation[];
  onSwapSeats: (sourceSeatId: string, targetSeatId: string) => void;
  onOpenStudentReport: (student: Student) => void;
  onRemoveStudentFromSeat?: (seatId: string) => void;
  isReadOnly?: boolean;
  staggerIndex?: number;
}

export const StudentDeskCard: React.FC<StudentDeskCardProps> = ({
  seat,
  student,
  onSwapSeats,
  onOpenStudentReport,
  onRemoveStudentFromSeat,
  isReadOnly = false,
  staggerIndex,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    if (!student || isReadOnly) return;
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({
        sourceSeatId: seat.id,
        studentId: student.id,
      })
    );
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (isReadOnly) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e: React.DragEvent) => {
    if (isReadOnly) return;
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (isReadOnly) return;
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    if (isReadOnly) return;
    e.preventDefault();
    setIsDragOver(false);

    try {
      const dataStr = e.dataTransfer.getData('application/json');
      if (!dataStr) return;
      const data = JSON.parse(dataStr);
      if (data && data.sourceSeatId && data.sourceSeatId !== seat.id) {
        onSwapSeats(data.sourceSeatId, seat.id);
      }
    } catch (err) {
      console.error('Drag drop parse error:', err);
    }
  };

  // Check if student's name is a generic placeholder like "Öğrenci 1", "Öğrenci1"
  const isGenericPlaceholderName =
    student && /^öğrenci\s*\d*$/i.test(student.fullName.trim());

  const displayName = isGenericPlaceholderName
    ? `Öğrenci #${student.studentNumber}`
    : student?.fullName;

  const isFemale = student?.gender === 'K';

  return (
    <div
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        animationDelay: staggerIndex !== undefined ? `${staggerIndex * 30}ms` : undefined,
      }}
      className={`animate-desk-entrance relative group rounded-xl transition-all duration-200 ease-in-out ${
        isDragOver && !isReadOnly
          ? 'scale-[1.02] ring-2 ring-blue-500 shadow-md bg-blue-50/90 z-20'
          : ''
      } ${
        isDragging && !isReadOnly ? 'opacity-40 scale-95 border-dashed border-2 border-blue-400' : ''
      }`}
    >
      {/* Desk Simulation Container */}
      <div
        draggable={!!student && !isReadOnly}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        className={`p-2.5 rounded-xl border flex flex-col justify-between min-h-[74px] backdrop-blur-md transition-all duration-200 ease-in-out ${
          student
            ? isFemale
              ? `bg-rose-50/90 border-rose-200/90 text-rose-950 shadow-sm ${
                  isReadOnly
                    ? 'cursor-default'
                    : 'hover:bg-rose-100/90 hover:border-rose-300 hover:shadow-md hover:-translate-y-0.5 hover:scale-[1.01] active:scale-[0.98] cursor-grab active:cursor-grabbing'
                }`
              : `bg-white/95 border-slate-200/90 text-slate-900 shadow-sm ${
                  isReadOnly
                    ? 'cursor-default'
                    : 'hover:bg-slate-50/95 hover:border-blue-300 hover:shadow-md hover:-translate-y-0.5 hover:scale-[1.01] active:scale-[0.98] cursor-grab active:cursor-grabbing'
                }`
            : 'bg-slate-50/70 border-dashed border-2 border-slate-200/90 text-slate-400 hover:border-slate-300 hover:bg-slate-100/60 cursor-default'
        }`}
      >
        {/* Top Bar: Student Number and Gender badge or empty indicator */}
        {student ? (
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span
              className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full leading-none shadow-2xs border ${
                isFemale
                  ? 'bg-rose-100/90 text-rose-900 border-rose-200/70'
                  : 'bg-slate-100 text-slate-700 border-slate-200/70'
              }`}
            >
              No: {student.studentNumber}
            </span>
            <span
              className={`text-[9px] font-bold px-2 py-0.5 rounded-full leading-none shadow-2xs border ${
                isFemale
                  ? 'bg-rose-200/90 text-rose-900 border-rose-300/80'
                  : 'bg-blue-100 text-blue-800 border-blue-200/70'
              }`}
            >
              {isFemale ? 'Kız' : 'Erkek'}
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-end text-[10px] mb-1">
            <span className="text-[10px] font-medium text-slate-400 bg-slate-200/60 px-2 py-0.5 rounded-full leading-none shadow-2xs">
              Boş Sıra
            </span>
          </div>
        )}

        {/* Student Name */}
        {student ? (
          <div>
            <div
              className={`font-bold text-xs sm:text-[13px] leading-tight transition-colors line-clamp-1 ${
                isFemale ? 'text-rose-950' : 'text-slate-900'
              }`}
              title={displayName}
            >
              {displayName}
            </div>

            {/* Bottom Meta & Action Area:
                In Read-Only Mode: Observations and edit buttons are STRICTLY hidden (only name, number, and seating layout visible).
                In Owner Mode: Fixed, sleek "Not Ekle" button is shown.
            */}
            {!isReadOnly && (
              <div
                className={`flex items-center justify-between mt-1.5 pt-1 border-t text-[11px] ${
                  isFemale ? 'border-rose-200/60' : 'border-slate-100'
                }`}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenStudentReport(student);
                  }}
                  className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold shadow-2xs hover:shadow-xs transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 cursor-pointer border ${
                    isFemale
                      ? 'text-rose-700 bg-rose-100/80 hover:bg-rose-200/90 border-rose-200/60'
                      : 'text-slate-600 bg-slate-100 hover:bg-slate-200/80 hover:text-slate-900 border-slate-200/60'
                  }`}
                  title="Gözlem geçmişini gör ve yeni not ekle"
                >
                  <MessageSquare className="w-3 h-3 shrink-0" />
                  <span>Not Ekle</span>
                </button>

                {onRemoveStudentFromSeat && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveStudentFromSeat(seat.id);
                    }}
                    className={`opacity-0 group-hover:opacity-100 p-1 rounded-full transition-all duration-200 ease-in-out hover:scale-110 active:scale-95 cursor-pointer ${
                      isFemale
                        ? 'text-rose-400 hover:text-rose-700 hover:bg-rose-200/60'
                        : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                    }`}
                    title="Öğrenciyi bu sıradan kaldır"
                  >
                    <UserX className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="py-2 flex items-center justify-center text-slate-400 text-center">
            <span className="text-[11px] font-medium text-slate-400">
              Boş Sıra
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
