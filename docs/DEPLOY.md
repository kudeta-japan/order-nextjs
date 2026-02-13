# デプロイ手順

## 方法1: Vercelにデプロイ（推奨・最も簡単）

VercelはNext.jsの開発元が提供するホスティングサービスで、無料で使えます。

### 手順

1. **Vercelアカウント作成**
   - https://vercel.com にアクセス
   - GitHubアカウントでサインアップ（推奨）

2. **プロジェクトをGitHubにプッシュ**
   ```bash
   cd /Users/sasakiyuya/Desktop/cursor/order/order-nextjs
   git init
   git add .
   git commit -m "Initial commit"
   # GitHubでリポジトリを作成してから
   git remote add origin https://github.com/your-username/order-nextjs.git
   git push -u origin main
   ```

3. **Vercelでプロジェクトをインポート**
   - Vercelダッシュボードで「New Project」をクリック
   - GitHubリポジトリを選択
   - 環境変数を設定:
     - `NEXT_PUBLIC_SUPABASE_URL`: SupabaseのURL
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabaseのanon key
   - 「Deploy」をクリック

4. **完了**
   - 数分でデプロイ完了
   - `https://your-project.vercel.app` でアクセス可能

### メリット
- ✅ 自動デプロイ（GitHubにプッシュするだけで更新）
- ✅ HTTPS対応
- ✅ 無料プランで十分
- ✅ 高速CDN

---

## 方法2: ku-deta.jpのサーバーに静的エクスポート

ku-deta.jpのサーバーにアップロードする場合、静的エクスポートを使用します。

### 手順

1. **next.config.jsを更新**
   ```javascript
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     reactStrictMode: true,
     output: 'export', // 静的エクスポートを有効化
     images: {
       unoptimized: true, // 画像最適化を無効化（静的エクスポート用）
     },
   }
   
   module.exports = nextConfig
   ```

2. **ビルド**
   ```bash
   cd /Users/sasakiyuya/Desktop/cursor/order/order-nextjs
   npm run build
   ```

3. **outディレクトリをサーバーにアップロード**
   - `out/` ディレクトリの中身をサーバーの公開ディレクトリ（例: `public_html/` や `www/`）にアップロード
   - FTP、SFTP、またはサーバーの管理画面からアップロード

4. **環境変数の設定**
   - 静的エクスポートの場合、環境変数はビルド時に埋め込まれます
   - `.env.local` の内容がビルド時に使用されます
   - **注意**: `.env.local` はGitにコミットしないでください（`.gitignore`に追加済み）

### 注意事項
- ⚠️ 静的エクスポートの場合、サーバーサイドの機能（API Routesなど）は使えません
- ⚠️ 環境変数はビルド時に埋め込まれるため、ビルド後に変更できません
- ⚠️ Supabaseの認証情報がJavaScriptに含まれるため、anon keyは公開されても問題ありませんが、service_role keyは絶対に使わないでください

---

## 方法3: Node.jsサーバーで実行

ku-deta.jpのサーバーでNode.jsが使える場合。

### 手順

1. **サーバーにファイルをアップロード**
   ```bash
   # ローカルで
   cd /Users/sasakiyuya/Desktop/cursor/order/order-nextjs
   npm run build
   
   # サーバーにアップロード（.next, public, package.json, node_modulesなど）
   ```

2. **サーバーで実行**
   ```bash
   # サーバー上で
   npm install --production
   npm start
   ```

3. **PM2で常時起動（推奨）**
   ```bash
   npm install -g pm2
   pm2 start npm --name "order-app" -- start
   pm2 save
   pm2 startup
   ```

4. **環境変数の設定**
   - サーバー上で `.env.local` を作成
   - Supabaseの認証情報を設定

---

## 推奨: Vercelを使う理由

1. **簡単**: GitHubにプッシュするだけで自動デプロイ
2. **無料**: 個人プロジェクトなら無料プランで十分
3. **高速**: グローバルCDNで高速アクセス
4. **自動HTTPS**: SSL証明書が自動で設定される
5. **スケーラブル**: トラフィックが増えても自動でスケール

---

## 環境変数の管理

### Vercelの場合
- Vercelダッシュボードの「Settings」→「Environment Variables」で設定
- 本番環境、プレビュー環境、開発環境で別々に設定可能

### 静的エクスポートの場合
- `.env.local` に設定してから `npm run build`
- ビルド後に環境変数は変更できない

### Node.jsサーバーの場合
- サーバー上で `.env.local` を作成
- または環境変数として設定

---

## トラブルシューティング

### ビルドエラーが出る場合
```bash
# キャッシュをクリアして再ビルド
rm -rf .next
npm run build
```

### 環境変数が読み込まれない場合
- `.env.local` が正しい場所にあるか確認
- 環境変数名が `NEXT_PUBLIC_` で始まっているか確認
- ビルド後に変更した場合は再ビルドが必要

### Supabase接続エラーが出る場合
- Supabaseダッシュボードでテーブルが作成されているか確認
- RLSポリシーが正しく設定されているか確認
- 環境変数が正しく設定されているか確認
