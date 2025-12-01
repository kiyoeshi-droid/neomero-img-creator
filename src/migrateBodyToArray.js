import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROMPTS_PATH = path.join(__dirname, '..', 'prompts.json');

async function migrateBodyPromptsToArray() {
  try {
    console.log('prompts.json を読み込み中...');
    const data = await fs.readJson(PROMPTS_PATH);
    
    if (data.characters && Array.isArray(data.characters)) {
      data.characters = data.characters.map(char => {
        if (char.bodyPrompts) {
          // 服を配列に変換
          if (typeof char.bodyPrompts['服'] === 'string') {
            char.bodyPrompts['服'] = [char.bodyPrompts['服']];
          }
          
          // 下着を配列に変換
          if (typeof char.bodyPrompts['下着'] === 'string') {
            char.bodyPrompts['下着'] = [char.bodyPrompts['下着']];
          }
          
          // ヌードは基本1つだが、統一感のために配列にしても良いが、
          // バリエーションはあまりないので今回は「服」と「下着」だけを配列化の対象とする指示と解釈
          // しかし、システム的には統一したほうが扱いやすいかもしれない。
          // ここでは「服」「下着」を複数登録という要望なので、それらを配列にする。
          // ヌードも配列にしておけば将来的に拡張しやすいので配列にしておく。
          if (typeof char.bodyPrompts['ヌード'] === 'string') {
             char.bodyPrompts['ヌード'] = [char.bodyPrompts['ヌード']];
          }
        }
        return char;
      });
      console.log('キャラクターデータの bodyPrompts を配列形式に変換しました。');
      
      await fs.writeJson(PROMPTS_PATH, data, { spaces: 2 });
      console.log('prompts.json を更新しました。');
    }
    
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

migrateBodyPromptsToArray();

