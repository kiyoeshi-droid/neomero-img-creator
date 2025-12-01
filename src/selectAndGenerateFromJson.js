import { chromium } from 'playwright';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configPath = path.join(__dirname, '..', 'config.json');

/**
 * JSONファイルから適切なプロンプトを選択
 * @param {string} jsonPath - JSONファイルのパス
 * @param {Object} options - 選択オプション
 * @returns {Array} 選択されたプロンプトの配列
 */
function selectAppropriatePrompts(jsonPath, options = {}) {
  const data = fs.readJsonSync(jsonPath);
  const prompts = data.prompts || [];
  
  // フィルタリング条件
  const filters = {
    sceneTag: options.sceneTag, // 特定のシーンタグ
    character: options.character, // 特定のキャラクター
    location: options.location, // 特定のロケーション
    nsfw: options.nsfw, // NSFWの有無
    sex: options.sex, // SEXの有無
    minLength: options.minLength || 50, // プロンプトの最小長
    maxLength: options.maxLength || 1000 // プロンプトの最大長
  };
  
  let filtered = prompts.filter(p => {
    // プロンプトの長さチェック
    if (p.prompt.length < filters.minLength || p.prompt.length > filters.maxLength) {
      return false;
    }
    
    // シーンタグフィルタ
    if (filters.sceneTag && p.sceneTag !== filters.sceneTag) {
      return false;
    }
    
    // キャラクターフィルタ
    if (filters.character && p.description?.character !== filters.character) {
      return false;
    }
    
    // ロケーションフィルタ
    if (filters.location && p.description?.location !== filters.location) {
      return false;
    }
    
    // NSFWフィルタ
    if (filters.nsfw !== undefined) {
      const isNsfw = p.description?.nsfw === 'あり';
      if (filters.nsfw !== isNsfw) {
        return false;
      }
    }
    
    // SEXフィルタ
    if (filters.sex !== undefined) {
      const isSex = p.description?.sex === 'あり';
      if (filters.sex !== isSex) {
        return false;
      }
    }
    
    return true;
  });
  
  // ランダムに選択（または最初のN件）
  const count = options.count || 1;
  if (filtered.length > count) {
    // ランダムにシャッフル
    for (let i = filtered.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
    }
    filtered = filtered.slice(0, count);
  }
  
  return filtered;
}

/**
 * 左ペインの画像一覧から一番上の画像をクリックして設定を読み込む
 */
