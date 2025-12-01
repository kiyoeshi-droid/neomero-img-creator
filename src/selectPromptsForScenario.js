import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const promptsPath = path.join(__dirname, '..', 'prompts.json');

/**
 * マスターデータからIDに対応するプロンプトを取得
 */
function getMasterData(data) {
  const compositions = {};
  const angles = {};
  const expressions = {};
  const poses = {};
  
  // 構図
  if (data.compositions) {
    data.compositions.forEach(cat => {
      if (cat.items) {
        cat.items.forEach(item => {
          compositions[item.id] = item.prompt;
        });
      }
    });
  }
  
  // アングル
  if (data.angles) {
    data.angles.forEach(cat => {
      if (cat.items) {
        cat.items.forEach(item => {
          angles[item.id] = item.prompt;
        });
      }
    });
  }
  
  // 感情
  if (data.expressions) {
    data.expressions.forEach(cat => {
      if (cat.items) {
        cat.items.forEach(item => {
          expressions[item.id] = item.prompt;
        });
      }
    });
  }
  
  // ポーズ
  if (data.poses) {
    data.poses.forEach(cat => {
      if (cat.items) {
        cat.items.forEach(item => {
          poses[item.id] = item.prompt;
        });
      }
    });
  }
  
  return { compositions, angles, expressions, poses };
}

/**
 * フェーズのコンテキストに基づいて、適切な構図・アングル・感情・ポーズを判断
 */
function selectAppropriateElements(phase, scene, masterData) {
  const { compositions, angles, expressions, poses } = masterData;
  
  // シーンが持つ候補から、フェーズのコンテキストに最も適したものを選ぶ
  const selected = {
    composition: null,
    angle: null,
    expression: null,
    pose: null
  };
  
  // 構図の選択
  if (scene.compositions && scene.compositions.length > 0) {
    // フェーズに応じた優先順位
    const priority = phase.name === '雰囲気作り' || phase.name === '前戯への予兆' 
      ? ['face', 'face focus', 'close up', 'upper body', 'cowboy shot']
      : ['upper body', 'cowboy shot', 'close up', 'face'];
    
    for (const priorityComp of priority) {
      const found = scene.compositions.find(compId => {
        const compPrompt = compositions[compId] || '';
        return compPrompt.toLowerCase().includes(priorityComp);
      });
      if (found) {
        selected.composition = compositions[found];
        break;
      }
    }
    
    // 見つからなければ最初の候補を使用
    if (!selected.composition && scene.compositions.length > 0) {
      selected.composition = compositions[scene.compositions[0]] || '';
    }
  }
  
  // アングルの選択
  if (scene.angles && scene.angles.length > 0) {
    // フェーズに応じた優先順位
    const priority = phase.name === '雰囲気作り' || phase.name === '前戯への予兆'
      ? ['from above', 'front view', 'side view']
      : phase.name === '前戯' || phase.name === '本番への予兆'
      ? ['front view', 'side view', 'from above']
      : ['front view', 'side view', 'from above', 'from below'];
    
    for (const priorityAngle of priority) {
      const found = scene.angles.find(angleId => {
        const anglePrompt = angles[angleId] || '';
        return anglePrompt.toLowerCase().includes(priorityAngle);
      });
      if (found) {
        selected.angle = angles[found];
        break;
      }
    }
    
    // 見つからなければ最初の候補を使用
    if (!selected.angle && scene.angles.length > 0) {
      selected.angle = angles[scene.angles[0]] || '';
    }
  }
  
  // 感情の選択
  if (scene.expressions && scene.expressions.length > 0) {
    // フェーズに応じた優先順位
    let priority = [];
    if (phase.name === '雰囲気作り') {
      priority = ['blushing', 'shy', 'bashful', 'smile', 'looking away'];
    } else if (phase.name === '前戯への予兆') {
      priority = ['blushing', 'shy', 'seductive', 'looking at viewer'];
    } else if (phase.name === '前戯') {
      priority = ['pleasure', 'ecstasy', 'blushing', 'moan'];
    } else if (phase.name === '本番への予兆') {
      priority = ['pleasure', 'ecstasy', 'moan', 'blushing'];
    } else if (phase.name === '本番行為') {
      priority = ['pleasure', 'ecstasy', 'orgasm', 'moan', 'ahegao'];
    } else if (phase.name === '絶頂への予兆' || phase.name === '絶頂') {
      priority = ['orgasm', 'extreme orgasm', 'ecstasy', 'ahegao', 'drooling'];
    }
    
    // 優先順位に基づいて選択
    for (const priorityExpr of priority) {
      const found = scene.expressions.find(exprId => {
        const exprPrompt = expressions[exprId] || '';
        return exprPrompt.toLowerCase().includes(priorityExpr);
      });
      if (found) {
        selected.expression = expressions[found];
        break;
      }
    }
    
    // 見つからなければ最初の候補を使用
    if (!selected.expression && scene.expressions.length > 0) {
      selected.expression = expressions[scene.expressions[0]] || '';
    }
  }
  
  // ポーズの選択
  if (scene.poses && scene.poses.length > 0) {
    // フェーズに応じた優先順位
    let priority = [];
    if (phase.name === '雰囲気作り' || phase.name === '前戯への予兆') {
      priority = ['standing', 'sitting', 'hands on face', 'hand over mouth'];
    } else if (phase.name === '前戯') {
      priority = ['on back', 'sitting', 'kneeling', 'hands on body'];
    } else if (phase.name === '本番への予兆') {
      priority = ['on back', 'legs apart', 'sitting', 'kneeling', 'spread legs'];
    } else if (phase.name === '本番行為') {
      priority = ['on back', 'legs apart', 'sitting', 'kneeling', 'arched back'];
    } else if (phase.name === '絶頂への予兆' || phase.name === '絶頂') {
      priority = ['arched back', 'legs apart', 'on back', 'leaning back'];
    }
    
    // 優先順位に基づいて選択
    for (const priorityPose of priority) {
      const found = scene.poses.find(poseId => {
        const posePrompt = poses[poseId] || '';
        return posePrompt.toLowerCase().includes(priorityPose);
      });
      if (found) {
        selected.pose = poses[found];
        break;
      }
    }
    
    // 見つからなければ最初の候補を使用
    if (!selected.pose && scene.poses.length > 0) {
      selected.pose = poses[scene.poses[0]] || '';
    }
  }
  
  return selected;
}

