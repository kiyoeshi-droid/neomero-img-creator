import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROMPTS_PATH = path.join(__dirname, '..', 'prompts.json');

// サイトから抽出した場所データ
const newLocations = [
  // 1. 日常風景
  { name: "家の中 (Indoors)", prompt: "indoors, inside a room, inside the house" },
  { name: "ベッドルーム (Bedroom)", prompt: "in the bedroom, on the bed" },
  { name: "リビング (Living Room)", prompt: "in the living room, in the living" },
  { name: "キッチン (Kitchen)", prompt: "in the kitchen" },
  { name: "バスルーム (Bathroom)", prompt: "in the bathroom" },
  { name: "書斎 (Study)", prompt: "in the study" },
  { name: "玄関 (Foyer)", prompt: "in the foyer, entrance hall" },
  
  // 2. 場所・施設
  { name: "教室 (Classroom)", prompt: "in the classroom, school desk" },
  { name: "オフィス (Office)", prompt: "in the office, office desk" },
  { name: "図書館 (Library)", prompt: "in the library, bookshelves" },
  { name: "カフェ (Cafe)", prompt: "in the cafe, coffee shop" },
  { name: "レストラン (Restaurant)", prompt: "in the restaurant" },
  { name: "バー (Bar)", prompt: "in the bar, bar counter" },
  { name: "コンビニ (Convenience Store)", prompt: "in the convenience store" },
  { name: "スーパー (Supermarket)", prompt: "in the supermarket" },
  { name: "ジム (Gym)", prompt: "in the gym, fitness center" },
  { name: "病院 (Hospital)", prompt: "in the hospital, hospital room" },
  
  { name: "街中 (City Street)", prompt: "on the street, city street, urban" },
  { name: "路地裏 (Back Alley)", prompt: "in the back alley, dark alley" },
  { name: "公園 (Park)", prompt: "in the park, park bench" },
  { name: "ビーチ (Beach)", prompt: "on the beach, seaside, ocean view" },
  { name: "プール (Pool)", prompt: "at the pool, swimming pool" },
  { name: "駅 (Train Station)", prompt: "at the train station, platform" },
  { name: "神社 (Shrine)", prompt: "at the shrine, shinto shrine" },
  { name: "温泉 (Onsen)", prompt: "in the onsen, hot spring" }
];

// 汎用的な時間帯・天候リスト
const defaultWeatherTime = [
  "daytime, sunny, clear sky",
  "sunset, evening, orange sky",
  "night, night view, starry sky",
  "morning, morning light",
  "cloudy, overcast",
  "raining, rainy day"
];

async function importLocations() {
  try {
    console.log('prompts.json を読み込み中...');
    const data = await fs.readJson(PROMPTS_PATH);
    
    if (!data.locations) data.locations = [];

    // 既存のロケーションIDを取得して重複チェックなどをしてもいいが、今回は追加していく
    let startId = Date.now();

    const formattedLocations = newLocations.map((loc, index) => {
      return {
        id: `loc_${startId + index}`,
        name: loc.name,
        prompt: loc.prompt,
        // 各ロケーションにデフォルトの時間帯・天候セットを追加
        weatherTimePrompts: [...defaultWeatherTime] 
      };
    });

    // 既存のデータにも weatherTimePrompts がなければ追加
    data.locations = data.locations.map(loc => {
      if (!loc.weatherTimePrompts) {
        loc.weatherTimePrompts = [...defaultWeatherTime];
      }
      return loc;
    });

    // 新しいデータを追加
    // 重複を避けるため、名前で簡易チェック
    const existingNames = new Set(data.locations.map(l => l.name));
    const uniqueNewLocations = formattedLocations.filter(l => !existingNames.has(l.name));

    data.locations = [...data.locations, ...uniqueNewLocations];
    
    console.log(`${uniqueNewLocations.length} 件の新しいロケーションを追加しました。`);
    
    await fs.writeJson(PROMPTS_PATH, data, { spaces: 2 });
    console.log('prompts.json を更新しました。');
    
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

importLocations();

