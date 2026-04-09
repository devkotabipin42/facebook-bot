const axios = require('axios');
const cheerio = require('cheerio');
require('dotenv').config();

const LUMBINI_KEYWORDS = [
  'butwal', 'bhairahawa', 'siddharthanagar', 'lumbini',
  'rupandehi', 'tilottama', 'devdaha', 'nawalparasi',
  'tansen', 'palpa', 'kapilvastu', 'dang', 'ghorahi',
  'tulsipur', 'nepalgunj', 'banke', 'bardiya', 'gulmi'
];

async function scrapeKumariJob() {
  console.log('KumariJob scraping start...');
  const allJobs = [];

  for (const keyword of LUMBINI_KEYWORDS) {
    try {
      const response = await axios.get(
        `https://www.kumarijob.com/search?keywords=${keyword}`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          timeout: 10000
        }
      );

      const $ = cheerio.load(response.data);
      const jobs = [];

      // Parse job cards
      $('.rounded-lg').each((i, el) => {
        const text = $(el).text().trim();
        if (!text || text.length < 30 || text.length > 500) return;

        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        if (lines.length < 7) return;
        if (lines[0] === 'Trainings' || lines[0] === 'Blogs') return;

        jobs.push({
          title:    lines[0],
          company:  lines[1],
          level:    lines[2],
          jobType:  lines[4],
          location: lines[6],
          salary:   lines[9] || 'Negotiable',
          link:     `https://www.kumarijob.com/search?keywords=${keyword}`,
          source:   'KumariJob'
        });
      });

      const filtered = jobs.filter(job => {
        const loc = (job.location || '').toLowerCase();
        return LUMBINI_KEYWORDS.some(k => loc.includes(k));
      });

      allJobs.push(...filtered);
      console.log(`  Found ${filtered.length} jobs for "${keyword}"`);

    } catch (error) {
      console.log(`  Error for ${keyword}:`, error.message);
    }

    // Small delay between requests
    await new Promise(r => setTimeout(r, 1000));
  }

  // Remove duplicates
  const seen = new Set();
  const unique = allJobs.filter(job => {
    const key = job.title + job.company;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  console.log(`Total unique Lumbini jobs: ${unique.length}`);
  return unique;
}

module.exports = { scrapeKumariJob };