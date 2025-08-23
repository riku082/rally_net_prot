# 📚 開発ログ管理ガイド

## 概要

Rally Net プロジェクトの開発ログを効率的に管理するためのガイドです。

## 📁 ファイル構成

```
/rallly_net/
├── DEVELOPMENT_LOG.md      # 日々の開発ログ（メインファイル）
├── DEVELOPMENT_SUMMARY.md   # 機能別の詳細まとめ
├── LOG_MANAGEMENT_GUIDE.md  # このファイル（管理ガイド）
└── scripts/
    └── daily-log.sh        # ログ管理補助スクリプト
```

## 🔄 日々のワークフロー

### 1. 作業開始時

```bash
# 本日のテンプレートを作成
./scripts/daily-log.sh start
```

または手動で：
1. `DEVELOPMENT_LOG.md` を開く
2. テンプレートをコピー
3. 本日の日付でセクション作成
4. 本日の目標を記入

### 2. 作業中

**実装時**:
- 機能ごとに実装内容を記録
- 重要なコードスニペットを保存
- ファイル名と変更箇所を明記

**問題発生時**:
- 問題の詳細を即座に記録
- 解決策を見つけたら追記
- 未解決の場合は「TODO」マークを付ける

**コミット時**:
```bash
# コミット後、ハッシュとメッセージを記録
git log --oneline -1
```

### 3. 作業終了時

```bash
# 本日の統計を表示
./scripts/daily-log.sh end
```

手動でのまとめ：
1. 完了項目にチェック ✅
2. 残タスクを明記
3. 重要な気づきを整理

## 📝 記録のベストプラクティス

### DO ✅

1. **即座に記録**
   - 実装完了後すぐに記録
   - 問題発生時にリアルタイムで記録

2. **具体的に記述**
   ```markdown
   ❌ 悪い例: バグを修正した
   ✅ 良い例: PracticeCardMobileEditor.tsx の returnTarget 状態追加で配球反映問題を解決
   ```

3. **コードサンプル追加**
   ```typescript
   // 重要な実装は必ずコード例を残す
   const [returnTarget, setReturnTarget] = useState<{x: number, y: number} | null>(null);
   ```

4. **ビジュアル要素活用**
   - 絵文字で視認性向上 🎯 💻 🐛 📝
   - チェックボックスでタスク管理
   - 見出しで構造化

### DON'T ❌

1. **曖昧な表現を避ける**
   - 「いろいろ修正」「細かい調整」

2. **後回しにしない**
   - 記憶が新鮮なうちに記録

3. **冗長になりすぎない**
   - 要点を簡潔に、でも具体的に

## 🔍 ログの活用方法

### 1. 問題解決の参照

```bash
# 過去の類似問題を検索
grep -n "状態同期" DEVELOPMENT_LOG.md
```

### 2. 進捗レポート作成

月次レポート作成時：
1. 該当月のセクションを抽出
2. 主要成果をまとめる
3. `DEVELOPMENT_SUMMARY.md` に追記

### 3. チーム共有

```bash
# 特定期間のログを抽出
sed -n '/## 📅 2024-08-01/,/## 📅 2024-08-31/p' DEVELOPMENT_LOG.md > august_report.md
```

## 🛠️ ツールとの連携

### VSCode 拡張機能推奨

1. **Markdown All in One**
   - 目次自動生成
   - プレビュー機能

2. **Markdown Emoji**
   - 絵文字サポート

3. **Git History**
   - コミット履歴の視覚化

### Git Hooks 設定（オプション）

```bash
# .git/hooks/post-commit
#!/bin/bash
echo "📝 コミット完了！DEVELOPMENT_LOG.md の更新を忘れずに！"
```

## 📊 月次・週次レビュー

### 週次レビューテンプレート

```markdown
## 📅 Week of [日付]

### 達成事項
- 

### 課題と改善点
- 

### 次週の優先事項
- 
```

### 月次サマリー作成

1. 全コミット数を集計
2. 主要機能の完成度を評価
3. 技術的債務の確認
4. 翌月の計画策定

## 🔄 ログのメンテナンス

### アーカイブ

```bash
# 3ヶ月以上前のログをアーカイブ
mkdir -p logs/archive
mv DEVELOPMENT_LOG_2024Q1.md logs/archive/
```

### バックアップ

```bash
# 定期バックアップ
cp DEVELOPMENT_LOG.md "backups/DEVELOPMENT_LOG_$(date +%Y%m%d).md"
```

## 💡 Tips & Tricks

1. **ショートカット作成**
   ```bash
   alias devlog="code DEVELOPMENT_LOG.md"
   alias logstart="./scripts/daily-log.sh start"
   alias logend="./scripts/daily-log.sh end"
   ```

2. **テンプレートスニペット**
   VSCode でスニペット登録して素早く入力

3. **自動化**
   GitHub Actions で日次サマリーを自動生成

## 📞 サポート

質問や改善提案がある場合：
1. Issue を作成
2. チームチャンネルで共有
3. ログファイル自体にTODOとして記載

---

*このガイドは継続的に改善されます。最終更新: 2024-08-23*