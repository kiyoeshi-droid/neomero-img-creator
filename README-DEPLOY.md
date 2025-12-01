# Vercelデプロイ手順（neomero-prompt-creator）

## 現在の状況

404エラーが出ている場合は、以下の手順で再デプロイしてください。

## デプロイ方法

### 方法1: Vercel CLI（推奨）

```bash
cd /Users/oshima-kiyoe/neomero-img-creator

# 1. Vercelにログイン（初回のみ）
vercel login

# 2. 新しいプロジェクトとしてデプロイ
vercel

# プロンプトが表示されたら：
# - Set up and deploy? → Yes
# - Which scope? → 自分のアカウントを選択
# - Link to existing project? → No
# - What's your project's name? → neomero-prompt-creator
# - In which directory is your code located? → ./

# 3. 本番環境にデプロイ
vercel --prod --yes
```

### 方法2: Vercelダッシュボード

1. [vercel.com](https://vercel.com) にアクセス
2. 「Add New...」→「Project」をクリック
3. GitHubリポジトリをインポート、または「Import Git Repository」でリポジトリを選択
4. プロジェクト名を「neomero-prompt-creator」に設定
5. **重要**: 「Root Directory」を確認（通常は`./`でOK）
6. 「Deploy」をクリック

## デプロイされるファイル

以下のファイルが自動的にデプロイされます：
- ✅ `public/index.html` - フロントエンド
- ✅ `api/index.js` - APIエンドポイント
- ✅ `prompts.json` - データファイル
- ✅ `package.json` - 依存関係
- ✅ `vercel.json` - Vercel設定

## トラブルシューティング

### 404エラーが出る場合

1. **デプロイが完了しているか確認**
   - Vercelダッシュボードでデプロイの状態を確認
   - 「Ready」になっているか確認

2. **プロジェクト名を確認**
   - Vercelダッシュボードでプロジェクト名が「neomero-prompt-creator」になっているか確認

3. **再デプロイを試す**
   ```bash
   vercel --prod --yes
   ```

### APIが動作しない場合

1. **APIエンドポイントを確認**
   - `https://neomero-prompt-creator.vercel.app/api/characters` にアクセス
   - JSONデータが返ってくるか確認

2. **ログを確認**
   ```bash
   vercel logs
   ```

## デプロイ後の確認

デプロイが成功したら、以下を確認してください：

1. **フロントエンド**: `https://neomero-prompt-creator.vercel.app/`
2. **API**: `https://neomero-prompt-creator.vercel.app/api/characters`

