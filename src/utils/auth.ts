import { auth } from './firebase';
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  linkWithCredential,
  EmailAuthProvider,
  signOut,
  onAuthStateChanged,
  User,
  AuthError,
} from 'firebase/auth';

// Firebaseエラーコードを日本語メッセージに変換する関数
const getJapaneseErrorMessage = (error: AuthError): string => {
  switch (error.code) {
    // メールアドレス・パスワード認証エラー
    case 'auth/invalid-email':
      return 'メールアドレスの形式が正しくありません。';
    case 'auth/user-disabled':
      return 'このアカウントは無効になっています。';
    case 'auth/user-not-found':
      return 'このメールアドレスは登録されていません。';
    case 'auth/wrong-password':
      return 'パスワードが間違っています。';
    case 'auth/email-already-in-use':
      return 'このメールアドレスは既に使用されています。';
    case 'auth/weak-password':
      return 'パスワードが弱すぎます。6文字以上で設定してください。';
    case 'auth/operation-not-allowed':
      return 'この認証方法は現在無効になっています。';
    case 'auth/too-many-requests':
      return 'リクエストが多すぎます。しばらく時間をおいてから再試行してください。';
    case 'auth/network-request-failed':
      return 'ネットワークエラーが発生しました。インターネット接続を確認してください。';
    
    // Google認証エラー
    case 'auth/popup-closed-by-user':
      return 'ログインウィンドウが閉じられました。';
    case 'auth/popup-blocked':
      return 'ポップアップがブロックされました。ブラウザの設定を確認してください。';
    case 'auth/cancelled-popup-request':
      return 'ログインがキャンセルされました。';
    case 'auth/account-exists-with-different-credential':
      return 'このメールアドレスは別の認証方法で既に登録されています。';
    
    // その他のエラー
    case 'auth/invalid-credential':
      return '認証情報が無効です。';
    case 'auth/requires-recent-login':
      return 'セキュリティのため、再度ログインしてください。';
    case 'auth/operation-not-supported-in-this-environment':
      return 'この環境では操作がサポートされていません。';
    case 'auth/timeout':
      return '認証がタイムアウトしました。';
    
    default:
      return '認証に失敗しました。しばらく時間をおいてから再試行してください。';
  }
};

// Google認証
export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    return { user: userCredential.user, error: null };
  } catch (error: unknown) {
    if (error instanceof Error) {
      // Firebase AuthErrorの場合は日本語メッセージに変換
      if ('code' in error) {
        return { user: null, error: getJapaneseErrorMessage(error as AuthError) };
      }
      return { user: null, error: error.message };
    }
    return { user: null, error: '認証に失敗しました。' };
  }
};

// メールアドレス認証（ログイン）
export const signInWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error: unknown) {
    if (error instanceof Error) {
      // Firebase AuthErrorの場合は日本語メッセージに変換
      if ('code' in error) {
        return { user: null, error: getJapaneseErrorMessage(error as AuthError) };
      }
      return { user: null, error: error.message };
    }
    return { user: null, error: '認証に失敗しました。' };
  }
};

// メールアドレス認証（新規登録）
export const signUpWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error: unknown) {
    if (error instanceof Error) {
      // Firebase AuthErrorの場合は日本語メッセージに変換
      if ('code' in error) {
        return { user: null, error: getJapaneseErrorMessage(error as AuthError) };
      }
      return { user: null, error: error.message };
    }
    return { user: null, error: '認証に失敗しました。' };
  }
};

// ログアウト
export const signOutUser = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error: unknown) {
    if (error instanceof Error) {
      // Firebase AuthErrorの場合は日本語メッセージに変換
      if ('code' in error) {
        return { error: getJapaneseErrorMessage(error as AuthError) };
      }
      return { error: error.message };
    }
    return { error: 'ログアウトに失敗しました。' };
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

// 匿名認証でログイン
export const signInAnonymouslyUser = async () => {
  try {
    const userCredential = await signInAnonymously(auth);
    return { user: userCredential.user, error: null };
  } catch (error: unknown) {
    if (error instanceof Error) {
      if ('code' in error) {
        return { user: null, error: getJapaneseErrorMessage(error as AuthError) };
      }
      return { user: null, error: error.message };
    }
    return { user: null, error: '匿名ログインに失敗しました。' };
  }
};

// 匿名アカウントをメールアカウントにアップグレード
export const linkAnonymousWithEmail = async (email: string, password: string) => {
  try {
    const user = auth.currentUser;
    if (!user || !user.isAnonymous) {
      return { user: null, error: '匿名ユーザーではありません。' };
    }

    const credential = EmailAuthProvider.credential(email, password);
    const userCredential = await linkWithCredential(user, credential);
    return { user: userCredential.user, error: null };
  } catch (error: unknown) {
    if (error instanceof Error) {
      if ('code' in error) {
        return { user: null, error: getJapaneseErrorMessage(error as AuthError) };
      }
      return { user: null, error: error.message };
    }
    return { user: null, error: 'アカウントの連携に失敗しました。' };
  }
}; 