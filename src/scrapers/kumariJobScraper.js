const { chromium } = require('playwright');

const LUMBINI_KEYWORDS = [
  'butwal', 'bhairahawa', 'siddharthanagar', 'lumbini',
  'rupandehi', 'palpa', 'tansen', 'kapilvastu',
  'nawalparasi', 'nawalpur', 'bardaghat', 'sunwal',
  'dang', 'ghorahi', 'tulsipur', 'banke', 'nepalgunj',
  'bardiya', 'gulmi', 'arghakhanchi', 'pyuthan', 'rolpa', 'chormara',  'musikot', 'ramgram', 'parasi'
];

async function scrapeKumariJob() {
  console.log('KumariJob scraping start...');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const allJobs = [];

  try {
    for (const keyword of LUMBINI_KEYWORDS) {
      console.log(`Searching: ${keyword}...`);

      await page.goto(
        `https://www.kumarijob.com/search?keywords=${keyword}`,
        { waitUntil: 'domcontentloaded', timeout: 30000 }
      );

      await page.waitForTimeout(2000);

      // Get jobs with actual links
      const jobs = await page.evaluate(() => {
        const results = [];
        const lines = document.body.innerText
          .split('\n')
          .map(l => l.trim())
          .filter(l => l.length > 0);

        let i = 0;
        while (i < lines.length) {
          if (
            lines[i + 2] && lines[i + 2].startsWith('Location :') &&
            lines[i + 3] && lines[i + 3].startsWith('Salary :') &&
            lines[i + 4] && lines[i + 4].startsWith('Deadline :')
          ) {
            results.push({
              title:    lines[i],
              company:  lines[i + 1],
              location: lines[i + 2].replace('Location :', '').trim(),
              salary:   lines[i + 3].replace('Salary :', '').trim(),
              deadline: lines[i + 4].replace('Deadline :', '').trim(),
            });
            i += 6;
          } else {
            i++;
          }
        }
        return results;
      });

      // Get actual job links
      // Get actual job links - try multiple selectors
const links = await page.evaluate(() => {
  // Try job detail links
  let anchors = document.querySelectorAll('a[href*="job-detail"]');
  if (anchors.length === 0) {
    anchors = document.querySelectorAll('a[href*="/jobs/"]');
  }
  if (anchors.length === 0) {
    // Get all links that are not nav/footer
    anchors = document.querySelectorAll('.card a, .job-card a, article a');
  }
  return Array.from(anchors).map(a => a.href).filter(h => h.includes('kumarijob'));
});

      // Assign actual links
      jobs.forEach((job, idx) => {
        job.link = links[idx] || `https://www.kumarijob.com/search?keywords=${keyword}`;
        job.source = 'KumariJob';
      });

      // Filter: only keep jobs where location matches Lumbini keywords
      const lumbiniFiltered = jobs.filter(job => {
        const loc = (job.location || '').toLowerCase();
        return LUMBINI_KEYWORDS.some(k => loc.includes(k)) ||
               loc.includes('lumbini province');
      });

      allJobs.push(...lumbiniFiltered);
      console.log(`  Found ${lumbiniFiltered.length} Lumbini jobs for "${keyword}"`);
    }

    await browser.close();

    // Remove duplicates
    const seen = new Set();
    const unique = allJobs.filter(job => {
      const key = job.title + job.company;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    console.log(`\nTotal unique Lumbini jobs: ${unique.length}`);
    return unique;

  } catch (error) {
    await browser.close();
    console.error('KumariJob error:', error.message);
    return [];
  }
}

module.exports = { scrapeKumariJob };