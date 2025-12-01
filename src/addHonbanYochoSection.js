import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const promptsPath = path.join(__dirname, '..', 'prompts.json');

/**
 * 「本番への予兆」セクションを追加し、該当するシーンのセクションを変更
 */
async function addHonbanYochoSection() {
  console.log('=== 「本番への予兆」セクションを追加 ===\n');
  
  const data = await fs.readJson(promptsPath);
  
  // 「本番への予兆」に変更すべきシーンを特定
  const targetSceneTags = [
    '素股している',
    '挿入を待っている'
  ];
  
  let changedCount = 0;
  
  for (const scene of data.scenes) {
    if (targetSceneTags.includes(scene.tag)) {
      const oldSection = scene.section;
      scene.section = '本番への予兆';
      console.log(`✅ ${scene.tag}`);
      console.log(`   セクション変更: ${oldSection} → 本番への予兆`);
      console.log(`   ID: ${scene.id}`);
      changedCount++;
    }
  }
  
  if (changedCount === 0) {
    console.log('⚠️ 変更対象のシーンが見つかりませんでした');
    return;
  }
  
  // バックアップを作成
  const backupPath = promptsPath + '.backup.' + Date.now();
  await fs.writeJson(backupPath, data, { spaces: 2 });
  console.log(`\n📦 バックアップを作成しました: ${backupPath}`);
  
  // 変更を保存
  await fs.writeJson(promptsPath, data, { spaces: 2 });
  
  console.log(`\n✅ ${changedCount}件のシーンのセクションを「本番への予兆」に変更しました`);
  console.log(`📝 ${promptsPath} を更新しました`);
}

addHonbanYochoSection().catch(error => {
  console.error('エラー:', error);
  process.exit(1);
});

