import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROMPTS_PATH = path.join(__dirname, '..', 'prompts.json');

/**
 * データを読み込む
 */
async function loadData() {
  return await fs.readJson(PROMPTS_PATH);
}

/**
 * ランダムにキャラクターを選択
 */
export async function selectCharacter() {
  const data = await loadData();
  const characters = data.characters;
  return characters[Math.floor(Math.random() * characters.length)];
}

/**
 * ランダムに場所（シナリオ）を選択
 */
export async function selectLocation() {
  const data = await loadData();
  const locations = data.locations;
  return locations[Math.floor(Math.random() * locations.length)];
}

/**
 * ランダムにシーンを選択
 * オプションでフィルタリングも可能
 */
export async function selectScene(filter = {}) {
  const data = await loadData();
  let scenes = data.scenes;

  if (filter.body) {
    scenes = scenes.filter(s => s.body === filter.body);
  }
  
  if (scenes.length === 0) return null;
  return scenes[Math.floor(Math.random() * scenes.length)];
}

/**
 * 動画生成用プロンプトを選択
 */
export async function selectVideoPrompt(scene = null) {
  const data = await loadData();
  const prompts = data.videoPrompts;
  
  // 将来的にはシーンの内容に基づいて選択ロジックを追加
  return prompts[Math.floor(Math.random() * prompts.length)];
}

/**
 * 画像生成用プロンプトを構築する
 * Character + Location + Body + Scene + (Optional Weather/Time)
 */
export async function buildImagePrompt(character, location, scene, weatherTime = null) {
  const data = await loadData();
  
  // Bodyプロンプトの取得 (服、下着、ヌード)
  // CSVのbodyカラムの値に対応するプロンプトを取得
  let bodyPrompt = "";
  
  // CSVのbody値（例: "服", "服_上半身脱衣"）から基本タイプ（服, 下着, ヌード）を判定
  let bodyTypeKey = "服";
  if (scene.body.includes("ヌード")) bodyTypeKey = "ヌード";
  else if (scene.body.includes("下着")) bodyTypeKey = "下着";
  else if (scene.body.includes("服")) bodyTypeKey = "服";
  
  // キャラクター個別のBody設定を使用
  if (character.bodyPrompts && character.bodyPrompts[bodyTypeKey]) {
    const prompts = character.bodyPrompts[bodyTypeKey];
    if (Array.isArray(prompts) && prompts.length > 0) {
      // 配列からランダムに選択
      bodyPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    } else if (typeof prompts === 'string') {
      bodyPrompt = prompts;
    }
  } else {
    // フォールバック（念のため）
    bodyPrompt = bodyTypeKey === "服" ? "wearing clothes" : 
                 bodyTypeKey === "下着" ? "wearing underwear" : "nude";
  }
  
  // 追加のBody状態（上半身脱衣など）を補足
  if (scene.body.includes("上半身脱衣")) {
    bodyPrompt += ", topless, breasts exposed";
  }
  if (scene.body.includes("下半身脱衣")) {
    bodyPrompt += ", bottomless, no panties";
  }

  // 時間帯・天候の選択（引数で指定された場合のみ使用）
  let weatherTimePrompt = "";
  if (weatherTime) {
    weatherTimePrompt = weatherTime;
  }

  // 共通の高品質プロンプト
  const commonPrompt = "masterpiece, best quality, exquisite, depth of field, dithering, detailed, anime style, anime artwork, douyin eyes, delicate, clicky eyes, bright highlight";

  // プロンプトの結合
  // Common + Character + Location + Weather/Time + Body + Scene Action/Tag
  const promptParts = [
    commonPrompt,
    character.prompt,
    location.prompt,
    weatherTimePrompt,
    bodyPrompt,
    scene.prompt // CSVから変換されたアクション/タグの英訳
  ];

  // 空の要素を除外して結合
  return promptParts.filter(p => p && p.trim() !== '').join(', ');
}

