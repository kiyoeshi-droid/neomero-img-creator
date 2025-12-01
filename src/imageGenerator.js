import { chromium } from 'playwright';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * PixAIで画像を生成する
 * @param {string} prompt - 画像生成用のプロンプト
 * @param {Object} config - 設定オブジェクト
 * @returns {Promise<string>} 生成された画像のパス
 */
export async function generateImage(prompt, config) {
  const browser = await chromium.launch({
    headless: config.browser.headless,
    slowMo: config.browser.slowMo
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log(`PixAIにアクセス中: ${config.pixai.url}`);
    await page.goto(config.pixai.url, { waitUntil: 'networkidle' });

    // プロンプト入力欄を探して入力
    console.log('プロンプトを入力中...');
    
    // プロンプト入力欄のセレクタを探す（実際のサイト構造に合わせて調整が必要）
    const promptSelectors = [
      'textarea[placeholder*="prompt"]',
      'textarea[placeholder*="プロンプト"]',
      'textarea[class*="prompt"]',
      'input[type="text"]',
      'textarea'
    ];

    let promptInput = null;
    for (const selector of promptSelectors) {
      try {
        promptInput = await page.waitForSelector(selector, { timeout: 5000 });
        if (promptInput) break;
      } catch (e) {
        continue;
      }
    }

    if (!promptInput) {
      // ページの構造を確認
      await page.screenshot({ path: './debug-pixai.png' });
      throw new Error('プロンプト入力欄が見つかりませんでした。デバッグ用スクリーンショットを保存しました。');
    }

    await promptInput.fill(prompt);
    console.log(`プロンプト: ${prompt}`);

    // 生成ボタンを探してクリック
    console.log('生成ボタンを探しています...');
    const generateSelectors = [
      'button:has-text("生成")',
      'button:has-text("Generate")',
      'button[type="submit"]',
      'button[class*="generate"]',
      'button[class*="submit"]'
    ];

    let generateButton = null;
    for (const selector of generateSelectors) {
      try {
        generateButton = await page.locator(selector).first();
        if (await generateButton.isVisible({ timeout: 3000 })) {
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (!generateButton || !(await generateButton.isVisible())) {
      await page.screenshot({ path: './debug-pixai-button.png' });
      throw new Error('生成ボタンが見つかりませんでした。デバッグ用スクリーンショットを保存しました。');
    }

    await generateButton.click();
    console.log('画像生成を開始しました...');

    // 画像生成の完了を待つ
    console.log('画像生成の完了を待機中...');
    await page.waitForTimeout(config.pixai.waitForGeneration);

    // 生成された画像を探す
    const imageSelectors = [
      'img[class*="generated"]',
      'img[class*="result"]',
      'img[alt*="generated"]',
      'img[src*="generated"]',
      '.generated-image img',
      '.result img'
    ];

    let imageUrl = null;
    for (const selector of imageSelectors) {
      try {
        const img = await page.waitForSelector(selector, { timeout: 10000 });
        if (img) {
          imageUrl = await img.getAttribute('src');
          if (imageUrl && imageUrl.startsWith('http')) {
            break;
          }
        }
      } catch (e) {
        continue;
      }
    }

    if (!imageUrl) {
      // 最後の手段：ページ内のすべての画像を確認
      const images = await page.$$eval('img', imgs => 
        imgs.map(img => img.src).filter(src => src && !src.includes('logo') && !src.includes('icon'))
      );
      
      if (images.length > 0) {
        imageUrl = images[images.length - 1]; // 最後の画像を取得
      }
    }

    if (!imageUrl) {
      await page.screenshot({ path: './debug-pixai-result.png' });
      throw new Error('生成された画像が見つかりませんでした。デバッグ用スクリーンショットを保存しました。');
    }

    // 画像をダウンロード
    console.log('画像をダウンロード中...');
    const imageDir = path.join(__dirname, '..', config.output.imageDir);
    await fs.ensureDir(imageDir);

    const timestamp = Date.now();
    const imagePath = path.join(imageDir, `image-${timestamp}.png`);

    const response = await page.goto(imageUrl);
    await fs.writeFile(imagePath, await response.body());

    console.log(`画像を保存しました: ${imagePath}`);
    return imagePath;

  } catch (error) {
    console.error('画像生成エラー:', error);
    await page.screenshot({ path: './error-pixai.png' });
    throw error;
  } finally {
    await browser.close();
  }
}

