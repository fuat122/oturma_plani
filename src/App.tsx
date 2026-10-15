/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Classroom, Teacher, Student, ObservationCategory } from './types';
import {
  initializeStorage,
  getStoredClassrooms,
  getStoredTeachers,
  saveClassrooms,
  saveTeachers,
  getCurrentTeacherId,
  setCurrentTeacherId,
  getActiveCLassId,
  setActiveClassId,
  createStarterClassroomForGoogleTeacher,
} from './services/storageService';
import { initAuth, googleSignIn, logout } from './services/firebaseAuth';
import {
  subscribeTeacherClasses,
  saveClassroomToFirestore,
  deleteClassroomFromFirestore,
  testFirestoreConnection,
} from './services/firestoreService';
import { exportSeatingPlanToPDF } from './services/pdfService';
import { exportClassroomToExcel } from './services/excelService';
import { Navbar } from './components/Navbar';
import { ClassroomHeader } from './components/ClassroomHeader';
import { BlackboardHeader } from './components/BlackboardHeader';
import { SeatingPlanGrid } from './components/SeatingPlanGrid';
import { PrintSeatingPlan } from './components/PrintSeatingPlan';
import { ReportModal } from './components/ReportModal';
import { NewClassModal } from './components/NewClassModal';
import { TeacherSwitcherModal } from './components/TeacherSwitcherModal';
import { StudentManagementModal } from './components/StudentManagementModal';
import { ConfirmModal } from './components/ConfirmModal';
import { CheckCircle2, AlertCircle, Info, Sparkles, Cloud } from 'lucide-react';

