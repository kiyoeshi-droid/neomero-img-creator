import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CSVファイルのパス
const csvPath = '/Users/oshima-kiyoe/Downloads/プライベート、シェア 7/シナリオ シーンリスト 2b05fa2c4df581a8aa72e085be3cf1b1_all.csv';
const promptsJsonPath = path.join(__dirname, '..', 'prompts.json');

// 簡易的なタグ英訳マッピング
const tagMapping = {
  '笑顔': 'smile, happy face',
  '照れ顔': 'blushing, shy face',
  '悲しい顔': 'sad face',
  '怒り顔': 'angry face, annoyed',
  'ほてった顔': 'flushed face, aroused',
  'トロ顔': 'ahegao, rolling eyes, tongue out',
  'アヘ顔': 'ahegao, extreme orgasm face',
  'キス顔': 'kissing face, lips pouting',
  'ディープキス': 'deep kiss, french kiss, tongue kissing',
  '手コキ': 'handjob',
  'フェラチオ': 'blowjob, fellatio',
  '胸を揉まれている': 'groping breasts',
  'パイズリ': 'paizuri, breast sex',
  '乳首を触られている': 'nipple play, touching nipples',
  'オナニー': 'masturbation, touching self',
  '潮吹き': 'squirting, female ejaculation',
  '挿入待ち': 'presenting, spread legs, waiting for insertion',
  '正常位': 'missionary position, sex',
  '騎乗位': 'cowgirl position, straddling',
  '後背位': 'doggystyle, from behind',
  '松葉崩し': 'mating press',
  '素股': 'sumata, femoral sex',
  '顔に射精': 'cum on face, facial',
  '胸に射精': 'cum on breasts',
  '口内に射精': 'cum in mouth',
  '中出し': 'creampie, cum inside',
  'クンニ': 'cunnilingus'
};

async function importCsv() {
  try {
    // CSVを読み込み
    const csvContent = await fs.readFile(csvPath, 'utf-8');
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true
    });

    // prompts.jsonを読み込み
    const promptsData = await fs.readJson(promptsJsonPath);

    // シーンデータを変換
    const scenes = records.map((record, index) => {
      let promptSuffix = '';
      
      // タグから英語プロンプトを推測
      for (const [key, value] of Object.entries(tagMapping)) {
        if (record.tag && record.tag.includes(key)) {
          promptSuffix += value + ', ';
        }
      }
      
      // マッピングになければ日本語タグをそのまま（必要に応じて手動修正）
      if (!promptSuffix) {
        // promptSuffix = record.tag; // 日本語を入れるとノイズになる場合があるので一旦空にするか、ローマ字にするか...
        // ここでは汎用的なタグを入れておく
        promptSuffix = 'high quality, detailed';
      }

      return {
        id: `scene_${index + 1}`,
        sceneId: record.scene,
        action: record.action,
        body: record.body, // "服", "下着" などの日本語のまま。生成時に変換する
        mero_gauge_end: parseInt(record.mero_gauge_end),
        mero_gauge_start: parseInt(record.mero_gauge_start),
        tag: record.tag,
        prompt: promptSuffix.replace(/,\s*$/, '') // 末尾のカンマ削除
      };
    });

    // prompts.jsonを更新
    promptsData.scenes = scenes;
    await fs.writeJson(promptsJsonPath, promptsData, { spaces: 2 });

    console.log(`${scenes.length} 件のシーンをインポートしました。`);

  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

importCsv();

