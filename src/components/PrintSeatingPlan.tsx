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
    {
      key: 'duvar',
      name: 'DUVAR KENARI SIRALARI',
      icon: '🧱',
      border: 'border-amber-400',
      headerBg: 'bg-amber-100 text-amber-950',
    },
    {
      key: 'orta',
      name: 'ORTA BLOK SIRALARI',
      icon: '🏛️',
      border: 'border-emerald-400',
      headerBg: 'bg-emerald-100 text-emerald-950',
    },
    {
      key: 'cam',
      name: 'CAM KENARI SIRALARI',
      icon: '🪟',
      border: 'border-sky-400',
      headerBg: 'bg-sky-100 text-sky-950',
    },
  ];

  return (
    <div
      id="printable-seating-chart"
      className="bg-white p-6 max-w-[1100px] mx-auto text-slate-900 border-2 border-slate-800 shadow-none font-sans"
      style={{ minHeight: '740px' }}
    >
      {/* 1. Resmi Üst Başlık ve Kurum Alanı */}
      <div className="text-center border-b-2 border-slate-900 pb-3 mb-4">
        <div className="text-xs uppercase tracking-widest text-slate-700 font-extrabold mb-0.5">
          T.C. MİLLÎ EĞİTİM BAKANLIĞI
        </div>

        {/* Çok Büyük ve Net Birleşik Ana Başlık */}
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 uppercase mt-0.5">
          {fullTitle}
        </h1>
        <div className="text-xs uppercase tracking-widest text-slate-600 font-black mt-0.5">
          RESMÎ SINIF OTURMA PLANI
        </div>

        {/* Sayfa Ortasında Kalın ve Okunaklı Bilgi Paneli */}
        <div className="mt-2.5 p-2.5 bg-slate-50 border-2 border-slate-700 rounded-lg max-w-4xl mx-auto">
          <div className="grid grid-cols-3 items-center text-center divide-x-2 divide-slate-300">
            {/* Danışman Öğretmen */}
            <div className="px-2">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Danışman Öğretmen
              </div>
              <div className="text-sm sm:text-base font-black text-slate-950 mt-0.5">
                {consultantTeacherName}
              </div>
              <div className="text-[10px] text-slate-600 font-semibold">
                {teacher.branch}
              </div>
            </div>

            {/* Öğretim Yılı ve Sınıf Kademesi */}
            <div className="px-2">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Öğretim Yılı / Kademe
              </div>
              <div className="text-sm sm:text-base font-black text-slate-950 mt-0.5">
                {classroom.academicYear}
              </div>
              <div className="text-[10px] text-slate-700 font-semibold">
                {classroom.grade} {classroom.branchName ? `• ${classroom.branchName}` : ''}
              </div>
            </div>

            {/* Sınıf Mevcudu & Tarih */}
            <div className="px-2">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Mevcut / Kapasite
              </div>
              <div className="text-sm sm:text-base font-black text-slate-950 mt-0.5">
                {classroom.students.length} / {classroom.seats.length} Öğrenci
              </div>
              <div className="text-[10px] text-slate-600 font-semibold">
                Tarih: {new Date().toLocaleDateString('tr-TR')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Akıllı Tahta & Öğretmen Kürsüsü Ön Cephe Şeridi */}
      <div className="grid grid-cols-12 gap-3 mb-4 items-center bg-slate-100 p-2 rounded-lg border-2 border-slate-400">
        <div className="col-span-2 text-center text-xs font-black text-amber-950 bg-amber-100 py-2 rounded border-2 border-amber-400">
          🚪 GİRİŞ KAPISI
        </div>
        <div className="col-span-8 bg-slate-900 text-white text-center py-2 rounded shadow-sm border-2 border-slate-800">
          <div className="text-xs sm:text-sm uppercase tracking-wider text-emerald-400 font-black">
            ÖĞRETMEN KÜRSÜSÜ / AKILLI TAHTA (ÖN CEPHE)
          </div>
        </div>
        <div className="col-span-2 text-center text-xs font-black text-sky-950 bg-sky-100 py-2 rounded border-2 border-sky-400">
          🪟 CAMLAR (DIŞ CEPHE)
        </div>
      </div>

      {/* 3. 3 Sıra Bloku (Yüksek Kontrastlı ve İri İsimli Masalar) */}
      <div className="grid grid-cols-3 gap-4">
        {blocks.map((block) => (
          <div
            key={block.key}
            className={`border-2 ${block.border} rounded-lg p-2.5 bg-slate-50/70 flex flex-col justify-between`}
          >
            {/* Blok Başlığı */}
            <div
              className={`text-center font-black text-xs uppercase tracking-wider py-1.5 px-2 rounded-md mb-2.5 border border-slate-300 ${block.headerBg}`}
            >
              {block.icon} {block.name}
            </div>

            {/* Blok İçindeki Sıralar */}
            <div className="space-y-2.5">
              {[1, 2, 3, 4].map((row) => (
                <div key={row} className="space-y-1">
                  <div className="flex justify-between items-center text-[11px] text-slate-600 px-1 font-bold">
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
                          className={`p-2 rounded-lg text-left min-h-[74px] flex flex-col justify-between border-2 ${
                            student
                              ? isGirl
                                ? 'bg-rose-50 border-rose-400 text-rose-950 shadow-xs'
                                : 'bg-white border-slate-800 text-slate-950 shadow-xs'
                              : 'bg-slate-50 border-dashed border-slate-300 text-slate-400'
                          }`}
                        >
                          {/* Sıra Üst Alanı: No ve Cinsiyet */}
                          <div className="flex justify-between items-center text-[10px]">
                            {student ? (
                              <>
                                <span className="font-mono font-black text-xs text-slate-900 bg-slate-200/90 px-1.5 py-0.5 rounded border border-slate-300 leading-none">
                                  #{student.studentNumber}
                                </span>
                                <span
                                  className={`text-[10px] font-black px-1.5 py-0.5 rounded leading-none ${
                                    isGirl
                                      ? 'bg-rose-200 text-rose-900'
                                      : 'bg-blue-100 text-blue-900'
                                  }`}
                                >
                                  {isGirl ? 'Kız' : 'Erkek'}
                                </span>
                              </>
                            ) : (
                              <span className="text-[10px] font-bold text-slate-400">
                                Sıra #{col}
                              </span>
                            )}
                          </div>

                          {/* Öğrenci Adı - İri, Kalın, Yüksek Kontrastlı */}
                          <div className="mt-1">
                            {student ? (
                              <div
                                className={`font-black text-xs sm:text-[13px] leading-tight tracking-tight uppercase line-clamp-2 ${
                                  isGirl ? 'text-rose-950' : 'text-slate-950'
                                }`}
                              >
                                {student.fullName}
                              </div>
                            ) : (
                              <div className="text-[11px] font-bold italic text-slate-400 text-center py-1">
                                Boş Sıra
                              </div>
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

      {/* 4. Resmi İmza ve Onay Alanı */}
      <div className="mt-6 pt-4 border-t-2 border-slate-800 grid grid-cols-2 text-center text-xs text-slate-700">
        <div>
          <div className="font-black text-sm text-slate-950">{consultantTeacherName}</div>
          <div className="text-[11px] font-semibold text-slate-600">{teacher.branch} / Danışman Öğretmen</div>
          <div className="mt-6 text-[11px] text-slate-500 font-medium">İmza: .......................................</div>
        </div>
        <div>
          <div className="font-black text-sm text-slate-950">Okul Müdürü</div>
          <div className="text-[11px] font-semibold text-slate-600">Okul Müdürlüğü</div>
          <div className="mt-6 text-[11px] text-slate-500 font-medium">Mühür / İmza: .......................................</div>
        </div>
      </div>
    </div>
  );
};
