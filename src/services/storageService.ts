import { Classroom, Teacher, SeatSlot, Student, StudentObservation, ClassNote } from '../types';

const STORAGE_KEYS = {
  TEACHERS: 'smart_classroom_teachers_v1',
  CLASSROOMS: 'smart_classroom_classes_v1',
  CURRENT_TEACHER_ID: 'smart_classroom_current_teacher_id_v1',
  ACTIVE_CLASS_ID: 'smart_classroom_active_class_id_v1',
};

export const DEFAULT_TEACHERS: Teacher[] = [
  {
    id: 'teacher_selim_9a',
    name: 'Selim Aydın',
    email: 'selim.aydin@anadolulisesi.k12.tr',
    branch: 'Matematik & 9-A Sınıf Rehber Öğretmeni',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'teacher_bahar_10b',
    name: 'Bahar Yılmaz',
    email: 'bahar.yilmaz@anadolulisesi.k12.tr',
    branch: 'Türk Dili ve Edebiyatı & 10-B Rehber Öğretmeni',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'teacher_murat_hazirlik',
    name: 'Murat Demir',
    email: 'murat.demir@anadolulisesi.k12.tr',
    branch: 'İngilizce & Hazırlık-A Danışmanı',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
];

export function generateDefaultSeats(): SeatSlot[] {
  const seats: SeatSlot[] = [];
  const blocks = [
    { key: 'duvar', name: 'Duvar Kenarı', prefix: 'D' },
    { key: 'orta', name: 'Orta Blok', prefix: 'O' },
    { key: 'cam', name: 'Cam Kenarı', prefix: 'C' },
  ];

  blocks.forEach((block) => {
    for (let row = 1; row <= 4; row++) {
      for (let col = 1; col <= 2; col++) {
        const seatNum = (row - 1) * 2 + col;
        const code = `${block.prefix}-${row}${col}`;
        seats.push({
          id: `${block.key}_r${row}_c${col}`,
          block: block.key,
          blockName: block.name,
          row,
          col,
          code,
          studentId: null,
        });
      }
    }
  });

  return seats;
}

export function generateFlexibleSeats(
  blockCount: 3 | 4 | 5 = 3,
  rowsPerBlock: number = 4
): SeatSlot[] {
  const seats: SeatSlot[] = [];
  const blockDefs: { key: string; name: string; prefix: string }[] = [];

  if (blockCount === 3) {
    blockDefs.push(
      { key: 'duvar', name: 'Duvar Kenarı', prefix: 'D' },
      { key: 'orta', name: 'Orta Blok', prefix: 'O' },
      { key: 'cam', name: 'Cam Kenarı', prefix: 'C' }
    );
  } else if (blockCount === 4) {
    blockDefs.push(
      { key: 'blok1', name: '1. Blok (Duvar)', prefix: 'B1' },
      { key: 'blok2', name: '2. Blok (Sol Orta)', prefix: 'B2' },
      { key: 'blok3', name: '3. Blok (Sağ Orta)', prefix: 'B3' },
      { key: 'blok4', name: '4. Blok (Cam)', prefix: 'B4' }
    );
  } else {
    for (let i = 1; i <= blockCount; i++) {
      blockDefs.push({
        key: `blok${i}`,
        name: `${i}. Sıra Bloku`,
        prefix: `S${i}`,
      });
    }
  }

  blockDefs.forEach((b) => {
    for (let r = 1; r <= rowsPerBlock; r++) {
      // 2 students per desk
      for (let c = 1; c <= 2; c++) {
        seats.push({
          id: `${b.key}_r${r}_c${c}`,
          block: b.key,
          blockName: b.name,
          row: r,
          col: c,
          code: `${b.prefix}-${r}${c}`,
          studentId: null,
        });
      }
    }
  });

  return seats;
}

function createSeedData(): { teachers: Teacher[]; classrooms: Classroom[] } {
  // 9-A Classroom for Teacher Selim Aydın (Capacity: 22 students - under 23 cap)
  const seats9A = generateDefaultSeats();
  const students9A: Student[] = [
    { id: 's9a_01', studentNumber: '101', fullName: 'Ahmet Eren Yılmaz', gender: 'E' },
    { id: 's9a_02', studentNumber: '104', fullName: 'Zeynep Su Kara', gender: 'K' },
    { id: 's9a_03', studentNumber: '108', fullName: 'Kerem Batuhan Demir', gender: 'E' },
    { id: 's9a_04', studentNumber: '112', fullName: 'Elif Naz Şahin', gender: 'K' },
    { id: 's9a_05', studentNumber: '115', fullName: 'Emir Kaan Çelik', gender: 'E' },
    { id: 's9a_06', studentNumber: '119', fullName: 'Defne Aydın', gender: 'K' },
    { id: 's9a_07', studentNumber: '122', fullName: 'Ege Baran Arslan', gender: 'E' },
    { id: 's9a_08', studentNumber: '127', fullName: 'Nehir Koç', gender: 'K' },
    { id: 's9a_09', studentNumber: '131', fullName: 'Yağız Alp Kurt', gender: 'E' },
    { id: 's9a_10', studentNumber: '135', fullName: 'İrem Doğan', gender: 'K' },
    { id: 's9a_11', studentNumber: '140', fullName: 'Umut Tuna Yıldız', gender: 'E' },
    { id: 's9a_12', studentNumber: '144', fullName: 'Ceren Öztürk', gender: 'K' },
    { id: 's9a_13', studentNumber: '149', fullName: 'Mert Ali Güneş', gender: 'E' },
    { id: 's9a_14', studentNumber: '153', fullName: 'Duru Aktaş', gender: 'K' },
    { id: 's9a_15', studentNumber: '158', fullName: 'Burak Can Yavuz', gender: 'E' },
    { id: 's9a_16', studentNumber: '162', fullName: 'Ada Yüksel', gender: 'K' },
    { id: 's9a_17', studentNumber: '167', fullName: 'Alperen Polat', gender: 'E' },
    { id: 's9a_18', studentNumber: '171', fullName: 'Buse Tekin', gender: 'K' },
    { id: 's9a_19', studentNumber: '176', fullName: 'Çağan Deniz Er', gender: 'E' },
    { id: 's9a_20', studentNumber: '180', fullName: 'Melis Kılıç', gender: 'K' },
    { id: 's9a_21', studentNumber: '185', fullName: 'Yiğit Akın', gender: 'E' },
    { id: 's9a_22', studentNumber: '189', fullName: 'Sude Nur Çetin', gender: 'K' },
  ];

  // Assign 22 students to initial 22 seats
  students9A.forEach((st, idx) => {
    if (idx < seats9A.length) {
      seats9A[idx].studentId = st.id;
      st.seatCode = seats9A[idx].code;
    }
  });

  const obs9A: StudentObservation[] = [
    {
      id: 'obs_1',
      classId: 'class_9a',
      studentId: 's9a_01',
      studentName: 'Ahmet Eren Yılmaz',
      date: '2026-10-10',
      category: 'katilim',
      content: 'Trigonometri tahta uygulamalarında oldukça istekli ve çözüm adımlarını net açıklıyor.',
      teacherId: 'teacher_selim_9a',
      teacherName: 'Selim Aydın',
      createdAt: '2026-10-10T09:30:00Z',
    },
    {
      id: 'obs_2',
      classId: 'class_9a',
      studentId: 's9a_01',
      studentName: 'Ahmet Eren Yılmaz',
      date: '2026-10-14',
      category: 'arkadas',
      content: 'Zeynep ile ön sırada uyumlu bir çalışma sergiledi, ders odağı yüksek.',
      teacherId: 'teacher_selim_9a',
      teacherName: 'Selim Aydın',
      createdAt: '2026-10-14T11:15:00Z',
    },
    {
      id: 'obs_3',
      classId: 'class_9a',
      studentId: 's9a_02',
      studentName: 'Zeynep Su Kara',
      date: '2026-10-12',
      category: 'odev',
      content: 'Haftalık problem çözümü fasikülü eksiksiz tamamlanmış, düzenli not tutuyor.',
      teacherId: 'teacher_selim_9a',
      teacherName: 'Selim Aydın',
      createdAt: '2026-10-12T10:00:00Z',
    },
    {
      id: 'obs_4',
      classId: 'class_9a',
      studentId: 's9a_03',
      studentName: 'Kerem Batuhan Demir',
      date: '2026-10-14',
      category: 'davranis',
      content: 'Cam kenarından orta bloka geçtikten sonra tahtaya odaklanması belirgin şekilde arttı.',
      teacherId: 'teacher_selim_9a',
      teacherName: 'Selim Aydın',
      createdAt: '2026-10-14T09:45:00Z',
    },
    {
      id: 'obs_5',
      classId: 'class_9a',
      studentId: 's9a_04',
      studentName: 'Elif Naz Şahin',
      date: '2026-10-14',
      category: 'katilim',
      content: 'Grup çalışmasında lider rol üstlendi ve arkadaşlarına soru çözümünde destek oldu.',
      teacherId: 'teacher_selim_9a',
      teacherName: 'Selim Aydın',
      createdAt: '2026-10-14T10:30:00Z',
    },
  ];

  const notes9A: ClassNote[] = [
    {
      id: 'cn_1',
      classId: 'class_9a',
      date: '2026-10-10',
      content: '1. Yazılı hazırlık tekrarı tamamlandı. Sınıf genelinin fonksiyon grafikleri konusundaki başarısı memnun edici.',
      teacherId: 'teacher_selim_9a',
      teacherName: 'Selim Aydın',
      createdAt: '2026-10-10T12:00:00Z',
    },
    {
      id: 'cn_2',
      classId: 'class_9a',
      date: '2026-10-14',
      content: 'Yeni oturma planı revizyonu yapıldı. Arka sıralardaki konuşmalar azaldı, tahta görüş açısı optimize edildi.',
      teacherId: 'teacher_selim_9a',
      teacherName: 'Selim Aydın',
      createdAt: '2026-10-14T11:40:00Z',
    },
  ];

  const class9A: Classroom = {
    id: 'class_9a',
    teacherId: 'teacher_selim_9a',
    name: '9-A',
    grade: '9. Sınıf',
    branchName: 'Sayısal Odaklı Anadolu Lisesi Programı',
    academicYear: '2026-2027',
    maxCapacity: 24,
    layoutType: '3-block-standard',
    students: students9A,
    seats: seats9A,
    observations: obs9A,
    classNotes: notes9A,
    syncStatus: 'synced',
    createdAt: '2026-09-15T08:00:00Z',
  };

  // 10-B Classroom for Teacher Bahar Yılmaz (Different students - ISOLATION TEST)
  const seats10B = generateDefaultSeats();
  const students10B: Student[] = [
    { id: 's10b_01', studentNumber: '201', fullName: 'Barış Alper Taşkın', gender: 'E' },
    { id: 's10b_02', studentNumber: '205', fullName: 'Büşra Hilal Kaya', gender: 'K' },
    { id: 's10b_03', studentNumber: '209', fullName: 'Canberk Dinçer', gender: 'E' },
    { id: 's10b_04', studentNumber: '214', fullName: 'Damla Nur Yıldırım', gender: 'K' },
    { id: 's10b_05', studentNumber: '218', fullName: 'Emre Can Boz', gender: 'E' },
    { id: 's10b_06', studentNumber: '223', fullName: 'Gülce Vural', gender: 'K' },
    { id: 's10b_07', studentNumber: '228', fullName: 'Hasan Basri Öz', gender: 'E' },
    { id: 's10b_08', studentNumber: '232', fullName: 'İlayda Keskin', gender: 'K' },
    { id: 's10b_09', studentNumber: '237', fullName: 'Kadir Mert Coşkun', gender: 'E' },
    { id: 's10b_10', studentNumber: '241', fullName: 'Leyla Melike Şen', gender: 'K' },
    { id: 's10b_11', studentNumber: '246', fullName: 'Mustafa Talha Eren', gender: 'E' },
    { id: 's10b_12', studentNumber: '250', fullName: 'Nisa Gültekin', gender: 'K' },
    { id: 's10b_13', studentNumber: '255', fullName: 'Oğuzhan Çakır', gender: 'E' },
    { id: 's10b_14', studentNumber: '260', fullName: 'Pelin Sare Aslan', gender: 'K' },
    { id: 's10b_15', studentNumber: '265', fullName: 'Rüzgar Efe Koçak', gender: 'E' },
    { id: 's10b_16', studentNumber: '270', fullName: 'Selin Karaca', gender: 'K' },
    { id: 's10b_17', studentNumber: '275', fullName: 'Tolga Mete Yücel', gender: 'E' },
    { id: 's10b_18', studentNumber: '280', fullName: 'Yağmur Tan', gender: 'K' },
  ];

  students10B.forEach((st, idx) => {
    if (idx < seats10B.length) {
      seats10B[idx].studentId = st.id;
      st.seatCode = seats10B[idx].code;
    }
  });

  const class10B: Classroom = {
    id: 'class_10b',
    teacherId: 'teacher_bahar_10b',
    name: '10-B',
    grade: '10. Sınıf',
    branchName: 'Edebiyat & Sosyal Bilimler Ağırlıklı',
    academicYear: '2026-2027',
    maxCapacity: 24,
    layoutType: '3-block-standard',
    students: students10B,
    seats: seats10B,
    observations: [
      {
        id: 'obs_10b_1',
        classId: 'class_10b',
        studentId: 's10b_01',
        studentName: 'Barış Alper Taşkın',
        date: '2026-10-13',
        category: 'katilim',
        content: 'Divan şiiri tahlilinde beyit yorumlaması çok başarılıydı.',
        teacherId: 'teacher_bahar_10b',
        teacherName: 'Bahar Yılmaz',
        createdAt: '2026-10-13T14:10:00Z',
      },
    ],
    classNotes: [
      {
        id: 'cn_10b_1',
        classId: 'class_10b',
        date: '2026-10-13',
        content: 'Edebi akımlar sunumları başlatıldı. Kütüphane kaynakları sınıfla paylaşıldı.',
        teacherId: 'teacher_bahar_10b',
        teacherName: 'Bahar Yılmaz',
        createdAt: '2026-10-13T15:00:00Z',
      },
    ],
    syncStatus: 'synced',
    createdAt: '2026-09-16T09:00:00Z',
  };

  // Hazırlık-A Classroom for Teacher Murat Demir (Different students - ISOLATION TEST)
  const seatsHazirlik = generateDefaultSeats();
  const studentsHazirlik: Student[] = [
    { id: 'shz_01', studentNumber: '001', fullName: 'Alp Arda Günay', gender: 'E' },
    { id: 'shz_02', studentNumber: '005', fullName: 'Bensu Mina Aksoy', gender: 'K' },
    { id: 'shz_03', studentNumber: '009', fullName: 'Can Polat Erden', gender: 'E' },
    { id: 'shz_04', studentNumber: '013', fullName: 'Dila Nazlı Köse', gender: 'K' },
    { id: 'shz_05', studentNumber: '017', fullName: 'Emre Tibet Bayraktar', gender: 'E' },
    { id: 'shz_06', studentNumber: '021', fullName: 'Gülfem İnce', gender: 'K' },
    { id: 'shz_07', studentNumber: '025', fullName: 'Halil İbrahim Özcan', gender: 'E' },
    { id: 'shz_08', studentNumber: '029', fullName: 'Ilgın Derin Taner', gender: 'K' },
    { id: 'shz_09', studentNumber: '033', fullName: 'Kaan Selim Toker', gender: 'E' },
    { id: 'shz_10', studentNumber: '037', fullName: 'Melisa Nil Güler', gender: 'K' },
    { id: 'shz_11', studentNumber: '041', fullName: 'Ozan Efe Çam', gender: 'E' },
    { id: 'shz_12', studentNumber: '045', fullName: 'Rana Zeynep Sarı', gender: 'K' },
    { id: 'shz_13', studentNumber: '049', fullName: 'Sarp Deniz Avcı', gender: 'E' },
    { id: 'shz_14', studentNumber: '053', fullName: 'Tuğçe Nur Yaşar', gender: 'K' },
    { id: 'shz_15', studentNumber: '057', fullName: 'Uras Kerem Bağcı', gender: 'E' },
  ];

  studentsHazirlik.forEach((st, idx) => {
    if (idx < seatsHazirlik.length) {
      seatsHazirlik[idx].studentId = st.id;
      st.seatCode = seatsHazirlik[idx].code;
    }
  });

  const classHazirlik: Classroom = {
    id: 'class_hazirlik_a',
    teacherId: 'teacher_murat_hazirlik',
    name: 'Hazırlık-A',
    grade: 'Hazırlık',
    branchName: 'Yoğunlaştırılmış İngilizce Hazırlık Programı',
    academicYear: '2026-2027',
    maxCapacity: 24,
    layoutType: '3-block-standard',
    students: studentsHazirlik,
    seats: seatsHazirlik,
    observations: [],
    classNotes: [
      {
        id: 'cn_hz_1',
        classId: 'class_hazirlik_a',
        date: '2026-10-14',
        content: 'Speaking kulübü eşleşmeleri yapıldı. Öğrencilerin dil pratiği için oturma sıraları haftalık değişecek.',
        teacherId: 'teacher_murat_hazirlik',
        teacherName: 'Murat Demir',
        createdAt: '2026-10-14T08:30:00Z',
      },
    ],
    syncStatus: 'synced',
    createdAt: '2026-09-14T08:00:00Z',
  };

  return {
    teachers: DEFAULT_TEACHERS,
    classrooms: [class9A, class10B, classHazirlik],
  };
}

export function initializeStorage(): { teachers: Teacher[]; classrooms: Classroom[] } {
  const existingTeachers = localStorage.getItem(STORAGE_KEYS.TEACHERS);
  const existingClassrooms = localStorage.getItem(STORAGE_KEYS.CLASSROOMS);

  if (!existingTeachers || !existingClassrooms) {
    const seed = createSeedData();
    localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(seed.teachers));
    localStorage.setItem(STORAGE_KEYS.CLASSROOMS, JSON.stringify(seed.classrooms));
    localStorage.setItem(STORAGE_KEYS.CURRENT_TEACHER_ID, seed.teachers[0].id);
    localStorage.setItem(STORAGE_KEYS.ACTIVE_CLASS_ID, seed.classrooms[0].id);
    return seed;
  }

  try {
    const teachers: Teacher[] = JSON.parse(existingTeachers);
    let classrooms: Classroom[] = JSON.parse(existingClassrooms);

    // Normalize maxCapacity to match actual physical seat count (e.g. 24 desks)
    let needsResave = false;
    classrooms = classrooms.map((cls) => {
      const realSeatCount = cls.seats && cls.seats.length > 0 ? cls.seats.length : 24;
      if (cls.maxCapacity !== realSeatCount) {
        needsResave = true;
        return { ...cls, maxCapacity: realSeatCount };
      }
      return cls;
    });

    if (needsResave) {
      localStorage.setItem(STORAGE_KEYS.CLASSROOMS, JSON.stringify(classrooms));
    }

    return {
      teachers,
      classrooms,
    };
  } catch (e) {
    console.error('Storage parse error, resetting seed data', e);
    const seed = createSeedData();
    localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(seed.teachers));
    localStorage.setItem(STORAGE_KEYS.CLASSROOMS, JSON.stringify(seed.classrooms));
    return seed;
  }
}

