# Vercelデプロイ手順

## デプロイ方法

1. **Vercel CLIをインストール**（初回のみ）
   ```bash
   npm i -g vercel
   ```

2. **Vercelにログイン**
   ```bash
   vercel login
   ```

3. **プロジェクトをデプロイ**
   ```bash
   vercel
   ```

   初回は設定を聞かれます：
   - Set up and deploy? → **Yes**
   - Which scope? → 自分のアカウントを選択
   - Link to existing project? → **No**
   - What's your project's name? → `neomero-img-creator`（または任意の名前）
   - In which directory is your code located? → `./`

4. **本番環境にデプロイ**
   ```bash
   vercel --prod
   ```

## 注意事項

### ファイルシステムの制限

Vercelのサーバーレス環境では、ファイルシステムへの**書き込みができません**。

現在の実装では：
- ✅ **読み取り**: `prompts.json`の読み取りは可能（デプロイ時に含まれる）
- ❌ **書き込み**: キャラクター・ロケーション・シーンの追加・更新・削除は動作しません

### 書き込み機能を使う場合の対応

書き込み機能が必要な場合は、以下のいずれかの方法を使用してください：

1. **Vercel KV**（推奨）
   - Vercelが提供するKey-Valueストア
   - 簡単に統合可能

2. **MongoDB Atlas**
   - 無料プランあり
   - 柔軟なデータ構造

3. **Supabase**
   - PostgreSQLベース
   - 無料プランあり

4. **GitHubリポジトリに直接コミット**
   - 書き込み時にGitHub API経由でコミット
   - 複雑だが、バージョン管理が可能

## 現在の動作

- ✅ キャラクター・ロケーション・シーンの一覧表示
- ✅ プロンプト生成機能
- ❌ データの追加・更新・削除（読み取り専用）

## トラブルシューティング

### `prompts.json`が見つからない

デプロイ時に`prompts.json`が含まれていることを確認してください。
`.vercelignore`に`prompts.json`が含まれていないことを確認してください。

### APIエラーが発生する

Vercelのログを確認：
```bash
vercel logs
```

