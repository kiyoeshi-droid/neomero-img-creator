import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const promptsPath = path.join(__dirname, '..', 'prompts.json');

async function fixKuppaScenes() {
  try {
    const data = await fs.readJson(promptsPath);
    
    if (!data.scenes) {
      console.log('シーンデータが見つかりません');
      return;
    }
    
    let updatedCount = 0;
    
    data.scenes.forEach(scene => {
      if (scene.tag && scene.tag.includes('くぱ')) {
        const originalPrompt = scene.prompt || '';
        
        // embarrassedをプロンプトから削除
        let newPrompt = originalPrompt
          .replace(/,\s*embarrassed/gi, '')
          .replace(/embarrassed\s*,/gi, '')
          .replace(/\bembarrassed\b/gi, '')
          .replace(/\s*,\s*,/g, ',')
          .replace(/,\s*$/, '')
          .replace(/^\s*,/, '')
          .trim();
        
        // 感情にembarrassed系を追加（まだない場合）
        const existingExprs = scene.expressions || [];
        if (!existingExprs.includes('expr_1') && !existingExprs.includes('expr_2') && !existingExprs.includes('expr_3')) {
          scene.expressions = [...new Set([...existingExprs, 'expr_1', 'expr_2', 'expr_3'])]; // 照れ・赤面系
        }
        
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

fixKuppaScenes();

