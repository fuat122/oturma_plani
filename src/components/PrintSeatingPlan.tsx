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
      className="bg-white p-2.5 sm:p-3 max-w-[1060px] mx-auto text-slate-900 border-2 border-slate-900 shadow-none font-sans box-border"
      style={{
        pageBreakInside: 'avoid',
        breakInside: 'avoid',
        pageBreakAfter: 'avoid',
        maxHeight: '194mm',
        overflow: 'hidden',
      }}
    >
      {/* 1. Resmi Üst Başlık ve Kurum Alanı (Kompakt Tek Sayfa) */}
      <div className="text-center border-b-2 border-slate-900 pb-1.5 mb-1.5">
        <div className="text-[10px] uppercase tracking-widest text-slate-700 font-extrabold leading-tight">
          T.C. MİLLÎ EĞİTİM BAKANLIĞI
        </div>

        {/* Çok Büyük ve Net Birleşik Ana Başlık */}
        <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-950 uppercase mt-0.5 leading-tight">
          {fullTitle}
        </h1>
        <div className="text-[9px] uppercase tracking-widest text-slate-600 font-black leading-tight">
          RESMÎ SINIF OTURMA PLANI
        </div>

        {/* Sayfa Ortasında Kalın ve Okunaklı Bilgi Paneli */}
        <div className="mt-1 py-0.5 px-3 bg-slate-50 border border-slate-700 rounded max-w-4xl mx-auto">
          <div className="grid grid-cols-3 items-center text-center divide-x divide-slate-300">
            {/* Danışman Öğretmen */}
            <div className="px-2">
              <div className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">
                Danışman Öğretmen
              </div>
              <div className="text-xs font-black text-slate-950 leading-tight">
                {consultantTeacherName}
              </div>
              <div className="text-[8px] text-slate-600 font-semibold">
                {teacher.branch}
              </div>
            </div>

            {/* Öğretim Yılı ve Sınıf Kademesi */}
            <div className="px-2">
              <div className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">
                Öğretim Yılı / Kademe
              </div>
              <div className="text-xs font-black text-slate-950 leading-tight">
                {classroom.academicYear}
              </div>
              <div className="text-[8px] text-slate-700 font-semibold">
                {classroom.grade} {classroom.branchName ? `• ${classroom.branchName}` : ''}
              </div>
            </div>

            {/* Sınıf Mevcudu & Tarih */}
            <div className="px-2">
              <div className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">
                Mevcut / Kapasite
              </div>
              <div className="text-xs font-black text-slate-950 leading-tight">
                {classroom.students.length} / {classroom.seats.length} Öğrenci
              </div>
              <div className="text-[8px] text-slate-600 font-semibold">
                Tarih: {new Date().toLocaleDateString('tr-TR')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Akıllı Tahta & Öğretmen Kürsüsü Ön Cephe Şeridi */}
      <div className="grid grid-cols-12 gap-2 mb-1.5 items-center bg-slate-100 p-1 rounded border border-slate-400">
        <div className="col-span-2 text-center text-[9px] font-black text-amber-950 bg-amber-100 py-0.5 rounded border border-amber-300">
          🚪 GİRİŞ KAPISI
        </div>
        <div className="col-span-8 bg-slate-900 text-white text-center py-0.5 rounded shadow-xs border border-slate-800">
          <div className="text-[10px] uppercase tracking-wider text-emerald-400 font-black">
            ÖĞRETMEN KÜRSÜSÜ / AKILLI TAHTA (ÖN CEPHE)
          </div>
        </div>
        <div className="col-span-2 text-center text-[9px] font-black text-sky-950 bg-sky-100 py-0.5 rounded border border-sky-300">
          🪟 CAMLAR (DIŞ CEPHE)
        </div>
      </div>

      {/* 3. 3 Sıra Bloku (Tek Sayfaya Sığan Optimize Yükseklik) */}
      <div className="grid grid-cols-3 gap-2">
        {blocks.map((block) => (
          <div
            key={block.key}
            className={`border-2 ${block.border} rounded-lg p-1.5 bg-slate-50/70 flex flex-col justify-between`}
            style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
          >
            {/* Blok Başlığı */}
            <div
              className={`text-center font-black text-[10px] uppercase tracking-wider py-0.5 px-1 rounded mb-1 border border-slate-300 ${block.headerBg}`}
            >
              {block.icon} {block.name}
            </div>

            {/* Blok İçindeki Sıralar */}
            <div className="space-y-1">
              {[1, 2, 3, 4].map((row) => (
                <div key={row} className="space-y-0.5">
                  <div className="flex justify-between items-center text-[9px] text-slate-600 px-0.5 font-bold">
                    <span>{row}. Sıra</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
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
                          className={`p-1 rounded text-left min-h-[46px] max-h-[50px] flex flex-col justify-between border-2 ${
                            student
                              ? isGirl
                                ? 'bg-rose-50 border-rose-400 text-rose-950'
                                : 'bg-white border-slate-800 text-slate-950'
                              : 'bg-slate-50 border-dashed border-slate-300 text-slate-400'
                          }`}
                        >
                          {/* Sıra Üst Alanı: No ve Cinsiyet */}
                          <div className="flex justify-between items-center text-[8px] leading-none">
                            {student ? (
                              <>
                                <span className="font-mono font-black text-[9px] text-slate-900 bg-slate-200 px-1 py-0.2 rounded border border-slate-300">
                                  #{student.studentNumber}
                                </span>
                                <span
                                  className={`text-[8px] font-black px-1 py-0.2 rounded ${
                                    isGirl
                                      ? 'bg-rose-200 text-rose-900'
                                      : 'bg-blue-100 text-blue-900'
                                  }`}
                                >
                                  {isGirl ? 'Kız' : 'Erk'}
                                </span>
                              </>
                            ) : (
                              <span className="text-[8px] font-bold text-slate-400">
                                #{col}
                              </span>
                            )}
                          </div>

                          {/* Öğrenci Adı - Kalın, Yüksek Kontrastlı, Tek Satır / İki Satır Sığan */}
                          <div className="mt-0.5">
                            {student ? (
                              <div
                                className={`font-black text-[10px] leading-tight tracking-tight uppercase line-clamp-1 ${
                                  isGirl ? 'text-rose-950' : 'text-slate-950'
                                }`}
                                title={student.fullName}
                              >
                                {student.fullName}
                              </div>
                            ) : (
                              <div className="text-[9px] font-bold italic text-slate-400 text-center py-0.5">
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

      {/* 4. Resmi İmza ve Onay Alanı (Kompakt Tek Sayfa) */}
      <div className="mt-2 pt-1.5 border-t-2 border-slate-900 grid grid-cols-2 text-center text-[9px] text-slate-700">
        <div>
          <div className="font-black text-[11px] text-slate-950">{consultantTeacherName}</div>
          <div className="text-[9px] font-semibold text-slate-600">{teacher.branch} / Danışman Öğretmen</div>
          <div className="mt-2 text-[8px] text-slate-500 font-medium">İmza: .......................................</div>
        </div>
        <div>
          <div className="font-black text-[11px] text-slate-950">Okul Müdürü</div>
          <div className="text-[9px] font-semibold text-slate-600">Okul Müdürlüğü</div>
          <div className="mt-2 text-[8px] text-slate-500 font-medium">Mühür / İmza: .......................................</div>
        </div>
      </div>
    </div>
  );
};
