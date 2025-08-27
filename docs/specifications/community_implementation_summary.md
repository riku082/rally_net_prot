# Rally Net コミュニティ機能実装まとめ

## 実装日: 2025年8月27日

## 概要
Rally Netにコミュニティ機能（フェーズ1）を実装しました。この機能により、バドミントンコミュニティがスケジュールを共有し、参加者を募集し、練習メニューを添付できるようになりました。

## 実装した主要機能

### 1. コミュニティ管理
- **コミュニティの作成・編集・削除**
  - コミュニティ名、説明、公開/非公開設定
  - カテゴリー（初心者、中級者、上級者、競技志向、カジュアル等）
  - 活動地域の設定
  
- **ビジュアル機能**
  - ヘッダー画像のアップロードと表示
  - サムネイル画像（トップ画像）のアップロードと表示
  - Firebase Storageを使用した画像管理

### 2. イベント管理システム
- **イベントの作成・編集**
  - タイトル、日時、場所、定員設定
  - 練習カードの添付機能
  - ステータス管理（下書き、公開、キャンセル、完了）

- **出欠管理**
  - 参加状況の登録（参加、不参加、保留）
  - リアルタイム参加者数表示
  - 定員管理

- **カレンダー機能**
  - 月間カレンダービュー
  - 個人カレンダーとの同期（5分間隔のバッチ処理）
  - イベント一覧表示

### 3. メンバー管理
- **メンバー一覧**
  - メンバーの表示と検索機能
  - プロフィール情報との連携
  - ロールベースのアクセス制御（オーナー、管理者、メンバー）

- **プロフィール連携**
  - ユーザープロフィールページへのリンク
  - アバター、ポジション、経験値の表示
  - アクティブステータス管理

### 4. 技術的な実装

#### データモデル（Firestore）
```typescript
// Community型を拡張
interface Community {
  headerImageUrl?: string;  // ヘッダー画像
  topImageUrl?: string;     // サムネイル画像
  category?: string;        // カテゴリー
  location?: string;        // 活動地域
}

// イベント管理
interface CommunityEvent {
  id: string;
  communityId: string;
  title: string;
  startDateTime: string;
  endDateTime: string;
  location: string;
  practiceCardIds?: string[];
  maxParticipants?: number;
  status: EventStatus;
}

// 参加管理
interface EventParticipation {
  eventId: string;
  userId: string;
  status: AttendanceStatus;
}
```

#### Firebase設定
- **Firestore インデックス**: イベント、参加、メンバーのクエリ最適化
- **Storage ルール**: 認証ユーザーによる画像アップロード許可
- **セキュリティ**: ロールベースのアクセス制御

#### API実装
- `/api/calendar/sync`: カレンダー同期エンドポイント
- バッチ処理による5分間隔の自動同期

## 解決した問題

### 1. Firebase複合クエリエラー
- **問題**: `Query requires index`エラー
- **解決**: シンプルなクエリとクライアントサイドフィルタリングの組み合わせ

### 2. サイドバー表示問題
- **問題**: コミュニティページでサイドバーが表示されない
- **解決**: `community/layout.tsx`にSidebarコンポーネントを追加

### 3. コミュニティ作成ボタン
- **問題**: ボタンが機能しない
- **解決**: `CreateCommunityModal`コンポーネントの実装

### 4. 404エラー
- **問題**: `/community/[id]/events`ページが存在しない
- **解決**: イベント一覧と編集ページの作成

### 5. Firebase Storage権限エラー
- **問題**: 画像アップロード時の権限エラー
- **解決**: `storage.rules`に`communities`パスのルール追加

### 6. Firestore undefined値エラー
- **問題**: `undefined`値によるFirestoreエラー
- **解決**: 条件付きフィールド追加と`null`値の使用

## ファイル構成

```
src/
├── app/community/
│   ├── page.tsx                           # コミュニティ一覧
│   ├── layout.tsx                          # レイアウト（サイドバー付き）
│   └── [communityId]/
│       ├── page.tsx                        # コミュニティ詳細
│       ├── settings/page.tsx               # 設定ページ
│       ├── members/page.tsx                # メンバー一覧
│       ├── calendar/page.tsx               # カレンダー
│       ├── events/
│       │   ├── page.tsx                    # イベント一覧
│       │   ├── new/page.tsx                # イベント作成
│       │   └── [eventId]/
│       │       ├── page.tsx                # イベント詳細
│       │       └── edit/page.tsx           # イベント編集
├── components/community/
│   ├── CreateCommunityModal.tsx            # コミュニティ作成モーダル
│   ├── EventForm.tsx                       # イベントフォーム
│   ├── AttendanceManager.tsx               # 出欠管理
│   └── CommunityCalendar.tsx              # カレンダーコンポーネント
├── types/community.ts                      # 型定義
├── context/CommunityContext.tsx            # 状態管理
└── api/calendar/sync/route.ts             # カレンダー同期API
```

## 今後の改善点（フェーズ2以降）

1. **通知機能**
   - イベント作成・変更通知
   - リマインダー機能

2. **コメント機能**
   - イベントへのコメント
   - ディスカッション機能

3. **権限管理の強化**
   - より細かい権限設定
   - 招待システム

4. **パフォーマンス最適化**
   - 画像の自動リサイズ
   - キャッシュ戦略の改善

5. **モバイル対応**
   - レスポンシブデザインの改善
   - モバイル専用UI

## コミット情報
- **ブランチ**: `community`
- **コミットハッシュ**: `7378f88`
- **変更ファイル数**: 21
- **追加行数**: 5573

## 使用技術
- Next.js 15 (App Router)
- TypeScript
- Firebase (Firestore, Storage, Auth)
- Tailwind CSS
- Lucide Icons

## テスト手順
1. コミュニティの作成
2. ヘッダー画像とサムネイル画像のアップロード
3. イベントの作成（練習カード添付）
4. メンバーの招待と管理
5. カレンダー表示と同期確認

---
実装者: Claude Code  
日付: 2025年8月27日