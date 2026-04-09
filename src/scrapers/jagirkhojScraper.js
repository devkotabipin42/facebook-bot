const { chromium } = require('playwright');

const LUMBINI_KEYWORDS = [
  'butwal', 'bhairahawa', 'siddharthanagar', 'lumbini',
  'rupandehi', 'tilottama', 'devdaha', 'nawalparasi',
  'tansen', 'palpa', 'kapilvastu', 'dang', 'ghorahi',
  'tulsipur', 'nepalgunj', 'banke', 'bardiya', 'gulmi'
];

async function scrapeJagirkhoj() {
  console.log('Jagirkhoj scraping start...');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const allJobs = [];

  try {
    await page.goto('https://jagirkhoj.com/jobs', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    await page.waitForTimeout(4000);

    const jobs = await page.evaluate(() => {
      const results = [];
      const lines = document.body.innerText
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 0);

      let i = 0;
      while (i < lines.length) {
        // Pattern: Title, Full/Part Time, Level, Salary, Company, Location
        if (
          lines[i + 1] && (lines[i + 1].includes('Full Time') || lines[i + 1].includes('Part Time')) &&
          lines[i + 2] && lines[i + 2].includes('Level') &&
          lines[i + 3] && lines[i + 3].includes('Salary')
        ) {
          results.push({
            title:    lines[i],
            jobType:  lines[i + 1],
            level:    lines[i + 2],
            salary:   lines[i + 3].replace('Salary:', '').trim(),
            company:  lines[i + 4] || '',
            location: lines[i + 5] || '',
            link:     'https://jagirkhoj.com/jobs',
            source:   'JagirKhoj'
          });
          i += 6;
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

    console.log(`Total jobs: ${jobs.length}`);
    console.log(`Lumbini jobs: ${unique.length}`);

    return unique;

  } catch (error) {
    await browser.close();
    console.error('JagirKhoj error:', error.message);
    return [];
  }
}

module.exports = { scrapeJagirkhoj };