# Neomero Image Creator

画像生成と動画生成を自動化するツール

## 機能

- キャラクター、ロケーション、シーンのプロンプト管理（Web CMS）
- プロンプト生成と画像生成の自動化
- PixAIとNeomero Studioとの連携

## ローカル開発

### セットアップ

```bash
npm install
```

### サーバー起動

```bash
npm run server
```

ブラウザで `http://localhost:3000` にアクセス

### 画像生成スクリプト

```bash
node src/generateAndCreateImage.js
```

## Vercelへのデプロイ

### 前提条件

- Vercelアカウント
- Vercel CLI（オプション）

### デプロイ手順

1. **Vercel CLIでデプロイ**（推奨）

```bash
npm i -g vercel
vercel
```

2. **GitHub連携でデプロイ**

   - GitHubリポジトリにプッシュ
   - Vercelダッシュボードで「New Project」を選択
   - リポジトリを選択
   - 設定は自動検出されるので「Deploy」をクリック

### 注意事項

- **PlaywrightはVercelでは動作しません**。画像生成スクリプト（`src/generateAndCreateImage.js`）はローカル環境でのみ実行してください。
- `prompts.json`はVercelの一時ファイルシステム（`/tmp`）に保存されます。永続化が必要な場合は、データベース（Vercel Postgres等）の使用を検討してください。

### 環境変数

現在は環境変数は不要ですが、将来的にデータベースを使用する場合は設定が必要です。

## プロジェクト構造

```
neomero-img-creator/
├── api/              # Vercel Serverless Functions
│   └── index.js      # APIエンドポイント
├── public/           # 静的ファイル
│   └── index.html    # Web CMS UI
├── src/              # ローカル実行用スクリプト
│   ├── server.js     # ローカル開発サーバー
│   ├── generateAndCreateImage.js  # 画像生成（ローカルのみ）
│   └── ...
├── prompts.json      # プロンプトデータ（ローカル）
├── vercel.json       # Vercel設定
└── package.json
```

## ライセンス

MIT
