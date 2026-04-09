const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto('https://jagirkhoj.com/jobs', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    await page.waitForTimeout(4000);

    const bodyText = await page.evaluate(() => {
      return document.body.innerText.slice(0, 3000);
    });

    console.log('Body text:\n', bodyText);

  } catch (error) {
    console.error('Error:', error.message);
  }

  await browser.close();
})();