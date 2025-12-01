import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROMPTS_PATH = path.join(__dirname, '..', 'prompts.json');

async function deleteAllScenes() {
  try {
    console.log('prompts.json を読み込み中...');
    const data = await fs.readJson(PROMPTS_PATH);
    
    if (data.scenes) {
      const count = data.scenes.length;
      data.scenes = [];
      console.log(`${count} 件のシーンデータを削除しました。`);
      
      await fs.writeJson(PROMPTS_PATH, data, { spaces: 2 });
      console.log('prompts.json を更新しました。');
    } else {
      console.log('シーンデータはありませんでした。');
    }
    
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

deleteAllScenes();

