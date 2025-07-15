// Firebase設定の確認用ユーティリティ

export const checkFirebaseConfig = () => {
  console.log('=== Firebase Configuration Check ===');
  console.log('Auth Domain:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN);
  console.log('Project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
  console.log('Current URL:', typeof window !== 'undefined' ? window.location.origin : 'Server Side');
  
  if (typeof window !== 'undefined') {
    console.log('Current Domain:', window.location.hostname);
    console.log('Protocol:', window.location.protocol);
  }
};

// メール認証URLの生成
export const generateEmailVerificationURL = (baseUrl: string = '') => {
  const currentUrl = typeof window !== 'undefined' ? window.location.origin : baseUrl;
  return `${currentUrl}/auth?verified=true`;
};

// 許可されたドメインのリスト
export const allowedDomains = [
  'localhost',
  'badsnsn-q2xa94.firebaseapp.com',
  // Vercelドメインをここに追加
  // 'your-app.vercel.app'
];

// ドメインの検証
export const validateDomain = (url: string): boolean => {
  try {
    const domain = new URL(url).hostname;
    return allowedDomains.some(allowed => 
      domain === allowed || domain.endsWith(`.${allowed}`)
    );
  } catch {
    return false;
  }
};