import { generateImage } from './imageGenerator.js';
import { generateVideo } from './videoGenerator.js';
import { 
  selectCharacter, 
  selectLocation, 
  selectScene, 
  selectVideoPrompt, 
  buildImagePrompt 
} from './promptBuilder.js';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * メイン実行関数
 */
async function main() {
  try {
    // 設定を読み込む
    const configPath = path.join(__dirname, '..', 'config.json');
    const config = await fs.readJson(configPath);

    // 出力ディレクトリを作成
    await fs.ensureDir(path.join(__dirname, '..', config.output.imageDir));
    await fs.ensureDir(path.join(__dirname, '..', config.output.videoDir));

    console.log('=== 画像・動画生成自動化ツール ===\n');

    // 1. 要素の選択
    console.log('生成要素を選択中...');
    
    const character = await selectCharacter();
    console.log(`キャラクター: ${character.name}`);
    
    const location = await selectLocation();
    console.log(`場所: ${location.name}`);
    
    const scene = await selectScene(); // ランダムにシーンを選択
    console.log(`シーン: ${scene.tag} (${scene.action})`);

    // 2. 画像プロンプトの構築
    const fullImagePrompt = await buildImagePrompt(character, location, scene);
    console.log(`\n生成された画像プロンプト:\n"${fullImagePrompt}"\n`);

    // 3. 動画プロンプトの選択
    const videoPromptObj = await selectVideoPrompt(scene);
    console.log(`選択された動画プロンプト: "${videoPromptObj.prompt}"\n`);

    // 4. 画像生成
    console.log('=== ステップ1: 画像生成 ===');
    const imagePath = await generateImage(fullImagePrompt, config);
    console.log(`✓ 画像生成完了: ${imagePath}\n`);

    // 5. 動画生成
    console.log('=== ステップ2: 動画生成 ===');
    const videoPath = await generateVideo(imagePath, videoPromptObj.prompt, config);
    console.log(`✓ 動画生成完了: ${videoPath}\n`);

    console.log('=== すべての処理が完了しました ===');
    console.log(`キャラクター: ${character.name}`);
    console.log(`シーン: ${scene.tag}`);
    console.log(`画像: ${imagePath}`);
    console.log(`動画: ${videoPath}`);

  } catch (error) {
    console.error('エラーが発生しました:', error);
    process.exit(1);
  }
}

// 実行
main();
