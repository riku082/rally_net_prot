#!/bin/bash

# 現在のブランチ名を取得
CURRENT_BRANCH=$(git branch --show-current)

# ブランチごとの編集可能ファイルパターンを定義
get_allowed_pattern() {
    case "$1" in
        "practice-card")
            echo "src/components/Practice|src/app/practice|DEVELOPMENT_LOG|DEVELOPMENT_SUMMARY|LOG_MANAGEMENT_GUIDE|scripts/daily-log"
            ;;
        "authentication")
            echo "src/context/AuthContext|src/utils/auth|src/app/auth|src/components/EmailVerification|firestore.rules"
            ;;
        "news")
            echo "src/app/news|src/app/api/news|src/components/News"
            ;;
        "UI")
            echo "src/components/UI|src/styles|globals.css|tailwind.config"
            ;;
        "main")
            echo ".*" # mainブランチは全ファイル編集可能
            ;;
        *)
            echo ""
            ;;
    esac
}

# 許可パターンを取得
ALLOWED_PATTERN=$(get_allowed_pattern "$CURRENT_BRANCH")

# パターンが定義されていない場合
if [[ -z "$ALLOWED_PATTERN" ]]; then
    echo "⚠️  警告: ブランチ '$CURRENT_BRANCH' のファイル制限が定義されていません"
    echo "全ファイルの編集が許可されます"
    exit 0
fi

# mainブランチは制限なし
if [[ "$CURRENT_BRANCH" == "main" ]]; then
    exit 0
fi

# ステージングされたファイルを取得
STAGED_FILES=$(git diff --cached --name-only)

# 違反ファイルを格納
VIOLATION_FILES=""

# 各ファイルをチェック
for FILE in $STAGED_FILES; do
    # ファイルが許可パターンにマッチするか確認
    if ! echo "$FILE" | grep -qE "$ALLOWED_PATTERN"; then
        if [ -z "$VIOLATION_FILES" ]; then
            VIOLATION_FILES="$FILE"
        else
            VIOLATION_FILES="$VIOLATION_FILES\n$FILE"
        fi
    fi
done

# 違反があった場合
if [ -n "$VIOLATION_FILES" ]; then
    echo "❌ エラー: ブランチ '$CURRENT_BRANCH' では以下のファイルの編集は許可されていません:"
    echo ""
    echo -e "$VIOLATION_FILES" | while read FILE; do
        echo "  - $FILE"
    done
    echo ""
    echo "📋 このブランチで編集可能なファイル:"
    echo "  パターン: $ALLOWED_PATTERN"
    echo ""
    echo "💡 ヒント:"
    echo "  1. 適切なブランチに切り替える: git checkout <branch-name>"
    echo "  2. または、変更を取り消す: git reset HEAD <file>"
    echo ""
    exit 1
fi

echo "✅ ファイルチェック完了: 全てのファイルが '$CURRENT_BRANCH' ブランチで編集可能です"
exit 0