import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const PROMPTS_PATH = path.join(__dirname, '..', 'prompts.json');

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// キャラクター一覧の取得
app.get('/api/characters', async (req, res) => {
  try {
    const data = await fs.readJson(PROMPTS_PATH);
    res.json(data.characters);
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
    
    if (!updatedCharacter.name || !updatedCharacter.prompt) {
      return res.status(400).json({ error: 'Name and Prompt are required' });
    }

    const data = await fs.readJson(PROMPTS_PATH);
    
    const index = data.characters.findIndex(c => c.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Character not found' });
    }
    
    // IDは変更させない
    updatedCharacter.id = id;
    data.characters[index] = updatedCharacter;
    
    await fs.writeJson(PROMPTS_PATH, data, { spaces: 2 });
    
    res.json(updatedCharacter);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// キャラクターの削除
app.delete('/api/characters/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = await fs.readJson(PROMPTS_PATH);
    
    const initialLength = data.characters.length;
    data.characters = data.characters.filter(c => c.id !== id);
    
    if (data.characters.length === initialLength) {
      return res.status(404).json({ error: 'Character not found' });
    }
    
    await fs.writeJson(PROMPTS_PATH, data, { spaces: 2 });
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- ロケーションAPI ---

// ロケーション一覧の取得
app.get('/api/locations', async (req, res) => {
  try {
    const data = await fs.readJson(PROMPTS_PATH);
    res.json(data.locations);
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
    
    if (!updatedLocation.name || !updatedLocation.prompt) {
      return res.status(400).json({ error: 'Name and Prompt are required' });
    }

    const data = await fs.readJson(PROMPTS_PATH);
    
    const index = data.locations.findIndex(l => l.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Location not found' });
    }
    
    // IDは変更させない
    updatedLocation.id = id;
    data.locations[index] = updatedLocation;
    
    await fs.writeJson(PROMPTS_PATH, data, { spaces: 2 });
    
    res.json(updatedLocation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ロケーションの削除
app.delete('/api/locations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = await fs.readJson(PROMPTS_PATH);
    
    const initialLength = data.locations.length;
    data.locations = data.locations.filter(l => l.id !== id);
    
    if (data.locations.length === initialLength) {
      return res.status(404).json({ error: 'Location not found' });
    }
    
    await fs.writeJson(PROMPTS_PATH, data, { spaces: 2 });
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- シーンAPI ---

// シーン一覧の取得
app.get('/api/scenes', async (req, res) => {
  try {
    const data = await fs.readJson(PROMPTS_PATH);
    res.json(data.scenes);
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
    
    if (!updatedScene.tag || !updatedScene.prompt) {
      return res.status(400).json({ error: 'Tag and Prompt are required' });
    }

    const data = await fs.readJson(PROMPTS_PATH);
    
    const index = data.scenes.findIndex(s => s.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Scene not found' });
    }
    
    // IDは変更させない
    updatedScene.id = id;
    data.scenes[index] = updatedScene;
    
    await fs.writeJson(PROMPTS_PATH, data, { spaces: 2 });
    
    res.json(updatedScene);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// シーンの削除
app.delete('/api/scenes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = await fs.readJson(PROMPTS_PATH);
    
    const initialLength = data.scenes.length;
    data.scenes = data.scenes.filter(s => s.id !== id);
    
    if (data.scenes.length === initialLength) {
      return res.status(404).json({ error: 'Scene not found' });
    }
    
    await fs.writeJson(PROMPTS_PATH, data, { spaces: 2 });
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- 感情プロンプトAPI ---

// 感情プロンプト一覧の取得
app.get('/api/expressions', async (req, res) => {
  try {
    const data = await fs.readJson(PROMPTS_PATH);
    res.json(data.expressions || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- ポーズAPI ---

// ポーズ一覧の取得
app.get('/api/poses', async (req, res) => {
  try {
    const data = await fs.readJson(PROMPTS_PATH);
    res.json(data.poses || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- 構図API ---

app.get('/api/compositions', async (req, res) => {
  try {
    const data = await fs.readJson(PROMPTS_PATH);
    res.json(data.compositions || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- アングルAPI ---

app.get('/api/angles', async (req, res) => {
  try {
    const data = await fs.readJson(PROMPTS_PATH);
    res.json(data.angles || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

