import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const promptsPath = path.join(__dirname, '..', 'prompts.json');

function cleanTitle(title) {
  if (!title) return title;
  
  let cleaned = title;
  
  // 上半身・下半身・脱衣に関する記述を削除（順序重要）
  cleaned = cleaned
    .replace(/下半身はかつ上半身は脱衣状態で/g, '')
    .replace(/下半身は脱衣かつ上半身はで/g, '')
    .replace(/かつ上半身はで/g, '')
    .replace(/上半身は脱衣状態で/g, '')
    .replace(/下半身は脱衣かつ/g, '')
    .replace(/下半身はかつ/g, '')
    .replace(/上半身はで/g, '')
    .replace(/かつ上半身/g, '')
    .replace(/上半身は/g, '')
    .replace(/下半身は/g, '')
    .replace(/脱衣状態で/g, '')
    .replace(/脱衣かつ/g, '')
    .replace(/脱衣/g, '')
    .replace(/かつ/g, '');
  
  // 前後の不要な空白を削除
  cleaned = cleaned.trim();
  
  return cleaned;
}

async function cleanupSceneTitles() {
  try {
    const data = await fs.readJson(promptsPath);
    
    if (!data.scenes) {
      console.log('シーンデータが見つかりません');
      return;
    }
    
    let updatedCount = 0;
    
    data.scenes.forEach(scene => {
      const originalTag = scene.tag;
      const cleanedTag = cleanTitle(originalTag);
      
      if (originalTag !== cleanedTag) {
        console.log(`"${originalTag}" → "${cleanedTag}"`);
        scene.tag = cleanedTag;
        updatedCount++;
      }
    });
    
    await fs.writeJson(promptsPath, data, { spaces: 2 });
    console.log(`\n合計 ${updatedCount} 個のシーンのタイトルをクリーンアップしました。`);
    
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

cleanupSceneTitles();

