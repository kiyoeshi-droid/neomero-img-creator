# Vercelデプロイ手順

## 方法1: GitHub経由でデプロイ（推奨）

### ステップ1: Gitリポジトリを初期化

```bash
# Gitリポジトリを初期化
git init

# ファイルをステージング
git add .

# 初回コミット
git commit -m "Initial commit"
```

### ステップ2: GitHubにリポジトリを作成

1. GitHubにログイン
2. 右上の「+」→「New repository」をクリック
3. リポジトリ名を入力（例: `neomero-img-creator`）
4. 「Create repository」をクリック

### ステップ3: GitHubにプッシュ

```bash
# GitHubリポジトリのURLを追加（YOUR_USERNAMEとYOUR_REPO_NAMEを置き換え）
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# メインブランチを設定
git branch -M main

# GitHubにプッシュ
git push -u origin main
```

### ステップ4: Vercelでデプロイ

1. [Vercel](https://vercel.com)にアクセスしてログイン
2. 「Add New...」→「Project」をクリック
3. 「Import Git Repository」でGitHubリポジトリを選択
4. プロジェクト設定：
   - **Framework Preset**: Other
   - **Root Directory**: `./`（そのまま）
   - **Build Command**: （空欄のまま）
   - **Output Directory**: （空欄のまま）
5. 「Deploy」をクリック

デプロイが完了すると、URLが表示されます！

---

## 方法2: Vercel CLIで直接デプロイ

### ステップ1: Vercel CLIをインストール

```bash
npm i -g vercel
```

### ステップ2: ログイン

```bash
vercel login
```

### ステップ3: デプロイ

```bash
# プロジェクトディレクトリで実行
vercel

# 初回は質問に答える：
# - Set up and deploy? Y
# - Which scope? （自分のアカウントを選択）
# - Link to existing project? N
# - Project name? （そのままEnter）
# - Directory? （そのままEnter）
```

### ステップ4: 本番環境にデプロイ

```bash
vercel --prod
```

---

## 注意事項

⚠️ **データの永続化について**

現在の実装では、Vercel上では`prompts.json`への書き込みができません（読み取り専用ファイルシステムのため）。

データを保存するには、以下のいずれかが必要です：

1. **Vercel Postgres**（推奨）
2. **MongoDB Atlas**
3. **Supabase**
4. **その他のデータベースサービス**

データベースを導入する場合は、`api/index.js`を修正してデータベース接続を追加してください。

---

## トラブルシューティング

### エラー: "Cannot find module"

`package.json`の依存関係が正しくインストールされているか確認してください。

### エラー: "File not found"

`vercel.json`の設定を確認してください。

### APIが動作しない

Vercelのダッシュボードで「Functions」タブを確認し、エラーログを確認してください。

