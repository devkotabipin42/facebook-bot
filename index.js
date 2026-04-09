require('dotenv').config();
const { scrapeKumariJob } = require('./src/scrapers/kumariJobScraper');
const { scrapeJagirkhoj } = require('./src/scrapers/jagirkhojScraper');
const { scrapeMerojobLumbini } = require('./src/scrapers/merojobScraper');
const { formatJobPost } = require('./src/ai/postFormatter');
const { postToFacebook } = require('./src/facebook/fbPoster');
const { isAlreadyPosted, savePostedJob } = require('./src/utils/dedupe');

async function main() {
  const [merojobs, kumarijobs, jagirjobs] = await Promise.all([
    scrapeMerojobLumbini(),
    scrapeKumariJob(),
    scrapeJagirkhoj()
  ]);

  const allJobs = [...merojobs, ...kumarijobs, ...jagirjobs];
  console.log(`Total jobs: ${allJobs.length}`);

  // Filter already posted jobs
  const newJobs = allJobs.filter(job => !isAlreadyPosted(job));
  console.log(`New jobs to post: ${newJobs.length}`);

  if (newJobs.length === 0) {
    console.log('No new jobs today!');
    return;
  }

  // Post first job only
  const job = newJobs[0];
  console.log('Posting:', job.title);

  const post = await formatJobPost(job);
  console.log('Post preview:\n', post);

  const success = await postToFacebook(post);

  if (success) {
    savePostedJob(job);
    console.log('Saved to posted list!');
  }
}

main();