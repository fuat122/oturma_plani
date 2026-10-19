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
      borderColor: '#f59e0b',
      headerBg: '#fef3c7',
      headerColor: '#451a03',
    },
    {
      key: 'orta',
      name: 'ORTA BLOK SIRALARI',
      icon: '🏛️',
      borderColor: '#10b981',
      headerBg: '#d1fae5',
      headerColor: '#064e3b',
    },
    {
      key: 'cam',
      name: 'CAM KENARI SIRALARI',
      icon: '🪟',
      borderColor: '#0284c7',
      headerBg: '#e0f2fe',
      headerColor: '#0c4a6e',
    },
  ];

  return (
    <div
      id="printable-seating-chart"
      className="p-2.5 sm:p-3 max-w-[1060px] mx-auto shadow-none font-sans box-border"
      style={{
        backgroundColor: '#ffffff',
        color: '#0f172a',
        border: '2px solid #0f172a',
        pageBreakInside: 'avoid',
        breakInside: 'avoid',
        pageBreakAfter: 'avoid',
        maxHeight: '194mm',
        overflow: 'hidden',
      }}
    >
      {/* 1. Resmi Üst Başlık ve Kurum Alanı (Kompakt Tek Sayfa) */}
      <div
        className="text-center pb-1.5 mb-1.5"
        style={{ borderBottom: '2px solid #0f172a' }}
      >
        <div
          className="text-[10px] uppercase tracking-widest font-extrabold leading-tight"
          style={{ color: '#334155' }}
        >
          T.C. MİLLÎ EĞİTİM BAKANLIĞI
        </div>

        {/* Çok Büyük ve Net Birleşik Ana Başlık */}
        <h1
          className="text-base sm:text-lg font-black tracking-tight uppercase mt-0.5 leading-tight"
          style={{ color: '#020617' }}
        >
          {fullTitle}
        </h1>
        <div
          className="text-[9px] uppercase tracking-widest font-black leading-tight"
          style={{ color: '#475569' }}
        >
          RESMÎ SINIF OTURMA PLANI
        </div>

        {/* Sayfa Ortasında Kalın ve Okunaklı Bilgi Paneli */}
        <div
          className="mt-1 py-0.5 px-3 rounded max-w-4xl mx-auto"
          style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #475569',
          }}
        >
          <div
            className="grid grid-cols-3 items-center text-center divide-x"
            style={{ borderColor: '#cbd5e1' }}
          >
            {/* Danışman Öğretmen */}
            <div className="px-2">
              <div
                className="text-[8px] font-bold uppercase tracking-wider"
                style={{ color: '#64748b' }}
              >
                Danışman Öğretmen
              </div>
              <div
                className="text-xs font-black leading-tight"
                style={{ color: '#020617' }}
              >
                {consultantTeacherName}
              </div>
              <div
                className="text-[8px] font-semibold"
                style={{ color: '#475569' }}
              >
                {teacher.branch}
              </div>
            </div>

            {/* Öğretim Yılı ve Sınıf Kademesi */}
            <div className="px-2">
              <div
                className="text-[8px] font-bold uppercase tracking-wider"
                style={{ color: '#64748b' }}
              >
                Öğretim Yılı / Kademe
              </div>
              <div
                className="text-xs font-black leading-tight"
                style={{ color: '#020617' }}
              >
                {classroom.academicYear}
              </div>
              <div
                className="text-[8px] font-semibold"
                style={{ color: '#334155' }}
              >
                {classroom.grade} {classroom.branchName ? `• ${classroom.branchName}` : ''}
              </div>
            </div>

            {/* Sınıf Mevcudu & Tarih */}
            <div className="px-2">
              <div
                className="text-[8px] font-bold uppercase tracking-wider"
                style={{ color: '#64748b' }}
              >
                Mevcut / Kapasite
              </div>
              <div
                className="text-xs font-black leading-tight"
                style={{ color: '#020617' }}
              >
                {classroom.students.length} / {classroom.seats.length} Öğrenci
              </div>
              <div
                className="text-[8px] font-semibold"
                style={{ color: '#475569' }}
              >
                Tarih: {new Date().toLocaleDateString('tr-TR')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Akıllı Tahta & Öğretmen Kürsüsü Ön Cephe Şeridi */}
      <div
        className="grid grid-cols-12 gap-2 mb-1.5 items-center p-1 rounded"
        style={{
          backgroundColor: '#f1f5f9',
          border: '1px solid #94a3b8',
        }}
      >
        <div
          className="col-span-2 text-center text-[9px] font-black py-0.5 rounded"
          style={{
            backgroundColor: '#fef3c7',
            color: '#451a03',
            border: '1px solid #fcd34d',
          }}
        >
          🚪 GİRİŞ KAPISI
        </div>
        <div
          className="col-span-8 text-center py-0.5 rounded shadow-xs"
          style={{
            backgroundColor: '#0f172a',
            border: '1px solid #1e293b',
          }}
        >
          <div
            className="text-[10px] uppercase tracking-wider font-black"
            style={{ color: '#34d399' }}
          >
            ÖĞRETMEN KÜRSÜSÜ / AKILLI TAHTA (ÖN CEPHE)
          </div>
        </div>
        <div
          className="col-span-2 text-center text-[9px] font-black py-0.5 rounded"
          style={{
            backgroundColor: '#e0f2fe',
            color: '#0c4a6e',
            border: '1px solid #7dd3fc',
          }}
        >
          🪟 CAMLAR (DIŞ CEPHE)
        </div>
      </div>

      {/* 3. 3 Sıra Bloku (Tek Sayfaya Sığan Optimize Yükseklik) */}
      <div className="grid grid-cols-3 gap-2">
        {blocks.map((block) => (
          <div
            key={block.key}
            className="rounded-lg p-1.5 flex flex-col justify-between"
            style={{
              backgroundColor: '#fafafa',
              border: `2px solid ${block.borderColor}`,
              pageBreakInside: 'avoid',
              breakInside: 'avoid',
            }}
          >
            {/* Blok Başlığı */}
            <div
              className="text-center font-black text-[10px] uppercase tracking-wider py-0.5 px-1 rounded mb-1"
              style={{
                backgroundColor: block.headerBg,
                color: block.headerColor,
                border: '1px solid #cbd5e1',
              }}
            >
              {block.icon} {block.name}
            </div>

            {/* Blok İçindeki Sıralar */}
            <div className="space-y-1">
              {[1, 2, 3, 4].map((row) => (
                <div key={row} className="space-y-0.5">
                  <div
                    className="flex justify-between items-center text-[9px] px-0.5 font-bold"
                    style={{ color: '#475569' }}
                  >
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
                          className="p-1 rounded text-left min-h-[46px] max-h-[50px] flex flex-col justify-between"
                          style={{
                            backgroundColor: student
                              ? isGirl
                                ? '#fff1f2'
                                : '#ffffff'
                              : '#f8fafc',
                            border: student
                              ? isGirl
                                ? '2px solid #fb7185'
                                : '2px solid #0f172a'
                              : '1px dashed #cbd5e1',
                            color: student
                              ? isGirl
                                ? '#4c0519'
                                : '#020617'
                              : '#94a3b8',
                          }}
                        >
                          {/* Sıra Üst Alanı: No ve Cinsiyet */}
                          <div className="flex justify-between items-center text-[8px] leading-none">
                            {student ? (
                              <>
                                <span
                                  className="font-mono font-black text-[9px] px-1 py-0.2 rounded"
                                  style={{
                                    backgroundColor: '#e2e8f0',
                                    color: '#0f172a',
                                    border: '1px solid #cbd5e1',
                                  }}
                                >
                                  #{student.studentNumber}
                                </span>
                                <span
                                  className="text-[8px] font-black px-1 py-0.2 rounded"
                                  style={{
                                    backgroundColor: isGirl ? '#fecdd3' : '#dbeafe',
                                    color: isGirl ? '#881337' : '#1e3a8a',
                                  }}
                                >
                                  {isGirl ? 'Kız' : 'Erk'}
                                </span>
                              </>
                            ) : (
                              <span
                                className="text-[8px] font-bold"
                                style={{ color: '#94a3b8' }}
                              >
                                #{col}
                              </span>
                            )}
                          </div>

                          {/* Öğrenci Adı - Kalın, Yüksek Kontrastlı, Tek Satır / İki Satır Sığan */}
                          <div className="mt-0.5">
                            {student ? (
                              <div
                                className="font-black text-[10px] leading-tight tracking-tight uppercase line-clamp-1"
                                style={{
                                  color: isGirl ? '#4c0519' : '#020617',
                                }}
                                title={student.fullName}
                              >
                                {student.fullName}
                              </div>
                            ) : (
                              <div
                                className="text-[9px] font-bold italic text-center py-0.5"
                                style={{ color: '#94a3b8' }}
                              >
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
      <div
        className="mt-2 pt-1.5 grid grid-cols-2 text-center text-[9px]"
        style={{
          borderTop: '2px solid #0f172a',
          color: '#334155',
        }}
      >
        <div>
          <div
            className="font-black text-[11px]"
            style={{ color: '#020617' }}
          >
            {consultantTeacherName}
          </div>
          <div
            className="text-[9px] font-semibold"
            style={{ color: '#475569' }}
          >
            {teacher.branch} / Danışman Öğretmen
          </div>
          <div
            className="mt-2 text-[8px] font-medium"
            style={{ color: '#64748b' }}
          >
            İmza: .......................................
          </div>
        </div>
        <div>
          <div
            className="font-black text-[11px]"
            style={{ color: '#020617' }}
          >
            Okul Müdürü
          </div>
          <div
            className="text-[9px] font-semibold"
            style={{ color: '#475569' }}
          >
            Okul Müdürlüğü
          </div>
          <div
            className="mt-2 text-[8px] font-medium"
            style={{ color: '#64748b' }}
          >
            Mühür / İmza: .......................................
          </div>
        </div>
      </div>
    </div>
  );
};
