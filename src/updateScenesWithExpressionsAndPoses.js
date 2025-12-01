import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const promptsPath = path.join(__dirname, '..', 'prompts.json');

// シーンの内容に基づいて適切な感情とポーズを返す関数
function getExpressionsAndPosesForScene(scene) {
  const tag = scene.tag || '';
  const prompt = scene.prompt || '';
  const action = scene.action || '';
  
  const expressions = [];
  const poses = [];
  
  // === 表情系シーン ===
  if (action === '表情' || tag.includes('顔')) {
    // 照れ顔
    if (tag.includes('照れ') || prompt.includes('blushing') || prompt.includes('shy')) {
      expressions.push('expr_1', 'expr_2', 'expr_3', 'expr_4'); // 照れ・赤面、はにかみ笑顔、恥ずかしがって隠れる、甘えた顔
      poses.push('pose_20', 'pose_6', 'pose_47', 'pose_48', 'pose_49', 'pose_52', 'pose_53'); // 立つ、座る、手を顔に、手を頭に、手を口に、下を向く、頭を傾げる
    }
    // 笑顔
    else if (tag.includes('笑顔') || prompt.includes('smile') || prompt.includes('happy')) {
      expressions.push('expr_6', 'expr_5', 'expr_7', 'expr_8', 'expr_9'); // 笑顔、微笑み、にやけ顔、ドヤ顔、あざと顔
      poses.push('pose_20', 'pose_6', 'pose_43', 'pose_50', 'pose_45', 'pose_46', 'pose_51'); // 立つ、座る、手を上げる、手を伸ばす、手を組む、手を胸に、上を向く
    }
    // 悲しい顔
    else if (tag.includes('悲しい') || prompt.includes('sad')) {
      expressions.push('expr_12', 'expr_11', 'expr_13'); // 悲しい顔、泣き顔、泣き笑い
      poses.push('pose_20', 'pose_6', 'pose_47', 'pose_48', 'pose_52', 'pose_14', 'pose_53'); // 立つ、座る、手を顔に、手を頭に、下を向く、膝を抱える、頭を傾げる
    }
    // 怒り顔
    else if (tag.includes('怒り') || prompt.includes('angry') || prompt.includes('annoyed')) {
      expressions.push('expr_21', 'expr_22', 'expr_23'); // 怒り、ふくれっ面
      poses.push('pose_20', 'pose_42', 'pose_21', 'pose_53'); // 立つ、手を腰に、脚を広げる、頭を傾げる
    }
    // ほてった顔
    else if (tag.includes('ほてった') || prompt.includes('flushed') || prompt.includes('aroused')) {
      expressions.push('expr_29', 'expr_30', 'expr_31', 'expr_32', 'expr_33'); // ほてった顔、リラックスした顔、瞳を輝かせる、目尻が下がる、口をわずかに開ける、うっとり
      poses.push('pose_20', 'pose_6', 'pose_2', 'pose_3', 'pose_47', 'pose_36', 'pose_34'); // 立つ、座る、仰向け、横向き、手を顔に、後ろに寄りかかる、背中を反らせる
    }
    // トロ顔
    else if (tag.includes('トロ') || prompt.includes('dazed') || prompt.includes('rolling eyes')) {
      expressions.push('expr_36', 'expr_30', 'expr_33'); // トロ顔・放心、リラックスした顔、うっとり
      poses.push('pose_2', 'pose_3', 'pose_6', 'pose_18', 'pose_36', 'pose_52'); // 仰向け、横向き、座る、もたれかかる、後ろに寄りかかる、下を向く
    }
    // アヘ顔
    else if (tag.includes('アヘ') || prompt.includes('ahegao') || prompt.includes('extreme orgasm')) {
      expressions.push('expr_37', 'expr_43', 'expr_42', 'expr_44', 'expr_45', 'expr_35'); // アヘ顔、イキ顔、快楽に身悶える顔、昇天・のけぞる、快楽で気絶した顔、よだれを垂らす
      poses.push('pose_2', 'pose_34', 'pose_40', 'pose_54', 'pose_21'); // 仰向け、背中を反らせる、三点着地、頭を後ろに反らす、脚を広げる
    }
  }
  
  // === キス系 ===
  if (tag.includes('キス') || action.includes('キス') || prompt.includes('kiss')) {
    if (tag.includes('ディープ') || prompt.includes('french kiss') || prompt.includes('tongue')) {
      expressions.push('expr_49', 'expr_33', 'expr_34', 'expr_32', 'expr_29', 'expr_31', 'expr_35'); // キス顔、うっとり、舌を出す、口をわずかに開ける、ほてった顔、瞳を輝かせる、よだれを垂らす
      poses.push('pose_20', 'pose_6', 'pose_36', 'pose_34', 'pose_18', 'pose_2', 'pose_3'); // 立つ、座る、後ろに寄りかかる、背中を反らせる、もたれかかる、仰向け、横向き
    } else {
      expressions.push('expr_49', 'expr_46', 'expr_33', 'expr_32', 'expr_29', 'expr_31'); // キス顔、キス待ちの顔、うっとり、口をわずかに開ける、ほてった顔、瞳を輝かせる
      poses.push('pose_20', 'pose_6', 'pose_36', 'pose_34', 'pose_18', 'pose_2', 'pose_3', 'pose_47'); // 立つ、座る、後ろに寄りかかる、背中を反らせる、もたれかかる、仰向け、横向き、手を顔に
    }
  }
  
  // === 前戯系 ===
  // 乳揉み
  if ((tag.includes('乳') && !tag.includes('射精')) || prompt.includes('groping')) {
    expressions.push('expr_29', 'expr_30', 'expr_31', 'expr_32', 'expr_33', 'expr_34', 'expr_41'); // ほてった顔、リラックスした顔、瞳を輝かせる、口をわずかに開ける、うっとり、舌を出す、快楽を我慢する顔
    poses.push('pose_2', 'pose_3', 'pose_6', 'pose_20', 'pose_34', 'pose_36', 'pose_18', 'pose_21'); // 仰向け、横向き、座る、立つ、背中を反らせる、後ろに寄りかかる、もたれかかる、脚を広げる
  }
  // 乳首責め
  if (tag.includes('乳首') || prompt.includes('nipple')) {
    expressions.push('expr_29', 'expr_30', 'expr_31', 'expr_32', 'expr_33', 'expr_34', 'expr_41', 'expr_42'); // ほてった顔、リラックスした顔、瞳を輝かせる、口をわずかに開ける、うっとり、舌を出す、快楽を我慢する顔、快楽に身悶える顔
    poses.push('pose_2', 'pose_3', 'pose_34', 'pose_36', 'pose_18', 'pose_21', 'pose_54'); // 仰向け、横向き、背中を反らせる、後ろに寄りかかる、もたれかかる、脚を広げる、頭を後ろに反らす
  }
  // 手コキ
  if (tag.includes('手コキ') || prompt.includes('handjob')) {
    expressions.push('expr_29', 'expr_30', 'expr_31', 'expr_32', 'expr_33', 'expr_34', 'expr_41', 'expr_42'); // ほてった顔、リラックスした顔、瞳を輝かせる、口をわずかに開ける、うっとり、舌を出す、快楽を我慢する顔、快楽に身悶える顔
    poses.push('pose_2', 'pose_3', 'pose_6', 'pose_20', 'pose_34', 'pose_36', 'pose_18', 'pose_21', 'pose_7', 'pose_8'); // 仰向け、横向き、座る、立つ、背中を反らせる、後ろに寄りかかる、もたれかかる、脚を広げる、ひざまずく、片膝をつく
  }
  // フェラ
  if (tag.includes('フェラ') || prompt.includes('blowjob') || prompt.includes('fellatio')) {
    expressions.push('expr_29', 'expr_30', 'expr_31', 'expr_32', 'expr_33', 'expr_34', 'expr_35', 'expr_41', 'expr_42'); // ほてった顔、リラックスした顔、瞳を輝かせる、口をわずかに開ける、うっとり、舌を出す、よだれを垂らす、快楽を我慢する顔、快楽に身悶える顔
    poses.push('pose_8', 'pose_7', 'pose_6', 'pose_9', 'pose_2', 'pose_3', 'pose_35', 'pose_52'); // 片膝をつく、ひざまずく、座る、しゃがむ、仰向け、横向き、前屈み、下を向く
  }
  // パイズリ
  if (tag.includes('パイズリ') || prompt.includes('paizuri')) {
    expressions.push('expr_29', 'expr_30', 'expr_31', 'expr_32', 'expr_33', 'expr_34', 'expr_41', 'expr_42'); // ほてった顔、リラックスした顔、瞳を輝かせる、口をわずかに開ける、うっとり、舌を出す、快楽を我慢する顔、快楽に身悶える顔
    poses.push('pose_2', 'pose_3', 'pose_6', 'pose_20', 'pose_34', 'pose_36', 'pose_18', 'pose_21'); // 仰向け、横向き、座る、立つ、背中を反らせる、後ろに寄りかかる、もたれかかる、脚を広げる
  }
  // オナニー
  if (tag.includes('オナニー') || prompt.includes('masturbation')) {
    expressions.push('expr_29', 'expr_30', 'expr_31', 'expr_32', 'expr_33', 'expr_34', 'expr_41', 'expr_42', 'expr_43'); // ほてった顔、リラックスした顔、瞳を輝かせる、口をわずかに開ける、うっとり、舌を出す、快楽を我慢する顔、快楽に身悶える顔、イキ顔
    poses.push('pose_2', 'pose_3', 'pose_6', 'pose_34', 'pose_36', 'pose_18', 'pose_21', 'pose_47', 'pose_48'); // 仰向け、横向き、座る、背中を反らせる、後ろに寄りかかる、もたれかかる、脚を広げる、手を顔に、手を頭に
  }
  // クンニ
  if (tag.includes('クンニ') || prompt.includes('cunnilingus')) {
    expressions.push('expr_29', 'expr_30', 'expr_31', 'expr_32', 'expr_33', 'expr_34', 'expr_41', 'expr_42', 'expr_43'); // ほてった顔、リラックスした顔、瞳を輝かせる、口をわずかに開ける、うっとり、舌を出す、快楽を我慢する顔、快楽に身悶える顔、イキ顔
    poses.push('pose_2', 'pose_34', 'pose_36', 'pose_18', 'pose_21', 'pose_54', 'pose_40'); // 仰向け、背中を反らせる、後ろに寄りかかる、もたれかかる、脚を広げる、頭を後ろに反らす、三点着地
  }
  
  // === 挿入待ち ===
  if (tag.includes('挿入を待') || tag.includes('挿入待ち')) {
    expressions.push('expr_46', 'expr_33', 'expr_32', 'expr_29', 'expr_30', 'expr_31', 'expr_34'); // キス待ちの顔、うっとり、口をわずかに開ける、ほてった顔、リラックスした顔、瞳を輝かせる、舌を出す
    poses.push('pose_2', 'pose_3', 'pose_6', 'pose_20', 'pose_34', 'pose_36', 'pose_18', 'pose_21', 'pose_47', 'pose_48'); // 仰向け、横向き、座る、立つ、背中を反らせる、後ろに寄りかかる、もたれかかる、脚を広げる、手を顔に、手を頭に
  }
  
  // === 挿入中 ===
  // 正常位
  if (tag.includes('正常位') || prompt.includes('missionary')) {
    expressions.push('expr_41', 'expr_42', 'expr_43', 'expr_47', 'expr_29', 'expr_32', 'expr_33', 'expr_34', 'expr_35', 'expr_44', 'expr_45'); // 快楽を我慢する顔、快楽に身悶える顔、イキ顔、高揚感で体を震わす、ほてった顔、口をわずかに開ける、うっとり、舌を出す、よだれを垂らす、昇天・のけぞる、快楽で気絶した顔
    poses.push('pose_2', 'pose_34', 'pose_36', 'pose_18', 'pose_21', 'pose_54', 'pose_40', 'pose_47', 'pose_48', 'pose_50'); // 仰向け、背中を反らせる、後ろに寄りかかる、もたれかかる、脚を広げる、頭を後ろに反らす、三点着地、手を顔に、手を頭に、手を伸ばす
  }
  // 騎乗位
  if (tag.includes('騎乗位') || prompt.includes('cowgirl')) {
    expressions.push('expr_41', 'expr_42', 'expr_43', 'expr_47', 'expr_29', 'expr_32', 'expr_33', 'expr_34', 'expr_35', 'expr_44', 'expr_45'); // 快楽を我慢する顔、快楽に身悶える顔、イキ顔、高揚感で体を震わす、ほてった顔、口をわずかに開ける、うっとり、舌を出す、よだれを垂らす、昇天・のけぞる、快楽で気絶した顔
    poses.push('pose_6', 'pose_20', 'pose_34', 'pose_36', 'pose_18', 'pose_21', 'pose_54', 'pose_40', 'pose_43', 'pose_50', 'pose_47', 'pose_48'); // 座る、立つ、背中を反らせる、後ろに寄りかかる、もたれかかる、脚を広げる、頭を後ろに反らす、三点着地、手を上げる、手を伸ばす、手を顔に、手を頭に
  }
  // 後背位
  if (tag.includes('後背位') || prompt.includes('doggystyle')) {
    expressions.push('expr_41', 'expr_42', 'expr_43', 'expr_47', 'expr_29', 'expr_32', 'expr_33', 'expr_34', 'expr_35', 'expr_44', 'expr_45'); // 快楽を我慢する顔、快楽に身悶える顔、イキ顔、高揚感で体を震わす、ほてった顔、口をわずかに開ける、うっとり、舌を出す、よだれを垂らす、昇天・のけぞる、快楽で気絶した顔
    poses.push('pose_4', 'pose_7', 'pose_35', 'pose_9', 'pose_8', 'pose_21', 'pose_37', 'pose_47', 'pose_48', 'pose_52', 'pose_54'); // うつ伏せ、ひざまずく、前屈み、しゃがむ、片膝をつく、脚を広げる、腕で体を支える、手を顔に、手を頭に、下を向く、頭を後ろに反らす
  }
  // 松葉崩し
  if (tag.includes('松葉崩し') || prompt.includes('mating press')) {
    expressions.push('expr_41', 'expr_42', 'expr_43', 'expr_47', 'expr_29', 'expr_32', 'expr_33', 'expr_34', 'expr_35', 'expr_44', 'expr_45'); // 快楽を我慢する顔、快楽に身悶える顔、イキ顔、高揚感で体を震わす、ほてった顔、口をわずかに開ける、うっとり、舌を出す、よだれを垂らす、昇天・のけぞる、快楽で気絶した顔
    poses.push('pose_2', 'pose_34', 'pose_36', 'pose_18', 'pose_21', 'pose_54', 'pose_40', 'pose_47', 'pose_48', 'pose_50'); // 仰向け、背中を反らせる、後ろに寄りかかる、もたれかかる、脚を広げる、頭を後ろに反らす、三点着地、手を顔に、手を頭に、手を伸ばす
  }
  // 素股
  if (tag.includes('素股') || prompt.includes('sumata')) {
    expressions.push('expr_41', 'expr_42', 'expr_43', 'expr_47', 'expr_29', 'expr_32', 'expr_33', 'expr_34', 'expr_35'); // 快楽を我慢する顔、快楽に身悶える顔、イキ顔、高揚感で体を震わす、ほてった顔、口をわずかに開ける、うっとり、舌を出す、よだれを垂らす
    poses.push('pose_2', 'pose_3', 'pose_6', 'pose_20', 'pose_34', 'pose_36', 'pose_18', 'pose_21', 'pose_47', 'pose_48'); // 仰向け、横向き、座る、立つ、背中を反らせる、後ろに寄りかかる、もたれかかる、脚を広げる、手を顔に、手を頭に
  }
  
  // === 絶頂・潮吹き ===
  if (tag.includes('絶頂') || tag.includes('潮吹き') || prompt.includes('squirting') || prompt.includes('ejaculation')) {
    expressions.push('expr_43', 'expr_42', 'expr_44', 'expr_45', 'expr_35', 'expr_47', 'expr_41'); // イキ顔、快楽に身悶える顔、昇天・のけぞる、快楽で気絶した顔、よだれを垂らす、高揚感で体を震わす、快楽を我慢する顔
    poses.push('pose_2', 'pose_34', 'pose_40', 'pose_36', 'pose_18', 'pose_21', 'pose_54', 'pose_47', 'pose_48', 'pose_50'); // 仰向け、背中を反らせる、三点着地、後ろに寄りかかる、もたれかかる、脚を広げる、頭を後ろに反らす、手を顔に、手を頭に、手を伸ばす
  }
  
  // === 射精系 ===
  if (tag.includes('射精') || tag.includes('中出し') || prompt.includes('cum') || prompt.includes('creampie') || prompt.includes('facial')) {
    expressions.push('expr_43', 'expr_45', 'expr_35', 'expr_42', 'expr_44', 'expr_47', 'expr_41'); // イキ顔、快楽で気絶した顔、よだれを垂らす、快楽に身悶える顔、昇天・のけぞる、高揚感で体を震わす、快楽を我慢する顔
    if (tag.includes('顔') || prompt.includes('facial')) {
      poses.push('pose_2', 'pose_3', 'pose_6', 'pose_8', 'pose_7', 'pose_35', 'pose_47', 'pose_48', 'pose_49', 'pose_52'); // 仰向け、横向き、座る、片膝をつく、ひざまずく、前屈み、手を顔に、手を頭に、手を口に、下を向く
    } else if (tag.includes('胸')) {
      poses.push('pose_2', 'pose_34', 'pose_36', 'pose_18', 'pose_21', 'pose_54', 'pose_47', 'pose_48'); // 仰向け、背中を反らせる、後ろに寄りかかる、もたれかかる、脚を広げる、頭を後ろに反らす、手を顔に、手を頭に
    } else {
      poses.push('pose_2', 'pose_3', 'pose_6', 'pose_34', 'pose_36', 'pose_18', 'pose_21', 'pose_47', 'pose_48'); // 仰向け、横向き、座る、背中を反らせる、後ろに寄りかかる、もたれかかる、脚を広げる、手を顔に、手を頭に
    }
  }
  
  // 重複を削除
  return {
    expressions: [...new Set(expressions)],
    poses: [...new Set(poses)]
  };
}

