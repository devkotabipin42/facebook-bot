const { chromium } = require('playwright');

async function scrapeMerojobLumbini() {
  console.log('Merojob scraping start...');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(
      'https://www.merojob.com/search/?q=',
      { waitUntil: 'networkidle', timeout: 60000 }
    );
    await page.waitForTimeout(5000);

    const jobs = await page.evaluate(() => {
      const results = [];
      const cards = document.querySelectorAll('.rounded-lg');

      cards.forEach(card => {
        const text = card.innerText ? card.innerText.trim() : '';
        if (!text || text.length < 30 || text.length > 500) return;
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        if (lines.length < 7) return;

        // Job 7,8 skip karo (Trainings, Blogs)
        if (lines[0] === 'Trainings' || lines[0] === 'Blogs') return;

        const title      = lines[0];
        const company    = lines[1];
        const level      = lines[2];
        const jobType    = lines[4];
        const location   = lines[6];
        const experience = lines[7] || '';
        const salary     = lines[9] || 'Not Disclosed';

        const linkEl = card.querySelector('a');
        const link = linkEl ? linkEl.href : '';

        results.push({ title, company, level, jobType, location, experience, salary, link });
      });

      return results;
    });

    await browser.close();

    const lumbiniKeywords = [
      'lumbini', 'butwal', 'bhairahawa', 'siddharthanagar',
      'rupandehi', 'palpa', 'kapilvastu', 'dang', 'gulmi',
      'pyuthan', 'rolpa', 'banke', 'bardiya', 'arghakhanchi',
      'tulsipur', 'ghorahi', 'tansen', 'musikot',
      'nawalparasi', 'nawalpur', 'kawasoti', 'bardaghat',
      'sunwal', 'ramgram', 'parasi'
    ];

    const filtered = jobs.filter(job => {
      const loc = (job.location || '').toLowerCase();
      return lumbiniKeywords.some(k => loc.includes(k));
    });

    console.log(`Total jobs mila: ${jobs.length}`);
    console.log(`Lumbini jobs: ${filtered.length}`);

    // Debug: saari locations print karo
    console.log('\nSaari locations:');
    jobs.forEach(j => console.log(' -', j.location));

    return filtered;

  } catch (error) {
    await browser.close();
    console.error('Scraping error:', error.message);
    return [];
  }
}

module.exports = { scrapeMerojobLumbini };