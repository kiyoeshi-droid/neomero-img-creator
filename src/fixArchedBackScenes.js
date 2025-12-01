import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const promptsPath = path.join(__dirname, '..', 'prompts.json');

async function fixArchedBackScenes() {
  try {
    const data = await fs.readJson(promptsPath);
    
    if (!data.scenes) {
      console.log('シーンデータが見つかりません');
      return;
    }
    
    let updatedCount = 0;
    
    data.scenes.forEach(scene => {
      if (scene.tag && (scene.tag.includes('仰け反り') || scene.tag.includes('エビ反り') || scene.tag.includes('ブリッジ'))) {
        const originalPrompt = scene.prompt || '';
        
        // 感情表現をプロンプトから削除
        let newPrompt = originalPrompt
          .replace(/,\s*orgasm/gi, '')
          .replace(/orgasm\s*,/gi, '')
          .replace(/\borgasm\b/gi, '')
          .replace(/,\s*sweat/gi, '')
          .replace(/sweat\s*,/gi, '')
          .replace(/\bsweat\b/gi, '')
          .replace(/,\s*drool/gi, '')
          .replace(/drool\s*,/gi, '')
          .replace(/\bdrool\b/gi, '')
          .replace(/\s*,\s*,/g, ',')
          .replace(/,\s*$/, '')
          .replace(/^\s*,/, '')
          .trim();
        
        if (originalPrompt !== newPrompt) {
          console.log(`"${scene.tag}"`);
          console.log(`  プロンプト: "${originalPrompt}" → "${newPrompt}"`);
          scene.prompt = newPrompt;
          updatedCount++;
        }
      }
    });
    
    await fs.writeJson(promptsPath, data, { spaces: 2 });
    console.log(`\n合計 ${updatedCount} 個のシーンを更新しました。`);
    
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

fixArchedBackScenes();

