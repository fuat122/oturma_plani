import React, { useState } from 'react';
import { SeatSlot, Student, StudentObservation } from '../types';
import { GripVertical, MessageSquare, UserX, Armchair } from 'lucide-react';

interface StudentDeskCardProps {
  seat: SeatSlot;
  student: Student | null;
  observations: StudentObservation[];
  onSwapSeats: (sourceSeatId: string, targetSeatId: string) => void;
  onOpenStudentReport: (student: Student) => void;
  onRemoveStudentFromSeat?: (seatId: string) => void;
}

export const StudentDeskCard: React.FC<StudentDeskCardProps> = ({
  seat,
  student,
  observations,
  onSwapSeats,
  onOpenStudentReport,
  onRemoveStudentFromSeat,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const studentObservations = student
    ? observations.filter((o) => o.studentId === student.id)
    : [];

  const handleDragStart = (e: React.DragEvent) => {
    if (!student) return;
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
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
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
      className={`relative group rounded-2xl transition-all duration-200 ${
        isDragOver
          ? 'scale-[1.03] ring-3 ring-blue-500 shadow-lg bg-blue-50/90 z-20'
          : ''
      } ${
        isDragging ? 'opacity-40 scale-95 border-dashed border-2 border-blue-400' : ''
      }`}
    >
      {/* Desk Simulation Container */}
      <div
        draggable={!!student}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        className={`p-3 rounded-2xl border transition-all duration-150 flex flex-col justify-between min-h-[96px] ${
          student
            ? isFemale
              ? 'bg-rose-50/95 hover:bg-rose-100/80 border-rose-200/90 hover:border-rose-300 shadow-xs hover:shadow-md cursor-grab active:cursor-grabbing text-rose-950'
              : 'bg-white hover:bg-slate-50/90 border-slate-200/90 hover:border-blue-300 shadow-xs hover:shadow-md cursor-grab active:cursor-grabbing text-slate-900'
            : 'bg-slate-50/70 border-dashed border-2 border-slate-200 hover:bg-blue-50/40 hover:border-blue-300 cursor-pointer text-slate-400'
        }`}
      >
        {/* Top Bar: Clean header with NO D/O/C location letters */}
        <div className="flex items-center justify-between gap-1 text-[11px] mb-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            {student ? (
              <GripVertical
                className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                  isFemale
                    ? 'text-rose-400 group-hover:text-rose-600'
                    : 'text-slate-400 group-hover:text-blue-500'
                }`}
              />
            ) : (
              <Armchair className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            )}
            <span
              className={`text-[10px] font-semibold tracking-tight ${
                student
                  ? isFemale
                    ? 'text-rose-800'
                    : 'text-slate-600'
                  : 'text-slate-400'
              }`}
            >
              {seat.row}. Sıra
            </span>
          </div>

          {student ? (
            <div className="flex items-center gap-1 shrink-0">
              <span
                className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  isFemale
                    ? 'bg-rose-200/60 text-rose-900'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                No: {student.studentNumber}
              </span>
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                  isFemale
                    ? 'bg-rose-200 text-rose-800'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                {isFemale ? 'Kız' : 'Erkek'}
              </span>
            </div>
          ) : (
            <span className="text-[10px] font-medium text-slate-400 bg-slate-200/50 px-1.5 py-0.5 rounded">
              Boş Sıra
            </span>
          )}
        </div>

        {/* Student Content or Clean Empty Slot */}
        {student ? (
          <div>
            <div
              className={`font-bold text-xs sm:text-sm leading-tight transition-colors line-clamp-1 ${
                isFemale
                  ? 'text-rose-950 group-hover:text-rose-800'
                  : 'text-slate-900 group-hover:text-blue-700'
              }`}
            >
              {displayName}
            </div>

            {/* Bottom Meta & Action Area */}
            <div
              className={`flex items-center justify-between mt-2 pt-1.5 border-t text-[11px] ${
                isFemale ? 'border-rose-200/60' : 'border-slate-100'
              }`}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenStudentReport(student);
                }}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors ${
                  studentObservations.length > 0
                    ? isFemale
                      ? 'bg-rose-200/70 text-rose-900 font-bold hover:bg-rose-200'
                      : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold'
                    : isFemale
                    ? 'text-rose-700 hover:bg-rose-100/80'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                }`}
                title="Gözlem geçmişini gör ve yeni not ekle"
              >
                <MessageSquare className="w-3 h-3" />
                <span>
                  {studentObservations.length > 0
                    ? `${studentObservations.length} Gözlem`
                    : 'Not Ekle'}
                </span>
              </button>

              {onRemoveStudentFromSeat && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveStudentFromSeat(seat.id);
                  }}
                  className={`opacity-0 group-hover:opacity-100 p-1 rounded transition-opacity ${
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
          </div>
        ) : (
          <div className="py-2.5 flex items-center justify-center text-slate-400 text-center">
            <span className="text-[11px] font-medium text-slate-400">
              Boş Sıra
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
