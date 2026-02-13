# 発注アシスト Cloud Biz (Next.js版)

KU-DETA 発注 webアプリのNext.js + Tailwind + Supabase版です。

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Supabase設定

1. `.env.local.example` を `.env.local` にコピー
2. Supabaseダッシュボードから以下を取得して `.env.local` に設定:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

詳細は `docs/SUPABASE_SETUP.md` を参照してください。

### 3. 開発サーバー起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開きます。

## デプロイ

### Vercel（推奨）

1. GitHubリポジトリにプッシュ
2. https://vercel.com でプロジェクトをインポート
3. 環境変数を設定
4. デプロイ完了

詳細は `docs/DEPLOY.md` を参照してください。

## 主な機能

- ✅ リアルタイム同期（Supabase Realtime）
- ✅ 発注数・在庫入力
- ✅ 業者・品目マスタ管理
- ✅ 発注内容確認・コピー
- ✅ 発注確定機能
- ✅ モバイル対応（iPad/iPhone）

## 技術スタック

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Realtime**: Supabase Realtime
