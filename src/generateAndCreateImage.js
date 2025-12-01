import { chromium } from 'playwright';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const promptsPath = path.join(__dirname, '..', 'prompts.json');
const configPath = path.join(__dirname, '..', 'config.json');

// シーンに適した構図・感情・ポーズをチェック
function isAppropriateForScene(scene, composition, expression, pose) {
  const tag = scene.tag || '';
  const section = scene.section || '';
  const promptLower = (scene.prompt || '').toLowerCase();
  
  if (composition === 'full body' || composition === 'なし') {
    return false;
  }
  
  if (section === '本番・セックス' || section === '絶頂' || tag.includes('挿入') || tag.includes('射精') || tag.includes('中出し')) {
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
  }
  
  return true;
}

async function generateRandomPrompt() {
  const data = await fs.readJson(promptsPath);
  
  // リナを探す
  const rina = data.characters.find(c => 
    c.name.toLowerCase().includes('リナ') || 
    c.name.toLowerCase().includes('rina') ||
    c.prompt.toLowerCase().includes('rina')
  );
  
  if (!rina) {
    throw new Error('リナが見つかりません');
  }
  
  // ヌードのボディプロンプトを取得
  const nudePrompts = rina.bodyPrompts?.['ヌード'] || [];
  if (nudePrompts.length === 0) {
    throw new Error('ヌードのプロンプトが見つかりません');
  }
  
  const selectedNudePrompt = Array.isArray(nudePrompts) 
    ? nudePrompts[0] 
    : nudePrompts;
  
  // ロケーションをランダムに選択
  const locations = data.locations || [];
  if (locations.length === 0) {
    throw new Error('ロケーションが見つかりません');
  }
  const randomLocation = locations[Math.floor(Math.random() * locations.length)];
  
  // 天候・時間帯をランダムに選択
  let weatherPrompt = '';
  if (randomLocation.weatherTimePrompts && randomLocation.weatherTimePrompts.length > 0) {
    const randomWeather = randomLocation.weatherTimePrompts[
      Math.floor(Math.random() * randomLocation.weatherTimePrompts.length)
    ];
    weatherPrompt = randomWeather;
  }
  
  // シーンをランダムに選択（NSFWまたはSEXがtrueのもの）
  const nsfwScenes = data.scenes.filter(s => s.nsfw || s.sex);
  if (nsfwScenes.length === 0) {
    throw new Error('NSFWシーンが見つかりません');
  }
  const randomScene = nsfwScenes[Math.floor(Math.random() * nsfwScenes.length)];
  
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
  const sceneCompositions = randomScene.compositions || [];
  const sceneAngles = randomScene.angles || [];
  const sceneExpressions = randomScene.expressions || [];
  const scenePoses = randomScene.poses || [];
  
  // 適切な組み合わせを探す
  const compList = sceneCompositions.length > 0 ? sceneCompositions : [null];
  const angleList = sceneAngles.length > 0 ? sceneAngles : [null];
  const exprList = sceneExpressions.length > 0 ? sceneExpressions : [null];
  const poseList = scenePoses.length > 0 ? scenePoses : [null];
  
  const allCombinations = [];
  
  for (const compId of compList) {
    for (const angleId of angleList) {
      for (const exprId of exprList) {
        for (const poseId of poseList) {
          const compPrompt = compId ? getCompositionPrompt(compId) : '';
          const exprPrompt = exprId ? getExpressionPrompt(exprId) : '';
          const posePrompt = poseId ? getPosePrompt(poseId) : '';
          
          if (!isAppropriateForScene(randomScene, compPrompt, exprPrompt, posePrompt)) {
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
          
          promptSections.location.push(randomLocation.prompt);
          if (weatherPrompt) {
            promptSections.location.push(weatherPrompt);
          }
          
          if (selectedNudePrompt) {
            const cleaned = selectedNudePrompt.trim().replace(/,\s*$/, '');
            if (cleaned) {
              promptSections.clothing.push(cleaned);
            }
          }
          
          if (randomScene.prompt) {
            promptSections.scene.push(randomScene.prompt);
          }
          
          if (compPrompt) promptSections.composition.push(compPrompt);
          if (angleId) {
            const anglePrompt = getAnglePrompt(angleId);
            if (anglePrompt) promptSections.composition.push(anglePrompt);
          }
          
          if (exprPrompt) promptSections.expression.push(exprPrompt);
          
          if (posePrompt) promptSections.pose.push(posePrompt);
          
          if (randomScene.nsfw) promptSections.tags.push('nsfw');
          if (randomScene.sex) promptSections.tags.push('sex');
          
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
            prompt: finalParts.join(', ')
          });
        }
      }
    }
  }
  
  if (allCombinations.length === 0) {
    throw new Error('適切なプロンプトの組み合わせが見つかりませんでした');
  }
  
  const shuffled = allCombinations.sort(() => Math.random() - 0.5);
  return {
    scene: randomScene.tag,
    location: randomLocation.name,
    prompt: shuffled[0].prompt
  };
}

