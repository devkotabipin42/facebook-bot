require('dotenv').config();
const { scrapeKumariJob } = require('./src/scrapers/kumariJobScraper');
const { scrapeJagirkhoj } = require('./src/scrapers/jagirkhojScraper');
const { scrapeMerojobLumbini } = require('./src/scrapers/merojobScraper');
const { formatJobPost } = require('./src/ai/postFormatter');
const { postToFacebook } = require('./src/facebook/fbPoster');

async function main() {
  const [merojobs, kumarijobs, jagirjobs] = await Promise.all([
    scrapeMerojobLumbini(),
    scrapeKumariJob(),
    scrapeJagirkhoj()
  ]);

  const allJobs = [...merojobs, ...kumarijobs, ...jagirjobs];
  console.log(`Total jobs: ${allJobs.length}`);

  if (allJobs.length === 0) {
    console.log('No jobs found!');
    return;
  }

  // Pick random job - different every run
  const randomIndex = Math.floor(Math.random() * Math.min(allJobs.length, 10));
  const job = allJobs[randomIndex];
  
  console.log('Posting:', job.title);

  const post = await formatJobPost(job);
  console.log('Post preview:\n', post);

  const success = await postToFacebook(post);
  
  if (success) {
    console.log('Done!');
  }
}

main();