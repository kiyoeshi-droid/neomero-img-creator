import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Vercelでは環境変数から取得、ローカルでは相対パス
const PROMPTS_PATH = process.env.VERCEL 
  ? path.join('/tmp', 'prompts.json')
  : path.join(__dirname, '..', 'prompts.json');

app.use(cors());
app.use(bodyParser.json());

// 静的ファイルの配信（Vercelでは自動的にpublic/が配信されるため、API経由では不要）
// ただし、開発環境では必要
if (!process.env.VERCEL) {
  app.use(express.static(path.join(__dirname, '..', 'public')));
}

// キャラクター一覧の取得
app.get('/api/characters', async (req, res) => {
  try {
    const data = await fs.readJson(PROMPTS_PATH);
    res.json(data.characters || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// キャラクターの追加
app.post('/api/characters', async (req, res) => {
  try {
    const newCharacter = req.body;
    
    if (!newCharacter.name || !newCharacter.prompt) {
      return res.status(400).json({ error: 'Name and Prompt are required' });
    }

    const data = await fs.readJson(PROMPTS_PATH);
    
    // ID生成
    const timestamp = Date.now();
    newCharacter.id = `char_${timestamp}`;
    
    if (!data.characters) {
      data.characters = [];
    }
    data.characters.push(newCharacter);
    
    await fs.writeJson(PROMPTS_PATH, data, { spaces: 2 });
    
    res.status(201).json(newCharacter);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// キャラクターの更新
app.put('/api/characters/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedCharacter = req.body;
    
    const data = await fs.readJson(PROMPTS_PATH);
    const index = data.characters.findIndex(c => c.id === id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Character not found' });
    }
    
    data.characters[index] = { ...data.characters[index], ...updatedCharacter, id };
    await fs.writeJson(PROMPTS_PATH, data, { spaces: 2 });
    
    res.json(data.characters[index]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// キャラクターの削除
app.delete('/api/characters/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const data = await fs.readJson(PROMPTS_PATH);
    data.characters = data.characters.filter(c => c.id !== id);
    
    await fs.writeJson(PROMPTS_PATH, data, { spaces: 2 });
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ロケーション一覧の取得
app.get('/api/locations', async (req, res) => {
  try {
    const data = await fs.readJson(PROMPTS_PATH);
    res.json(data.locations || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ロケーションの追加
app.post('/api/locations', async (req, res) => {
  try {
    const newLocation = req.body;
    
    if (!newLocation.name || !newLocation.prompt) {
      return res.status(400).json({ error: 'Name and Prompt are required' });
    }

    const data = await fs.readJson(PROMPTS_PATH);
    
    // ID生成
    const timestamp = Date.now();
    newLocation.id = `loc_${timestamp}`;
    
    if (!data.locations) {
      data.locations = [];
    }
    data.locations.push(newLocation);
    
    await fs.writeJson(PROMPTS_PATH, data, { spaces: 2 });
    
    res.status(201).json(newLocation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ロケーションの更新
app.put('/api/locations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedLocation = req.body;
    
    const data = await fs.readJson(PROMPTS_PATH);
    const index = data.locations.findIndex(l => l.id === id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Location not found' });
    }
    
    data.locations[index] = { ...data.locations[index], ...updatedLocation, id };
    await fs.writeJson(PROMPTS_PATH, data, { spaces: 2 });
    
    res.json(data.locations[index]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ロケーションの削除
app.delete('/api/locations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const data = await fs.readJson(PROMPTS_PATH);
    data.locations = data.locations.filter(l => l.id !== id);
    
    await fs.writeJson(PROMPTS_PATH, data, { spaces: 2 });
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// シーン一覧の取得
app.get('/api/scenes', async (req, res) => {
  try {
    const data = await fs.readJson(PROMPTS_PATH);
    res.json(data.scenes || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// シーンの追加
app.post('/api/scenes', async (req, res) => {
  try {
    const newScene = req.body;
    
    if (!newScene.tag || !newScene.prompt) {
      return res.status(400).json({ error: 'Tag and Prompt are required' });
    }

    const data = await fs.readJson(PROMPTS_PATH);
    
    // ID生成
    const timestamp = Date.now();
    newScene.id = `scene_${timestamp}`;
    
    if (!data.scenes) {
      data.scenes = [];
    }
    data.scenes.push(newScene);
    
    await fs.writeJson(PROMPTS_PATH, data, { spaces: 2 });
    
    res.status(201).json(newScene);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// シーンの更新
app.put('/api/scenes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedScene = req.body;
    
    const data = await fs.readJson(PROMPTS_PATH);
    const index = data.scenes.findIndex(s => s.id === id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Scene not found' });
    }
    
    data.scenes[index] = { ...data.scenes[index], ...updatedScene, id };
    await fs.writeJson(PROMPTS_PATH, data, { spaces: 2 });
    
    res.json(data.scenes[index]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// シーンの削除
app.delete('/api/scenes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const data = await fs.readJson(PROMPTS_PATH);
    data.scenes = data.scenes.filter(s => s.id !== id);
    
    await fs.writeJson(PROMPTS_PATH, data, { spaces: 2 });
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 感情マスターデータの取得
app.get('/api/expressions', async (req, res) => {
  try {
    const data = await fs.readJson(PROMPTS_PATH);
    res.json(data.expressions || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ポーズマスターデータの取得
app.get('/api/poses', async (req, res) => {
  try {
    const data = await fs.readJson(PROMPTS_PATH);
    res.json(data.poses || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 構図マスターデータの取得
app.get('/api/compositions', async (req, res) => {
  try {
    const data = await fs.readJson(PROMPTS_PATH);
    res.json(data.compositions || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// アングルマスターデータの取得
app.get('/api/angles', async (req, res) => {
  try {
    const data = await fs.readJson(PROMPTS_PATH);
    res.json(data.angles || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Vercel用のエクスポート
export default app;

