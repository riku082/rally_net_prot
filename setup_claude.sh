#!/bin/bash

echo "Claude設定自動化スクリプト"
echo "=========================="

# APIキーの確認
if [ -z "$CLAUDE_API_KEY" ]; then
    echo "❌ CLAUDE_API_KEYが設定されていません"
    echo "以下の手順を実行してください："
    echo "1. VPNを無効化"
    echo "2. https://console.anthropic.com/ でAPIキーを取得"
    echo "3. 以下を実行: export CLAUDE_API_KEY=sk-ant-api03-..."
    exit 1
fi

echo "✅ APIキーが設定されています"

# Claudeコードの停止
echo "🔄 Claudeコードを停止中..."
pkill -f claude 2>/dev/null || echo "Claudeコードは既に停止しています"

# 設定ファイルの確認
if [ -f ".claude/settings.local.json" ]; then
    echo "✅ 設定ファイルが存在します"
else
    echo "❌ 設定ファイルが見つかりません"
    exit 1
fi

# Claudeコードの起動
echo "🚀 Claudeコードを起動中..."
claude &

echo "✅ 設定完了！"
echo "Claudeコードが起動しました。"
echo "新しいチャットを開始して動作確認してください。" 