async function findPreviousGenerationSettings(page) {
  console.log('左ペインの画像一覧から「neomero, rina」を含む画像を探しています...');
  
  try {
    // 左ペインの画像一覧を探す
    await page.waitForTimeout(3000);
    
    // 左ペインの画像一覧を探す（複数のセレクタを試す）
    const leftPanelSelectors = [
      '[class*="sidebar"]',
      '[class*="left"]',
      '[class*="panel"]',
      '[class*="history"]',
      '[class*="gallery"]',
      'aside',
      'nav'
    ];
    
    let leftPanel = null;
    for (const selector of leftPanelSelectors) {
      try {
        const panels = await page.$$(selector);
        for (const panel of panels) {
          const rect = await panel.boundingBox();
          if (rect && rect.x < 400) { // 左側にある要素
            leftPanel = panel;
            console.log(`左ペインを見つけました: ${selector}`);
            break;
          }
        }
        if (leftPanel) break;
      } catch (e) {
        continue;
      }
    }
    
    if (!leftPanel) {
      // 左ペインが見つからない場合は、画像要素を直接探す
      console.log('左ペインが見つかりませんでした。画像要素を直接探します。');
      const allImages = await page.$$('img');
      if (allImages.length > 0) {
        // 一番上の画像をクリック（左側にある画像を優先）
        for (const img of allImages) {
          try {
            const rect = await img.boundingBox();
            if (rect && rect.x < 400 && rect.y < 500) { // 左側で上にある画像
              console.log('左側の画像を見つけました。クリックします。');
              await img.click();
              await page.waitForTimeout(3000);
              return true;
            }
          } catch (e) {
            continue;
          }
        }
        
        // 左側の画像が見つからない場合は、一番上の画像をクリック
        if (allImages.length > 0) {
          console.log('一番上の画像をクリックします。');
          await allImages[0].click();
          await page.waitForTimeout(3000);
          return true;
        }
      }
      return false;
    }
    
    // 左ペイン内の画像を探す
    const imagesInPanel = await leftPanel.$$('img, [class*="image"], [class*="thumbnail"], [class*="card"]');
    console.log(`左ペイン内に${imagesInPanel.length}個の要素が見つかりました`);
    
    if (imagesInPanel.length === 0) {
      return false;
    }
    
    // 一番上の画像をクリック
    console.log('左ペインの一番上の画像をクリックします。');
    await imagesInPanel[0].click();
    await page.waitForTimeout(3000);
    
    console.log('画像の詳細画面を開きました。設定が読み込まれました。');
    return true;
    
  } catch (error) {
    console.log('過去の設定の読み込みに失敗しました:', error.message);
    return false;
  }
}

