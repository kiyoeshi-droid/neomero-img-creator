import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const promptsPath = path.join(__dirname, '..', 'prompts.json');

// シーンに適した構図・感情・ポーズをチェック
function isAppropriateForScene(scene, composition, expression, pose) {
  const tag = scene.tag || '';
  const section = scene.section || '';
  const promptLower = (scene.prompt || '').toLowerCase();
  
  // 構図チェック（全身構図は避ける）
  if (composition === 'full body' || composition === 'なし') {
    return false;
  }
  
  // シーンタイプに応じたチェック
  if (tag.includes('キス') || promptLower.includes('kiss')) {
    const appropriateExpressions = ['pleasure', 'ecstasy', 'passion', 'kissing', 'love', 'desire'];
    if (expression !== 'なし') {
      const exprLower = expression.toLowerCase();
      const hasAppropriate = appropriateExpressions.some(e => exprLower.includes(e));
      if (!hasAppropriate) return false;
    }
  } else if (tag.includes('手コキ') || tag.includes('フェラ') || promptLower.includes('handjob') || promptLower.includes('blowjob')) {
    const appropriateExpressions = ['pleasure', 'ecstasy', 'arousal', 'moan', 'drooling'];
    const appropriatePoses = ['sitting', 'kneeling', 'on knees', 'on back', 'leaning'];
    if (expression !== 'なし') {
      const exprLower = expression.toLowerCase();
      const hasAppropriate = appropriateExpressions.some(e => exprLower.includes(e));
      if (!hasAppropriate) return false;
    }
    if (pose !== 'なし') {
      const poseLower = pose.toLowerCase();
      const hasAppropriate = appropriatePoses.some(p => poseLower.includes(p));
      if (!hasAppropriate) return false;
    }
  } else if (section === '本番・セックス' || section === '絶頂' || tag.includes('挿入') || tag.includes('射精') || tag.includes('中出し')) {
    const appropriateExpressions = ['pleasure', 'ecstasy', 'orgasm', 'climax', 'drooling', 'moan', 'arching'];
    const appropriatePoses = ['arched back', 'legs apart', 'on back', 'leaning back', 'spread legs', 'sitting', 'on side'];
    if (expression !== 'なし') {
      const exprLower = expression.toLowerCase();
      const hasAppropriate = appropriateExpressions.some(e => exprLower.includes(e));
      if (!hasAppropriate) return false;
    }
    if (pose !== 'なし') {
      const poseLower = pose.toLowerCase();
      const hasAppropriate = appropriatePoses.some(p => poseLower.includes(p));
      if (!hasAppropriate) return false;
    }
  } else if (section === '前戯・奉仕' || section === '前戯への予兆') {
    const appropriateExpressions = ['pleasure', 'arousal', 'blushing', 'excited', 'desire'];
    if (expression !== 'なし') {
      const exprLower = expression.toLowerCase();
      const hasAppropriate = appropriateExpressions.some(e => exprLower.includes(e));
      if (!hasAppropriate) return false;
    }
  }
  
  return true;
}

