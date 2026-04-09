require('dotenv').config();
const http = require('http');
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('JobMate Bot Running!');
});
server.listen(process.env.PORT || 3000);
const cron = require('node-cron');
const { scrapeKumariJob } = require('../scrapers/kumariJobScraper');
const { scrapeJagirkhoj } = require('../scrapers/jagirkhojScraper');
const { scrapeMerojobLumbini } = require('../scrapers/merojobScraper');
const { formatJobPost } = require('../ai/postFormatter');
const { postToFacebook } = require('./fbPoster');
const { isAlreadyPosted, savePostedJob } = require('../utils/dedupe');

async function runBot() {
  console.log('\nBot running...', new Date().toLocaleString());

  const [merojobs, kumarijobs, jagirjobs] = await Promise.all([
    scrapeMerojobLumbini(),
    scrapeKumariJob(),
    scrapeJagirkhoj()
  ]);

  const allJobs = [...merojobs, ...kumarijobs, ...jagirjobs];
  console.log(`Total jobs: ${allJobs.length}`);

  // Filter new jobs only
  const newJobs = allJobs.filter(job => !isAlreadyPosted(job));
  console.log(`New jobs: ${newJobs.length}`);

  if (newJobs.length === 0) {
    console.log('No new jobs today!');
    return;
  }

  // Post first unposted job
  const job = newJobs[0];
  console.log('Posting:', job.title);

  const post = await formatJobPost(job);
  const success = await postToFacebook(post);

  if (success) {
    savePostedJob(job);
    console.log('Done! Posted:', job.title);
  }
}

// Schedule: 7am, 12pm, 3pm, 6pm daily
cron.schedule('0 7 * * *',  runBot);
cron.schedule('0 12 * * *', runBot);
cron.schedule('0 15 * * *', runBot);
cron.schedule('0 18 * * *', runBot);

console.log('Scheduler started! Runs at 7am, 12pm, 3pm, 6pm');

// Run once immediately
runBot();