#!/bin/bash
# 静的エクスポート用デプロイスクリプト

echo "=== 静的エクスポート用ビルド ==="

# next.config.jsを一時的に変更
cat > next.config.static.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
}
module.exports = nextConfig
EOF

# バックアップ
cp next.config.js next.config.backup.js
cp next.config.static.js next.config.js

echo "1. ビルド中..."
npm run build

# 元に戻す
cp next.config.backup.js next.config.js
rm next.config.backup.js next.config.static.js

echo ""
echo "=== ビルド完了 ==="
echo "out/ ディレクトリの中身をサーバーにアップロードしてください"
echo ""
echo "アップロード先: ku-deta.jpの公開ディレクトリ（例: public_html/ や www/）"
echo ""
echo "注意: .env.local の環境変数がビルド時に埋め込まれます"
echo "      Supabaseの認証情報が正しく設定されているか確認してください"
