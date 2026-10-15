import * as XLSX from 'xlsx';
import { Classroom } from '../types';

export function exportClassroomToExcel(classroom: Classroom, teacherName?: string): void {
  const wb = XLSX.utils.book_new();

  // -------------------------------------------------------------
  // Sheet 1: OTURMA PLANI (Grid & Desk List)
  // -------------------------------------------------------------
  const seatingData: any[][] = [
    ['AKILLI SINIF OTURMA PLANI VE GÖZLEM RAPORU'],
    ['Sınıf:', classroom.name, 'Akademik Yıl:', classroom.academicYear],
    ['Öğretmen:', teacherName || 'Yetkili Öğretmen', 'Düzen:', '3 Blok İkili Sıra Düzeni'],
    ['Toplam Sıra:', classroom.seats.length, 'Yerleşen Öğrenci:', classroom.students.length],
    ['Rapor Tarihi:', new Date().toLocaleDateString('tr-TR')],
    [],
    ['Sıra Kodu', 'Blok', 'Sıra No', 'Masa Tarafı', 'Öğrenci No', 'Öğrenci Adı Soyadı', 'Cinsiyet', 'Özel Not / Durum']
  ];

  classroom.seats.forEach((seat) => {
    const student = classroom.students.find((s) => s.id === seat.studentId);
    const blockLabel =
      seat.block === 'duvar'
        ? '1. Blok (Pencere/Duvar)'
        : seat.block === 'orta'
        ? '2. Blok (Orta)'
        : '3. Blok (Kapı Tarafı)';
    const colLabel = seat.col === 1 ? 'Sol Masa' : 'Sağ Masa';

    seatingData.push([
      seat.code,
      blockLabel,
      `${seat.row}. Sıra`,
      colLabel,
      student ? student.studentNumber : '-',
      student ? student.fullName : '(BOŞ SIRA)',
      student ? (student.gender === 'K' ? 'Kız' : 'Erkek') : '-',
      student?.notes || '-'
    ]);
  });

  const wsSeating = XLSX.utils.aoa_to_sheet(seatingData);
  // Auto-fit column widths
  wsSeating['!cols'] = [
    { wch: 12 },
    { wch: 25 },
    { wch: 12 },
    { wch: 14 },
    { wch: 14 },
    { wch: 28 },
    { wch: 10 },
    { wch: 30 }
  ];
  XLSX.utils.book_append_sheet(wb, wsSeating, 'Oturma Planı');

  // -------------------------------------------------------------
  // Sheet 2: ÖĞRENCİ LİSTESİ
  // -------------------------------------------------------------
  const studentData: any[][] = [
    ['SINIF ÖĞRENCİ LİSTESİ VE OTURMA BİLGİSİ'],
    ['Sınıf:', classroom.name, 'Mevcut:', classroom.students.length],
    [],
    ['Sıra No', 'Okul No', 'Adı Soyadı', 'Cinsiyet', 'Oturduğu Sıra Kodu', 'Özel Notlar', 'Toplam Gözlem/Yorum']
  ];

  classroom.students.forEach((student, index) => {
    const seat = classroom.seats.find((s) => s.studentId === student.id);
    const observationCount = (classroom.observations || []).filter(
      (obs) => obs.studentId === student.id
    ).length;

    studentData.push([
      index + 1,
      student.studentNumber,
      student.fullName,
      student.gender === 'K' ? 'Kız' : 'Erkek',
      seat ? seat.code : 'Atanmamış',
      student.notes || '-',
      observationCount
    ]);
  });

  const wsStudents = XLSX.utils.aoa_to_sheet(studentData);
  wsStudents['!cols'] = [
    { wch: 8 },
    { wch: 14 },
    { wch: 28 },
    { wch: 10 },
    { wch: 18 },
    { wch: 30 },
    { wch: 20 }
  ];
  XLSX.utils.book_append_sheet(wb, wsStudents, 'Öğrenci Listesi');

  // -------------------------------------------------------------
  // Sheet 3: TARİH BAZLI ÖĞRENCİ YORUMLARI VE GÖZLEMLER
  // -------------------------------------------------------------
  const observationData: any[][] = [
    ['TARİH BAZLI ÖĞRENCİ GELİŞİM VE GÖZLEM NOTLARI'],
    ['Sınıf:', classroom.name, 'Toplam Kayıt:', (classroom.observations || []).length],
    [],
    ['Tarih', 'Öğrenci No', 'Öğrenci Adı Soyadı', 'Kategori', 'Gözlem / Öğretmen Yorumu', 'Öğretmen', 'Kayıt Zamanı']
  ];

  const sortedObservations = [...(classroom.observations || [])].sort((a, b) =>
    b.date.localeCompare(a.date)
  );

  if (sortedObservations.length === 0) {
    observationData.push(['Henüz tarih bazlı öğrenci yorumu kaydedilmemiş.', '', '', '', '', '', '']);
  } else {
    sortedObservations.forEach((obs) => {
      const categoryMap: Record<string, string> = {
        katilim: 'Ders Katılımı',
        davranis: 'Sınıf İçi Davranış',
        arkadas: 'Arkadaş İlişkileri',
        odev: 'Ödev ve Hazırlık',
        genel: 'Genel Değerlendirme'
      };

      observationData.push([
        obs.date,
        classroom.students.find((s) => s.id === obs.studentId)?.studentNumber || '-',
        obs.studentName,
        categoryMap[obs.category] || obs.category,
        obs.content,
        obs.teacherName || teacherName || 'Öğretmen',
        obs.createdAt ? new Date(obs.createdAt).toLocaleString('tr-TR') : '-'
      ]);
    });
  }

  const wsObservations = XLSX.utils.aoa_to_sheet(observationData);
  wsObservations['!cols'] = [
    { wch: 14 },
    { wch: 14 },
    { wch: 26 },
    { wch: 20 },
    { wch: 45 },
    { wch: 22 },
    { wch: 20 }
  ];
  XLSX.utils.book_append_sheet(wb, wsObservations, 'Tarihli Yorumlar');

  // Generate filename: e.g. 9-A_Oturma_Plani_2026-10-15.xlsx
  const safeClassName = classroom.name.replace(/[^a-zA-Z0-9_\-]/g, '_');
  const dateStr = new Date().toISOString().split('T')[0];
  const fileName = `${safeClassName}_Oturma_Plani_${dateStr}.xlsx`;

  XLSX.writeFile(wb, fileName);
}
