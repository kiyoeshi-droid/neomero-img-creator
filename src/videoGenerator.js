import { chromium } from 'playwright';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Neomero Studioで動画を生成する
 * @param {string} imagePath - 画像ファイルのパス
 * @param {string} prompt - 動画生成用のプロンプト
 * @param {Object} config - 設定オブジェクト
 * @returns {Promise<string>} 生成された動画のパス
 */
export async function generateVideo(imagePath, prompt, config) {
  const browser = await chromium.launch({
    headless: config.browser.headless,
    slowMo: config.browser.slowMo
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log(`Neomero Studioにアクセス中: ${config.neomero.url}`);
    await page.goto(config.neomero.url, { waitUntil: 'networkidle' });

    // Video Generatorページに移動（必要に応じて）
    const videoGeneratorLink = await page.locator('text=Video Generator').first();
    if (await videoGeneratorLink.isVisible({ timeout: 5000 })) {
      await videoGeneratorLink.click();
      await page.waitForLoadState('networkidle');
    }

    // 画像アップロード欄を探す
    console.log('画像アップロード欄を探しています...');
    
    const uploadSelectors = [
      'input[type="file"]',
      'input[accept*="image"]',
      '[class*="upload"]',
      '[class*="drop"]'
    ];

    let fileInput = null;
    for (const selector of uploadSelectors) {
      try {
        fileInput = await page.locator(selector).first();
        if (await fileInput.isVisible({ timeout: 3000 })) {
          break;
        }
      } catch (e) {
        continue;
      }
    }

    // ファイル入力が見つからない場合、ドラッグ&ドロップエリアを探す
    if (!fileInput || !(await fileInput.isVisible())) {
      // ドラッグ&ドロップエリアをクリックしてファイル選択ダイアログを開く
      const dropAreaSelectors = [
        '[class*="drop"]',
        '[class*="upload"]',
        '[class*="file"]'
      ];

      for (const selector of dropAreaSelectors) {
        try {
          const dropArea = await page.locator(selector).first();
          if (await dropArea.isVisible({ timeout: 3000 })) {
            await dropArea.click();
            // ファイル選択ダイアログが開くのを待つ
            await page.waitForTimeout(1000);
            break;
          }
        } catch (e) {
          continue;
        }
      }

      // 再度ファイル入力を探す
      fileInput = await page.locator('input[type="file"]').first();
    }

    if (!fileInput || !(await fileInput.isVisible())) {
      await page.screenshot({ path: './debug-neomero-upload.png' });
      throw new Error('画像アップロード欄が見つかりませんでした。デバッグ用スクリーンショットを保存しました。');
    }

    // 画像をアップロード
    console.log('画像をアップロード中...');
    const absoluteImagePath = path.resolve(imagePath);
    await fileInput.setInputFiles(absoluteImagePath);
    console.log(`アップロード完了: ${absoluteImagePath}`);

    // アップロード完了を待つ
    await page.waitForTimeout(3000);

    // プロンプト入力欄を探して入力
    if (prompt) {
      console.log('動画生成プロンプトを入力中...');
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

      if (promptInput) {
        await promptInput.fill(prompt);
        console.log(`動画生成プロンプト: ${prompt}`);
        await page.waitForTimeout(1000);
      } else {
        console.log('警告: プロンプト入力欄が見つかりませんでした。プロンプトなしで続行します。');
      }
    }

    // 生成ボタンを探してクリック
    console.log('動画生成ボタンを探しています...');
    const generateSelectors = [
      'button:has-text("生成")',
      'button:has-text("Generate")',
      'button:has-text("Create")',
      'button[type="submit"]',
      'button[class*="generate"]',
      'button[class*="create"]'
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
      await page.screenshot({ path: './debug-neomero-button.png' });
      throw new Error('動画生成ボタンが見つかりませんでした。デバッグ用スクリーンショットを保存しました。');
    }

    await generateButton.click();
    console.log('動画生成を開始しました...');

    // 動画生成の完了を待つ
    console.log('動画生成の完了を待機中...');
    await page.waitForTimeout(config.neomero.waitForGeneration);

    // 生成された動画を探す
    const videoSelectors = [
      'video[class*="generated"]',
      'video[class*="result"]',
      'video[src*="generated"]',
      '.generated-video video',
      '.result video',
      'video'
    ];

    let videoUrl = null;
    for (const selector of videoSelectors) {
      try {
        const video = await page.waitForSelector(selector, { timeout: 10000 });
        if (video) {
          videoUrl = await video.getAttribute('src');
          if (videoUrl && (videoUrl.startsWith('http') || videoUrl.startsWith('blob'))) {
            break;
          }
        }
      } catch (e) {
        continue;
      }
    }

    // 動画のダウンロードボタンを探す
    if (!videoUrl) {
      const downloadSelectors = [
        'a[download]',
        'button:has-text("ダウンロード")',
        'button:has-text("Download")',
        '[class*="download"]'
      ];

      for (const selector of downloadSelectors) {
        try {
          const downloadBtn = await page.locator(selector).first();
          if (await downloadBtn.isVisible({ timeout: 5000 })) {
            // ダウンロードリンクを取得
            const href = await downloadBtn.getAttribute('href');
            if (href) {
              videoUrl = href;
              break;
            }
          }
        } catch (e) {
          continue;
        }
      }
    }

    if (!videoUrl) {
      await page.screenshot({ path: './debug-neomero-result.png' });
      throw new Error('生成された動画が見つかりませんでした。デバッグ用スクリーンショットを保存しました。');
    }

    // 動画をダウンロード
    console.log('動画をダウンロード中...');
    const videoDir = path.join(__dirname, '..', config.output.videoDir);
    await fs.ensureDir(videoDir);

    const timestamp = Date.now();
    const videoPath = path.join(videoDir, `video-${timestamp}.mp4`);

    // blob URLの場合は別の方法でダウンロード
    if (videoUrl.startsWith('blob:')) {
      // ページコンテキストで動画を取得
      const videoData = await page.evaluate(async (url) => {
        const response = await fetch(url);
        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();
        return Array.from(new Uint8Array(arrayBuffer));
      }, videoUrl);

      await fs.writeFile(videoPath, Buffer.from(videoData));
    } else {
      const response = await page.goto(videoUrl);
      await fs.writeFile(videoPath, await response.body());
    }

    console.log(`動画を保存しました: ${videoPath}`);
    return videoPath;

  } catch (error) {
    console.error('動画生成エラー:', error);
    await page.screenshot({ path: './error-neomero.png' });
    throw error;
  } finally {
    await browser.close();
  }
}