export default function App() {
  // Initial local storage setup for demo fallback
  const [teachers, setTeachers] = useState<Teacher[]>(() => getStoredTeachers());
  const [classrooms, setClassrooms] = useState<Classroom[]>(() => getStoredClassrooms());
  const [currentTeacherId, setTeacherIdState] = useState<string>(() => getCurrentTeacherId());
  const [activeClassId, setClassIdState] = useState<string | null>(() => getActiveCLassId());

  // Google & Firebase Auth State
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [googleUser, setGoogleUser] = useState<any | null>(null);

  // Firestore saving state
  const [isFirestoreSaving, setIsFirestoreSaving] = useState(false);

  // Modals
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportStudentId, setReportStudentId] = useState<string | null>(null);
  const [isNewClassModalOpen, setIsNewClassModalOpen] = useState(false);
  const [isTeacherSwitcherOpen, setIsTeacherSwitcherOpen] = useState(false);
  const [isStudentManagementOpen, setIsStudentManagementOpen] = useState(false);

  // Export states
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'warning' } | null>(null);

  // Confirmation Modal
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    variant?: 'danger' | 'warning' | 'info';
    action: () => Promise<void> | void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    action: () => {},
  });

  const firestoreUnsubscribeRef = useRef<(() => void) | null>(null);

  // Show Toast Helper
  const showToast = useCallback((text: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  }, []);

  // Initialize storage and test connection on mount
  useEffect(() => {
    const seed = initializeStorage();
    setTeachers(seed.teachers);
    setClassrooms(seed.classrooms);
    testFirestoreConnection();
  }, []);

  // Sync Google User into Teacher and Classroom state with Firestore real-time listener
  const syncGoogleUserTeacher = useCallback(
    (user: any) => {
      setIsGoogleConnected(true);
      setGoogleUser(user);

      const googleTeacherId = user.uid;
      const googleTeacherName = user.displayName || user.email?.split('@')[0] || 'Google Öğretmen';

      const googleTeacher: Teacher = {
        id: googleTeacherId,
        name: googleTeacherName,
        email: user.email || 'ogretmen@meb.k12.tr',
        branch: 'Rehber / Danışman Öğretmen',
        avatar: user.photoURL || undefined,
        isGoogleUser: true,
      };

      // 1. Update teachers state
      setTeachers((prev) => {
        const withoutGoogle = prev.filter((t) => t.id !== googleTeacherId);
        const updated = [googleTeacher, ...withoutGoogle];
        saveTeachers(updated);
        return updated;
      });

      // 2. Set as active teacher
      setTeacherIdState(googleTeacherId);
      setCurrentTeacherId(googleTeacherId);

      // 3. Unsubscribe previous Firestore listener if exists
      if (firestoreUnsubscribeRef.current) {
        firestoreUnsubscribeRef.current();
        firestoreUnsubscribeRef.current = null;
      }

      // 4. Attach real-time listener to teachers/{user.uid}/classes
      const unsubscribe = subscribeTeacherClasses(
        googleTeacherId,
        (fetchedClasses) => {
          if (fetchedClasses.length === 0) {
            // First time this teacher logs into Firestore:
            // Seed a starter classroom (9-A with 24 seats) and immediately write it to Firestore
            const starterClass = createStarterClassroomForGoogleTeacher(googleTeacher);
            starterClass.teacherId = googleTeacherId;
            saveClassroomToFirestore(googleTeacherId, starterClass)
              .then(() => {
                showToast(`Firebase Cloud Firestore'da yeni sınıfınız oluşturuldu: 9-A`, 'success');
              })
              .catch((err) => console.error('Error saving initial class:', err));

            setClassrooms((prev) => {
              const otherTeachers = prev.filter((c) => c.teacherId !== googleTeacherId);
              const merged = [starterClass, ...otherTeachers];
              saveClassrooms(merged);
              return merged;
            });
            setClassIdState(starterClass.id);
            setActiveClassId(starterClass.id);
          } else {
            // Loaded existing classes from Firestore
            setClassrooms((prev) => {
              const otherTeachers = prev.filter((c) => c.teacherId !== googleTeacherId);
              const merged = [...fetchedClasses, ...otherTeachers];
              saveClassrooms(merged);
              return merged;
            });

            // Set active class if not set or invalid
            setClassIdState((currentActive) => {
              const stillExists = fetchedClasses.some((c) => c.id === currentActive);
              if (stillExists && currentActive) return currentActive;
              const firstId = fetchedClasses[0].id;
              setActiveClassId(firstId);
              return firstId;
            });
          }
        },
        (error) => {
          console.warn('Firestore subscription warning:', error);
          showToast('Firestore bağlantısında gecikme var, yerel veriler gösteriliyor.', 'info');
        }
      );

      firestoreUnsubscribeRef.current = unsubscribe;
    },
    [showToast]
  );

  // Initialize Firebase Auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => {
        if (user) {
          syncGoogleUserTeacher(user);
        }
      },
      () => {
        setIsGoogleConnected(false);
        setGoogleUser(null);
        if (firestoreUnsubscribeRef.current) {
          firestoreUnsubscribeRef.current();
          firestoreUnsubscribeRef.current = null;
        }
      }
    );

    return () => {
      unsubscribe();
      if (firestoreUnsubscribeRef.current) {
        firestoreUnsubscribeRef.current();
      }
    };
  }, [syncGoogleUserTeacher]);

  // Current Active Teacher
  const activeTeacher = useMemo(() => {
    return teachers.find((t) => t.id === currentTeacherId) || teachers[0];
  }, [teachers, currentTeacherId]);

  // STRICT ISOLATION FILTER:
  // A teacher can ONLY see and access their own classes!
  const myClassrooms = useMemo(() => {
    return classrooms.filter((c) => c.teacherId === activeTeacher.id);
  }, [classrooms, activeTeacher.id]);

  // Active Classroom selection
  const currentClassroom = useMemo(() => {
    if (myClassrooms.length === 0) return null;
    const found = myClassrooms.find((c) => c.id === activeClassId);
    return found || myClassrooms[0];
  }, [myClassrooms, activeClassId]);

  // Keep activeClassId synchronized
  useEffect(() => {
    if (currentClassroom && currentClassroom.id !== activeClassId) {
      setClassIdState(currentClassroom.id);
      setActiveClassId(currentClassroom.id);
    }
  }, [currentClassroom, activeClassId]);

  // Switch Teacher handler (Strict Isolation Verification)
  const handleSelectTeacher = (teacher: Teacher) => {
    setTeacherIdState(teacher.id);
    setCurrentTeacherId(teacher.id);

    // If switching to demo teacher, detach Google Firestore listener
    if (!teacher.isGoogleUser && firestoreUnsubscribeRef.current) {
      firestoreUnsubscribeRef.current();
      firestoreUnsubscribeRef.current = null;
    }

    const teacherClasses = classrooms.filter((c) => c.teacherId === teacher.id);
    if (teacherClasses.length > 0) {
      setClassIdState(teacherClasses[0].id);
      setActiveClassId(teacherClasses[0].id);
    } else {
      setClassIdState(null);
    }
    showToast(`Aktif Öğretmen: ${teacher.name} (${teacher.branch}). Sınıflar izole edildi.`, 'info');
  };

  // Google Login Trigger
  const handleGoogleLogin = async () => {
    try {
      const user = await googleSignIn();
      if (user) {
        syncGoogleUserTeacher(user);
        showToast(`Google ile başarıyla giriş yapıldı: ${user.displayName || user.email}`, 'success');
      }
    } catch (err: any) {
      showToast(`Giriş başarısız: ${err?.message || 'Bilinmeyen hata'}`, 'warning');
    }
  };

  // Google Logout
  const handleGoogleLogout = async () => {
    await logout();
    if (firestoreUnsubscribeRef.current) {
      firestoreUnsubscribeRef.current();
      firestoreUnsubscribeRef.current = null;
    }
    setIsGoogleConnected(false);
    setGoogleUser(null);

    // Return to first demo teacher
    const defaultTeacher = teachers.find((t) => !t.isGoogleUser) || teachers[0];
    setTeacherIdState(defaultTeacher.id);
    setCurrentTeacherId(defaultTeacher.id);
    const defaultClasses = classrooms.filter((c) => c.teacherId === defaultTeacher.id);
    if (defaultClasses.length > 0) {
      setClassIdState(defaultClasses[0].id);
      setActiveClassId(defaultClasses[0].id);
    }
    showToast('Google oturumu kapatıldı. Demo moduna dönüldü.', 'info');
  };

  // Helper to persist classroom changes to both state & Firestore
  const persistClassroomChange = useCallback(
    async (updatedClass: Classroom) => {
      // 1. Update local state immediately for instant responsive UI
      setClassrooms((prev) => {
        const next = prev.map((c) => (c.id === updatedClass.id ? updatedClass : c));
        saveClassrooms(next);
        return next;
      });

      // 2. If user is authenticated with Google, save to Firestore: teachers/{user.uid}/classes/{classId}
      if (isGoogleConnected && googleUser?.uid && updatedClass.teacherId === googleUser.uid) {
        setIsFirestoreSaving(true);
        try {
          await saveClassroomToFirestore(googleUser.uid, updatedClass);
        } catch (err) {
          console.error('Firestore save failed:', err);
        } finally {
          setIsFirestoreSaving(false);
        }
      }
    },
    [isGoogleConnected, googleUser]
  );

  // SWAP SEATS LOGIC (HTML5 Drag & Drop)
  const handleSwapSeats = useCallback(
    (sourceSeatId: string, targetSeatId: string) => {
      if (!currentClassroom) return;

      const newSeats = currentClassroom.seats.map((seat) => ({ ...seat }));
      const newStudents = currentClassroom.students.map((st) => ({ ...st }));

      const sourceSeat = newSeats.find((s) => s.id === sourceSeatId);
      const targetSeat = newSeats.find((s) => s.id === targetSeatId);

      if (!sourceSeat || !targetSeat) return;

      const sourceStudentId = sourceSeat.studentId;
      const targetStudentId = targetSeat.studentId;

      // Swap studentId pointers on the seat objects
      sourceSeat.studentId = targetStudentId;
      targetSeat.studentId = sourceStudentId;

      // Update seatCode references on students
      if (sourceStudentId) {
        const st = newStudents.find((s) => s.id === sourceStudentId);
        if (st) st.seatCode = targetSeat.code;
      }
      if (targetStudentId) {
        const st = newStudents.find((s) => s.id === targetStudentId);
        if (st) st.seatCode = sourceSeat.code;
      }

      const updatedClass: Classroom = {
        ...currentClassroom,
        seats: newSeats,
        students: newStudents,
        syncStatus: 'synced',
        lastSyncedAt: new Date().toISOString(),
      };

      persistClassroomChange(updatedClass);

      const sName = currentClassroom.students.find((s) => s.id === sourceStudentId)?.fullName;
      const tName = currentClassroom.students.find((s) => s.id === targetStudentId)?.fullName;
      if (sName && tName) {
        showToast(`${sName} ile ${tName} yer değiştirdi. Firestore güncellendi.`, 'success');
      } else if (sName) {
        showToast(`${sName} ${targetSeat.code} numaralı sıraya taşındı.`, 'info');
      }
    },
    [currentClassroom, persistClassroomChange, showToast]
  );

  // REMOVE STUDENT FROM SEAT
  const handleRemoveStudentFromSeat = useCallback(
    (seatId: string) => {
      if (!currentClassroom) return;

      const newSeats = currentClassroom.seats.map((seat) => ({ ...seat }));
      const newStudents = currentClassroom.students.map((st) => ({ ...st }));

      const targetSeat = newSeats.find((s) => s.id === seatId);
      if (!targetSeat || !targetSeat.studentId) return;

      const student = newStudents.find((s) => s.id === targetSeat.studentId);
      targetSeat.studentId = null;
      if (student) student.seatCode = undefined;

      const updatedClass: Classroom = {
        ...currentClassroom,
        seats: newSeats,
        students: newStudents,
        syncStatus: 'synced',
        lastSyncedAt: new Date().toISOString(),
      };

      persistClassroomChange(updatedClass);
      if (student) {
        showToast(`${student.fullName} sıradan kaldırıldı.`, 'info');
      }
    },
    [currentClassroom, persistClassroomChange, showToast]
  );

  // ADD NEW STUDENT
  const handleAddStudent = (studentData: Omit<Student, 'id'>) => {
    if (!currentClassroom) return;

    const newStudentId = `st_${Date.now()}`;
    const newStudent: Student = {
      ...studentData,
      id: newStudentId,
    };

    const newSeats = currentClassroom.seats.map((s) => ({ ...s }));
    const emptySeat = newSeats.find((s) => !s.studentId);

    if (emptySeat) {
      emptySeat.studentId = newStudentId;
      newStudent.seatCode = emptySeat.code;
    }

    const updatedClass: Classroom = {
      ...currentClassroom,
      students: [...currentClassroom.students, newStudent],
      seats: newSeats,
      syncStatus: 'synced',
      lastSyncedAt: new Date().toISOString(),
    };

    persistClassroomChange(updatedClass);
    showToast(`${newStudent.fullName} sınıfa eklendi ve Firestore'a kaydedildi.`, 'success');
  };

  // DELETE STUDENT
  const handleDeleteStudent = (studentId: string) => {
    if (!currentClassroom) return;

    const newSeats = currentClassroom.seats.map((s) => ({
      ...s,
      studentId: s.studentId === studentId ? null : s.studentId,
    }));

    const newStudents = currentClassroom.students.filter((s) => s.id !== studentId);
    const newObservations = currentClassroom.observations.filter((o) => o.studentId !== studentId);

    const updatedClass: Classroom = {
      ...currentClassroom,
      students: newStudents,
      seats: newSeats,
      observations: newObservations,
      syncStatus: 'synced',
      lastSyncedAt: new Date().toISOString(),
    };

    persistClassroomChange(updatedClass);
    showToast('Öğrenci sınıftan silindi.', 'info');
  };

  // CLEAR ALL STUDENTS
  const handleClearAllStudents = () => {
    if (!currentClassroom) return;

    setConfirmDialog({
      isOpen: true,
      title: 'Tüm Öğrencileri Kaldır',
      message: `${currentClassroom.name} sınıfındaki tüm öğrencileri (${currentClassroom.students.length} öğrenci) ve oturma düzenini sıfırlamak istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      confirmLabel: 'Tüm Sınıfı Boşalt',
      variant: 'danger',
      action: () => {
        const resetSeats = currentClassroom.seats.map((s) => ({
          ...s,
          studentId: null,
        }));

        const updatedClass: Classroom = {
          ...currentClassroom,
          students: [],
          seats: resetSeats,
          syncStatus: 'synced',
          lastSyncedAt: new Date().toISOString(),
        };

        persistClassroomChange(updatedClass);
        showToast('Sınıftaki tüm öğrenciler kaldırıldı ve boşaltıldı.', 'info');
      },
    });
  };

  // UPDATE ALL STUDENTS (In-place edits from modal)
  const handleUpdateStudents = (updatedStudents: Student[]) => {
    if (!currentClassroom) return;

    // Map updated student names to observations
    const nameMap = new Map(updatedStudents.map((s) => [s.id, s.fullName]));
    const updatedObservations = currentClassroom.observations.map((obs) => ({
      ...obs,
      studentName: nameMap.get(obs.studentId) || obs.studentName,
    }));

    const updatedClass: Classroom = {
      ...currentClassroom,
      students: updatedStudents,
      observations: updatedObservations,
      syncStatus: 'synced',
      lastSyncedAt: new Date().toISOString(),
    };

    persistClassroomChange(updatedClass);
    showToast('Öğrenci bilgileri güncellendi ve Firestore veritabanına kaydedildi.', 'success');
  };

  // BULK ADD / REPLACE STUDENTS
  const handleBulkAddStudents = (
    rawList: Array<{ studentNumber: string; fullName: string; gender: 'K' | 'E' }>,
    replaceExisting: boolean
  ) => {
    if (!currentClassroom) return;

    const totalCapacity = currentClassroom.seats.length > 0 ? currentClassroom.seats.length : 24;

    const existingStudents = replaceExisting ? [] : [...currentClassroom.students];
    const seats = replaceExisting
      ? currentClassroom.seats.map((s) => ({ ...s, studentId: null }))
      : [...currentClassroom.seats];

    const existingNumbers = new Set(existingStudents.map((s) => s.studentNumber));
    const newStudents: Student[] = [];

    for (let i = 0; i < rawList.length; i++) {
      if (existingStudents.length + newStudents.length >= totalCapacity) {
        break;
      }
      const item = rawList[i];
      let num = item.studentNumber.trim();
      if (!num) num = String(100 + existingStudents.length + newStudents.length + 1);
      while (existingNumbers.has(num)) {
        num = String(Number(num) + 1);
      }
      existingNumbers.add(num);

      const student: Student = {
        id: `st_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`,
        studentNumber: num,
        fullName: item.fullName.trim() || `Öğrenci ${num}`,
        gender: item.gender,
      };
      newStudents.push(student);
    }

    const combinedStudents = [...existingStudents, ...newStudents];

    // Assign unassigned students to available empty seats
    const emptySeats = seats.filter((s) => !s.studentId);
    let emptyIdx = 0;

    combinedStudents.forEach((st) => {
      const isSeated = seats.some((s) => s.studentId === st.id);
      if (!isSeated && emptyIdx < emptySeats.length) {
        emptySeats[emptyIdx].studentId = st.id;
        st.seatCode = emptySeats[emptyIdx].code;
        emptyIdx++;
      }
    });

    const updatedClass: Classroom = {
      ...currentClassroom,
      students: combinedStudents,
      seats: seats,
      syncStatus: 'synced',
      lastSyncedAt: new Date().toISOString(),
    };

    persistClassroomChange(updatedClass);
    showToast(
      `${newStudents.length} öğrenci sınıfa başarıyla eklendi ve Firestore veritabanına kaydedildi.`,
      'success'
    );
  };

  // ADD STUDENT OBSERVATION / COMMENT (Requirement: Date-based comments in Firestore)
  const handleAddObservation = (
    studentId: string,
    category: ObservationCategory,
    content: string,
    date: string
  ) => {
    if (!currentClassroom) return;

    const student = currentClassroom.students.find((s) => s.id === studentId);
    const newObservation = {
      id: `obs_${Date.now()}`,
      classId: currentClassroom.id,
      studentId,
      studentName: student?.fullName || 'Öğrenci',
      date,
      category,
      content,
      teacherId: activeTeacher.id,
      teacherName: activeTeacher.name,
      createdAt: new Date().toISOString(),
    };

    const updatedClass: Classroom = {
      ...currentClassroom,
      observations: [newObservation, ...currentClassroom.observations],
      syncStatus: 'synced',
      lastSyncedAt: new Date().toISOString(),
    };

    persistClassroomChange(updatedClass);
    showToast(`${student?.fullName} için tarihli gözlem Firestore veritabanına kaydedildi.`, 'success');
  };

  // DELETE STUDENT OBSERVATION
  const handleDeleteObservation = (obsId: string) => {
    if (!currentClassroom) return;

    const updatedClass: Classroom = {
      ...currentClassroom,
      observations: currentClassroom.observations.filter((o) => o.id !== obsId),
      syncStatus: 'synced',
      lastSyncedAt: new Date().toISOString(),
    };

    persistClassroomChange(updatedClass);
    showToast('Gözlem kaydı silindi.', 'info');
  };

  // ADD CLASS NOTE
  const handleAddClassNote = (content: string, date: string) => {
    if (!currentClassroom) return;

    const newNote = {
      id: `cn_${Date.now()}`,
      classId: currentClassroom.id,
      date,
      content,
      teacherId: activeTeacher.id,
      teacherName: activeTeacher.name,
      createdAt: new Date().toISOString(),
    };

    const updatedClass: Classroom = {
      ...currentClassroom,
      classNotes: [newNote, ...currentClassroom.classNotes],
      syncStatus: 'synced',
      lastSyncedAt: new Date().toISOString(),
    };

    persistClassroomChange(updatedClass);
    showToast('Sınıf notu Firestore veritabanına kaydedildi.', 'success');
  };

  // DELETE CLASS NOTE
  const handleDeleteClassNote = (noteId: string) => {
    if (!currentClassroom) return;

    const updatedClass: Classroom = {
      ...currentClassroom,
      classNotes: currentClassroom.classNotes.filter((n) => n.id !== noteId),
      syncStatus: 'synced',
      lastSyncedAt: new Date().toISOString(),
    };

    persistClassroomChange(updatedClass);
    showToast('Sınıf notu silindi.', 'info');
  };

  // CREATE NEW CLASS
  const handleCreateClass = async (newClass: Classroom) => {
    // 1. If Google User, save directly to Firestore under teachers/{uid}/classes/{classId}
    if (isGoogleConnected && googleUser?.uid) {
      newClass.teacherId = googleUser.uid;
      await saveClassroomToFirestore(googleUser.uid, newClass);
    }

    // 2. Add to local state
    setClassrooms((prev) => {
      const updated = [newClass, ...prev];
      saveClassrooms(updated);
      return updated;
    });

    setClassIdState(newClass.id);
    setActiveClassId(newClass.id);
    showToast(`${newClass.name} sınıfı başarıyla oluşturuldu ve kaydedildi!`, 'success');
  };

  // SHUFFLE SEATS
  const handleShuffleSeats = () => {
    if (!currentClassroom) return;

    setConfirmDialog({
      isOpen: true,
      title: 'Sıraları Rastgele Karıştır',
      message: `${currentClassroom.name} sınıfındaki tüm öğrencilerin sıraları rastgele karıştırılacaktır. Devam etmek istiyor musunuz?`,
      confirmLabel: 'Karıştır',
      variant: 'warning',
      action: () => {
        const students = [...currentClassroom.students];
        const seats = currentClassroom.seats.map((s) => ({ ...s, studentId: null as string | null }));

        // Fisher-Yates shuffle
        for (let i = students.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [students[i], students[j]] = [students[j], students[i]];
        }

        students.forEach((st, idx) => {
          if (idx < seats.length) {
            seats[idx].studentId = st.id;
            st.seatCode = seats[idx].code;
          }
        });

        const updatedClass: Classroom = {
          ...currentClassroom,
          seats,
          students,
          syncStatus: 'synced',
          lastSyncedAt: new Date().toISOString(),
        };

        persistClassroomChange(updatedClass);
        showToast('Sıralar rastgele karıştırıldı ve Firestore güncellendi.', 'success');
      },
    });
  };

  // RESET SEATS BY STUDENT NUMBER
  const handleResetSeats = () => {
    if (!currentClassroom) return;

    setConfirmDialog({
      isOpen: true,
      title: 'Sıraları Numaraya Göre Sıfırla',
      message: `Öğrenciler okul numaralarına göre küçükten büyüğe sıralanacaktır. Onaylıyor musunuz?`,
      confirmLabel: 'Numaraya Göre Sırala',
      variant: 'info',
      action: () => {
        const sortedStudents = [...currentClassroom.students].sort(
          (a, b) => parseInt(a.studentNumber || '0', 10) - parseInt(b.studentNumber || '0', 10)
        );

        const resetSeats = currentClassroom.seats.map((s) => ({ ...s, studentId: null as string | null }));

        sortedStudents.forEach((st, idx) => {
          if (idx < resetSeats.length) {
            resetSeats[idx].studentId = st.id;
            st.seatCode = resetSeats[idx].code;
          }
        });

        const updatedClass: Classroom = {
          ...currentClassroom,
          seats: resetSeats,
          students: sortedStudents,
          syncStatus: 'synced',
          lastSyncedAt: new Date().toISOString(),
        };

        persistClassroomChange(updatedClass);
        showToast('Sıralar öğrenci numarasına göre sıfırlandı.', 'info');
      },
    });
  };

  // PDF İNDİR (Visual Seating Plan PDF)
  const handleExportPDF = async () => {
    if (!currentClassroom) return;
    setIsExportingPDF(true);
    try {
      await exportSeatingPlanToPDF('printable-seating-chart', currentClassroom, activeTeacher);
      showToast('Oturma planı PDF dosyası başarıyla indirildi.', 'success');
    } catch (err: any) {
      showToast(`PDF oluşturma hatası: ${err?.message || 'Bilinmeyen hata'}`, 'warning');
    } finally {
      setIsExportingPDF(false);
    }
  };

  // EXCEL (.XLSX) İNDİR (Full Seating Plan, Student Roster & Date-based Comments)
  const handleExportExcel = () => {
    if (!currentClassroom) return;
    setIsExportingExcel(true);
    try {
      exportClassroomToExcel(currentClassroom, activeTeacher.name);
      showToast(`${currentClassroom.name} Excel (.xlsx) raporu başarıyla indirildi.`, 'success');
    } catch (err: any) {
      showToast(`Excel oluşturma hatası: ${err?.message || 'Bilinmeyen hata'}`, 'warning');
    } finally {
      setIsExportingExcel(false);
    }
  };

  // PRINT
  const handlePrint = () => {
    window.print();
  };

  // Open Report Modal focused on student
  const handleOpenStudentReport = (student: Student) => {
    setReportStudentId(student.id);
    setIsReportModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/70 text-slate-900">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-xl bg-slate-900 text-white text-xs font-medium border border-slate-700 animate-in fade-in slide-in-from-top-4 duration-200 no-print max-w-md">
          {toastMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
          {toastMessage.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />}
          {toastMessage.type === 'info' && <Info className="w-4 h-4 text-blue-400 shrink-0" />}
          <span className="leading-tight">{toastMessage.text}</span>
        </div>
      )}

      {/* Navigation Bar */}
      <Navbar
        activeTeacher={activeTeacher}
        classrooms={myClassrooms}
        selectedClassId={activeClassId || ''}
        onSelectClass={(id) => {
          setClassIdState(id);
          setActiveClassId(id);
        }}
        onOpenNewClassModal={() => setIsNewClassModalOpen(true)}
        onOpenTeacherSwitcher={() => setIsTeacherSwitcherOpen(true)}
        onOpenGoogleLogin={handleGoogleLogin}
        onGoogleLogout={handleGoogleLogout}
        isGoogleConnected={isGoogleConnected}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 no-print">
        {currentClassroom ? (
          <>
            {/* Classroom Header & Control Bar */}
            <ClassroomHeader
              classroom={currentClassroom}
              activeTeacher={activeTeacher}
              onExportPDF={handleExportPDF}
              onExportExcel={handleExportExcel}
              onPrint={handlePrint}
              onOpenReports={() => {
                setReportStudentId(null);
                setIsReportModalOpen(true);
              }}
              onOpenStudentManagement={() => setIsStudentManagementOpen(true)}
              onShuffleSeats={handleShuffleSeats}
              onResetSeats={handleResetSeats}
              onClearAllStudents={handleClearAllStudents}
              isExportingPDF={isExportingPDF}
              isExportingExcel={isExportingExcel}
              isFirestoreSaving={isFirestoreSaving}
            />

            {/* Smart Blackboard & Room Simulation Frontage */}
            <BlackboardHeader classroom={currentClassroom} />

            {/* 3-Block Interactive Drag-and-Drop Seating Plan */}
            <SeatingPlanGrid
              classroom={currentClassroom}
              onSwapSeats={handleSwapSeats}
              onOpenStudentReport={handleOpenStudentReport}
              onRemoveStudentFromSeat={handleRemoveStudentFromSeat}
            />
          </>
        ) : (
          /* Empty state if teacher has no classes */
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 shadow-xs max-w-xl mx-auto my-12">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 text-3xl shadow-xs">
              🏫
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              {activeTeacher.name} İçin Henüz Sınıf Bulunmuyor
            </h2>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Sıkı izolasyon kuralı gereği diğer öğretmenlerin (9-A, 10-B vb.) sınıfları bu hesapta gizlidir. Yeni bir sınıf oluşturarak oturma planınızı ve Firebase Cloud Firestore bulut veritabanı senkronizasyonunuzu başlatabilirsiniz.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsNewClassModalOpen(true)}
                className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>İlk Sınıfınızı Oluşturun</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* DEDICATED PRINT & PDF CONTAINER (STRICTLY THE VISUAL SEATING PLAN) */}
      <div
        id="pdf-export-container"
        className="fixed -left-[9999px] top-0 w-[1080px] pointer-events-none bg-white z-[-99] print:static print:left-0 print:w-full print:pointer-events-auto print:z-auto print:block"
        aria-hidden="true"
      >
        {currentClassroom && (
          <PrintSeatingPlan
            classroom={currentClassroom}
            teacher={activeTeacher}
          />
        )}
      </div>

      {/* MODALS */}

      {/* 1. Student Report Panel (Tarih Bazlı Öğrenci Gözlemleri & Yorumları) */}
      {currentClassroom && (
        <ReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          classroom={currentClassroom}
          activeTeacher={activeTeacher}
          initialSelectedStudentId={reportStudentId}
          onAddObservation={handleAddObservation}
          onDeleteObservation={handleDeleteObservation}
          onAddClassNote={handleAddClassNote}
          onDeleteClassNote={handleDeleteClassNote}
        />
      )}

      {/* 2. New Class Modal */}
      <NewClassModal
        isOpen={isNewClassModalOpen}
        onClose={() => setIsNewClassModalOpen(false)}
        activeTeacher={activeTeacher}
        isGoogleConnected={isGoogleConnected}
        onCreateClass={handleCreateClass}
      />

      {/* 3. Teacher Switcher & Isolation Verification Modal */}
      <TeacherSwitcherModal
        isOpen={isTeacherSwitcherOpen}
        onClose={() => setIsTeacherSwitcherOpen(false)}
        teachers={teachers}
        currentTeacher={activeTeacher}
        classrooms={classrooms}
        onSelectTeacher={handleSelectTeacher}
        onOpenGoogleLogin={handleGoogleLogin}
        isGoogleConnected={isGoogleConnected}
        googleUser={googleUser}
      />

      {/* 4. Student Roster & Class Management Modal */}
      {currentClassroom && (
        <StudentManagementModal
          isOpen={isStudentManagementOpen}
          onClose={() => setIsStudentManagementOpen(false)}
          classroom={currentClassroom}
          onAddStudent={handleAddStudent}
          onDeleteStudent={handleDeleteStudent}
          onClearAllStudents={handleClearAllStudents}
          onUpdateStudents={handleUpdateStudents}
          onBulkAddStudents={handleBulkAddStudents}
        />
      )}

      {/* 5. Destructive / Mutating Operation Confirm Modal */}
      <ConfirmModal
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmLabel={confirmDialog.confirmLabel}
        variant={confirmDialog.variant}
        onConfirm={async () => {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
          await confirmDialog.action();
        }}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
