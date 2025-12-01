import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const promptsPath = path.join(__dirname, '..', 'prompts.json');

function fixTitle(title) {
  if (!title) return title;
  
  let fixed = title;
  
  // 「で」が抜けている箇所を修正
  fixed = fixed
    .replace(/正常位挿入/g, '正常位で挿入')
    .replace(/騎乗位挿入/g, '騎乗位で挿入')
    .replace(/後背位挿入/g, '後背位で挿入')
    .replace(/松葉崩し挿入/g, '松葉崩しで挿入');
  
  return fixed;
}

async function fixSceneTitles() {
  try {
    const data = await fs.readJson(promptsPath);
    
    if (!data.scenes) {
      console.log('シーンデータが見つかりません');
      return;
    }
    
    let updatedCount = 0;
    
    data.scenes.forEach(scene => {
      const originalTag = scene.tag;
      const fixedTag = fixTitle(originalTag);
      
      if (originalTag !== fixedTag) {
        console.log(`"${originalTag}" → "${fixedTag}"`);
        scene.tag = fixedTag;
        updatedCount++;
      }
    });
    
    await fs.writeJson(promptsPath, data, { spaces: 2 });
    console.log(`\n合計 ${updatedCount} 個のシーンのタイトルを修正しました。`);
    
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

fixSceneTitles();