async function generateImageWithPixAI(prompt) {
  const config = await fs.readJson(configPath);
  
  // ユーザーデータディレクトリを指定してブラウザを起動（ログイン状態を保持）
  const userDataDir = path.join(__dirname, '..', '.browser-data');
  await fs.ensureDir(userDataDir);
  
  const browser = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    slowMo: 500,
    viewport: { width: 1280, height: 720 }
  });
  
  let page;
  
  try {
    // 既存のページを使用するか、新しいページを作成
    const pages = browser.pages();
    if (pages.length > 0) {
      page = pages[0];
    } else {
      page = await browser.newPage();
    }
    
    console.log('PixAIにアクセス中...');
    await page.goto('https://pixai.art/ja/generator/image', { 
      waitUntil: 'domcontentloaded',
      timeout: 120000 
    });
    
    // ページが読み込まれるまで待機
    await page.waitForTimeout(5000);
    
    // 過去の生成履歴から設定を取得（左ペインの一番上の画像をクリック）
    const foundSettings = await findPreviousGenerationSettings(page);
    
    // 設定が見つかった場合は、その画面でプロンプトを更新する
    // 見つからなかった場合は、通常の生成ページで続行
    if (!foundSettings) {
      console.log('過去の設定が見つかりませんでした。通常の生成ページで続行します。');
      await page.goto('https://pixai.art/ja/generator/image', {
        waitUntil: 'domcontentloaded',
        timeout: 120000
      });
      await page.waitForTimeout(5000);
    }
    
    // ログイン状態を確認（ログインボタンが表示されていないか確認）
    console.log('ログイン状態を確認中...');
    await page.waitForTimeout(3000);
    
    // ログインボタンが表示されているか、またはGoogleログインページにリダイレクトされているか確認
    const currentUrl = page.url();
    if (currentUrl.includes('accounts.google.com') || currentUrl.includes('signin')) {
      console.log('ログインページにリダイレクトされました。ログインを完了してください...');
      console.log('ログイン完了後、PixAIの画像生成ページに戻るまで待機します...');
      
      // PixAIの画像生成ページに戻るまで待機（最大120秒）
      await page.waitForFunction(
        () => {
          const url = window.location.href;
          return url.includes('pixai.art') && url.includes('generator/image');
        },
        { timeout: 120000 }
      );
      console.log('ログインが完了し、画像生成ページに戻りました。');
      await page.waitForTimeout(3000);
    } else {
      // ログインボタンが表示されているか確認
      try {
        const loginButton = await page.$('button:has-text("ログイン")');
        if (loginButton && await loginButton.isVisible()) {
          console.log('ログインが必要です。ログインを完了してください...');
          // ログインボタンが消えるまで待機（最大120秒）
          await page.waitForFunction(
            () => {
              const loginBtn = document.querySelector('button:has-text("ログイン")');
              return !loginBtn || loginBtn.offsetParent === null;
            },
            { timeout: 120000 }
          );
          console.log('ログインが完了しました。');
          await page.waitForTimeout(2000);
        }
      } catch (e) {
        // ログインボタンが見つからない場合は既にログイン済みと判断
        console.log('既にログイン済みのようです。');
      }
    }
    
    // プロンプト入力欄を探す
    console.log('プロンプト入力欄を探しています...');
    const promptTextarea = await page.waitForSelector('textarea', { timeout: 10000 });
    
    if (!promptTextarea) {
      await page.screenshot({ path: 'pixai-debug.png', fullPage: true });
      console.log('デバッグ用スクリーンショットを保存しました: pixai-debug.png');
      throw new Error('プロンプト入力欄が見つかりませんでした');
    }
    
    console.log('プロンプトを入力中...');
    console.log(`プロンプト内容: ${prompt.substring(0, 100)}...`);
    
    // 既存のテキストをクリアしてから入力
    await promptTextarea.click({ clickCount: 3 });
    await page.waitForTimeout(500);
    await promptTextarea.fill('');
    await page.waitForTimeout(500);
    await promptTextarea.type(prompt, { delay: 10 });
    await page.waitForTimeout(2000);
    
    // プロンプトが正しく入力されたか確認
    const inputValue = await promptTextarea.inputValue();
    if (!inputValue || inputValue.length < 10) {
      console.error('プロンプトが正しく入力されていません。再試行します...');
      await promptTextarea.fill(prompt);
      await page.waitForTimeout(2000);
    }
    
    console.log(`プロンプト入力完了（${inputValue.length}文字）`);
    
    // 紫の生成ボタンを探す（プロンプト入力欄のすぐ下にある）
    console.log('紫の生成ボタンを探しています...');
    let generateButton = null;
    
    // まず、プロンプト入力欄の位置を取得
    const promptRect = await promptTextarea.boundingBox();
    
    // プロンプト入力欄の下にある紫のボタンを探す
    const allButtons = await page.$$('button, [role="button"], [class*="button"]');
    console.log(`ページ内に${allButtons.length}個のボタン要素が見つかりました`);
    
    for (const button of allButtons) {
      try {
        const rect = await button.boundingBox();
        const isVisible = await button.isVisible();
        const computedStyle = await page.evaluate((btn) => {
          const style = window.getComputedStyle(btn);
          return {
            backgroundColor: style.backgroundColor,
            color: style.color,
            borderColor: style.borderColor
          };
        }, button);
        
        // 紫のボタンかどうかを判定（rgba(128, 0, 128) や purple など）
        const bgColor = computedStyle.backgroundColor.toLowerCase();
        const isPurple = bgColor.includes('128') && bgColor.includes('0') && bgColor.includes('purple') ||
                        bgColor.includes('rgb(128') || bgColor.includes('rgba(128') ||
                        bgColor.includes('purple') || bgColor.includes('violet');
        
        // プロンプト入力欄の下にあるか確認
        const isBelowPrompt = promptRect && rect && rect.y > promptRect.y + promptRect.height - 50;
        
        if (isVisible && (isPurple || isBelowPrompt)) {
          const text = await button.textContent();
          if (text && (text.includes('生成') || text.includes('Generate') || text.trim() === '')) {
            generateButton = button;
            console.log(`紫の生成ボタンを見つけました: "${text.trim()}" (背景色: ${bgColor})`);
            break;
          }
        }
      } catch (e) {
        continue;
      }
    }
    
    // 見つからない場合は、プロンプト入力欄の下にあるボタンを探す
    if (!generateButton && promptRect) {
      for (const button of allButtons) {
        try {
          const rect = await button.boundingBox();
          const isVisible = await button.isVisible();
          
          // プロンプト入力欄の下にあるボタン（y座標がpromptRect.y + promptRect.heightより大きい）
          if (isVisible && rect && rect.y > promptRect.y + promptRect.height - 100 && rect.y < promptRect.y + promptRect.height + 200) {
            const text = await button.textContent();
            if (text && (text.includes('生成') || text.includes('Generate'))) {
              generateButton = button;
              console.log(`生成ボタンを見つけました（位置ベース）: "${text.trim()}"`);
              break;
            }
          }
        } catch (e) {
          continue;
        }
      }
    }
    
    // それでも見つからない場合は、テキストで探す
    if (!generateButton) {
      const buttonSelectors = [
        'button:has-text("生成")',
        'button:has-text("Generate")'
      ];
      
      for (const selector of buttonSelectors) {
        try {
          const buttons = await page.$$(selector);
          for (const btn of buttons) {
            if (await btn.isVisible()) {
              generateButton = btn;
              console.log(`生成ボタンを見つけました（セレクタ）: ${selector}`);
              break;
            }
          }
          if (generateButton) break;
        } catch (e) {
          continue;
        }
      }
    }
    
    if (!generateButton) {
      await page.screenshot({ path: 'pixai-debug-button.png', fullPage: true });
      console.log('デバッグ用スクリーンショットを保存しました: pixai-debug-button.png');
      throw new Error('生成ボタンが見つかりませんでした');
    }
    
    console.log('画像生成を開始します...');
    await generateButton.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    
    // 複数の方法でクリックを試す
    try {
      await generateButton.click({ timeout: 5000 });
      console.log('生成ボタンをクリックしました（通常のクリック）');
    } catch (e) {
      try {
        await generateButton.dispatchEvent('click');
        console.log('生成ボタンをクリックしました（dispatchEvent）');
      } catch (e2) {
        // JavaScriptで直接クリック
        await page.evaluate((btn) => {
          if (btn) btn.click();
        }, generateButton);
        console.log('生成ボタンをクリックしました（JavaScript実行）');
      }
    }
    
    await page.waitForTimeout(2000);
    
    console.log('画像生成中...（完了まで待機します）');
    
    // 生成開始の確認（ローディングインジケーターなど）
    await page.waitForTimeout(5000);
    
    // 生成された画像を待機（最大10分）
    // 画像が表示されるまで待つ
    let imagesFound = false;
    const maxWaitTime = 600000; // 10分
    const checkInterval = 5000; // 5秒ごとにチェック
    const startTime = Date.now();
    
    console.log('生成完了を待機中...（最大10分）');
    
    while (Date.now() - startTime < maxWaitTime) {
      // 生成された画像を探す
      const imageSelectors = [
        'img[src*="generated"]',
        'img[src*="result"]',
        'img[alt*="generated"]',
        '.generated-image img',
        '.result img',
        '[class*="generated"] img',
        '[class*="result"] img'
      ];
      
      const images = [];
      for (const selector of imageSelectors) {
        try {
          const imgs = await page.$$(selector);
          for (const img of imgs) {
            const src = await img.getAttribute('src');
            if (src && (src.includes('http') || src.startsWith('data:image'))) {
              images.push(src);
            }
          }
        } catch (e) {
          continue;
        }
      }
      
      // ページ内のすべての画像を確認（生成された画像を探す）
      try {
        // 生成された画像を探す（より広範囲に検索）
        const allImages = await page.$$eval('img', imgs => 
          imgs
            .map(img => ({
              src: img.src,
              alt: img.alt || '',
              className: img.className || ''
            }))
            .filter(img => 
              img.src && 
              img.src.includes('http') && 
              !img.src.includes('logo') && 
              !img.src.includes('icon') &&
              !img.src.includes('avatar') &&
              !img.src.includes('google') &&
              (img.src.includes('generated') || 
               img.src.includes('result') || 
               img.src.includes('cdn') || 
               img.src.includes('storage') ||
               img.src.includes('pixai') ||
               img.className.includes('generated') ||
               img.className.includes('result'))
            )
            .map(img => img.src)
        );
        
        // 重複を削除
        const uniqueImages = [...new Set(allImages)];
        
        if (uniqueImages.length >= 4) {
          imagesFound = true;
          console.log(`${uniqueImages.length}枚の画像が見つかりました。`);
          
          // 画像保存用ディレクトリを作成
          const outputDir = path.join(__dirname, '..', 'generated-images');
          await fs.ensureDir(outputDir);
          
          // タイムスタンプ付きのフォルダを作成
          const timestamp = Date.now();
          const sceneFolder = path.join(outputDir, `generation-${timestamp}`);
          await fs.ensureDir(sceneFolder);
          
          console.log(`画像を保存中: ${sceneFolder}`);
          
          // 各画像をダウンロード（最大4枚）
          for (let i = 0; i < Math.min(uniqueImages.length, 4); i++) {
            try {
              const imageUrl = uniqueImages[i];
              console.log(`画像 ${i + 1}/4 をダウンロード中: ${imageUrl.substring(0, 50)}...`);
              
              // 画像を取得（page.requestを使用）
              try {
                const response = await page.request.get(imageUrl);
                if (response && response.ok()) {
                  const buffer = await response.body();
                  const imagePath = path.join(sceneFolder, `image-${i + 1}.png`);
                  await fs.writeFile(imagePath, buffer);
                  console.log(`保存完了: ${imagePath}`);
                } else {
                  console.error(`画像 ${i + 1} のダウンロードに失敗しました: HTTP ${response?.status()}`);
                }
              } catch (downloadError) {
                // 別の方法で試す：画像要素から直接ダウンロード
                try {
                  const imgElement = await page.$(`img[src="${imageUrl}"]`);
                  if (imgElement) {
                    const buffer = await imgElement.screenshot();
                    const imagePath = path.join(sceneFolder, `image-${i + 1}.png`);
                    await fs.writeFile(imagePath, buffer);
                    console.log(`保存完了（スクリーンショット方式）: ${imagePath}`);
                  }
                } catch (screenshotError) {
                  console.error(`画像 ${i + 1} のダウンロードに失敗しました:`, screenshotError.message);
                }
              }
            } catch (error) {
              console.error(`画像 ${i + 1} のダウンロードに失敗しました:`, error.message);
            }
          }
          
          console.log(`\n全ての画像を保存しました: ${sceneFolder}`);
          break;
        }
      } catch (e) {
        // エラーは無視して続行
      }
      
      await page.waitForTimeout(checkInterval);
    }
    
    if (!imagesFound) {
      console.log('画像が見つかりませんでした。手動で確認してください。');
      await page.screenshot({ path: path.join(__dirname, '..', 'generated-images', 'debug-no-images.png'), fullPage: true });
    }
    
    console.log('\nブラウザは開いたままです。確認後、手動で閉じてください。');
    
  } catch (error) {
    console.error('エラーが発生しました:', error);
    // persistent contextの場合はclose()ではなく、browserをそのまま残す
    // await browser.close();
    throw error;
  }
  // ブラウザは開いたままにする（ログイン状態を保持するため）
  console.log('\nブラウザは開いたままです。次回もログイン状態が保持されます。');
}

async function main() {
  try {
    console.log('=== リナのランダムプロンプト生成 ===\n');
    const result = await generateRandomPrompt();
    
    console.log(`シーン: ${result.scene}`);
    console.log(`ロケーション: ${result.location}`);
    console.log(`\n生成されたプロンプト:\n${result.prompt}\n`);
    
    console.log('=== PixAIで画像生成を開始 ===\n');
    await generateImageWithPixAI(result.prompt);
    
  } catch (error) {
    console.error('エラー:', error.message);
    process.exit(1);
  }
}

main();

