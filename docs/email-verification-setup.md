# メール認証コード送信の設定手順

Rally Netでは、メールアドレスに6桁の認証コードを送信する方式で認証を行います。

## セットアップ手順

### 1. Resendアカウントの作成（推奨）

Resendは簡単にセットアップできるメール送信サービスです。

1. **アカウント作成**
   - https://resend.com にアクセス
   - 無料アカウントを作成（月100通まで無料）

2. **APIキーの取得**
   - ダッシュボード → API Keys
   - 「Create API Key」をクリック
   - キーをコピー

3. **ドメインの設定（オプション）**
   - 独自ドメインからメールを送信する場合
   - Domains → Add Domain
   - DNSレコードを設定

### 2. 環境変数の設定

`.env.local`ファイルを作成し、以下を追加：

```bash
# Resend設定
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=Rally Net <noreply@yourdomain.com>

# Firebase Admin SDK設定（既存のFirebaseプロジェクトから取得）
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
```

### 3. Firebase Admin SDKのセットアップ

1. **サービスアカウントの作成**
   - Firebase Console → プロジェクト設定
   - サービスアカウント → 新しい秘密鍵を生成
   - JSONファイルをダウンロード

2. **環境変数に設定**
   - JSONファイルから以下の値をコピー：
     - `project_id` → `FIREBASE_PROJECT_ID`
     - `client_email` → `FIREBASE_CLIENT_EMAIL`
     - `private_key` → `FIREBASE_PRIVATE_KEY`

### 4. 動作確認

#### 開発環境での確認

1. **環境変数なしでテスト**
   ```bash
   npm run dev
   ```
   - 認証コードはコンソールとアラートに表示される

2. **Resend統合テスト**
   ```bash
   # .env.localにRESEND_API_KEYを設定後
   npm run dev
   ```
   - 実際にメールが送信される

#### 認証フロー

1. `/auth/signup`でアカウント作成
2. メールアドレスとパスワードを入力
3. 認証コードがメールで送信される
4. `/auth/verify`で6桁のコードを入力
5. アカウント作成完了

## メールテンプレートのカスタマイズ

`/src/app/api/auth/send-code/route.ts`のHTMLテンプレートを編集：

```typescript
html: `
  <div style="font-family: sans-serif;">
    <!-- カスタムHTMLを記述 -->
  </div>
`
```

## トラブルシューティング

### メールが届かない場合

1. **スパムフォルダを確認**
2. **Resendダッシュボードでログを確認**
   - https://resend.com/emails
3. **環境変数の確認**
   ```bash
   echo $RESEND_API_KEY
   ```

### 認証コードエラー

1. **有効期限（10分）を過ぎていないか確認**
2. **Firestore Rulesの確認**
   - `verificationCodes`コレクションへの書き込み権限

### 開発環境での動作

- `RESEND_API_KEY`が未設定でも動作
- 認証コードはレスポンスとコンソールに表示
- 本番環境では必ず設定すること

## 他のメールサービスの使用

### SendGrid

```typescript
// npm install @sendgrid/mail
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const msg = {
  to: email,
  from: process.env.SENDGRID_FROM_EMAIL,
  subject: '認証コード',
  html: htmlContent,
};

await sgMail.send(msg);
```

### Amazon SES

```typescript
// npm install @aws-sdk/client-ses
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const client = new SESClient({ region: process.env.AWS_REGION });
const command = new SendEmailCommand({
  Source: process.env.SES_FROM_EMAIL,
  Destination: { ToAddresses: [email] },
  Message: {
    Subject: { Data: "認証コード" },
    Body: { Html: { Data: htmlContent } },
  },
});

await client.send(command);
```

## セキュリティの考慮事項

1. **レート制限**
   - 同一IPからの過度なリクエストを制限
   - Firebase Functionsでの実装を推奨

2. **認証コードの保護**
   - 本番環境では絶対にレスポンスに含めない
   - HTTPSを必須とする

3. **有効期限の設定**
   - 現在は10分（変更可能）
   - 短すぎず長すぎない設定が重要

## 本番環境チェックリスト

- [ ] RESEND_API_KEY設定済み
- [ ] カスタムドメインからのメール送信設定
- [ ] SPF/DKIM/DMARCレコード設定
- [ ] レート制限の実装
- [ ] エラーログの監視設定
- [ ] メールバウンス処理の実装