export function getStoredTeachers(): Teacher[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TEACHERS);
    return raw ? JSON.parse(raw) : DEFAULT_TEACHERS;
  } catch {
    return DEFAULT_TEACHERS;
  }
}

export function getStoredClassrooms(): Classroom[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CLASSROOMS);
    if (!raw) return [];
    const parsed: Classroom[] = JSON.parse(raw);
    return parsed.map((cls) => ({
      ...cls,
      maxCapacity: cls.seats && cls.seats.length > 0 ? cls.seats.length : 24,
    }));
  } catch {
    return [];
  }
}

export function saveClassrooms(classrooms: Classroom[]) {
  localStorage.setItem(STORAGE_KEYS.CLASSROOMS, JSON.stringify(classrooms));
}

export function saveTeachers(teachers: Teacher[]) {
  localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(teachers));
}

export function getCurrentTeacherId(): string {
  return localStorage.getItem(STORAGE_KEYS.CURRENT_TEACHER_ID) || DEFAULT_TEACHERS[0].id;
}

export function setCurrentTeacherId(teacherId: string) {
  localStorage.setItem(STORAGE_KEYS.CURRENT_TEACHER_ID, teacherId);
}

export function getActiveCLassId(): string | null {
  return localStorage.getItem(STORAGE_KEYS.ACTIVE_CLASS_ID);
}

