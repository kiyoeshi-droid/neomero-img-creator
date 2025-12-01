import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const promptsPath = path.join(__dirname, '..', 'prompts.json');

// シーンの内容に基づいて適切な構図とアングルを返す関数
function getCompositionsAndAnglesForScene(scene) {
  const tag = scene.tag || '';
  const prompt = scene.prompt || '';
  const action = scene.action || '';
  const section = scene.section || '';
  
  const compositions = [];
  const angles = [];
  
  // === 表情系シーン（雰囲気作り） ===
  if (action === '表情' || tag.includes('顔') || tag.includes('笑顔') || tag.includes('照れ')) {
    // 顔に焦点を当てる構図
    compositions.push('comp_2', 'comp_3', 'comp_4', 'comp_5'); // face, face focus, close up, portrait
    compositions.push('comp_8'); // upper body（上半身）
    compositions.push('comp_9'); // front view（正面から）
    compositions.push('comp_16'); // look at viewer（視聴者目線）
    
    // アングルは正面から、少し上から、横から
    angles.push('angle_1', 'angle_2'); // from above, high angle
    angles.push('angle_9'); // from side
  }
  
  // === キス系シーン ===
  else if (tag.includes('キス') || prompt.includes('kiss')) {
    compositions.push('comp_2', 'comp_3', 'comp_4'); // face, face focus, close up
    compositions.push('comp_8'); // upper body
    compositions.push('comp_9'); // front view
    compositions.push('comp_11', 'comp_12'); // side view, from side
    
    angles.push('angle_1', 'angle_2'); // from above, high angle
    angles.push('angle_9'); // from side
    angles.push('angle_13'); // over the shoulder
  }
  
  // === 手コキ・フェラ系 ===
  else if (tag.includes('手コキ') || tag.includes('フェラ') || prompt.includes('handjob') || prompt.includes('blowjob') || prompt.includes('fellatio')) {
    compositions.push('comp_8'); // upper body
    compositions.push('comp_7'); // cowboy shot
    compositions.push('comp_9'); // front view
    compositions.push('comp_11', 'comp_12'); // side view, from side
    
    angles.push('angle_1', 'angle_2'); // from above, high angle
    angles.push('angle_9'); // from side
    angles.push('angle_13'); // over the shoulder
  }
  
  // === クンニ系 ===
  else if (tag.includes('クンニ') || prompt.includes('cunnilingus')) {
    compositions.push('comp_8'); // upper body
    compositions.push('comp_7'); // cowboy shot
    compositions.push('comp_9'); // front view
    compositions.push('comp_10', 'comp_15'); // back view, from behind
    
    angles.push('angle_1', 'angle_2'); // from above, high angle
    angles.push('angle_6', 'angle_7'); // from below, low angle
    angles.push('angle_9'); // from side
  }
  
  // === くぱぁ系 ===
  else if (tag.includes('くぱぁ') || prompt.includes('open vagina') || prompt.includes('open pussy')) {
    compositions.push('comp_8'); // upper body
    compositions.push('comp_7'); // cowboy shot
    compositions.push('comp_9'); // front view
    compositions.push('comp_10', 'comp_15'); // back view, from behind
    
    angles.push('angle_1', 'angle_2'); // from above, high angle
    angles.push('angle_6', 'angle_7'); // from below, low angle
    angles.push('angle_9'); // from side
  }
  
  // === セックス系（本番） ===
  else if (section === '本番・セックス' || tag.includes('挿入') || tag.includes('セックス') || prompt.includes('sex') || prompt.includes('penetration') || prompt.includes('intercourse')) {
    compositions.push('comp_8'); // upper body
    compositions.push('comp_7'); // cowboy shot
    compositions.push('comp_9'); // front view
    compositions.push('comp_11', 'comp_12'); // side view, from side
    compositions.push('comp_10', 'comp_15'); // back view, from behind
    
    angles.push('angle_1', 'angle_2'); // from above, high angle
    angles.push('angle_6', 'angle_7'); // from below, low angle
    angles.push('angle_9'); // from side
    angles.push('angle_10', 'angle_11'); // from behind, back shot
    angles.push('angle_13'); // over the shoulder
    angles.push('angle_14'); // cinematic angle
  }
  
  // === 絶頂系 ===
  else if (section === '絶頂' || tag.includes('絶頂') || tag.includes('射精') || prompt.includes('orgasm') || prompt.includes('climax') || prompt.includes('cum')) {
    compositions.push('comp_2', 'comp_3', 'comp_4'); // face, face focus, close up
    compositions.push('comp_8'); // upper body
    compositions.push('comp_7'); // cowboy shot
    compositions.push('comp_9'); // front view
    compositions.push('comp_11', 'comp_12'); // side view, from side
    compositions.push('comp_10', 'comp_15'); // back view, from behind
    
    angles.push('angle_1', 'angle_2'); // from above, high angle
    angles.push('angle_6', 'angle_7'); // from below, low angle
    angles.push('angle_9'); // from side
    angles.push('angle_10', 'angle_11'); // from behind, back shot
    angles.push('angle_14'); // cinematic angle
    angles.push('angle_15'); // dynamic angle
  }
  
  // === 前戯・奉仕系（その他） ===
  else if (section === '前戯・奉仕' || section === '前戯への予兆') {
    compositions.push('comp_8'); // upper body
    compositions.push('comp_7'); // cowboy shot
    compositions.push('comp_9'); // front view
    compositions.push('comp_11', 'comp_12'); // side view, from side
    compositions.push('comp_10', 'comp_15'); // back view, from behind
    
    angles.push('angle_1', 'angle_2'); // from above, high angle
    angles.push('angle_6', 'angle_7'); // from below, low angle
    angles.push('angle_9'); // from side
    angles.push('angle_13'); // over the shoulder
  }
  
  // === ピロートーク系 ===
  else if (section === 'ピロートーク') {
    compositions.push('comp_2', 'comp_3', 'comp_4'); // face, face focus, close up
    compositions.push('comp_8'); // upper body
    compositions.push('comp_9'); // front view
    compositions.push('comp_16'); // look at viewer
    
    angles.push('angle_1', 'angle_2'); // from above, high angle
    angles.push('angle_9'); // from side
    angles.push('angle_13'); // over the shoulder
  }
  
  // === その他のシーン（デフォルト） ===
  else {
    compositions.push('comp_8'); // upper body
    compositions.push('comp_7'); // cowboy shot
    compositions.push('comp_9'); // front view
    compositions.push('comp_11', 'comp_12'); // side view, from side
    
    angles.push('angle_1', 'angle_2'); // from above, high angle
    angles.push('angle_9'); // from side
  }
  
  // 重複を削除
  return {
    compositions: [...new Set(compositions)],
    angles: [...new Set(angles)]
  };
}