/**
 * プロンプトを生成
 */
function generatePrompt(character, location, bodyPrompt, scene, selectedElements, phase) {
  const commonPrompt = "masterpiece, best quality, exquisite, depth of field, dithering, detailed, anime style, anime artwork, douyin eyes, delicate, clicky eyes, bright highlight";
  
  const promptParts = [];
  
  // 1. 品質タグ
  promptParts.push(commonPrompt);
  
  // 2. キャラクター（括弧で囲む）
  if (character.prompt) {
    const charPrompt = character.prompt.trim();
    if (charPrompt.startsWith('(') && charPrompt.endsWith(')')) {
      promptParts.push(charPrompt);
    } else {
      promptParts.push(`(${charPrompt})`);
    }
  }
  
  // 3. ロケーション
  if (location.prompt) {
    promptParts.push(location.prompt);
  }
  
  // 4. 服装（括弧で囲む）
  if (bodyPrompt) {
    promptParts.push(`(${bodyPrompt})`);
  }
  
  // 5. シーンプロンプト
  if (scene.prompt) {
    promptParts.push(scene.prompt);
  }
  
  // 6. 構図・アングル
  if (selectedElements.composition) {
    promptParts.push(selectedElements.composition);
  }
  if (selectedElements.angle) {
    promptParts.push(selectedElements.angle);
  }
  
  // 7. 感情
  if (selectedElements.expression) {
    promptParts.push(selectedElements.expression);
  }
  
  // 8. ポーズ
  if (selectedElements.pose) {
    promptParts.push(selectedElements.pose);
  }
  
  // 9. NSFW/SEXタグ
  if (scene.nsfw) {
    promptParts.push('nsfw');
  }
  if (scene.sex) {
    promptParts.push('sex');
  }
  
  return promptParts.filter(p => p && p.trim() !== '').join(', ');
}

/**
 * シナリオの各フェーズに適したプロンプトを生成する
 */
