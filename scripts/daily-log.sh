#!/bin/bash

# Rally Net 開発ログ管理スクリプト
# 使用方法: ./scripts/daily-log.sh [start|end|add]

LOG_FILE="DEVELOPMENT_LOG.md"
TODAY=$(date +"%Y-%m-%d")

# 本日の作業開始
start_work() {
    echo "📅 本日（$TODAY）の開発を開始します..."
    
    # 本日のセクションが既に存在するか確認
    if grep -q "## 📅 $TODAY" "$LOG_FILE"; then
        echo "⚠️  本日のセクションは既に存在します"
    else
        # テンプレートを追加
        cat >> "$LOG_FILE" << EOF

## 📅 $TODAY

### 🎯 本日の目標
- [ ] 

### 💻 実装内容

### 🐛 問題と解決

### 📝 コミット履歴

### 📊 本日の成果

### 💡 メモ・気づき

---
EOF
        echo "✅ 本日のセクションを作成しました"
    fi
    
    # エディタで開く（VSCodeがインストールされている場合）
    if command -v code &> /dev/null; then
        code "$LOG_FILE"
    fi
}

# 本日の作業終了
end_work() {
    echo "📊 本日（$TODAY）の作業を集計します..."
    
    # Gitのコミット履歴を取得
    echo "📝 本日のコミット:"
    git log --since="$TODAY 00:00:00" --until="$TODAY 23:59:59" --oneline
    
    # 変更ファイル数を取得
    CHANGED_FILES=$(git diff --name-only HEAD~5..HEAD 2>/dev/null | wc -l)
    echo "📁 変更ファイル数: $CHANGED_FILES"
    
    # 追加/削除行数を取得
    STATS=$(git diff --shortstat HEAD~5..HEAD 2>/dev/null)
    echo "📈 変更統計: $STATS"
    
    echo ""
    echo "💡 DEVELOPMENT_LOG.md を更新してください"
}

# ログエントリー追加
add_entry() {
    echo "📝 新しいエントリーを追加します..."
    
    read -p "タイトル: " title
    read -p "内容: " content
    
    # 現在時刻を追加
    TIME=$(date +"%H:%M")
    
    # ログファイルの本日のセクションに追記
    # （実装は簡略化）
    echo "[$TIME] $title: $content" >> quick_notes.txt
    echo "✅ quick_notes.txt に追記しました"
}

# メイン処理
case "$1" in
    start)
        start_work
        ;;
    end)
        end_work
        ;;
    add)
        add_entry
        ;;
    *)
        echo "使用方法: $0 {start|end|add}"
        echo "  start - 本日の作業開始（テンプレート作成）"
        echo "  end   - 本日の作業終了（統計表示）"
        echo "  add   - クイックメモ追加"
        exit 1
        ;;
esac