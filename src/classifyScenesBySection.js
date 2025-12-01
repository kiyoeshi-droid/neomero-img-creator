import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const promptsPath = path.join(__dirname, '..', 'prompts.json');

function getSectionForScene(scene) {
  const tag = scene.tag || '';
  const prompt = scene.prompt || '';
  const action = scene.action || '';
  
  // 射精系（顔、胸、口内、中出し）- 全て「絶頂」（最優先）
  if (tag.includes('射精') || tag.includes('中出し') || action.includes('射精') ||
      prompt.includes('cum') || prompt.includes('creampie') || prompt.includes('facial')) {
    return '絶頂';
  }
  
  // 絶頂・潮吹き
  if (tag.includes('絶頂') || tag.includes('潮吹き') || action.includes('絶頂') ||
      prompt.includes('squirting') || prompt.includes('ejaculation')) {
    return '絶頂';
  }
  
  // アヘ顔は「本番・セックス」
  if (tag.includes('アヘ') || (prompt.includes('ahegao') && prompt.includes('extreme orgasm'))) {
    return '本番・セックス';
  }
  
  // 前戯系（乳揉み、乳首責め、手コキ、フェラ、パイズリ、オナニー、クンニ）
  // クンニは前戯なので、挿入系の判定より先に処理
  if (tag.includes('乳') || tag.includes('手コキ') || tag.includes('フェラ') || 
      tag.includes('パイズリ') || tag.includes('オナニー') || tag.includes('クンニ') ||
      action.includes('乳') || action.includes('手コキ') || action.includes('フェラ') ||
      action.includes('パイズリ') || action.includes('オナニー') || action.includes('クンニ') ||
      prompt.includes('groping') || prompt.includes('nipple') || prompt.includes('handjob') ||
      prompt.includes('blowjob') || prompt.includes('fellatio') || prompt.includes('paizuri') ||
      prompt.includes('masturbation') || prompt.includes('cunnilingus')) {
    return '前戯・奉仕';
  }
  
  // 挿入中（正常位、騎乗位、後背位、松葉崩し、素股）
  if (tag.includes('正常位') || tag.includes('騎乗位') || tag.includes('後背位') ||
      tag.includes('松葉崩し') || tag.includes('素股') ||
      action.includes('正常位') || action.includes('騎乗位') || action.includes('後背位') ||
      action.includes('松葉崩し') || action.includes('素股') ||
      prompt.includes('missionary') || prompt.includes('cowgirl') || prompt.includes('doggystyle') ||
      prompt.includes('mating press') || prompt.includes('sumata')) {
    return '本番・セックス';
  }
  
  // 挿入待ちは「前戯・奉仕」
  if (tag.includes('挿入を待') || tag.includes('挿入待ち')) {
    return '前戯・奉仕';
  }
  
  // キス系は「前戯への予兆」または「前戯・奉仕」
  // ただし、actionが「表情」の場合は後で処理
  if ((tag.includes('キス') || action.includes('キス') || prompt.includes('kiss')) && action !== '表情') {
    if (tag.includes('ディープ') || prompt.includes('french kiss') || prompt.includes('tongue')) {
      return '前戯・奉仕';
    }
    return '前戯への予兆';
  }
  
  // トロ顔・情熱・快楽（軽度）の表情は「前戯への予兆」
  // expressionsにexpr_29～expr_35（情熱・快楽（軽度））が含まれている場合
  const lightPleasureExpressions = ['expr_29', 'expr_30', 'expr_31', 'expr_32', 'expr_33', 'expr_34', 'expr_35'];
  const sceneExpressions = scene.expressions || [];
  const hasLightPleasure = sceneExpressions.some(exprId => lightPleasureExpressions.includes(exprId));
  
  if (tag.includes('トロ') || tag.includes('ほてった') || hasLightPleasure ||
      prompt.includes('dazed') || prompt.includes('blank stare') ||
      prompt.includes('flushed face') || prompt.includes('aroused') ||
      prompt.includes('relaxed face') || prompt.includes('glowing eyes') ||
      prompt.includes('narrowed eyes') || prompt.includes('parted lips') ||
      prompt.includes('heart-shaped pupils') || prompt.includes('drooling')) {
    return '前戯への予兆';
  }
  
  // その他の表情系は「雰囲気作り」
  if (action === '表情' || tag.includes('顔') || tag.includes('笑顔') || tag.includes('照れ') || 
      tag.includes('悲しい') || tag.includes('怒り')) {
    return '雰囲気作り';
  }
  
  // デフォルトは「雰囲気作り」
  return '雰囲気作り';
}

async function classifyScenesBySection() {
  try {
    const data = await fs.readJson(promptsPath);
    
    if (!data.scenes) {
      console.log('シーンデータが見つかりません');
      return;
    }
    
    let updatedCount = 0;
    
    data.scenes.forEach(scene => {
      const section = getSectionForScene(scene);
      
      if (scene.section !== section) {
        console.log(`"${scene.tag}" → セクション: ${section}`);
        scene.section = section;
        updatedCount++;
      }
    });
    
    await fs.writeJson(promptsPath, data, { spaces: 2 });
    console.log(`\n合計 ${updatedCount} 個のシーンのセクションを分類しました。`);
    
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

classifyScenesBySection();