async function updateScenesWithExpressionsAndPoses() {
  try {
    const data = await fs.readJson(promptsPath);
    
    if (!data.scenes) {
      console.log('シーンデータが見つかりません');
      return;
    }
    
    let updatedCount = 0;
    
    data.scenes.forEach(scene => {
      const { expressions, poses } = getExpressionsAndPosesForScene(scene);
      
      let updated = false;
      
      // 感情を更新（既存のものとマージ）
      const existingExprs = scene.expressions || [];
      const newExprs = [...new Set([...existingExprs, ...expressions])];
      if (JSON.stringify(existingExprs.sort()) !== JSON.stringify(newExprs.sort())) {
        scene.expressions = newExprs;
        updated = true;
      }
      
      // ポーズを更新
      if (poses.length > 0) {
        scene.poses = poses;
        updated = true;
      }
      
      if (updated) {
        console.log(`\n"${scene.tag}" (${scene.id})`);
        if (newExprs.length > 0) {
          console.log(`  感情: ${newExprs.join(', ')}`);
        }
        if (poses.length > 0) {
          console.log(`  ポーズ: ${poses.join(', ')}`);
        }
        updatedCount++;
      }
    });
    
    await fs.writeJson(promptsPath, data, { spaces: 2 });
    console.log(`\n合計 ${updatedCount} 個のシーンを更新しました。`);
    
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

updateScenesWithExpressionsAndPoses();

