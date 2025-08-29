# Firebase メール認証の設定手順

## 1. Firebase Consoleでのメールテンプレート設定

### 手順

1. **Firebase Consoleにアクセス**
   - https://console.firebase.google.com/
   - プロジェクトを選択

2. **Authenticationセクションへ移動**
   - 左側のメニューから「Authentication」を選択
   - 「テンプレート」タブをクリック

3. **メールアドレスの確認テンプレートを設定**
   - 「メールアドレスの確認」を選択
   - 以下の内容に編集：

```
件名: Rally Net - メールアドレスの確認

本文:
こんにちは、

Rally Netへのご登録ありがとうございます。

以下のリンクをクリックして、メールアドレスを確認してください：
%LINK%

このリンクは24時間有効です。

よろしくお願いいたします。
Rally Net運営チーム
```

4. **SMTPの設定（任意）**
   - 独自のSMTPサーバーを使用する場合は、SMTP設定を行う
   - SendGridやAmazon SESを設定可能

## 2. ドメインの確認

1. **プロジェクト設定**
   - 歯車アイコン → プロジェクト設定

2. **認証ドメインの追加**
   - 「Authentication」→「Settings」→「認証済みドメイン」
   - 本番環境のドメインを追加（例：rallynet.com）

## 3. メール送信の有効化

1. **認証方法の確認**
   - Authentication → Sign-in method
   - 「メール/パスワード」が有効になっていることを確認

2. **メール認証の設定**
   - 「メールリンク（パスワードなしログイン）」はオフのまま
   - 「メール列挙保護」を有効化（推奨）

## 4. 動作確認

### テスト手順

1. **新規アカウント作成**
   ```
   1. /auth/signup にアクセス
   2. メールアドレスとパスワードを入力
   3. アカウント作成ボタンをクリック
   ```

2. **メール確認**
   ```
   - 登録したメールアドレスに確認メールが届く
   - メール内のリンクをクリック
   - /auth/email-verified ページにリダイレクトされる
   ```

3. **認証完了確認**
   ```
   - Firebase Console → Authentication → Users
   - 該当ユーザーの「メール認証」列が「✓」になっていることを確認
   ```

## 5. トラブルシューティング

### メールが届かない場合

1. **スパムフォルダを確認**
   - 迷惑メールフォルダに振り分けられている可能性

2. **送信者メールアドレスの確認**
   - デフォルト: noreply@[project-id].firebaseapp.com
   - カスタムドメインを設定している場合はそのアドレス

3. **Firebase Quotaの確認**
   - 無料プランの場合、1日のメール送信数に制限あり
   - Spark Plan: 1日100通まで
   - Blaze Plan: 従量課金

### メールテンプレートが反映されない場合

1. **言語設定の確認**
   - テンプレートの言語設定が「日本語」になっているか確認

2. **保存の確認**
   - テンプレート編集後、必ず「保存」ボタンをクリック

## 6. 本番環境での推奨設定

### カスタムドメインの設定

1. **独自ドメインからのメール送信**
   - SendGrid、Mailgun、Amazon SESなどを設定
   - Firebase ExtensionsでTrigger Emailを使用

2. **メールテンプレートのカスタマイズ**
   - ブランディングに合わせたデザイン
   - ロゴの追加
   - フッターに連絡先情報を追加

### セキュリティ設定

1. **Rate Limiting**
   - 同一IPからの過度なリクエストを制限

2. **メール認証の必須化**
   - 重要な機能へのアクセスをメール認証済みユーザーに限定

3. **二要素認証の追加（任意）**
   - より高いセキュリティが必要な場合

## 7. 実装コードの例

### メール送信（signup時）
```typescript
import { sendEmailVerification } from 'firebase/auth';

// ユーザー作成後
await sendEmailVerification(user, {
  url: 'https://rallynet.com/auth/email-verified',
  handleCodeInApp: false,
});
```

### メール認証状態の確認
```typescript
// AuthContext内
if (user) {
  setIsEmailVerified(user.emailVerified);
}
```

### 再送信機能
```typescript
const resendVerificationEmail = async () => {
  const user = auth.currentUser;
  if (user && !user.emailVerified) {
    await sendEmailVerification(user);
  }
};
```

## 注意事項

- Firebase Authenticationのメール機能は、Firebaseプロジェクトの設定に依存します
- 本番環境では必ずカスタムドメインを設定してください
- メールテンプレートは多言語対応可能です
- SPF、DKIM、DMARCレコードの設定を推奨します