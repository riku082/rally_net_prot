import { auth } from './firebase';
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';

// Google認証
export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    return { user: userCredential.user, error: null };
  } catch (error: unknown) {
    return { user: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// メールアドレス認証（ログイン）
export const signInWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error: unknown) {
    return { user: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// メールアドレス認証（新規登録）
export const signUpWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error: unknown) {
    return { user: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// ログアウト
export const signOutUser = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// 現在のユーザー取得（リアルタイム監視）
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// 現在のユーザーを取得
export const getCurrentUser = () => {
  return auth.currentUser;
}; 