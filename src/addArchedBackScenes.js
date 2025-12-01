import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const promptsPath = path.join(__dirname, '..', 'prompts.json');

async function addArchedBackScenes() {
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
        tag: "正面から見た仰け反り絶頂",
        prompt: "Adam's apple, leaning back, arched back, head back, woman on top",
        section: "絶頂",
        expressions: ["expr_43", "expr_42", "expr_44", "expr_35", "expr_47"],
        poses: ["pose_34", "pose_36", "pose_54", "pose_6", "pose_20"]
      },
      {
        tag: "横から見た仰け反り絶頂",
        prompt: "Adam's apple, leaning back, arched back, head back, woman on top, from side",
        section: "絶頂",
        expressions: ["expr_43", "expr_42", "expr_44", "expr_35", "expr_47"],
        poses: ["pose_34", "pose_36", "pose_54", "pose_6", "pose_20"]
      },
      {
        tag: "後ろから見た仰け反り絶頂",
        prompt: "leaning back, arched back, head back, woman on top, from back",
        section: "絶頂",
        expressions: ["expr_43", "expr_42", "expr_44", "expr_35", "expr_47"],
        poses: ["pose_34", "pose_36", "pose_54", "pose_6", "pose_20"]
      },
      {
        tag: "しゃがんで後ろに手をつく仰け反り絶頂（正面）",
        prompt: "squatting, hands on behind, knee apart, Adam's apple, leaning back, arched back, head back, woman on top",
        section: "絶頂",
        expressions: ["expr_43", "expr_42", "expr_44", "expr_35", "expr_47"],
        poses: ["pose_9", "pose_41", "pose_21", "pose_34", "pose_54"]
      },
      {
        tag: "しゃがんで後ろに手をつく仰け反り絶頂（横）",
        prompt: "squatting, hands on behind, knee apart, Adam's apple, leaning back, arched back, head back, woman on top, from side",
        section: "絶頂",
        expressions: ["expr_43", "expr_42", "expr_44", "expr_35", "expr_47"],
        poses: ["pose_9", "pose_41", "pose_21", "pose_34", "pose_54"]
      },
      {
        tag: "しゃがんで後ろに手をつく仰け反り絶頂（後ろ）",
        prompt: "squatting, hands on behind, knee apart, leaning back, arched back, head back, woman on top, from back",
        section: "絶頂",
        expressions: ["expr_43", "expr_42", "expr_44", "expr_35", "expr_47"],
        poses: ["pose_9", "pose_41", "pose_21", "pose_34", "pose_54"]
      },
      {
        tag: "ブリッジ姿勢でのオナニー",
        prompt: "bridge pose, masturbation, arched back, head back",
        section: "前戯・奉仕",
        expressions: ["expr_29", "expr_33", "expr_41", "expr_42", "expr_43"],
        poses: ["pose_40", "pose_34", "pose_54", "pose_21"]
      },
      {
        tag: "エビ反り絶頂",
        prompt: "arched back, head back, Adam's apple, orgasm",
        section: "絶頂",
        expressions: ["expr_43", "expr_42", "expr_44", "expr_35", "expr_47", "expr_45"],
        poses: ["pose_34", "pose_54", "pose_40", "pose_21", "pose_50"]
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

addArchedBackScenes();