function selectPromptsForScenario(scenarioInfo) {
  const data = fs.readJsonSync(promptsPath);
  const masterData = getMasterData(data);
  
  // キャラクターを取得（リナ）
  const character = data.characters.find(c => 
    c.name.includes('リナ') || c.prompt.includes('rina')
  );
  
  if (!character) {
    throw new Error('キャラクター「リナ」が見つかりません');
  }
  
  // ロケーションを取得（ユーザーの部屋）
  const location = data.locations.find(l => 
    l.name.includes('家の中') || l.name.includes('Indoors')
  ) || data.locations[0];
  
  // ボディプロンプト（フェーズに応じて変化）
  const getBodyPrompt = (phase) => {
    if (phase.name === '雰囲気作り' || phase.name === '前戯への予兆') {
      // バスタオル（服として扱う）
      return 'towel, bath towel, wrapped in towel';
    } else if (phase.name === '前戯') {
      // 下着またはヌード
      const underwearPrompts = character.bodyPrompts?.['下着'] || [];
      return underwearPrompts.length > 0 ? underwearPrompts[0] : 'wearing underwear, lingerie';
    } else {
      // ヌード
      const nudePrompts = character.bodyPrompts?.['ヌード'] || [];
      return nudePrompts.length > 0 ? nudePrompts[0] : 'nude, naked';
    }
  };
  
  // フェーズ定義
  const phases = [
    {
      name: '雰囲気作り',
      meroRange: [0, 14],
      section: '雰囲気作り',
      context: {
        state: 'バスタオル一枚の姿で会話している',
        psychology: '恥ずかしさが勝っている。ギャルとしての大胆な振る舞いを装い、間接的にアピール',
        action: '暑いふりをしてタオルの胸元をぱたぱたさせるなど、セクシーさをアピール',
        clothing: 'バスタオル',
        intimacy: '低い',
        nsfw: false,
        sex: false
      }
    },
    {
      name: '前戯への予兆',
      meroRange: [15, 29],
      section: '前戯への予兆',
      context: {
        state: 'バスタオル一枚。少しだけはだけてきている',
        psychology: '恥ずかしさよりも、もっとユーザーに近づきたい、触れたいという気持ちが強くなる',
        action: '「なんか、すっごく熱くなっちゃった…」と言いながら、意図的に衣服を一枚ずつ脱ぎ始める。ベッドへ移動するようにユーザーを誘う',
        clothing: 'バスタオル（少しはだけている）',
        intimacy: '中程度',
        nsfw: true,
        sex: false
      }
    },
    {
      name: '前戯',
      meroRange: [30, 44],
      section: '前戯・奉仕',
      context: {
        state: 'ベッドの上。衣服を脱いでいる、または脱いだ状態',
        psychology: '緊張が解け、純粋な愛情と関係が進展する事への高揚感に満たされる',
        action: 'ユーザーの要求に素直に応じ、受け身の行動を取る',
        clothing: '下着、またはヌード',
        intimacy: '高い',
        nsfw: true,
        sex: false
      }
    },
    {
      name: '本番への予兆',
      meroRange: [45, 64],
      section: '本番への予兆',
      context: {
        state: 'ベッドの上。ほぼ全裸、または全裸',
        psychology: 'もっと深い関係を求めている',
        action: '積極的に誘う、または受け入れる準備ができている',
        clothing: 'ヌード',
        intimacy: '非常に高い',
        nsfw: true,
        sex: true
      }
    },
    {
      name: '本番行為',
      meroRange: [65, 84],
      section: '本番・セックス',
      context: {
        state: 'ベッドの上。全裸。セックス中',
        psychology: '深い快楽と愛情を感じている',
        action: 'セックス行為中',
        clothing: 'ヌード',
        intimacy: '最高',
        nsfw: true,
        sex: true
      }
    },
    {
      name: '絶頂への予兆',
      meroRange: [85, 99],
      section: '絶頂',
      context: {
        state: 'ベッドの上。全裸。セックス中、絶頂が近い',
        psychology: '絶頂が近づいていることを感じている',
        action: '絶頂に向かっている',
        clothing: 'ヌード',
        intimacy: '最高',
        nsfw: true,
        sex: true
      }
    },
    {
      name: '絶頂',
      meroRange: [100, 100],
      section: '絶頂',
      context: {
        state: 'ベッドの上。全裸。絶頂中',
        psychology: '絶頂の快楽に満たされている',
        action: '絶頂中',
        clothing: 'ヌード',
        intimacy: '最高',
        nsfw: true,
        sex: true
      }
    }
  ];
  
  // 各フェーズに適したプロンプトを生成
  const selectedPrompts = [];
  
  for (const phase of phases) {
    console.log(`\n=== ${phase.name} (メロ度 ${phase.meroRange[0]}-${phase.meroRange[1]}) ===`);
    console.log(`状態: ${phase.context.state}`);
    console.log(`心理: ${phase.context.psychology}`);
    console.log(`行動: ${phase.context.action}`);
    
    // このフェーズに適したシーンをフィルタリング
    const candidateScenes = data.scenes.filter(s => {
      // セクションでフィルタ
      if (s.section !== phase.section) {
        return false;
      }
      
      // NSFW/SEXチェック
      if (phase.context.nsfw !== undefined && s.nsfw !== phase.context.nsfw) {
        return false;
      }
      if (phase.context.sex !== undefined && s.sex !== phase.context.sex) {
        return false;
      }
      
      return true;
    });
    
    console.log(`候補シーン数: ${candidateScenes.length}件`);
    
    if (candidateScenes.length === 0) {
      console.log(`⚠️ ${phase.name}に適したシーンが見つかりませんでした`);
      continue;
    }
    
    // 各フェーズで2-3枚を選択（20枚程度になるように調整）
    const countPerPhase = phase.name === '雰囲気作り' ? 3 : 
                         phase.name === '前戯への予兆' ? 3 :
                         phase.name === '前戯' ? 3 :
                         phase.name === '本番への予兆' ? 2 :
                         phase.name === '本番行為' ? 3 :
                         phase.name === '絶頂への予兆' ? 3 :
                         3; // 絶頂
    
    // ランダムにシャッフルして選択
    const shuffled = [...candidateScenes].sort(() => Math.random() - 0.5);
    const selectedScenes = shuffled.slice(0, Math.min(countPerPhase, shuffled.length));
    
    const bodyPrompt = getBodyPrompt(phase);
    
    selectedScenes.forEach((scene, index) => {
      // コンテキストに基づいて適切な要素を選択
      const selectedElements = selectAppropriateElements(phase, scene, masterData);
      
      // プロンプトを生成
      const prompt = generatePrompt(character, location, bodyPrompt, scene, selectedElements, phase);
      
      console.log(`\n  ${index + 1}. ${scene.tag}`);
      console.log(`     構図: ${selectedElements.composition || '未指定'}`);
      console.log(`     アングル: ${selectedElements.angle || '未指定'}`);
      console.log(`     感情: ${selectedElements.expression || '未指定'}`);
      console.log(`     ポーズ: ${selectedElements.pose || '未指定'}`);
      console.log(`     プロンプト: ${prompt.substring(0, 100)}...`);
      
      selectedPrompts.push({
        phase: phase.name,
        meroRange: phase.meroRange,
        sceneTag: scene.tag,
        scenePrompt: scene.prompt,
        composition: selectedElements.composition,
        angle: selectedElements.angle,
        expression: selectedElements.expression,
        pose: selectedElements.pose,
        prompt: prompt,
        description: {
          character: character.name,
          location: location.name,
          body: bodyPrompt,
          scene: scene.tag,
          composition: selectedElements.composition,
          angle: selectedElements.angle,
          expression: selectedElements.expression,
          pose: selectedElements.pose,
          nsfw: scene.nsfw ? 'あり' : 'なし',
          sex: scene.sex ? 'あり' : 'なし'
        }
      });
    });
  }
  
  return selectedPrompts;
}

