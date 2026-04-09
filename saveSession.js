const { chromium } = require('playwright');
require('dotenv').config();

(async () => {
  // Use your actual Chrome profile where you're already logged in
  const browser = await chromium.launchPersistentContext(
    '/tmp/fb_profile',
    { 
      headless: false,
      channel: 'chrome'
    }
  );
  
  const page = await browser.newPage();
  await page.goto('https://www.facebook.com');
  await page.waitForTimeout(5000);

  console.log('URL:', page.url());
  console.log('Agar logged out hai toh manually login karo');
  console.log('60 seconds wait kar raha hun...');
  
  await page.waitForTimeout(60000);
  
  // Save cookies
  const cookies = await browser.cookies();
  const fs = require('fs');
  fs.writeFileSync('fb_cookies.json', JSON.stringify(cookies));
  console.log('Cookies saved!');
  
  await browser.close();
})();