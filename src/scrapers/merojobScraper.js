const axios = require('axios');
require('dotenv').config();

async function scrapeMerojobLumbini() {
  console.log('Merojob scraping start...');

  try {
    const response = await axios.get('https://www.merojob.com/search/?q=', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 15000
    });

    const text = response.data;
    const lines = text.replace(/<[^>]*>/g, '\n')
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);

    const lumbiniKeywords = [
      'lumbini', 'butwal', 'bhairahawa', 'rupandehi',
      'nawalparasi', 'dang', 'banke', 'nepalgunj'
    ];

    const jobs = [];
    let i = 0;

    while (i < lines.length) {
      if (lines[i + 6] && lines[i + 2] === 'Mid Level' || lines[i + 2] === 'Senior Level' || lines[i + 2] === 'Entry Level') {
        const location = lines[i + 6] || '';
        const loc = location.toLowerCase();

        if (lumbiniKeywords.some(k => loc.includes(k))) {
          jobs.push({
            title:    lines[i],
            company:  lines[i + 1],
            level:    lines[i + 2],
            jobType:  lines[i + 4],
            location: location,
            salary:   'Negotiable',
            link:     'https://www.merojob.com/search/?q=',
            source:   'Merojob'
          });
        }
        i += 7;
      } else {
        i++;
      }
    }

    console.log(`Merojob Lumbini jobs: ${jobs.length}`);
    return jobs;

  } catch (error) {
    console.error('Merojob error:', error.message);
    return [];
  }
}

module.exports = { scrapeMerojobLumbini };