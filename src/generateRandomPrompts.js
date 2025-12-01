import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const promptsPath = path.join(__dirname, '..', 'prompts.json');

let generationCount = 0;
const maxGenerations = 20; // 最大再生成回数

async function generateRandomPrompts() {
  generationCount++;
  if (generationCount > maxGenerations) {
    console.log('最大再生成回数に達しました。最後のプロンプトを表示します。');
    generationCount = 0; // リセット
    return;
  }
  try {
    const data = await fs.readJson(promptsPath);
    
    // リナを探す
    const rina = data.characters.find(c => 
      c.name.toLowerCase().includes('リナ') || 
      c.name.toLowerCase().includes('rina') ||
      c.prompt.toLowerCase().includes('rina')
    );
    
    if (!rina) {
      console.log('リナが見つかりません');
      return;
    }
    
    console.log(`キャラクター: ${rina.name}`);
    console.log(`プロンプト: ${rina.prompt}\n`);
    
    // ヌードのボディプロンプトを取得
    const nudePrompts = rina.bodyPrompts?.['ヌード'] || [];
    if (nudePrompts.length === 0) {
      console.log('ヌードのプロンプトが見つかりません');
      return;
    }
    
    const selectedNudePrompt = Array.isArray(nudePrompts) 
      ? nudePrompts[0] 
      : nudePrompts;
    
    console.log(`ボディプロンプト: ${selectedNudePrompt}\n`);
    
    // 中出しのシーンを探す
    const creampieScenes = data.scenes.filter(s => 
      s.tag.includes('中出し') || 
      s.prompt.toLowerCase().includes('creampie') ||
      s.prompt.toLowerCase().includes('cum inside')
    );
    
    if (creampieScenes.length === 0) {
      console.log('中出しのシーンが見つかりません');
      return;
    }
    
    const scene = creampieScenes[0];
    console.log(`シーン: ${scene.tag}`);
    console.log(`プロンプト: ${scene.prompt}\n`);
    
    // マスターデータを取得
    const compositionsData = data.compositions || [];
    const anglesData = data.angles || [];
    const expressionsData = data.expressions || [];
    const posesData = data.poses || [];
    
    // ヘルパー関数
    const getCompositionPrompt = (id) => {
      for (const cat of compositionsData) {
        const item = cat.items.find(c => c.id === id);
        if (item) return item.prompt;
      }
      return '';
    };
    
    const getAnglePrompt = (id) => {
      for (const cat of anglesData) {
        const item = cat.items.find(a => a.id === id);
        if (item) return item.prompt;
      }
      return '';
    };
    
    const getExpressionPrompt = (id) => {
      for (const cat of expressionsData) {
        const item = cat.items.find(e => e.id === id);
        if (item) return item.prompt;
      }
      return '';
    };
    
    const getPosePrompt = (id) => {
      for (const cat of posesData) {
        const item = cat.items.find(p => p.id === id);
        if (item) return item.prompt;
      }
      return '';
    };
    
    // シーンの設定を取得
    const sceneCompositions = scene.compositions || [];
    const sceneAngles = scene.angles || [];
    const sceneExpressions = scene.expressions || [];
    const scenePoses = scene.poses || [];
    
    // 全ての組み合わせを生成
    const allCombinations = [];
    const compList = sceneCompositions.length > 0 ? sceneCompositions : [null];
    const angleList = sceneAngles.length > 0 ? sceneAngles : [null];
    const exprList = sceneExpressions.length > 0 ? sceneExpressions : [null];
    const poseList = scenePoses.length > 0 ? scenePoses : [null];
    
    for (const compId of compList) {
      for (const angleId of angleList) {
        for (const exprId of exprList) {
          for (const poseId of poseList) {
            const promptSections = {
              quality: [],
              character: [],
              location: [],
              clothing: [],
              scene: [],
              composition: [],
              expression: [],
              pose: [],
              tags: []
            };
            
            // 品質タグ
            const common = "masterpiece, best quality, exquisite, depth of field, dithering, detailed, anime style, anime artwork, douyin eyes, delicate, clicky eyes, bright highlight";
            promptSections.quality.push(common);
            
            // キャラクター（既に括弧で囲まれている場合はそのまま、そうでない場合は括弧で囲む）
            if (rina.prompt) {
              // 既に括弧で囲まれているかチェック
              const trimmed = rina.prompt.trim();
              if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
                promptSections.character.push(trimmed);
              } else {
                promptSections.character.push(`(${trimmed})`);
              }
            }
            
            // ロケーション（デフォルトでベッドルームを使用）
            const defaultLocation = "apartment, bedroom";
            promptSections.location.push(defaultLocation);
            
            // 服装（ヌード）- 末尾の余分なカンマやスペースを削除
            if (selectedNudePrompt) {
              const cleaned = selectedNudePrompt.trim().replace(/,\s*$/, '');
              if (cleaned) {
                promptSections.clothing.push(cleaned);
              }
            }
            
            // シーン
            if (scene.prompt) {
              promptSections.scene.push(scene.prompt);
            }
            
            // 構図・アングル
            if (compId) {
              const compPrompt = getCompositionPrompt(compId);
              if (compPrompt) promptSections.composition.push(compPrompt);
            }
            if (angleId) {
              const anglePrompt = getAnglePrompt(angleId);
              if (anglePrompt) promptSections.composition.push(anglePrompt);
            }
            
            // 感情
            if (exprId) {
              const exprPrompt = getExpressionPrompt(exprId);
              if (exprPrompt) promptSections.expression.push(exprPrompt);
            }
            
            // ポーズ
            if (poseId) {
              const posePrompt = getPosePrompt(poseId);
              if (posePrompt) promptSections.pose.push(posePrompt);
            }
            
            // タグ
            if (scene.nsfw) {
              promptSections.tags.push('nsfw');
            }
            if (scene.sex) {
              promptSections.tags.push('sex');
            }
            
            // プロンプトを組み立て
            const finalParts = [];
            
            if (promptSections.quality.length > 0) {
              finalParts.push(promptSections.quality.join(', '));
            }
            
            if (promptSections.character.length > 0) {
              // 既に括弧で囲まれている場合はそのまま、そうでない場合は括弧で囲む
              const charPrompt = promptSections.character.join(', ');
              const trimmed = charPrompt.trim();
              if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
                finalParts.push(trimmed);
              } else {
                finalParts.push(`(${trimmed})`);
              }
            }
            
            if (promptSections.clothing.length > 0) {
              finalParts.push(`(${promptSections.clothing.join(', ')})`);
            }
            
            if (promptSections.scene.length > 0) {
              finalParts.push(promptSections.scene.join(', '));
            }
            
            if (promptSections.composition.length > 0) {
              finalParts.push(promptSections.composition.join(', '));
            }
            
            if (promptSections.expression.length > 0) {
              finalParts.push(promptSections.expression.join(', '));
            }
            
            if (promptSections.pose.length > 0) {
              finalParts.push(promptSections.pose.join(', '));
            }
            
            if (promptSections.tags.length > 0) {
              finalParts.push(promptSections.tags.join(', '));
            }
            
            allCombinations.push({
              composition: compId ? getCompositionPrompt(compId) : 'なし',
              angle: angleId ? getAnglePrompt(angleId) : 'なし',
              expression: exprId ? getExpressionPrompt(exprId) : 'なし',
              pose: poseId ? getPosePrompt(poseId) : 'なし',
              prompt: finalParts.join(', ')
            });
          }
        }
      }
    }
    
    // ロケーションをランダムに選択
    const locations = data.locations || [];
    if (locations.length === 0) {
      console.log('ロケーションが見つかりません');
      return;
    }
    
    const randomLocation = locations[Math.floor(Math.random() * locations.length)];
    console.log(`ロケーション: ${randomLocation.name}`);
    console.log(`プロンプト: ${randomLocation.prompt}`);
    
    // 天候・時間帯をランダムに選択（オプション）
    let weatherPrompt = '';
    if (randomLocation.weatherTimePrompts && randomLocation.weatherTimePrompts.length > 0) {
      const randomWeather = randomLocation.weatherTimePrompts[
        Math.floor(Math.random() * randomLocation.weatherTimePrompts.length)
      ];
      weatherPrompt = randomWeather;
      console.log(`天候・時間帯: ${weatherPrompt}\n`);
    }
    
    // 適切なプロンプトが見つかるまで繰り返す
    let selected = null;
    let attemptCount = 0;
    const maxAttempts = 100; // 最大試行回数
    
    while (!selected && attemptCount < maxAttempts) {
      attemptCount++;
      const shuffled = allCombinations.sort(() => Math.random() - 0.5);
      const candidate = shuffled[0];
      
      // クイックチェック（完全性とシーン品質の基本チェック）
      const promptLower = candidate.prompt.toLowerCase();
      
      // 完全性チェック
      const hasRequired = 
        promptLower.includes('masterpiece') &&
        promptLower.includes('rina') &&
        promptLower.includes('nude') &&
        promptLower.includes('creampie') &&
        promptLower.includes('nsfw') &&
        promptLower.includes('sex');
      
      if (!hasRequired) continue;
      
      // シーン品質チェック（中出しシーンに適した構図・感情・ポーズか）
      const hasAppropriateComposition = 
        candidate.composition !== 'なし' && 
        candidate.composition !== 'full body';
      
      const appropriateExpressions = ['pleasure', 'ecstasy', 'orgasm', 'climax', 'drooling', 'moan', 'arching'];
      const hasAppropriateExpression = candidate.expression === 'なし' || 
        appropriateExpressions.some(e => candidate.expression.toLowerCase().includes(e));
      
      const appropriatePoses = ['arched back', 'legs apart', 'on back', 'leaning back', 'spread legs', 'sitting', 'on side'];
      const hasAppropriatePose = candidate.pose === 'なし' || 
        appropriatePoses.some(p => candidate.pose.toLowerCase().includes(p));
      
      if (hasAppropriateComposition && hasAppropriateExpression && hasAppropriatePose) {
        selected = candidate;
        break;
      }
    }
    
    if (!selected) {
      console.log('適切なプロンプトが見つかりませんでした。最初の候補を使用します。');
      const shuffled = allCombinations.sort(() => Math.random() - 0.5);
      selected = shuffled[0];
    }
    
    // プロンプトを再構築（ロケーションを正しい位置に追加）
    // 構造: 品質, (キャラ), ロケーション, (服装), シーン, 構図, アングル, 感情, ポーズ, タグ
    const promptParts = selected.prompt.split(', ');
    
    // キャラクターの括弧の終わりを見つける
    let charEndIndex = -1;
    let openParenCount = 0;
    for (let i = 0; i < promptParts.length; i++) {
      const part = promptParts[i];
      if (part.startsWith('(')) {
        openParenCount += (part.match(/\(/g) || []).length;
      }
      if (part.endsWith(')')) {
        openParenCount -= (part.match(/\)/g) || []).length;
        if (openParenCount === 0 && part.includes('rina')) {
          charEndIndex = i;
          break;
        }
      }
    }
    
    // 服装の括弧の終わりを見つける
    let clothingEndIndex = -1;
    openParenCount = 0;
    for (let i = charEndIndex + 1; i < promptParts.length; i++) {
      const part = promptParts[i];
      if (part.startsWith('(')) {
        openParenCount += (part.match(/\(/g) || []).length;
      }
      if (part.endsWith(')')) {
        openParenCount -= (part.match(/\)/g) || []).length;
        if (openParenCount === 0 && (part.includes('nude') || part.includes('naked'))) {
          clothingEndIndex = i;
          break;
        }
      }
    }
    
    // ロケーションを服装の後に挿入
    const locationParts = [randomLocation.prompt];
    if (weatherPrompt) {
      locationParts.push(weatherPrompt);
    }
    
    let newPrompt;
    if (clothingEndIndex >= 0) {
      const beforeLocation = promptParts.slice(0, clothingEndIndex + 1).join(', ');
      const afterLocation = promptParts.slice(clothingEndIndex + 1).join(', ');
      newPrompt = `${beforeLocation}, ${locationParts.join(', ')}, ${afterLocation}`;
    } else if (charEndIndex >= 0) {
      const beforeLocation = promptParts.slice(0, charEndIndex + 1).join(', ');
      const afterLocation = promptParts.slice(charEndIndex + 1).join(', ');
      newPrompt = `${beforeLocation}, ${locationParts.join(', ')}, ${afterLocation}`;
    } else {
      newPrompt = `${selected.prompt}, ${locationParts.join(', ')}`;
    }
    
    console.log('=== 生成されたプロンプト ===\n');
    console.log(`構図: ${selected.composition}`);
    console.log(`アングル: ${selected.angle}`);
    console.log(`感情: ${selected.expression}`);
    console.log(`ポーズ: ${selected.pose}`);
    console.log(`\n${newPrompt}\n`);
    
    // クオリティチェック
    console.log('=== クオリティチェック ===\n');
    
    const checks = {
      structure: { passed: true, issues: [] },
      completeness: { passed: true, issues: [] },
      consistency: { passed: true, issues: [] },
      sceneQuality: { passed: true, issues: [] }
    };
    
    // 1. 構造チェック
    const openParens = (newPrompt.match(/\(/g) || []).length;
    const closeParens = (newPrompt.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
      checks.structure.passed = false;
      checks.structure.issues.push(`括弧のバランスが取れていません（開き: ${openParens}, 閉じ: ${closeParens}）`);
    }
    
    // 2. 完全性チェック
    const requiredElements = {
      '品質タグ': ['masterpiece', 'best quality'],
      'キャラクター': ['rina', 'gyaru'],
      'ロケーション': randomLocation.prompt.split(', ')[0],
      '服装': ['nude', 'naked'],
      'シーン': ['creampie', 'cum inside'],
      'タグ': ['nsfw', 'sex']
    };
    
    const promptLower = newPrompt.toLowerCase();
    for (const [element, keywords] of Object.entries(requiredElements)) {
      if (Array.isArray(keywords)) {
        const found = keywords.some(k => promptLower.includes(k.toLowerCase()));
        if (!found) {
          checks.completeness.passed = false;
          checks.completeness.issues.push(`${element}が見つかりません`);
        }
      } else {
        if (!promptLower.includes(keywords.toLowerCase())) {
          checks.completeness.passed = false;
          checks.completeness.issues.push(`${element}が見つかりません`);
        }
      }
    }
    
    // 3. 一貫性チェック（矛盾する要素がないか）
    const contradictions = [
      { keywords: ['standing', 'sitting', 'lying', 'on back', 'on side'], name: '姿勢の矛盾', check: (prompt) => {
        // 複数の姿勢が同時に存在するかチェック（ただし、感情プロンプト内の"arching back"などは除外）
        const standing = prompt.match(/\bstanding\b/i);
        const sitting = prompt.match(/\bsitting\b/i);
        const lying = prompt.match(/\blying\b/i);
        const onBack = prompt.match(/\bon back\b/i);
        const onSide = prompt.match(/\bon side\b/i);
        const poses = [standing, sitting, lying, onBack, onSide].filter(p => p);
        return poses.length > 1;
      }},
      { keywords: ['front view', 'back view', 'side view'], name: '視点の矛盾', check: (prompt) => {
        const frontView = prompt.match(/\bfront view\b/i);
        const backView = prompt.match(/\bback view\b/i);
        const sideView = prompt.match(/\bside view\b/i);
        const views = [frontView, backView, sideView].filter(v => v);
        return views.length > 1;
      }}
    ];
    
    for (const contradiction of contradictions) {
      if (contradiction.check && contradiction.check(newPrompt)) {
        checks.consistency.passed = false;
        checks.consistency.issues.push(`${contradiction.name}が検出されました`);
      }
    }
    
    // 4. シーン品質チェック
    // 中出しシーンに適切な要素が含まれているか
    const sceneQualityChecks = [];
    
    // 構図が適切か（中出しシーンには全身より上半身やクローズアップが適切）
    if (selected.composition === 'なし' || selected.composition === 'full body') {
      sceneQualityChecks.push('構図が指定されていないか、全身構図です（中出しシーンには上半身やクローズアップが適切）');
    }
    
    // 感情が適切か（中出しシーンには快楽や絶頂の感情が適切）
    const appropriateExpressions = ['pleasure', 'ecstasy', 'orgasm', 'climax', 'drooling', 'moan'];
    const hasAppropriateExpression = appropriateExpressions.some(e => 
      promptLower.includes(e.toLowerCase())
    );
    if (!hasAppropriateExpression && selected.expression !== 'なし') {
      sceneQualityChecks.push('感情が中出しシーンに適していない可能性があります');
    }
    
    // ポーズが適切か（中出しシーンには仰け反りや開脚などが適切）
    const appropriatePoses = ['arched back', 'legs apart', 'on back', 'leaning back', 'spread legs'];
    const hasAppropriatePose = appropriatePoses.some(p => 
      promptLower.includes(p.toLowerCase())
    );
    if (!hasAppropriatePose && selected.pose !== 'なし') {
      sceneQualityChecks.push('ポーズが中出しシーンに適していない可能性があります');
    }
    
    if (sceneQualityChecks.length > 0) {
      checks.sceneQuality.passed = false;
      checks.sceneQuality.issues = sceneQualityChecks;
    }
    
    // 結果を表示
    let allPassed = true;
    for (const [checkName, checkResult] of Object.entries(checks)) {
      const status = checkResult.passed ? '✓' : '✗';
      const checkNameJP = {
        structure: '構造',
        completeness: '完全性',
        consistency: '一貫性',
        sceneQuality: 'シーン品質'
      }[checkName];
      
      console.log(`${status} ${checkNameJP}`);
      if (!checkResult.passed) {
        allPassed = false;
        checkResult.issues.forEach(issue => {
          console.log(`  - ${issue}`);
        });
      }
    }
    
    console.log('\n=== 総合評価 ===');
    if (allPassed) {
      console.log('✓ すべてのチェックをパスしました。シーンとして成立しています。');
      generationCount = 0; // リセット
      return; // 適切なプロンプトが見つかったので終了
    } else {
      console.log(`✗ いくつかの問題が見つかりました。再生成します... (試行 ${generationCount}/${maxGenerations})\n`);
      console.log('='.repeat(50) + '\n');
      // 再帰的に再生成
      return await generateRandomPrompts();
    }
    
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

generateRandomPrompts();