async function addCompositionsAndAnglesToScenes() {
  try {
    const data = await fs.readJson(promptsPath);
    
    if (!data.scenes) {
      console.log('シーンデータが見つかりません');
      return;
    }
    
    let updatedCount = 0;
    
    // 各シーンに構図とアングルを追加
    for (const scene of data.scenes) {
      const { compositions, angles } = getCompositionsAndAnglesForScene(scene);
      
      // 既に設定されている場合はスキップ（手動で設定済みの可能性があるため）
      if (scene.compositions && scene.compositions.length > 0) {
        console.log(`シーン "${scene.tag}" は既に構図が設定されています。スキップします。`);
        continue;
      }
      if (scene.angles && scene.angles.length > 0) {
        console.log(`シーン "${scene.tag}" は既にアングルが設定されています。スキップします。`);
        continue;
      }
      
      scene.compositions = compositions;
      scene.angles = angles;
      updatedCount++;
      
      console.log(`シーン "${scene.tag}": 構図 ${compositions.length}件、アングル ${angles.length}件を追加`);
    }
    
    await fs.writeJson(promptsPath, data, { spaces: 2 });
    
    console.log(`\n合計 ${updatedCount} 件のシーンを更新しました。`);
    
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

addCompositionsAndAnglesToScenes();