export function setActiveClassId(classId: string) {
  localStorage.setItem(STORAGE_KEYS.ACTIVE_CLASS_ID, classId);
}

export function clearStoredSessionData() {
  try {
    localStorage.removeItem(STORAGE_KEYS.TEACHERS);
    localStorage.removeItem(STORAGE_KEYS.CLASSROOMS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_TEACHER_ID);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_CLASS_ID);
  } catch (err) {
    console.error('Error clearing stored session data:', err);
  }
}

export function createStarterClassroomForGoogleTeacher(teacher: Teacher): Classroom {
  const seats = generateDefaultSeats();
  const sampleNames = [
    { name: 'Ahmet Faruk Yılmaz', gender: 'E' as const },
    { name: 'Zeynep Defne Kaya', gender: 'K' as const },
    { name: 'Kerem Arda Demir', gender: 'E' as const },
    { name: 'Elif Sare Şahin', gender: 'K' as const },
    { name: 'Emir Kaan Çelik', gender: 'E' as const },
    { name: 'Defne Beren Aydın', gender: 'K' as const },
    { name: 'Ege Baran Arslan', gender: 'E' as const },
    { name: 'Nehir İrem Koç', gender: 'K' as const },
    { name: 'Yağız Alp Kurt', gender: 'E' as const },
    { name: 'İrem Su Doğan', gender: 'K' as const },
    { name: 'Umut Tuna Yıldız', gender: 'E' as const },
    { name: 'Ceren Naz Öztürk', gender: 'K' as const },
    { name: 'Mert Ali Güneş', gender: 'E' as const },
    { name: 'Duru Melis Aktaş', gender: 'K' as const },
    { name: 'Burak Can Yavuz', gender: 'E' as const },
    { name: 'Ada Nil Yüksel', gender: 'K' as const },
    { name: 'Alperen Bora Polat', gender: 'E' as const },
    { name: 'Buse Ela Tekin', gender: 'K' as const },
    { name: 'Çağan Deniz Er', gender: 'E' as const },
    { name: 'Sude Nur Çetin', gender: 'K' as const },
  ];

  const students: Student[] = sampleNames.map((s, idx) => ({
    id: `st_g_${Date.now()}_${idx}`,
    studentNumber: String(300 + idx + 1),
    fullName: s.name,
    gender: s.gender,
  }));

  students.forEach((st, idx) => {
    if (idx < seats.length) {
      seats[idx].studentId = st.id;
      st.seatCode = seats[idx].code;
    }
  });

  const today = new Date().toISOString().split('T')[0];
  const classId = `class_g_${Date.now()}`;

  return {
    id: classId,
    teacherId: teacher.id,
    name: '9-A',
    grade: '9. Sınıf',
    branchName: `${teacher.name} Danışmanlığında 9-A Sınıfı`,
    academicYear: '2026-2027',
    maxCapacity: 24,
    layoutType: '3-block-standard',
    students,
    seats,
    observations: [
      {
        id: `obs_g_1`,
        classId,
        studentId: students[0].id,
        studentName: students[0].fullName,
        date: today,
        category: 'katilim',
        content: 'Ders başlangıcında oturma düzenine hızlı uyum sağladı ve tahta uygulamalarına aktif katıldı.',
        teacherId: teacher.id,
        teacherName: teacher.name,
        createdAt: new Date().toISOString(),
      },
    ],
    classNotes: [
      {
        id: `cn_g_1`,
        classId,
        date: today,
        content: 'Firebase Cloud Firestore veritabanı ile sınıf oturma planı ve öğrenci takibi başlatıldı.',
        teacherId: teacher.id,
        teacherName: teacher.name,
        createdAt: new Date().toISOString(),
      },
    ],
    syncStatus: 'synced',
    createdAt: new Date().toISOString(),
  };
}

