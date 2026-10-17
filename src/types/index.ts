export type GradeLevel = 'Hazırlık' | '9. Sınıf' | '10. Sınıf' | '11. Sınıf' | '12. Sınıf';

export type ObservationCategory = 'katilim' | 'davranis' | 'arkadas' | 'odev' | 'genel';

export interface Teacher {
  id: string;
  name: string;
  email: string;
  branch: string;
  avatar?: string;
  isGoogleUser?: boolean;
}

export interface Student {
  id: string;
  studentNumber: string;
  fullName: string;
  gender: 'K' | 'E';
  notes?: string;
  seatCode?: string; // e.g. "D-11", "O-21", "C-32"
}

export interface SeatSlot {
  id: string;
  block: 'duvar' | 'orta' | 'cam' | string;
  blockName: string;
  row: number; // 1 to 4
  col: number; // 1 to 2
  code: string; // e.g., "A-11", "D-1", etc.
  studentId: string | null;
}

export interface StudentObservation {
  id: string;
  classId: string;
  studentId: string;
  studentName: string;
  date: string; // YYYY-MM-DD
  category: ObservationCategory;
  content: string;
  teacherId: string;
  teacherName: string;
  createdAt: string;
}

export interface ClassNote {
  id: string;
  classId: string;
  date: string; // YYYY-MM-DD
  content: string;
  teacherId: string;
  teacherName: string;
  createdAt: string;
}

export interface Classroom {
  id: string;
  teacherId: string;
  teacherName?: string;
  name: string; // e.g., "9-A"
  grade: GradeLevel;
  branchName?: string;
  academicYear: string;
  maxCapacity: number;
  layoutType: '3-block-standard' | '3-block-extended' | '4-block';
  students: Student[];
  seats: SeatSlot[];
  observations: StudentObservation[];
  classNotes: ClassNote[];
  lastSyncedAt?: string;
  syncStatus?: 'synced' | 'saving' | 'offline' | 'error';
  createdAt: string;
  isReadOnly?: boolean;
}
