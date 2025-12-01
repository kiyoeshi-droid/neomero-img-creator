import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const promptsPath = path.join(__dirname, '..', 'prompts.json');

async function addKuppaScenes() {
  try {
    const data = await fs.readJson(promptsPath);
    
    if (!data.scenes) {
      console.log('シーンデータが見つかりません');
      return;
    }
    
    // 既存のシーンのタグとプロンプトを確認して重複チェック
    const existingTags = new Set(data.scenes.map(s => s.tag));
    const existingPrompts = new Set(data.scenes.map(s => s.prompt?.toLowerCase() || ''));
    
    const newScenes = [
      {
        tag: "自分の両手で拡げるくぱぁ",
        prompt: "open vagina with my hands, open legs, close up vagina",
        section: "前戯・奉仕",
        expressions: ["expr_1", "expr_2", "expr_3", "expr_29", "expr_32", "expr_33"],
        poses: ["pose_6", "pose_2", "pose_21", "pose_47", "pose_48"]
      },
      {
        tag: "片手のチョキで広げるくぱぁ",
        prompt: "open vagina with 2fingers, show pussy, open legs, close up vagina",
        section: "前戯・奉仕",
        expressions: ["expr_1", "expr_2", "expr_3", "expr_29", "expr_32", "expr_33"],
        poses: ["pose_6", "pose_2", "pose_21", "pose_47", "pose_48"]
      },
      {
        tag: "後ろからお尻といっしょに拡げるくぱぁ",
        prompt: "open hip with my hands, from back, close up vagina, show pussy",
        section: "前戯・奉仕",
        expressions: ["expr_1", "expr_2", "expr_3", "expr_29", "expr_32", "expr_33"],
        poses: ["pose_20", "pose_35", "pose_4", "pose_7", "pose_21"]
      },
      {
        tag: "前から他人に拡げられるくぱぁ",
        prompt: "man open vagina with hands, open legs, close up vagina",
        section: "前戯・奉仕",
        expressions: ["expr_1", "expr_2", "expr_3", "expr_29", "expr_32", "expr_33", "expr_46"],
        poses: ["pose_6", "pose_2", "pose_21", "pose_47", "pose_48", "pose_52"]
      },
      {
        tag: "後ろから男に拡げられるくぱぁ",
        prompt: "man behind girl, man open vagina with hands, open legs, close up vagina",
        section: "前戯・奉仕",
        expressions: ["expr_1", "expr_2", "expr_3", "expr_29", "expr_32", "expr_33", "expr_46"],
        poses: ["pose_6", "pose_2", "pose_21", "pose_35", "pose_47", "pose_48"]
      }
    ];
    
    let addedCount = 0;
    
    newScenes.forEach(scene => {
      // 重複チェック（タグとプロンプトの両方）
      const tagExists = existingTags.has(scene.tag);
      const promptExists = existingPrompts.has(scene.prompt.toLowerCase());
      
      if (!tagExists && !promptExists) {
        const timestamp = Date.now();
        const newScene = {
          id: `scene_${timestamp}`,
          tag: scene.tag,
          prompt: scene.prompt,
          section: scene.section,
          expressions: scene.expressions,
          poses: scene.poses
        };
        
        data.scenes.push(newScene);
        existingTags.add(scene.tag);
        existingPrompts.add(scene.prompt.toLowerCase());
        addedCount++;
        console.log(`追加: "${scene.tag}"`);
      } else {
        console.log(`スキップ（重複）: "${scene.tag}"`);
      }
    });
    
    await fs.writeJson(promptsPath, data, { spaces: 2 });
    console.log(`\n合計 ${addedCount} 個のシーンを追加しました。`);
    
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

addKuppaScenes();

