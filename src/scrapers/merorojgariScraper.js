const { chromium } = require('playwright');

const LUMBINI_KEYWORDS = [
  'butwal', 'bhairahawa', 'siddharthanagar', 'lumbini',
  'rupandehi', 'tilottama', 'nawalparasi', 'palpa',
  'tansen', 'kapilvastu', 'dang', 'ghorahi', 'tulsipur',
  'nepalgunj', 'banke', 'bardiya', 'gulmi', 'pyuthan'
];

async function scrapeMerorojgari() {
  console.log('Merorojgari scraping start...');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.setExtraHTTPHeaders({
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  });

  try {
    await page.goto('https://www.merorojgari.com/', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    await page.waitForTimeout(3000);

    const jobs = await page.evaluate(() => {
      const results = [];
      const lines = document.body.innerText
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 0);

      let i = 0;
      while (i < lines.length) {
        // Pattern: Title, Company, Location, Full Time, Posted X ago
        if (
          lines[i + 2] &&
          (lines[i + 1 + 1] === 'Full Time' || lines[i + 1 + 1] === 'Part Time') &&
          lines[i + 3] && lines[i + 3].includes('Posted')
        ) {
          results.push({
            title:    lines[i],
            company:  lines[i + 1],
            location: lines[i + 2],
            jobType:  lines[i + 3] === 'Full Time' ? 'Full Time' : 'Part Time',
            deadline: lines[i + 4] || '',
            link:     'https://www.merorojgari.com',
            source:   'Merorojgari'
          });
          i += 5;
        } else {
          i++;
        }
      }
      return results;
    });

    await browser.close();

    // Filter Lumbini jobs
    const filtered = jobs.filter(job => {
      const loc = (job.location || '').toLowerCase();
      return LUMBINI_KEYWORDS.some(k => loc.includes(k));
    });

    // Remove duplicates
    const seen = new Set();
    const unique = filtered.filter(job => {
      const key = job.title + job.company;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    console.log(`Merorojgari total: ${jobs.length}, Lumbini: ${unique.length}`);
    return unique;

  } catch (error) {
    await browser.close();
    console.error('Merorojgari error:', error.message);
    return [];
  }
}

module.exports = { scrapeMerorojgari };