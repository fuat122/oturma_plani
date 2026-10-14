import React, { useState } from 'react';
import { SeatSlot, Student, StudentObservation } from '../types';
import { GripVertical, MessageSquare, Plus, UserX, Star } from 'lucide-react';

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

  return (
    <div
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative group rounded-xl transition-all duration-200 ${
        isDragOver
          ? 'scale-[1.03] ring-3 ring-blue-500 shadow-lg bg-blue-50/90 z-20'
          : ''
      } ${
        isDragging ? 'opacity-40 scale-95 border-dashed border-2 border-blue-400' : ''
      }`}
    >
      {/* Wooden Desk Simulation Container */}
      <div
        draggable={!!student}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        className={`p-3 rounded-xl border transition-all duration-150 flex flex-col justify-between min-h-[96px] ${
          student
            ? 'bg-white hover:bg-slate-50/90 border-slate-200/90 hover:border-blue-300 shadow-xs hover:shadow-md cursor-grab active:cursor-grabbing'
            : 'bg-slate-100/70 border-dashed border-2 border-slate-300/80 hover:bg-blue-50/50 hover:border-blue-400 cursor-pointer'
        }`}
      >
        {/* Top Bar: Seat Code & Badges */}
        <div className="flex items-center justify-between gap-1 text-[11px] mb-1.5">
          <div className="flex items-center gap-1.5">
            {student && (
              <GripVertical className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 transition-colors" />
            )}
            <span
              className={`font-mono font-bold px-1.5 py-0.5 rounded text-[10px] tracking-tight ${
                seat.block === 'duvar'
                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                  : seat.block === 'orta'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-sky-100 text-sky-800 border border-sky-200'
              }`}
            >
              {seat.code}
            </span>
          </div>

          {student ? (
            <div className="flex items-center gap-1">
              <span className="font-mono text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                No: {student.studentNumber}
              </span>
              <span
                className={`text-[9px] font-bold px-1 py-0.5 rounded ${
                  student.gender === 'K'
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                {student.gender === 'K' ? 'Kız' : 'Erk'}
              </span>
            </div>
          ) : (
            <span className="text-[10px] font-medium text-slate-500 bg-slate-200/60 px-1.5 py-0.5 rounded">
              Boş Sıra
            </span>
          )}
        </div>

        {/* Student Content or Empty Slot */}
        {student ? (
          <div>
            <div className="font-semibold text-xs sm:text-sm text-slate-900 leading-tight group-hover:text-blue-700 transition-colors line-clamp-1">
              {student.fullName}
            </div>

            {/* Bottom Meta & Action Area */}
            <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100 text-[11px]">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenStudentReport(student);
                }}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors ${
                  studentObservations.length > 0
                    ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold'
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
                  className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition-opacity"
                  title="Öğrenciyi bu sıradan kaldır"
                >
                  <UserX className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="py-2 flex flex-col items-center justify-center text-slate-500 text-center">
            <span className="text-xs font-medium text-slate-600">Öğrenci Sürükleyin</span>
            <span className="text-[10px] text-slate-500">veya bırakın</span>
          </div>
        )}
      </div>
    </div>
  );
};
