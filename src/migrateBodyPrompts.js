import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROMPTS_PATH = path.join(__dirname, '..', 'prompts.json');

async function migrateBodyPrompts() {
  try {
    console.log('prompts.json を読み込み中...');
    const data = await fs.readJson(PROMPTS_PATH);
    
    // グローバルのbodyPromptsを取得（バックアップ用）
    const defaultBodyPrompts = data.bodyPrompts || {
      "服": "wearing clothes, casual outfit",
      "下着": "wearing underwear, lingerie",
      "ヌード": "nude, naked"
    };

    // 各キャラクターにbodyPromptsを追加
    if (data.characters && Array.isArray(data.characters)) {
      data.characters = data.characters.map(char => {
        if (!char.bodyPrompts) {
          char.bodyPrompts = { ...defaultBodyPrompts };
        }
        return char;
      });
      console.log('キャラクターデータに bodyPrompts を追加しました。');
    }

    // グローバルのbodyPromptsを削除
    delete data.bodyPrompts;
    console.log('グローバルの bodyPrompts を削除しました。');

    await fs.writeJson(PROMPTS_PATH, data, { spaces: 2 });
    console.log('prompts.json を更新しました。');
    
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

migrateBodyPrompts();