async function findPreviousGenerationSettings(page) {
  console.log('左ペインの画像一覧から設定を読み込んでいます...');
  
  try {
    await page.waitForTimeout(3000);
    
    // 左ペインの画像一覧を探す
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

/**
 * PixAIで画像を生成
 */
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
    
    // 設定が見つからなかった場合は、通常の生成ページで続行
    if (!foundSettings) {
      console.log('過去の設定が見つかりませんでした。通常の生成ページで続行します。');
      await page.goto('https://pixai.art/ja/generator/image', {
        waitUntil: 'domcontentloaded',
        timeout: 120000
      });
      await page.waitForTimeout(5000);
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
    
    // 紫の生成ボタンを探す
    console.log('紫の生成ボタンを探しています...');
    let generateButton = null;
    
    // プロンプト入力欄の位置を取得
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
        
        // 紫のボタンかどうかを判定
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
    
    // 生成開始の確認
    await page.waitForTimeout(5000);
    
    // 生成された画像を待機（最大10分）
    let imagesFound = false;
    const maxWaitTime = 600000; // 10分
    const checkInterval = 5000; // 5秒ごとにチェック
    const startTime = Date.now();
    
    console.log('生成完了を待機中...（最大10分）');
    
    while (Date.now() - startTime < maxWaitTime) {
      // ページ内のすべての画像を確認
      try {
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
              
              // 画像を取得
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
      console.log('\n⚠️ 画像が見つかりませんでした。手動で確認してください。');
      const debugPath = path.join(__dirname, '..', 'generated-images', 'debug-no-images.png');
      await page.screenshot({ path: debugPath, fullPage: true });
      console.log(`デバッグ用スクリーンショットを保存しました: ${debugPath}`);
    } else {
      console.log('\n✅ 画像生成と保存が完了しました！');
    }
    
    console.log('\nブラウザは開いたままです。確認後、手動で閉じてください。');
    
  } catch (error) {
    console.error('エラーが発生しました:', error);
    throw error;
  }
}

/**
 * メイン処理
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('使用方法: node src/selectAndGenerateFromJson.js <JSONファイルパス> [オプション]');
    console.log('');
    console.log('オプション:');
    console.log('  --sceneTag <タグ>     特定のシーンタグでフィルタ');
    console.log('  --character <名前>    特定のキャラクターでフィルタ');
    console.log('  --location <名前>     特定のロケーションでフィルタ');
    console.log('  --nsfw <true|false>   NSFWの有無でフィルタ');
    console.log('  --sex <true|false>    SEXの有無でフィルタ');
    console.log('  --count <数>          生成するプロンプト数（デフォルト: 1）');
    console.log('');
    console.log('例:');
    console.log('  node src/selectAndGenerateFromJson.js sample/prompts.json --sceneTag "照れ顔" --count 3');
    process.exit(1);
  }
  
  const jsonPath = args[0];
  
  if (!fs.existsSync(jsonPath)) {
    console.error(`エラー: ファイルが見つかりません: ${jsonPath}`);
    process.exit(1);
  }
  
  // オプションを解析
  const options = {
    count: 1
  };
  
  for (let i = 1; i < args.length; i += 2) {
    const key = args[i];
    const value = args[i + 1];
    
    switch (key) {
      case '--sceneTag':
        options.sceneTag = value;
        break;
      case '--character':
        options.character = value;
        break;
      case '--location':
        options.location = value;
        break;
      case '--nsfw':
        options.nsfw = value === 'true';
        break;
      case '--sex':
        options.sex = value === 'true';
        break;
      case '--count':
        options.count = parseInt(value, 10);
        break;
    }
  }
  
  console.log('=== JSONファイルからプロンプトを選択 ===\n');
  console.log(`ファイル: ${jsonPath}`);
  console.log(`オプション:`, options);
  console.log('');
  
  // プロンプトを選択
  const selectedPrompts = selectAppropriatePrompts(jsonPath, options);
  
  if (selectedPrompts.length === 0) {
    console.log('⚠️ 条件に合うプロンプトが見つかりませんでした。');
    process.exit(1);
  }
  
  console.log(`✅ ${selectedPrompts.length}件のプロンプトを選択しました:\n`);
  
  selectedPrompts.forEach((p, index) => {
    console.log(`${index + 1}. ${p.sceneTag}`);
    console.log(`   キャラクター: ${p.description?.character || '未指定'}`);
    console.log(`   ロケーション: ${p.description?.location || '未指定'}`);
    console.log(`   プロンプト: ${p.prompt.substring(0, 80)}...`);
    console.log('');
  });
  
  // 各プロンプトで画像生成
  for (let i = 0; i < selectedPrompts.length; i++) {
    const prompt = selectedPrompts[i];
    console.log(`\n=== プロンプト ${i + 1}/${selectedPrompts.length} で画像生成 ===`);
    console.log(`シーン: ${prompt.sceneTag}`);
    console.log(`プロンプト: ${prompt.prompt.substring(0, 100)}...\n`);
    
    try {
      await generateImageWithPixAI(prompt.prompt);
      console.log(`\n✅ プロンプト ${i + 1} の画像生成が完了しました。\n`);
      
      // 次のプロンプトまで少し待機
      if (i < selectedPrompts.length - 1) {
        console.log('次のプロンプトまで10秒待機します...');
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    } catch (error) {
      console.error(`\n❌ プロンプト ${i + 1} の画像生成に失敗しました:`, error.message);
      // エラーが発生しても次のプロンプトを続行
    }
  }
  
  console.log('\n=== 全ての画像生成が完了しました ===');
}

main().catch(error => {
  console.error('エラー:', error);
  process.exit(1);
});

