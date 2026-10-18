import React from 'react';
import { Classroom, Teacher } from '../types';

interface PrintSeatingPlanProps {
  classroom: Classroom;
  teacher: Teacher;
}

export const PrintSeatingPlan: React.FC<PrintSeatingPlanProps> = ({ classroom, teacher }) => {
  const consultantTeacherName = classroom.teacherName || teacher.name;
  const fullTitle = `${consultantTeacherName} Danışmanlığında ${classroom.name} Sınıfı`;

  const blocks = [
    { key: 'duvar', name: 'DUVAR KENARI', prefix: 'D' },
    { key: 'orta', name: 'ORTA BLOK', prefix: 'O' },
    { key: 'cam', name: 'CAM KENARI', prefix: 'C' },
  ];

  return (
    <div
      id="printable-seating-chart"
      className="bg-white p-8 max-w-[1100px] mx-auto text-slate-900 border border-slate-300 shadow-sm print:border-none print:shadow-none print:p-2"
    >
      {/* Official Header */}
      <div className="text-center border-b-2 border-slate-900 pb-5 mb-6">
        <div className="text-xs uppercase tracking-widest text-slate-600 font-bold mb-1">
          T.C. MİLLÎ EĞİTİM BAKANLIĞI
        </div>

        {/* Çok daha büyük ve belirgin Sınıf Adı Ana Başlığı */}
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-950 mt-0.5">
          {fullTitle}
        </h1>
        <div className="text-xs uppercase tracking-widest text-slate-600 font-bold mt-1">
          OTURMA PLANI
        </div>

        {/* Sayfanın üst ortasında kalın ve büyük fontla Danışman Öğretmen ve Öğretim Yılı Vurgusu */}
        <div className="mt-4 p-3 bg-slate-50 border-2 border-slate-400 rounded-xl max-w-4xl mx-auto shadow-xs">
          <div className="grid grid-cols-3 items-center text-center divide-x divide-slate-300">
            {/* Danışman Öğretmen */}
            <div className="px-3">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Danışman Öğretmen
              </div>
              <div className="text-base sm:text-lg font-black text-slate-950 mt-0.5">
                {classroom.teacherName || teacher.name}
              </div>
              <div className="text-[11px] text-slate-600 font-medium">
                {teacher.branch}
              </div>
            </div>

            {/* Öğretim Yılı */}
            <div className="px-3">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Öğretim Yılı
              </div>
              <div className="text-base sm:text-lg font-black text-slate-950 mt-0.5">
                {classroom.academicYear}
              </div>
              <div className="text-[11px] text-slate-600 font-medium">
                {classroom.branchName || 'Genel Ortaöğretim'}
              </div>
            </div>

            {/* Sınıf Mevcudu & Tarih */}
            <div className="px-3">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Mevcut / Kapasite
              </div>
              <div className="text-base sm:text-lg font-black text-slate-950 mt-0.5">
                {classroom.students.length} / {classroom.seats.length} Öğrenci
              </div>
              <div className="text-[11px] text-slate-600 font-medium">
                Tarih: {new Date().toLocaleDateString('tr-TR')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Blackboard & Teacher Desk Visual Simulation */}
      <div className="grid grid-cols-12 gap-4 mb-8 items-center bg-slate-100 p-3 rounded-lg border border-slate-300">
        <div className="col-span-2 text-center text-xs font-semibold text-slate-600 bg-slate-200 py-2.5 rounded border border-slate-300">
          🚪 GİRİŞ KAPISI
        </div>
        <div className="col-span-8 bg-slate-800 text-white text-center py-2.5 rounded shadow-sm border-2 border-slate-700">
          <div className="text-xs uppercase tracking-wider text-emerald-400 font-bold">
            ÖĞRETMEN KÜRSÜSÜ / AKILLI TAHTA (ÖN CEPHE)
          </div>
        </div>
        <div className="col-span-2 text-center text-xs font-semibold text-slate-600 bg-blue-50 py-2.5 rounded border border-blue-200">
          🪟 CAMLAR (DIŞ CEPHE)
        </div>
      </div>

      {/* 3 Blocks of Desks */}
      <div className="grid grid-cols-3 gap-6">
        {blocks.map((block) => (
          <div
            key={block.key}
            className="border-2 border-slate-300 rounded-lg p-3 bg-slate-50 flex flex-col justify-between"
          >
            <div className="text-center font-bold text-xs uppercase tracking-wider text-slate-700 pb-2 mb-3 border-b border-slate-200">
              {block.name}
            </div>

            <div className="space-y-3">
              {[1, 2, 3, 4].map((row) => (
                <div key={row} className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] text-slate-400 px-1 font-mono">
                    <span>{row}. Sıra</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[1, 2].map((col) => {
                      const seat = classroom.seats.find(
                        (s) => s.block === block.key && s.row === row && s.col === col
                      );
                      const student = seat?.studentId
                        ? classroom.students.find((st) => st.id === seat.studentId)
                        : null;

                      const isGirl = student?.gender === 'K';
                      return (
                        <div
                          key={col}
                          className={`p-2 rounded-lg border text-left min-h-[64px] flex flex-col justify-between ${
                            student
                              ? isGirl
                                ? 'bg-rose-50 border-rose-300 text-rose-950'
                                : 'bg-white border-slate-300 shadow-2xs text-slate-900'
                              : 'bg-slate-50 border-dashed border-slate-200 text-slate-400'
                          }`}
                        >
                          <div className="flex justify-between items-start text-[10px] text-slate-500">
                            <span className="font-medium text-slate-500">
                              {row}. Sıra
                            </span>
                            {student && (
                              <div className="flex items-center gap-1">
                                <span className="font-mono font-bold text-slate-700">
                                  #{student.studentNumber}
                                </span>
                                <span
                                  className={`text-[9px] font-bold px-1 rounded ${
                                    isGirl
                                      ? 'bg-rose-100 text-rose-800'
                                      : 'bg-blue-100 text-blue-700'
                                  }`}
                                >
                                  {isGirl ? 'Kız' : 'Erkek'}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="mt-1">
                            {student ? (
                              <div
                                className={`font-bold text-xs leading-tight line-clamp-2 ${
                                  isGirl ? 'text-rose-950' : 'text-slate-900'
                                }`}
                              >
                                {student.fullName}
                              </div>
                            ) : (
                              <div className="text-[11px] italic text-slate-400">Boş Sıra</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Official Signatures Footer */}
      <div className="mt-12 pt-6 border-t border-slate-300 grid grid-cols-2 text-center text-xs text-slate-600">
        <div>
          <div className="font-semibold text-slate-800">{classroom.teacherName || teacher.name}</div>
          <div className="text-[11px] text-slate-500">{teacher.branch}</div>
          <div className="mt-8 text-[11px] text-slate-400">İmza: .......................................</div>
        </div>
        <div>
          <div className="font-semibold text-slate-800">Okul Müdürü</div>
          <div className="text-[11px] text-slate-500">Anadolu Lisesi Müdürlüğü</div>
          <div className="mt-8 text-[11px] text-slate-400">Mühür / İmza: .......................................</div>
        </div>
      </div>
    </div>
  );
};
