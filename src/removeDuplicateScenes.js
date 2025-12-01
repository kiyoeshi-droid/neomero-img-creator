import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const promptsPath = path.join(__dirname, '..', 'prompts.json');

async function removeDuplicateScenes() {
  try {
    const data = await fs.readJson(promptsPath);
    
    if (!data.scenes) {
      console.log('シーンデータが見つかりません');
      return;
    }
    
    const seen = new Map();
    const uniqueScenes = [];
    const duplicates = [];
    
    data.scenes.forEach(scene => {
      // tagとpromptの組み合わせで重複を判定
      const key = `${scene.tag || ''}|${scene.prompt || ''}`;
      
      if (seen.has(key)) {
        duplicates.push(scene);
        console.log(`重複を検出: "${scene.tag}" (ID: ${scene.id}) - 既存: ${seen.get(key).id}`);
      } else {
        seen.set(key, scene);
        uniqueScenes.push(scene);
      }
    });
    
    console.log(`\n重複シーン: ${duplicates.length} 個`);
    console.log(`ユニークなシーン: ${uniqueScenes.length} 個`);
    
    data.scenes = uniqueScenes;
    
    await fs.writeJson(promptsPath, data, { spaces: 2 });
    console.log(`\n重複を削除しました。合計 ${uniqueScenes.length} 個のシーンが残りました。`);
    
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

removeDuplicateScenes();