/**
 * メイン処理
 */
async function main() {
  console.log('=== シナリオベースでプロンプトを生成 ===\n');
  
  // シナリオ情報
  const scenarioInfo = {
    title: 'シャワーの後の、甘い挑発',
    location: 'ユーザーの部屋',
    character: '天羽 リナ'
  };
  
  console.log(`シナリオ: ${scenarioInfo.title}`);
  console.log(`キャラクター: ${scenarioInfo.character}`);
  console.log(`ロケーション: ${scenarioInfo.location}`);
  console.log('');
  
  // 各フェーズに適したプロンプトを生成
  const selectedPrompts = selectPromptsForScenario(scenarioInfo);
  
  console.log(`\n\n=== 生成結果 ===`);
  console.log(`合計: ${selectedPrompts.length}件のプロンプトを生成しました`);
  
  // JSON形式で出力
  const output = {
    scenario: scenarioInfo,
    generatedAt: new Date().toISOString(),
    count: selectedPrompts.length,
    prompts: selectedPrompts
  };
  
  const outputPath = path.join(__dirname, '..', 'scenario-prompts.json');
  fs.writeJsonSync(outputPath, output, { spaces: 2 });
  
  console.log(`\n生成結果を保存しました: ${outputPath}`);
  console.log('\n次のステップ: このJSONファイルを使って画像生成を実行してください');
}

main().catch(error => {
  console.error('エラー:', error);
  process.exit(1);
});
