# Google認証セットアップガイド

Google認証が動作しない場合は、以下の手順を確認してください。

## Firebase Console での設定

1. **Firebase Consoleにアクセス**
   - https://console.firebase.google.com/
   - プロジェクト「badsnsn-q2xa94」を選択

2. **Authentication設定を開く**
   - 左メニューから「Authentication」を選択
   - 「Sign-in method」タブをクリック

3. **Google認証を有効化**
   - プロバイダリストから「Google」を選択
   - 「有効にする」をONに切り替え
   - **プロジェクトのサポートメール**を設定（必須）
   - 「保存」をクリック

4. **承認済みドメインの確認**
   - 「Settings」タブを選択
   - 「Authorized domains」セクションで以下が含まれていることを確認：
     - localhost
     - あなたの本番ドメイン（もしあれば）

## ローカル開発環境での確認事項

1. **ブラウザの設定**
   - ポップアップブロッカーが無効になっていることを確認
   - サードパーティCookieが許可されていることを確認

2. **開発サーバーのURL**
   - http://localhost:3000 でアクセスしていることを確認
   - HTTPSは不要（localhostは自動的に許可される）

## よくあるエラーと対処法

### エラー: "auth/operation-not-allowed"
- **原因**: Firebase ConsoleでGoogle認証が無効
- **対処**: 上記の手順3を実行

### エラー: "auth/unauthorized-domain"
- **原因**: 現在のドメインが承認されていない
- **対処**: Firebase Console > Authentication > Settings > Authorized domainsに追加

### エラー: "auth/popup-blocked"
- **原因**: ブラウザがポップアップをブロック
- **対処**: ブラウザの設定でlocalhost:3000のポップアップを許可

### エラー: "auth/popup-closed-by-user"
- **原因**: ユーザーがGoogleログイン画面を閉じた
- **対処**: ユーザーに再度試してもらう

## デバッグ方法

ブラウザの開発者ツール（F12）のコンソールで以下を確認：
- `Google認証エラー:` のログ
- `エラーコード:` のログ

これらの情報を元に、上記の対処法を試してください。