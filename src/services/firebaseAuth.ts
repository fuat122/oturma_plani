import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

// Simple Google Provider without Drive/Sheets scopes
const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  prompt: 'select_account',
});

export const initAuth = (
  onAuthSuccess?: (user: User) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (onAuthSuccess) onAuthSuccess(user);
    } else {
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<User | null> => {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error: any) {
    console.error('Google ile giriş hatası:', error);
    throw error;
  }
};

export const logout = async () => {
  await signOut(auth);
};

/**
 * Kurumsal okul e-posta domain kontrolü:
 * Yalnızca @alkev.k12.tr uzantılı kurumsal e-posta adresleri veya yetkili hesap kabul edilir.
 */
export const isAuthorizedSchoolEmail = (email: string | null | undefined): boolean => {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();

  // Aktif kullanıcı / yetkili yönetici istisnası
  if (normalized === 'fuattosun@gmail.com') return true;

  // Yalnızca @alkev.k12.tr kurumsal domaini
  return normalized.endsWith('@alkev.k12.tr');
};
