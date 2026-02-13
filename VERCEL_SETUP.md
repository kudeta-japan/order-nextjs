# Vercelデプロイ手順

## 方法1: Web UIを使う（推奨・最も簡単）

### ステップ1: GitHubリポジトリを作成

1. **GitHubでリポジトリを作成**
   - https://github.com/new にアクセス
   - リポジトリ名: `order-nextjs`（任意）
   - Public または Private を選択
   - 「Create repository」をクリック

2. **ローカルでGitを初期化してプッシュ**
   ```bash
   cd /Users/sasakiyuya/Desktop/cursor/order/order-nextjs
   
   # Gitを初期化
   git init
   git add .
   git commit -m "Initial commit"
   
   # GitHubリポジトリを追加（上で作成したリポジトリのURLに置き換え）
   git remote add origin https://github.com/your-username/order-nextjs.git
   git branch -M main
   git push -u origin main
   ```

### ステップ2: Vercelでデプロイ

1. **Vercelアカウント作成**
   - https://vercel.com にアクセス
   - 「Sign Up」をクリック
   - 「Continue with GitHub」を選択してGitHubアカウントでサインアップ

2. **プロジェクトをインポート**
   - ダッシュボードで「Add New...」→「Project」をクリック
   - GitHubリポジトリ一覧から `order-nextjs` を選択
   - 「Import」をクリック

3. **環境変数を設定**
   - 「Environment Variables」セクションで以下を追加:
     - **Name**: `NEXT_PUBLIC_SUPABASE_URL`
     - **Value**: SupabaseのURL（`.env.local`からコピー）
     - **Environment**: Production, Preview, Development すべてにチェック
   
   - もう1つ追加:
     - **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - **Value**: Supabaseのanon key（`.env.local`からコピー）
     - **Environment**: Production, Preview, Development すべてにチェック

4. **デプロイ**
   - 「Deploy」をクリック
   - 数分待つとデプロイ完了
   - `https://your-project.vercel.app` でアクセス可能

### ステップ3: カスタムドメイン設定（オプション）

ku-deta.jpのドメインを使いたい場合:

1. Vercelダッシュボードでプロジェクトを開く
2. 「Settings」→「Domains」を開く
3. ドメインを入力（例: `order.ku-deta.jp`）
4. DNS設定の指示に従って設定

---

## 方法2: Vercel CLIを使う

### インストール

```bash
npm install -g vercel
```

### デプロイ

```bash
cd /Users/sasakiyuya/Desktop/cursor/order/order-nextjs

# ログイン
vercel login

# デプロイ
vercel

# 本番環境にデプロイ
vercel --prod
```

環境変数は対話形式で設定できます。

---

## 自動デプロイ

GitHubにプッシュするたびに自動でデプロイされます。

```bash
git add .
git commit -m "Update"
git push
```

Vercelが自動で検知してデプロイを開始します。

---

## トラブルシューティング

### ビルドエラーが出る場合

1. Vercelダッシュボードの「Deployments」でエラーログを確認
2. 環境変数が正しく設定されているか確認
3. ローカルで `npm run build` が成功するか確認

### 環境変数が読み込まれない場合

- 環境変数名が `NEXT_PUBLIC_` で始まっているか確認
- Production, Preview, Development すべてに設定されているか確認
- デプロイ後に再デプロイが必要な場合があります

### Supabase接続エラーが出る場合

- Supabaseダッシュボードでテーブルが作成されているか確認
- RLSポリシーが正しく設定されているか確認
- 環境変数が正しく設定されているか確認
