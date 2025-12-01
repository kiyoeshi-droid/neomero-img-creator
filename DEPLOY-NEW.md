# 新しいVercelプロジェクト「neomero-prompt-creator」へのデプロイ手順

## デプロイ方法

### 方法1: Vercel CLIを使用（推奨）

```bash
# 1. プロジェクトディレクトリに移動
cd /Users/oshima-kiyoe/neomero-img-creator

# 2. Vercel CLIでログイン（まだの場合）
vercel login

# 3. 新しいプロジェクトとしてデプロイ
vercel

# プロジェクト名を聞かれたら「neomero-prompt-creator」と入力

# 4. 本番環境にデプロイ
vercel --prod
```

### 方法2: Vercelダッシュボードを使用

1. [vercel.com](https://vercel.com) にアクセス
2. 「Add New...」→「Project」をクリック
3. GitHubリポジトリをインポート、または「Import Git Repository」でリポジトリを選択
4. プロジェクト名を「neomero-prompt-creator」に設定
5. 「Deploy」をクリック

## デプロイされるファイル

以下のファイルがデプロイされます：
- ✅ `api/index.js` - APIエンドポイント
- ✅ `public/index.html` - フロントエンド
- ✅ `prompts.json` - データファイル（読み取り専用）
- ✅ `package.json` - 依存関係
- ✅ `vercel.json` - Vercel設定

以下のファイルは除外されます（`.vercelignore`で指定）：
- ❌ `node_modules/` - 依存関係（Vercelで自動インストール）
- ❌ `src/` - 開発用スクリプト
- ❌ `generated-images/` - 生成された画像
- ❌ `*.backup.*` - バックアップファイル

## 動作確認

デプロイ後、以下のURLでアクセスできます：
- プレビュー環境: `https://neomero-prompt-creator-xxxxx.vercel.app`
- 本番環境: `https://neomero-prompt-creator.vercel.app`

## 注意事項

- データの追加・更新・削除は読み取り専用モードのため動作しません（Vercelの制限）
- データの表示とプロンプト生成は正常に動作します

