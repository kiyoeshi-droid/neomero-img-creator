import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const promptsPath = path.join(__dirname, '..', 'prompts.json');

// シーンの内容に基づいてNSFWとSEXタグを判定する関数
function shouldAddNsfwTag(scene) {
  const tag = scene.tag || '';
  const prompt = scene.prompt || '';
  const section = scene.section || '';
  const action = scene.action || '';
  
  // セクションで判定
  if (section === '本番・セックス' || section === '絶頂' || section === '前戯・奉仕' || section === '前戯への予兆') {
    return true;
  }
  
  // タグで判定
  const nsfwKeywords = [
    'キス', 'フェラ', '手コキ', 'クンニ', 'くぱぁ', '挿入', 'セックス', '絶頂', '射精',
    '中出し', '潮吹き', 'オナニー', 'パイズリ', '乳首', '素股', '仰け反り', 'エビ反り',
    'トロ顔', 'アヘ顔', 'ほてった', '情熱', '快楽'
  ];
  
  for (const keyword of nsfwKeywords) {
    if (tag.includes(keyword)) {
      return true;
    }
  }
  
  // プロンプトで判定
  const nsfwPromptKeywords = [
    'kiss', 'blowjob', 'fellatio', 'handjob', 'cunnilingus', 'sex', 'penetration',
    'intercourse', 'orgasm', 'climax', 'cum', 'creampie', 'squirt', 'masturbation',
    'paizuri', 'nipple', 'breast', 'pussy', 'vagina', 'cock', 'penis', 'erotic',
    'aroused', 'lewd', 'nsfw', 'sex'
  ];
  
  const promptLower = prompt.toLowerCase();
  for (const keyword of nsfwPromptKeywords) {
    if (promptLower.includes(keyword)) {
      return true;
    }
  }
  
  return false;
}

function shouldAddSexTag(scene) {
  const tag = scene.tag || '';
  const prompt = scene.prompt || '';
  const section = scene.section || '';
  
  // セクションで判定
  if (section === '本番・セックス' || section === '絶頂') {
    return true;
  }
  
  // タグで判定
  const sexKeywords = [
    '挿入', 'セックス', '正常位', '騎乗位', '後背位', '松葉崩し', '絶頂', '射精',
    '中出し', '仰け反り', 'エビ反り'
  ];
  
  for (const keyword of sexKeywords) {
    if (tag.includes(keyword)) {
      return true;
    }
  }
  
  // プロンプトで判定
  const sexPromptKeywords = [
    'sex', 'penetration', 'intercourse', 'creampie', 'cum inside', 'woman on top',
    'missionary', 'cowgirl', 'doggy', 'from behind', 'insertion'
  ];
  
  const promptLower = prompt.toLowerCase();
  for (const keyword of sexPromptKeywords) {
    if (promptLower.includes(keyword)) {
      return true;
    }
  }
  
  return false;
}

async function addNsfwAndSexTags() {
  try {
    const data = await fs.readJson(promptsPath);
    
    if (!data.scenes) {
      console.log('シーンデータが見つかりません');
      return;
    }
    
    let updatedCount = 0;
    let nsfwCount = 0;
    let sexCount = 0;
    
    // 各シーンにNSFWとSEXタグを追加
    for (const scene of data.scenes) {
      let updated = false;
      
      // 既に設定されている場合はスキップ（手動で設定済みの可能性があるため）
      if (scene.nsfw !== undefined || scene.sex !== undefined) {
        const shouldNsfw = shouldAddNsfwTag(scene);
        const shouldSex = shouldAddSexTag(scene);
        
        // 既存の値と異なる場合のみ更新
        if (scene.nsfw !== shouldNsfw || scene.sex !== shouldSex) {
          scene.nsfw = shouldNsfw;
          scene.sex = shouldSex;
          updated = true;
          updatedCount++;
          if (shouldNsfw) nsfwCount++;
          if (shouldSex) sexCount++;
          console.log(`更新: "${scene.tag}" - NSFW: ${shouldNsfw}, SEX: ${shouldSex}`);
        }
      } else {
        // 未設定の場合は追加
        const shouldNsfw = shouldAddNsfwTag(scene);
        const shouldSex = shouldAddSexTag(scene);
        
        scene.nsfw = shouldNsfw;
        scene.sex = shouldSex;
        updated = true;
        updatedCount++;
        if (shouldNsfw) nsfwCount++;
        if (shouldSex) sexCount++;
        console.log(`追加: "${scene.tag}" - NSFW: ${shouldNsfw}, SEX: ${shouldSex}`);
      }
    }
    
    await fs.writeJson(promptsPath, data, { spaces: 2 });
    
    console.log(`\n合計 ${updatedCount} 件のシーンを更新しました。`);
    console.log(`NSFWタグ: ${nsfwCount}件`);
    console.log(`SEXタグ: ${sexCount}件`);
    
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

addNsfwAndSexTags();

