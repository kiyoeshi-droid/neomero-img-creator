import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const promptsPath = path.join(__dirname, '..', 'prompts.json');

async function mergeArchedBackScenes() {
  try {
    const data = await fs.readJson(promptsPath);
    
    if (!data.scenes) {
      console.log('シーンデータが見つかりません');
      return;
    }
    
    // 統合対象のシーンIDを特定
    const scenesToMerge = {
      normal: [], // 通常の仰け反り絶頂（正面、横、後ろ）
      squatting: [] // しゃがみ姿勢の仰け反り絶頂（正面、横、後ろ）
    };
    
    // 各シーンを確認
    for (let i = 0; i < data.scenes.length; i++) {
      const scene = data.scenes[i];
      const tag = scene.tag || '';
      
      if (tag.includes('仰け反り絶頂')) {
        if (tag.includes('しゃがんで')) {
          scenesToMerge.squatting.push({ index: i, scene });
        } else if (tag.includes('正面から') || tag.includes('横から') || tag.includes('後ろから')) {
          scenesToMerge.normal.push({ index: i, scene });
        }
      }
    }
    
    console.log(`通常の仰け反り絶頂: ${scenesToMerge.normal.length}件`);
    console.log(`しゃがみ姿勢の仰け反り絶頂: ${scenesToMerge.squatting.length}件`);
    
    // 1. 通常の仰け反り絶頂を1つに統合
    if (scenesToMerge.normal.length > 0) {
      const baseScene = scenesToMerge.normal[0].scene;
      
      // プロンプトから視点指定を削除
      let mergedPrompt = baseScene.prompt
        .replace(/,?\s*from side/gi, '')
        .replace(/,?\s*from back/gi, '');
      
      // 統合されたシーンの構図とアングルを設定（全方向を含める）
      const mergedCompositions = [
        'comp_2', 'comp_3', 'comp_4', // face, face focus, close up
        'comp_8', // upper body
        'comp_7', // cowboy shot
        'comp_9', // front view
        'comp_11', 'comp_12', // side view, from side
        'comp_10', 'comp_15' // back view, from behind
      ];
      
      const mergedAngles = [
        'angle_1', 'angle_2', // from above, high angle
        'angle_6', 'angle_7', // from below, low angle
        'angle_9', // from side
        'angle_10', 'angle_11', // from behind, back shot
        'angle_14', // cinematic angle
        'angle_15' // dynamic angle
      ];
      
      // 統合されたシーンを作成
      const mergedScene = {
        ...baseScene,
        id: baseScene.id, // 最初のシーンのIDを保持
        tag: '仰け反り絶頂',
        prompt: mergedPrompt.trim(),
        compositions: mergedCompositions,
        angles: mergedAngles
      };
      
      // 最初のシーンを統合版に置き換え
      data.scenes[scenesToMerge.normal[0].index] = mergedScene;
      
      // 残りのシーンを削除（後ろから削除してインデックスを維持）
      const indicesToDelete = scenesToMerge.normal.slice(1).map(s => s.index).sort((a, b) => b - a);
      for (const index of indicesToDelete) {
        console.log(`削除: ${data.scenes[index].tag}`);
        data.scenes.splice(index, 1);
      }
      
      console.log(`\n通常の仰け反り絶頂を統合しました: "${mergedScene.tag}"`);
    }
    
    // 2. しゃがみ姿勢の仰け反り絶頂を1つに統合
    if (scenesToMerge.squatting.length > 0) {
      // インデックスが変わっている可能性があるので、再度検索
      const squattingScenes = [];
      for (let i = 0; i < data.scenes.length; i++) {
        const scene = data.scenes[i];
        const tag = scene.tag || '';
        if (tag.includes('しゃがんで') && tag.includes('仰け反り絶頂')) {
          squattingScenes.push({ index: i, scene });
        }
      }
      
      if (squattingScenes.length > 0) {
        const baseScene = squattingScenes[0].scene;
        
        // プロンプトから視点指定を削除
        let mergedPrompt = baseScene.prompt
          .replace(/,?\s*from side/gi, '')
          .replace(/,?\s*from back/gi, '');
        
        // 統合されたシーンの構図とアングルを設定（全方向を含める）
        const mergedCompositions = [
          'comp_2', 'comp_3', 'comp_4', // face, face focus, close up
          'comp_8', // upper body
          'comp_7', // cowboy shot
          'comp_9', // front view
          'comp_11', 'comp_12', // side view, from side
          'comp_10', 'comp_15' // back view, from behind
        ];
        
        const mergedAngles = [
          'angle_1', 'angle_2', // from above, high angle
          'angle_6', 'angle_7', // from below, low angle
          'angle_9', // from side
          'angle_10', 'angle_11', // from behind, back shot
          'angle_14', // cinematic angle
          'angle_15' // dynamic angle
        ];
        
        // 統合されたシーンを作成
        const mergedScene = {
          ...baseScene,
          id: baseScene.id, // 最初のシーンのIDを保持
          tag: 'しゃがんで後ろに手をつく仰け反り絶頂',
          prompt: mergedPrompt.trim(),
          compositions: mergedCompositions,
          angles: mergedAngles
        };
        
        // 最初のシーンを統合版に置き換え
        data.scenes[squattingScenes[0].index] = mergedScene;
        
        // 残りのシーンを削除（後ろから削除してインデックスを維持）
        const indicesToDelete = squattingScenes.slice(1).map(s => s.index).sort((a, b) => b - a);
        for (const index of indicesToDelete) {
          console.log(`削除: ${data.scenes[index].tag}`);
          data.scenes.splice(index, 1);
        }
        
        console.log(`\nしゃがみ姿勢の仰け反り絶頂を統合しました: "${mergedScene.tag}"`);
      }
    }
    
    await fs.writeJson(promptsPath, data, { spaces: 2 });
    
    console.log('\n統合が完了しました。');
    
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

mergeArchedBackScenes();

