/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
} from './services/storageService';
import { initAuth, googleSignIn, logout, getAccessToken } from './services/firebaseAuth';
import {
  createGoogleSpreadsheet,
  syncClassroomToGoogleSheet,
} from './services/googleSheetsService';
import { exportSeatingPlanToPDF } from './services/pdfService';
import { Navbar } from './components/Navbar';
import { ClassroomHeader } from './components/ClassroomHeader';
import { BlackboardHeader } from './components/BlackboardHeader';
import { SeatingPlanGrid } from './components/SeatingPlanGrid';
import { PrintSeatingPlan } from './components/PrintSeatingPlan';
import { ReportModal } from './components/ReportModal';
import { GoogleSheetsPreviewModal } from './components/GoogleSheetsPreviewModal';
import { NewClassModal } from './components/NewClassModal';
import { TeacherSwitcherModal } from './components/TeacherSwitcherModal';
import { StudentManagementModal } from './components/StudentManagementModal';
import { ConfirmModal } from './components/ConfirmModal';
import { CheckCircle2, AlertCircle, Info, ShieldAlert, Sparkles, Layers } from 'lucide-react';

export default function App() {
  // Initial storage setup
  const [teachers, setTeachers] = useState<Teacher[]>(() => getStoredTeachers());
  const [classrooms, setClassrooms] = useState<Classroom[]>(() => getStoredClassrooms());
  const [currentTeacherId, setTeacherIdState] = useState<string>(() => getCurrentTeacherId());
  const [activeClassId, setClassIdState] = useState<string | null>(() => getActiveCLassId());

  // Google OAuth & Auth State
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [googleUser, setGoogleUser] = useState<any | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);

  // Modals
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportStudentId, setReportStudentId] = useState<string | null>(null);
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState(false);
  const [isNewClassModalOpen, setIsNewClassModalOpen] = useState(false);
  const [isTeacherSwitcherOpen, setIsTeacherSwitcherOpen] = useState(false);
  const [isStudentManagementOpen, setIsStudentManagementOpen] = useState(false);

  // Action states
  const [isSyncingSheets, setIsSyncingSheets] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
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

  // Show Toast Helper
  const showToast = useCallback((text: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  }, []);

  // Initialize data on mount
  useEffect(() => {
    const seed = initializeStorage();
    setTeachers(seed.teachers);
    setClassrooms(seed.classrooms);
  }, []);

  // Initialize Firebase Auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setIsGoogleConnected(true);
        setGoogleUser(user);
        setGoogleToken(token);

        // Check if teacher persona for this Google user already exists
        const googleTeacherId = `google_${user.uid}`;
        setTeachers((prev) => {
          const exists = prev.find((t) => t.id === googleTeacherId);
          if (!exists) {
            const newTeacher: Teacher = {
              id: googleTeacherId,
              name: user.displayName || 'Google Öğretmen',
              email: user.email || 'ogretmen@meb.k12.tr',
              branch: 'Branş Öğretmeni',
              avatar: user.photoURL || undefined,
              isGoogleUser: true,
            };
            const updated = [newTeacher, ...prev];
            saveTeachers(updated);
            return updated;
          }
          return prev;
        });
      },
      () => {
        setIsGoogleConnected(false);
        setGoogleUser(null);
        setGoogleToken(null);
      }
    );

    return () => unsubscribe();
  }, []);

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
    const teacherClasses = classrooms.filter((c) => c.teacherId === teacher.id);
    if (teacherClasses.length > 0) {
      setClassIdState(teacherClasses[0].id);
      setActiveClassId(teacherClasses[0].id);
    } else {
      setClassIdState(null);
    }
    showToast(`Aktif Öğretmen: ${teacher.name} (${teacher.branch}). Sınıflar başarıyla izole edildi.`, 'info');
  };

  // Google Login Trigger
  const handleGoogleLogin = async () => {
    try {
      const res = await googleSignIn();
      if (res) {
        setIsGoogleConnected(true);
        setGoogleUser(res.user);
        setGoogleToken(res.accessToken);
        const googleTeacherId = `google_${res.user.uid}`;
        setTeacherIdState(googleTeacherId);
        setCurrentTeacherId(googleTeacherId);
        showToast(`Google ile giriş yapıldı: ${res.user.displayName || res.user.email}`, 'success');
      }
    } catch (err: any) {
      showToast(`Giriş başarısız: ${err?.message || 'Bilinmeyen hata'}`, 'warning');
    }
  };

  // Google Logout
  const handleGoogleLogout = async () => {
    await logout();
    setIsGoogleConnected(false);
    setGoogleUser(null);
    setGoogleToken(null);
    setTeacherIdState(teachers[0].id);
    setCurrentTeacherId(teachers[0].id);
    showToast('Google oturumu kapatıldı. Demo moduna dönüldü.', 'info');
  };

  // Update Classroom in state & local storage
  const updateClassroomState = useCallback(
    (updatedClass: Classroom) => {
      setClassrooms((prev) => {
        const next = prev.map((c) => (c.id === updatedClass.id ? updatedClass : c));
        saveClassrooms(next);
        return next;
      });
    },
    []
  );

  // SWAP SEATS LOGIC (HTML5 Drag & Drop)
  const handleSwapSeats = useCallback(
    (sourceSeatId: string, targetSeatId: string) => {
      if (!currentClassroom) return;

      const newSeats = [...currentClassroom.seats];
      const sourceSeatIndex = newSeats.findIndex((s) => s.id === sourceSeatId);
      const targetSeatIndex = newSeats.findIndex((s) => s.id === targetSeatId);

      // Handle unassigned dock drop
      if (sourceSeatId === 'unassigned') {
        // Source is from unseated list
        if (targetSeatIndex !== -1) {
          // Handled via assign
          return;
        }
      }

      if (sourceSeatIndex === -1 || targetSeatIndex === -1) return;

      const sourceStudentId = newSeats[sourceSeatIndex].studentId;
      const targetStudentId = newSeats[targetSeatIndex].studentId;

      // Swap student IDs between the two seats
      newSeats[sourceSeatIndex] = {
        ...newSeats[sourceSeatIndex],
        studentId: targetStudentId,
      };
      newSeats[targetSeatIndex] = {
        ...newSeats[targetSeatIndex],
        studentId: sourceStudentId,
      };

      // Update student seatCode references
      const newStudents = currentClassroom.students.map((st) => {
        if (st.id === sourceStudentId) {
          return { ...st, seatCode: newSeats[targetSeatIndex].code };
        }
        if (st.id === targetStudentId) {
          return { ...st, seatCode: newSeats[sourceSeatIndex].code };
        }
        return st;
      });

      const sourceStudent = currentClassroom.students.find((s) => s.id === sourceStudentId);
      const targetStudent = currentClassroom.students.find((s) => s.id === targetStudentId);

      const updatedClass: Classroom = {
        ...currentClassroom,
        seats: newSeats,
        students: newStudents,
        syncStatus: 'pending',
      };

      updateClassroomState(updatedClass);

      const msg = targetStudent
        ? `Sıra Değişikliği: ${sourceStudent?.fullName || 'Öğrenci'} (${newSeats[targetSeatIndex].code}) ↔ ${targetStudent.fullName} (${newSeats[sourceSeatIndex].code}) yer değiştirdi.`
        : `Sıra Değişikliği: ${sourceStudent?.fullName || 'Öğrenci'} ${newSeats[targetSeatIndex].code} sırasına taşındı.`;

      showToast(msg, 'success');

      // Auto sync in background if Google Sheets is connected
      if (googleToken && updatedClass.googleSpreadsheetId) {
        syncClassroomToGoogleSheet(googleToken, updatedClass.googleSpreadsheetId, updatedClass)
          .then(() => {
            updateClassroomState({
              ...updatedClass,
              syncStatus: 'synced',
              lastSyncedAt: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
            });
          })
          .catch((err) => {
            console.warn('Auto-sync notice:', err);
          });
      }
    },
    [currentClassroom, googleToken, showToast, updateClassroomState]
  );

  // Remove Student from Desk (Unseat)
  const handleRemoveStudentFromSeat = (seatId: string) => {
    if (!currentClassroom) return;
    const newSeats = currentClassroom.seats.map((s) => {
      if (s.id === seatId) {
        return { ...s, studentId: null };
      }
      return s;
    });

    const seat = currentClassroom.seats.find((s) => s.id === seatId);
    const student = seat?.studentId
      ? currentClassroom.students.find((st) => st.id === seat.studentId)
      : null;

    const newStudents = currentClassroom.students.map((st) => {
      if (st.id === seat?.studentId) {
        return { ...st, seatCode: undefined };
      }
      return st;
    });

    const updated = {
      ...currentClassroom,
      seats: newSeats,
      students: newStudents,
      syncStatus: 'pending' as const,
    };
    updateClassroomState(updated);
    showToast(`${student?.fullName || 'Öğrenci'} sıradan kaldırıldı ve bekleme listesine alındı.`, 'info');
  };

  // Add Observation to Student
  const handleAddObservation = (
    studentId: string,
    category: ObservationCategory,
    content: string,
    date: string
  ) => {
    if (!currentClassroom) return;
    const student = currentClassroom.students.find((s) => s.id === studentId);
    if (!student) return;

    const newObs = {
      id: `obs_${Date.now()}`,
      classId: currentClassroom.id,
      studentId,
      studentName: student.fullName,
      date,
      category,
      content,
      teacherId: activeTeacher.id,
      teacherName: activeTeacher.name,
      createdAt: new Date().toISOString(),
    };

    const updatedClass: Classroom = {
      ...currentClassroom,
      observations: [newObs, ...currentClassroom.observations],
      syncStatus: 'pending',
    };

    updateClassroomState(updatedClass);
    showToast(`Gözlem kaydedildi: [${student.fullName}]: ${content.slice(0, 40)}...`, 'success');

    // Auto sync if Google Token
    if (googleToken && updatedClass.googleSpreadsheetId) {
      syncClassroomToGoogleSheet(googleToken, updatedClass.googleSpreadsheetId, updatedClass).catch(
        (err) => console.warn('Sync notice:', err)
      );
    }
  };

  // Delete Observation
  const handleDeleteObservation = (obsId: string) => {
    if (!currentClassroom) return;
    const updatedClass: Classroom = {
      ...currentClassroom,
      observations: currentClassroom.observations.filter((o) => o.id !== obsId),
      syncStatus: 'pending',
    };
    updateClassroomState(updatedClass);
    showToast('Gözlem notu silindi.', 'info');
  };

  // Add General Class Note (Row 24)
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
      syncStatus: 'pending',
    };

    updateClassroomState(updatedClass);
    showToast(`Sınıf genel notu (Satır 24) kaydedildi: ${date}`, 'success');

    if (googleToken && updatedClass.googleSpreadsheetId) {
      syncClassroomToGoogleSheet(googleToken, updatedClass.googleSpreadsheetId, updatedClass).catch(
        (err) => console.warn('Sync notice:', err)
      );
    }
  };

  // Delete Class Note
  const handleDeleteClassNote = (noteId: string) => {
    if (!currentClassroom) return;
    const updatedClass: Classroom = {
      ...currentClassroom,
      classNotes: currentClassroom.classNotes.filter((n) => n.id !== noteId),
      syncStatus: 'pending',
    };
    updateClassroomState(updatedClass);
    showToast('Genel sınıf notu silindi.', 'info');
  };

  // Create New Class Handler
  const handleCreateClass = async (newClass: Classroom, createDriveSheet: boolean) => {
    let finalClass = { ...newClass };

    // If Google account is connected & user wants to create Google Sheet immediately
    if (createDriveSheet && googleToken) {
      try {
        const { spreadsheetId, spreadsheetUrl } = await createGoogleSpreadsheet(
          googleToken,
          finalClass
        );
        finalClass.googleSpreadsheetId = spreadsheetId;
        finalClass.googleSpreadsheetUrl = spreadsheetUrl;
        finalClass.syncStatus = 'synced';
        finalClass.lastSyncedAt = new Date().toLocaleTimeString('tr-TR', {
          hour: '2-digit',
          minute: '2-digit',
        });
        showToast(
          `Google Drive'da 'Sinif_Oturma_Plani_${finalClass.name}' E-Tablosu otomatik oluşturuldu.`,
          'success'
        );
      } catch (err: any) {
        console.error('Google Sheet create failed:', err);
        showToast('E-Tablo oluşturulurken hata oluştu, ancak sınıf yerel olarak kaydedildi.', 'warning');
      }
    }

    setClassrooms((prev) => {
      const next = [finalClass, ...prev];
      saveClassrooms(next);
      return next;
    });

    setClassIdState(finalClass.id);
    setActiveClassId(finalClass.id);
    showToast(`${finalClass.name} sınıfı başarıyla oluşturuldu (${finalClass.students.length} öğrenci).`, 'success');
  };

  // Add Student to Class
  const handleAddStudent = (studentData: Omit<Student, 'id'>) => {
    if (!currentClassroom) return;
    const newStudent: Student = {
      ...studentData,
      id: `st_${Date.now()}`,
    };

    // Find first empty seat
    const emptySeat = currentClassroom.seats.find((s) => s.studentId === null);
    let updatedSeats = [...currentClassroom.seats];

    if (emptySeat) {
      const seatIdx = updatedSeats.findIndex((s) => s.id === emptySeat.id);
      updatedSeats[seatIdx] = {
        ...updatedSeats[seatIdx],
        studentId: newStudent.id,
      };
      newStudent.seatCode = emptySeat.code;
    }

    const updatedClass: Classroom = {
      ...currentClassroom,
      students: [...currentClassroom.students, newStudent],
      seats: updatedSeats,
      syncStatus: 'pending',
    };

    updateClassroomState(updatedClass);
    showToast(
      `${newStudent.fullName} sınıfa eklendi${newStudent.seatCode ? ` (${newStudent.seatCode} sırasına atandı)` : ''}.`,
      'success'
    );
  };

  // Delete Student
  const handleDeleteStudent = (studentId: string) => {
    if (!currentClassroom) return;
    const updatedSeats = currentClassroom.seats.map((s) => {
      if (s.studentId === studentId) {
        return { ...s, studentId: null };
      }
      return s;
    });

    const updatedStudents = currentClassroom.students.filter((s) => s.id !== studentId);
    const updatedClass: Classroom = {
      ...currentClassroom,
      students: updatedStudents,
      seats: updatedSeats,
      observations: currentClassroom.observations.filter((o) => o.studentId !== studentId),
      syncStatus: 'pending',
    };

    updateClassroomState(updatedClass);
    showToast('Öğrenci sınıftan silindi.', 'info');
  };

  // SHUFFLE SEATS
  const handleShuffleSeats = () => {
    if (!currentClassroom) return;

    setConfirmDialog({
      isOpen: true,
      title: 'Sıraları Rastgele Karıştır?',
      message: `${currentClassroom.name} sınıfındaki tüm öğrencilerin sıraları pedagojik olarak rastgele yeniden atanacaktır. Bu işlem mevcut oturma düzenini değiştirecektir.`,
      confirmLabel: 'Evet, Sıraları Karıştır',
      variant: 'warning',
      action: () => {
        const studentIds = currentClassroom.students.map((s) => s.id);
        // Fisher-Yates Shuffle
        for (let i = studentIds.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [studentIds[i], studentIds[j]] = [studentIds[j], studentIds[i]];
        }

        const newSeats = currentClassroom.seats.map((seat, idx) => ({
          ...seat,
          studentId: idx < studentIds.length ? studentIds[idx] : null,
        }));

        const newStudents = currentClassroom.students.map((st) => {
          const seat = newSeats.find((s) => s.studentId === st.id);
          return { ...st, seatCode: seat?.code };
        });

        const updatedClass: Classroom = {
          ...currentClassroom,
          seats: newSeats,
          students: newStudents,
          syncStatus: 'pending',
        };

        updateClassroomState(updatedClass);
        showToast('Sınıf oturma sıraları başarıyla yeniden karıştırıldı!', 'success');
      },
    });
  };

  // RESET SEATS (Back to alphabetical / student number order)
  const handleResetSeats = () => {
    if (!currentClassroom) return;

    setConfirmDialog({
      isOpen: true,
      title: 'Sıraları Numaraya Göre Sıfırla?',
      message: `${currentClassroom.name} sınıfındaki öğrenciler okul numaralarına göre sıralı olarak baştan sona yerleştirilecektir.`,
      confirmLabel: 'Sıralamayı Sıfırla',
      variant: 'info',
      action: () => {
        const sortedStudents = [...currentClassroom.students].sort(
          (a, b) => parseInt(a.studentNumber) - parseInt(b.studentNumber)
        );

        const newSeats = currentClassroom.seats.map((seat, idx) => ({
          ...seat,
          studentId: idx < sortedStudents.length ? sortedStudents[idx].id : null,
        }));

        const newStudents = currentClassroom.students.map((st) => {
          const seat = newSeats.find((s) => s.studentId === st.id);
          return { ...st, seatCode: seat?.code };
        });

        const updatedClass: Classroom = {
          ...currentClassroom,
          seats: newSeats,
          students: newStudents,
          syncStatus: 'pending',
        };

        updateClassroomState(updatedClass);
        showToast('Sıralar öğrenci numarasına göre sıfırlandı.', 'info');
      },
    });
  };

  // EXPORT ONLY SEATING PLAN TO PDF (Requirement 6)
  const handleExportPDF = async () => {
    if (!currentClassroom) return;
    setIsExportingPDF(true);
    try {
      await exportSeatingPlanToPDF('printable-seating-chart', currentClassroom, activeTeacher);
      showToast('Oturma planı PDF dosyası başarıyla hazırlandı.', 'success');
    } catch (err: any) {
      showToast(`PDF oluşturma hatası: ${err?.message || 'Bilinmeyen hata'}`, 'warning');
    } finally {
      setIsExportingPDF(false);
    }
  };

  // PRINT
  const handlePrint = () => {
    window.print();
  };

  // SYNC TO GOOGLE SHEETS
  const handleTriggerSync = () => {
    if (!currentClassroom) return;

    // MANDATORY per Workspace integration skill: Confirm before updating user spreadsheet data
    setConfirmDialog({
      isOpen: true,
      title: 'Google Drive ve E-Tablo Senkronizasyon Onayı',
      message: `Google Drive hesabınızda bulunan 'Sinif_Oturma_Plani_${currentClassroom.name}' tablosu güncellenecektir. A Sütunundaki Sıra Kodları, B Sütunundaki Öğrenci İsimleri, Tarih Yorumları ve Satır 24 Sınıf Notları senkronize edilecektir. Devam etmek istiyor musunuz?`,
      confirmLabel: 'Onayla ve Senkronize Et',
      variant: 'info',
      action: async () => {
        setIsSyncingSheets(true);
        try {
          const token = googleToken || (await getAccessToken());

          if (token && currentClassroom.googleSpreadsheetId) {
            // Live Google Sheets API Call
            await syncClassroomToGoogleSheet(token, currentClassroom.googleSpreadsheetId, currentClassroom);
            const updatedClass = {
              ...currentClassroom,
              syncStatus: 'synced' as const,
              lastSyncedAt: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
            };
            updateClassroomState(updatedClass);
            showToast('Google Drive E-Tablosu başarıyla canlı senkronize edildi.', 'success');
          } else if (token && !currentClassroom.googleSpreadsheetId) {
            // Create spreadsheet on the fly
            const { spreadsheetId, spreadsheetUrl } = await createGoogleSpreadsheet(
              token,
              currentClassroom
            );
            const updatedClass = {
              ...currentClassroom,
              googleSpreadsheetId: spreadsheetId,
              googleSpreadsheetUrl: spreadsheetUrl,
              syncStatus: 'synced' as const,
              lastSyncedAt: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
            };
            updateClassroomState(updatedClass);
            showToast(`Google Drive'da 'Sinif_Oturma_Plani_${currentClassroom.name}' oluşturuldu ve senkronize edildi.`, 'success');
          } else {
            // Demo Mode Simulation
            const updatedClass = {
              ...currentClassroom,
              syncStatus: 'synced' as const,
              lastSyncedAt: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
            };
            updateClassroomState(updatedClass);
            showToast('E-Tablo verisi matrisi başarıyla güncellendi (Test Modu Simülatörü).', 'success');
          }
        } catch (err: any) {
          showToast(`Senkronizasyon hatası: ${err?.message || 'Bağlantı sorunu'}`, 'warning');
        } finally {
          setIsSyncingSheets(false);
        }
      },
    });
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
        onOpenSheetsPreview={() => setIsSheetsModalOpen(true)}
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
              onPrint={handlePrint}
              onOpenReports={() => {
                setReportStudentId(null);
                setIsReportModalOpen(true);
              }}
              onOpenSheetsPreview={() => setIsSheetsModalOpen(true)}
              onOpenStudentManagement={() => setIsStudentManagementOpen(true)}
              onShuffleSeats={handleShuffleSeats}
              onResetSeats={handleResetSeats}
              isExportingPDF={isExportingPDF}
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
              Sıkı izolasyon kuralı gereği diğer öğretmenlerin (9-A, 10-B vb.) sınıfları bu hesapta gizlidir. Yeni bir sınıf oluşturarak oturma planınızı ve Google E-Tablo senkronizasyonunuzu başlatabilirsiniz.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsNewClassModalOpen(true)}
                className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-2"
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

      {/* 1. Student Report Panel (Requirement 5) */}
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

      {/* 2. Google Sheets Preview & Sync Simulator (Requirement 4) */}
      {currentClassroom && (
        <GoogleSheetsPreviewModal
          isOpen={isSheetsModalOpen}
          onClose={() => setIsSheetsModalOpen(false)}
          classroom={currentClassroom}
          activeTeacher={activeTeacher}
          isGoogleConnected={isGoogleConnected}
          onTriggerSync={handleTriggerSync}
          isSyncing={isSyncingSheets}
        />
      )}

      {/* 3. New Class Modal (Requirement 2) */}
      <NewClassModal
        isOpen={isNewClassModalOpen}
        onClose={() => setIsNewClassModalOpen(false)}
        activeTeacher={activeTeacher}
        isGoogleConnected={isGoogleConnected}
        onCreateClass={handleCreateClass}
      />

      {/* 4. Teacher Switcher & Isolation Verification Modal (Requirement 1) */}
      <TeacherSwitcherModal
        isOpen={isTeacherSwitcherOpen}
        onClose={() => setIsTeacherSwitcherOpen(false)}
        teachers={teachers}
        currentTeacher={activeTeacher}
        classrooms={classrooms}
        onSelectTeacher={handleSelectTeacher}
        onOpenGoogleLogin={handleGoogleLogin}
        isGoogleConnected={isGoogleConnected}
      />

      {/* 5. Student Roster Management Modal */}
      {currentClassroom && (
        <StudentManagementModal
          isOpen={isStudentManagementOpen}
          onClose={() => setIsStudentManagementOpen(false)}
          classroom={currentClassroom}
          onAddStudent={handleAddStudent}
          onDeleteStudent={handleDeleteStudent}
        />
      )}

      {/* 6. Destructive / Mutating Operation Confirm Modal */}
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
