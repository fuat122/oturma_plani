import {
  collection,
  collectionGroup,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  onSnapshot,
  query,
  getDocFromServer,
} from 'firebase/firestore';
import { db, auth } from './firebaseAuth';
import { Classroom, StudentObservation } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test Firestore connectivity
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    const testDoc = doc(db, 'test', 'connection');
    await getDocFromServer(testDoc).catch(() => {});
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore client is currently offline.');
    }
    return false;
  }
}

// Collection reference for a specific teacher's classes: teachers/{teacherUid}/classes
export function getTeacherClassesCollection(teacherUid: string) {
  return collection(db, 'teachers', teacherUid, 'classes');
}

// Document reference for a specific class: teachers/{teacherUid}/classes/{classId}
export function getTeacherClassDoc(teacherUid: string, classId: string) {
  return doc(db, 'teachers', teacherUid, 'classes', classId);
}

/**
 * Real-time listener for the logged-in teacher's classes
 * Enforces total isolation: only teachers/{userId}/classes is queried.
 */
export function subscribeTeacherClasses(
  userId: string,
  onClassesUpdated: (classes: Classroom[]) => void,
  onError?: (error: Error) => void
): () => void {
  const colRef = getTeacherClassesCollection(userId);
  const q = query(colRef);

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const classes: Classroom[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        classes.push({
          id: docSnap.id,
          teacherId: userId,
          name: data.name || 'İsimsiz Sınıf',
          grade: data.grade || '9. Sınıf',
          branchName: data.branchName || '',
          academicYear: data.academicYear || '2026-2027',
          maxCapacity: typeof data.maxCapacity === 'number' ? data.maxCapacity : 24,
          layoutType: data.layoutType || '3-block-standard',
          students: Array.isArray(data.students) ? data.students : [],
          seats: Array.isArray(data.seats) ? data.seats : [],
          observations: Array.isArray(data.observations) ? data.observations : [],
          classNotes: Array.isArray(data.classNotes) ? data.classNotes : [],
          syncStatus: 'synced',
          lastSyncedAt: data.updatedAt || new Date().toISOString(),
          createdAt: data.createdAt || new Date().toISOString(),
        });
      });
      onClassesUpdated(classes);
    },
    (error) => {
      console.error('Firestore classes subscription error:', error);
      try {
        handleFirestoreError(error, OperationType.LIST, `teachers/${userId}/classes`);
      } catch (err: any) {
        if (onError) onError(err);
      }
    }
  );

  return unsubscribe;
}

/**
 * Fetch all classes for a teacher once
 */
export async function fetchTeacherClasses(userId: string): Promise<Classroom[]> {
  const colRef = getTeacherClassesCollection(userId);
  try {
    const snapshot = await getDocs(colRef);
    const classes: Classroom[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      classes.push({
        id: docSnap.id,
        teacherId: userId,
        name: data.name || 'İsimsiz Sınıf',
        grade: data.grade || '9. Sınıf',
        branchName: data.branchName || '',
        academicYear: data.academicYear || '2026-2027',
        maxCapacity: typeof data.maxCapacity === 'number' ? data.maxCapacity : 24,
        layoutType: data.layoutType || '3-block-standard',
        students: Array.isArray(data.students) ? data.students : [],
        seats: Array.isArray(data.seats) ? data.seats : [],
        observations: Array.isArray(data.observations) ? data.observations : [],
        classNotes: Array.isArray(data.classNotes) ? data.classNotes : [],
        syncStatus: 'synced',
        lastSyncedAt: data.updatedAt || new Date().toISOString(),
        createdAt: data.createdAt || new Date().toISOString(),
      });
    });
    return classes;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `teachers/${userId}/classes`);
    return [];
  }
}

/**
 * Save / Update a classroom document in Firestore:
 * teachers/{user.uid}/classes/{classId}
 */
