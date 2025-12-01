import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROMPTS_PATH = path.join(__dirname, '..', 'prompts.json');

async function cleanupSceneTags() {
  try {
    console.log('prompts.json を読み込み中...');
    const data = await fs.readJson(PROMPTS_PATH);
    
    if (data.scenes && Array.isArray(data.scenes)) {
      console.log(`${data.scenes.length} 件のシーンデータを処理中...`);
      
      // 置換ルール（順序重要：詳細なものを先に）
      const replacements = [
        { from: /着衣状態の/g, to: '' },
        { from: /着衣状態で/g, to: '' },
        { from: /着衣/g, to: '' },
        { from: /下着状態の/g, to: '' },
        { from: /下着状態で/g, to: '' },
        { from: /下着/g, to: '' },
        { from: /全裸状態の/g, to: '' },
        { from: /全裸状態で/g, to: '' },
        { from: /全裸で/g, to: '' },
        { from: /全裸/g, to: '' },
        { from: /上半身脱衣状態で/g, to: '' },
        { from: /下半身脱衣状態で/g, to: '' },
        { from: /下半身は脱衣かつ上半身は下着で/g, to: '' },
        { from: /下半身脱衣かつ上半身は下着で/g, to: '' },
        { from: /下半身は脱衣かつ上半身は下着/g, to: '' },
        { from: /上半身脱衣/g, to: '' },
        { from: /下半身脱衣/g, to: '' },
      ];

      data.scenes = data.scenes.map(scene => {
        let newTag = scene.tag;
        
        replacements.forEach(rule => {
          newTag = newTag.replace(rule.from, rule.to);
        });

        // 不要な文字の削除などのクリーンアップ
        // 例: "している" を削除して名詞化するなどはお好みで
        
        // ボディ情報の削除（念のためここでも）
        delete scene.body;

        return {
          ...scene,
          tag: newTag.trim()
        };
      });
      
      // 重複したタグがある場合、統合するかそのままにするか...
      // ここでは単純にタグ名だけ更新して保存する
      
      console.log('タグ名を更新し、bodyフィールドを削除しました。');
      
      await fs.writeJson(PROMPTS_PATH, data, { spaces: 2 });
      console.log('prompts.json を更新しました。');
    }
    
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

cleanupSceneTags();

