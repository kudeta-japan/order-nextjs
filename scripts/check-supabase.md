# Supabase動作確認方法

## 方法1: テストスクリプトを実行（推奨）

ターミナルで以下を実行:

```bash
cd /Users/sasakiyuya/Desktop/cursor/order/order-nextjs
npm install  # dotenvをインストール（初回のみ）
npx tsx scripts/test-supabase.ts
```

このスクリプトは以下をテストします:
- ✅ Supabaseへの接続
- ✅ ordersテーブルの存在確認
- ✅ データの挿入（UPSERT）
- ✅ データの取得
- ✅ リアルタイム購読

## 方法2: ブラウザのコンソールで確認

1. ブラウザでアプリを開く（http://localhost:3008）
2. 開発者ツールを開く（F12 または Cmd+Option+I）
3. 「Console」タブを開く
4. 以下を確認:

### エラーの確認
- `Error fetching orders:` などのエラーが出ていないか
- `Realtime update:` のログが出ているか（リアルタイム同期が動作している証拠）

### 手動テスト
コンソールに以下を入力して実行:

```javascript
// Supabase接続確認
fetch('/api/test-supabase').then(r => r.json()).then(console.log)
```

## 方法3: Supabaseダッシュボードで確認

1. https://supabase.com/dashboard にログイン
2. プロジェクトを選択
3. 「Table Editor」を開く
4. `orders` テーブルを確認
5. 発注データを入力して、データが保存されているか確認

## 確認ポイント

### ✅ 正常な場合
- ブラウザのコンソールにエラーが出ない
- 発注数を変更すると「保存済み」と表示される
- 別のブラウザ/タブで開いても同じデータが表示される（リアルタイム同期）
- Supabaseダッシュボードでデータが確認できる

### ❌ 問題がある場合
- ブラウザのコンソールに `Error fetching orders:` などのエラーが出る
- 「オフライン」と表示される
- データが保存されない
- リアルタイム同期が動作しない

## よくある問題と解決方法

### 1. 「オフライン」と表示される
- `.env.local` の認証情報を確認
- Supabaseダッシュボードでテーブルが作成されているか確認
- RLSポリシーが正しく設定されているか確認

### 2. データが保存されない
- Supabaseダッシュボードの「Table Editor」でテーブル構造を確認
- ブラウザのコンソールでエラーを確認
- RLSポリシーが `FOR ALL USING (true) WITH CHECK (true)` になっているか確認

### 3. リアルタイム同期が動作しない
- Supabaseダッシュボードの「Replication」で `orders` テーブルが有効になっているか確認
- `ALTER PUBLICATION supabase_realtime ADD TABLE orders;` が実行されているか確認
