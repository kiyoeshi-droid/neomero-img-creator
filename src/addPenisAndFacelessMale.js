import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const promptsPath = path.join(__dirname, '..', 'prompts.json');

// ペニスが必要なシーンかどうかを判定
function needsPenis(scene) {
  const tag = scene.tag || '';
  const prompt = scene.prompt || '';
  const section = scene.section || '';
  
  // セクションで判定
  if (section === '本番・セックス' || section === '絶頂') {
    return true;
  }
  
  // タグで判定
  const penisKeywords = [
    '手コキ', 'フェラ', 'フェラチオ', '挿入', '正常位', '騎乗位', '後背位', '松葉崩し',
    '射精', '中出し', '素股', 'セックス'
  ];
  
  for (const keyword of penisKeywords) {
    if (tag.includes(keyword)) {
      return true;
    }
  }
  
  // プロンプトで判定
  const penisPromptKeywords = [
    'handjob', 'blowjob', 'fellatio', 'penetration', 'intercourse', 'sex',
    'missionary', 'cowgirl', 'doggy', 'from behind', 'cum', 'creampie',
    'cum inside', 'cum on', 'facial', 'woman on top'
  ];
  
  const promptLower = prompt.toLowerCase();
  for (const keyword of penisPromptKeywords) {
    if (promptLower.includes(keyword)) {
      return true;
    }
  }
  
  return false;
}

// キス系でfaceless maleが必要なシーンかどうかを判定
function needsFacelessMale(scene) {
  const tag = scene.tag || '';
  const prompt = scene.prompt || '';
  
  // キス系のシーンかどうか
  const isKissScene = tag.includes('キス') || 
                      prompt.toLowerCase().includes('kiss') ||
                      prompt.toLowerCase().includes('kissing');
  
  if (!isKissScene) {
    return false;
  }
  
  // POV系（画面に向かってキス顔するようなもの）は除外
  // 「キス顔」はPOV系の可能性が高い
  if (tag.includes('キス顔') || tag === 'キス顔') {
    return false;
  }
  
  // ディープキスなど、実際にキスしている様子を描写するもの
  // プロンプトに「kissing」や「french kiss」などが含まれる
  const facelessMaleKeywords = [
    'deep kiss', 'french kiss', 'tongue kissing', 'kissing'
  ];
  
  const promptLower = prompt.toLowerCase();
  for (const keyword of facelessMaleKeywords) {
    if (promptLower.includes(keyword)) {
      return true;
    }
  }
  
  return false;
}

async function addPenisAndFacelessMale() {
  try {
    const data = await fs.readJson(promptsPath);
    
    if (!data.scenes) {
      console.log('シーンデータが見つかりません');
      return;
    }
    
    let penisCount = 0;
    let facelessMaleCount = 0;
    
    // 各シーンを確認してプロンプトに追加
    for (const scene of data.scenes) {
      const originalPrompt = scene.prompt || '';
      let updatedPrompt = originalPrompt;
      let updated = false;
      
      // ペニスが必要なシーンかチェック
      if (needsPenis(scene)) {
        // 既にpenisが含まれていないか確認
        if (!originalPrompt.toLowerCase().includes('penis') && 
            !originalPrompt.toLowerCase().includes('cock') &&
            !originalPrompt.toLowerCase().includes('dick')) {
          updatedPrompt = updatedPrompt ? `${updatedPrompt}, penis` : 'penis';
          updated = true;
          penisCount++;
          console.log(`[PENIS] "${scene.tag}": ${originalPrompt} -> ${updatedPrompt}`);
        }
      }
      
      // faceless maleが必要なシーンかチェック
      if (needsFacelessMale(scene)) {
        // 既にfaceless maleが含まれていないか確認
        if (!originalPrompt.toLowerCase().includes('faceless male') &&
            !originalPrompt.toLowerCase().includes('faceless man')) {
          updatedPrompt = updatedPrompt ? `${updatedPrompt}, faceless male` : 'faceless male';
          updated = true;
          facelessMaleCount++;
          console.log(`[FACELESS MALE] "${scene.tag}": ${originalPrompt} -> ${updatedPrompt}`);
        }
      }
      
      if (updated) {
        scene.prompt = updatedPrompt;
      }
    }
    
    await fs.writeJson(promptsPath, data, { spaces: 2 });
    
    console.log(`\n合計 ${penisCount} 件のシーンにpenisを追加しました。`);
    console.log(`合計 ${facelessMaleCount} 件のシーンにfaceless maleを追加しました。`);
    
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

addPenisAndFacelessMale();

