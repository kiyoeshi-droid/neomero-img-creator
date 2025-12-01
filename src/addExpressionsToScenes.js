import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const promptsPath = path.join(__dirname, '..', 'prompts.json');

// シーンの内容に基づいて適切な感情プロンプトIDを返す関数
function getExpressionsForScene(scene) {
  const expressions = [];
  const tag = scene.tag || '';
  const prompt = scene.prompt || '';
  const action = scene.action || '';
  
  // 照れ顔系
  if (tag.includes('照れ') || prompt.includes('blushing') || prompt.includes('shy')) {
    expressions.push('expr_1'); // 照れ・赤面
    expressions.push('expr_2'); // はにかみ笑顔
  }
  
  // 笑顔系
  if (tag.includes('笑顔') || prompt.includes('smile') || prompt.includes('happy')) {
    expressions.push('expr_6'); // 笑顔
    expressions.push('expr_5'); // 微笑み
  }
  
  // 悲しい顔
  if (tag.includes('悲しい') || prompt.includes('sad')) {
    expressions.push('expr_12'); // 悲しい顔
    expressions.push('expr_11'); // 泣き顔（涙うるうる）
  }
  
  // 怒り顔
  if (tag.includes('怒り') || prompt.includes('angry') || prompt.includes('annoyed')) {
    expressions.push('expr_21'); // 怒り
  }
  
  // ほてった顔
  if (tag.includes('ほてった') || prompt.includes('flushed') || prompt.includes('aroused')) {
    expressions.push('expr_29'); // ほてった顔
    expressions.push('expr_30'); // リラックスした顔
  }
  
  // トロ顔
  if (tag.includes('トロ顔') || prompt.includes('dazed') || prompt.includes('rolling eyes')) {
    expressions.push('expr_36'); // トロ顔・放心
  }
  
  // アヘ顔
  if (tag.includes('アヘ顔') || prompt.includes('ahegao') || prompt.includes('extreme orgasm')) {
    expressions.push('expr_37'); // アヘ顔
    expressions.push('expr_43'); // イキ顔
  }
  
  // キス関連
  if (tag.includes('キス') || prompt.includes('kiss') || action.includes('キス')) {
    expressions.push('expr_49'); // キス顔
    expressions.push('expr_46'); // キス待ちの顔
    expressions.push('expr_33'); // うっとり
    expressions.push('expr_32'); // 口をわずかに開ける
  }
  
  // ディープキス
  if (tag.includes('ディープキス') || prompt.includes('french kiss') || prompt.includes('tongue kissing')) {
    expressions.push('expr_49'); // キス顔
    expressions.push('expr_34'); // 舌を出す
    expressions.push('expr_33'); // うっとり
  }
  
  // 前戯系（乳揉み、乳首責め、手コキ、フェラ、パイズリ）
  if (tag.includes('乳') || tag.includes('手コキ') || tag.includes('フェラ') || tag.includes('パイズリ') || 
      prompt.includes('groping') || prompt.includes('nipple') || prompt.includes('handjob') || 
      prompt.includes('blowjob') || prompt.includes('fellatio') || prompt.includes('paizuri')) {
    expressions.push('expr_29'); // ほてった顔
    expressions.push('expr_32'); // 口をわずかに開ける
    expressions.push('expr_33'); // うっとり
    expressions.push('expr_31'); // 瞳を輝かせる
  }
  
  // オナニー
  if (tag.includes('オナニー') || prompt.includes('masturbation')) {
    expressions.push('expr_29'); // ほてった顔
    expressions.push('expr_33'); // うっとり
    expressions.push('expr_41'); // 快楽を我慢する顔
  }
  
  // 絶頂・潮吹き
  if (tag.includes('絶頂') || tag.includes('潮吹き') || prompt.includes('squirting') || prompt.includes('ejaculation')) {
    expressions.push('expr_43'); // イキ顔
    expressions.push('expr_42'); // 快楽に身悶える顔
    expressions.push('expr_44'); // 昇天・のけぞる
  }
  
  // 挿入待ち
  if (tag.includes('挿入を待') || tag.includes('挿入待ち')) {
    expressions.push('expr_46'); // キス待ちの顔
    expressions.push('expr_33'); // うっとり
    expressions.push('expr_32'); // 口をわずかに開ける
    expressions.push('expr_29'); // ほてった顔
  }
  
  // 挿入中（正常位、騎乗位、後背位、松葉崩し、素股）
  if (tag.includes('正常位') || tag.includes('騎乗位') || tag.includes('後背位') || 
      tag.includes('松葉崩し') || tag.includes('素股') || 
      prompt.includes('missionary') || prompt.includes('cowgirl') || 
      prompt.includes('doggystyle') || prompt.includes('mating press') || prompt.includes('sumata')) {
    expressions.push('expr_41'); // 快楽を我慢する顔
    expressions.push('expr_42'); // 快楽に身悶える顔
    expressions.push('expr_43'); // イキ顔
    expressions.push('expr_47'); // 高揚感で体を震わす
  }
  
  // 射精系
  if (tag.includes('射精') || tag.includes('中出し') || prompt.includes('cum') || prompt.includes('creampie')) {
    expressions.push('expr_43'); // イキ顔
    expressions.push('expr_45'); // 快楽で気絶した顔
    expressions.push('expr_35'); // よだれを垂らす
  }
  
  // 重複を削除
  return [...new Set(expressions)];
}

async function addExpressionsToScenes() {
  try {
    const data = await fs.readJson(promptsPath);
    
    if (!data.scenes) {
      console.log('シーンデータが見つかりません');
      return;
    }
    
    let updatedCount = 0;
    
    data.scenes.forEach(scene => {
      const expressions = getExpressionsForScene(scene);
      if (expressions.length > 0) {
        scene.expressions = expressions;
        updatedCount++;
        console.log(`シーン "${scene.tag}" に ${expressions.length} 個の感情を追加: ${expressions.join(', ')}`);
      }
    });
    
    await fs.writeJson(promptsPath, data, { spaces: 2 });
    console.log(`\n合計 ${updatedCount} 個のシーンを更新しました。`);
    
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

addExpressionsToScenes();