async function generatePromptForScene(scene, rina, selectedNudePrompt, locations, compositionsData, anglesData, expressionsData, posesData) {
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
  
  const sceneCompositions = scene.compositions || [];
  const sceneAngles = scene.angles || [];
  const sceneExpressions = scene.expressions || [];
  const scenePoses = scene.poses || [];
  
  const allCombinations = [];
  const compList = sceneCompositions.length > 0 ? sceneCompositions : [null];
  const angleList = sceneAngles.length > 0 ? sceneAngles : [null];
  const exprList = sceneExpressions.length > 0 ? sceneExpressions : [null];
  const poseList = scenePoses.length > 0 ? scenePoses : [null];
  
  for (const compId of compList) {
    for (const angleId of angleList) {
      for (const exprId of exprList) {
        for (const poseId of poseList) {
          const compPrompt = compId ? getCompositionPrompt(compId) : '';
          const exprPrompt = exprId ? getExpressionPrompt(exprId) : '';
          const posePrompt = poseId ? getPosePrompt(poseId) : '';
          
          if (!isAppropriateForScene(scene, compPrompt, exprPrompt, posePrompt)) {
            continue;
          }
          
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
          
          const common = "masterpiece, best quality, exquisite, depth of field, dithering, detailed, anime style, anime artwork, douyin eyes, delicate, clicky eyes, bright highlight";
          promptSections.quality.push(common);
          
          if (rina.prompt) {
            const trimmed = rina.prompt.trim();
            if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
              promptSections.character.push(trimmed);
            } else {
              promptSections.character.push(`(${trimmed})`);
            }
          }
          
          const randomLocation = locations[Math.floor(Math.random() * locations.length)];
          promptSections.location.push(randomLocation.prompt);
          
          if (randomLocation.weatherTimePrompts && randomLocation.weatherTimePrompts.length > 0) {
            const randomWeather = randomLocation.weatherTimePrompts[
              Math.floor(Math.random() * randomLocation.weatherTimePrompts.length)
            ];
            promptSections.location.push(randomWeather);
          }
          
          if (selectedNudePrompt) {
            const cleaned = selectedNudePrompt.trim().replace(/,\s*$/, '');
            if (cleaned) {
              promptSections.clothing.push(cleaned);
            }
          }
          
          if (scene.prompt) {
            promptSections.scene.push(scene.prompt);
          }
          
          if (compPrompt) promptSections.composition.push(compPrompt);
          if (angleId) {
            const anglePrompt = getAnglePrompt(angleId);
            if (anglePrompt) promptSections.composition.push(anglePrompt);
          }
          
          if (exprPrompt) promptSections.expression.push(exprPrompt);
          
          if (posePrompt) promptSections.pose.push(posePrompt);
          
          if (scene.nsfw) promptSections.tags.push('nsfw');
          if (scene.sex) promptSections.tags.push('sex');
          
          const finalParts = [];
          
          if (promptSections.quality.length > 0) {
            finalParts.push(promptSections.quality.join(', '));
          }
          
          if (promptSections.character.length > 0) {
            const charPrompt = promptSections.character.join(', ');
            const trimmed = charPrompt.trim();
            if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
              finalParts.push(trimmed);
            } else {
              finalParts.push(`(${trimmed})`);
            }
          }
          
          if (promptSections.location.length > 0) {
            finalParts.push(promptSections.location.join(', '));
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
            location: randomLocation.name,
            weather: randomLocation.weatherTimePrompts && randomLocation.weatherTimePrompts.length > 0 
              ? randomLocation.weatherTimePrompts[Math.floor(Math.random() * randomLocation.weatherTimePrompts.length)]
              : '',
            composition: compPrompt || 'なし',
            angle: angleId ? getAnglePrompt(angleId) : 'なし',
            expression: exprPrompt || 'なし',
            pose: posePrompt || 'なし',
            prompt: finalParts.join(', ')
          });
        }
      }
    }
  }
  
  if (allCombinations.length === 0) {
    return null;
  }
  
  const shuffled = allCombinations.sort(() => Math.random() - 0.5);
  return shuffled[0];
}

async function showLastPrompts() {
  try {
    const data = await fs.readJson(promptsPath);
    
    const rina = data.characters.find(c => 
      c.name.toLowerCase().includes('リナ') || 
      c.name.toLowerCase().includes('rina') ||
      c.prompt.toLowerCase().includes('rina')
    );
    
    if (!rina) {
      console.log('リナが見つかりません');
      return;
    }
    
    const nudePrompts = rina.bodyPrompts?.['ヌード'] || [];
    if (nudePrompts.length === 0) {
      console.log('ヌードのプロンプトが見つかりません');
      return;
    }
    
    const selectedNudePrompt = Array.isArray(nudePrompts) 
      ? nudePrompts[0] 
      : nudePrompts;
    
    const locations = data.locations || [];
    const compositionsData = data.compositions || [];
    const anglesData = data.angles || [];
    const expressionsData = data.expressions || [];
    const posesData = data.poses || [];
    
    const sections = ['雰囲気作り', '前戯への予兆', '前戯・奉仕', '本番・セックス', '絶頂', 'ピロートーク'];
    const selectedScenes = [];
    
    for (const section of sections) {
      const scenesInSection = data.scenes.filter(s => s.section === section);
      if (scenesInSection.length > 0) {
        const randomScene = scenesInSection[Math.floor(Math.random() * scenesInSection.length)];
        selectedScenes.push(randomScene);
      }
    }
    
    console.log('=== コピー用プロンプト一覧 ===\n');
    
    const prompts = [];
    
    for (let i = 0; i < selectedScenes.length; i++) {
      const scene = selectedScenes[i];
      
      let generatedPrompt = null;
      for (let attempt = 0; attempt < 10; attempt++) {
        generatedPrompt = await generatePromptForScene(
          scene, rina, selectedNudePrompt, locations,
          compositionsData, anglesData, expressionsData, posesData
        );
        if (generatedPrompt) break;
      }
      
      if (generatedPrompt) {
        prompts.push({
          scene: scene.tag,
          section: scene.section,
          prompt: generatedPrompt.prompt
        });
      }
    }
    
    // プロンプトのみを表示（コピーしやすい形式）
    console.log('\n【プロンプト一覧】\n');
    prompts.forEach((p, index) => {
      console.log(`--- ${index + 1}. ${p.scene} (${p.section}) ---`);
      console.log(p.prompt);
      console.log('');
    });
    
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

showLastPrompts();