export async function saveClassroomToFirestore(
  userId: string,
  classroom: Classroom
): Promise<void> {
  const docRef = getTeacherClassDoc(userId, classroom.id);
  const now = new Date().toISOString();

  const payload = {
    id: classroom.id,
    teacherId: userId,
    teacherName: classroom.teacherName || '',
    name: classroom.name,
    grade: classroom.grade,
    branchName: classroom.branchName || '',
    academicYear: classroom.academicYear,
    maxCapacity: classroom.maxCapacity || (classroom.seats.length > 0 ? classroom.seats.length : 24),
    layoutType: classroom.layoutType || '3-block-standard',
    students: classroom.students || [],
    seats: classroom.seats || [],
    observations: classroom.observations || [],
    classNotes: classroom.classNotes || [],
    createdAt: classroom.createdAt || now,
    updatedAt: now,
  };

  try {
    await setDoc(docRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `teachers/${userId}/classes/${classroom.id}`);
  }
}

/**
 * Fetch all school classes across all teachers (Okul Sınıf Düzenleri - Salt Okunur)
 * For classes not belonging to the current teacher:
 * - Marked as isReadOnly: true
 * - Personal observations and notes are completely stripped ([]) so personal comments remain private
 * - Only student names, numbers, gender and seating arrangement are exposed
 */
export async function fetchAllSchoolClasses(currentUserId?: string): Promise<Classroom[]> {
  try {
    const classesGroup = collectionGroup(db, 'classes');
    const snapshot = await getDocs(classesGroup);
    const classes: Classroom[] = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const isOwner = currentUserId && data.teacherId === currentUserId;

      classes.push({
        id: docSnap.id,
        teacherId: data.teacherId || '',
        teacherName: data.teacherName || 'Öğretmen',
        name: data.name || 'İsimsiz Sınıf',
        grade: data.grade || '9. Sınıf',
        branchName: data.branchName || '',
        academicYear: data.academicYear || '2026-2027',
        maxCapacity: typeof data.maxCapacity === 'number' ? data.maxCapacity : 24,
        layoutType: data.layoutType || '3-block-standard',
        students: Array.isArray(data.students)
          ? data.students.map((s: any) => ({
              id: s.id,
              studentNumber: s.studentNumber,
              fullName: s.fullName,
              gender: s.gender,
              seatCode: s.seatCode,
            }))
          : [],
        seats: Array.isArray(data.seats) ? data.seats : [],
        // Privacy rule: foreign teachers NEVER receive observations or private classNotes
        observations: isOwner && Array.isArray(data.observations) ? data.observations : [],
        classNotes: isOwner && Array.isArray(data.classNotes) ? data.classNotes : [],
        syncStatus: 'synced',
        lastSyncedAt: data.updatedAt || new Date().toISOString(),
        createdAt: data.createdAt || new Date().toISOString(),
        isReadOnly: !isOwner,
      });
    });

    return classes.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
  } catch (error) {
    console.error('Error fetching school classes:', error);
    try {
      handleFirestoreError(error, OperationType.LIST, 'classes (collectionGroup)');
    } catch {
      // Graceful fallback
    }
    return [];
  }
}

/**
 * Delete a classroom document from Firestore
 */
export async function deleteClassroomFromFirestore(
  userId: string,
  classId: string
): Promise<void> {
  const docRef = getTeacherClassDoc(userId, classId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `teachers/${userId}/classes/${classId}`);
  }
}

/**
 * Add an observation comment directly to the classroom document and its subcollection
 */
export async function addObservationToClass(
  userId: string,
  classId: string,
  observation: StudentObservation,
  currentClass: Classroom
): Promise<Classroom> {
  const updatedObservations = [observation, ...(currentClass.observations || [])];
  const updatedClass: Classroom = {
    ...currentClass,
    observations: updatedObservations,
    lastSyncedAt: new Date().toISOString(),
    syncStatus: 'synced',
  };

  await saveClassroomToFirestore(userId, updatedClass);

  // Also write to subcollection `observations` for granular history if needed
  try {
    const obsDoc = doc(db, 'teachers', userId, 'classes', classId, 'observations', observation.id);
    await setDoc(obsDoc, observation);
  } catch (e) {
    console.warn('Subcollection observation write warning:', e);
  }

  return updatedClass;
}
