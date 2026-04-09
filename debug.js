const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('https://www.merojob.com/search/?q=', { 
    waitUntil: 'networkidle', 
    timeout: 60000 
  });
  
  await page.waitForTimeout(5000);
  
  const jobs = await page.evaluate(() => {
    const results = [];
    const cards = document.querySelectorAll('.rounded-lg');
    
    cards.forEach(card => {
      const text = card.innerText ? card.innerText.trim() : '';
      if (!text || text.length < 30 || text.length > 500) return;
      const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      if (lines.length < 4) return;
      results.push(lines);
    });
    
    return results;
  });

  jobs.forEach((lines, i) => {
    console.log('Job', i+1, ':', JSON.stringify(lines));
  });

  await browser.close();
})();