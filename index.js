require('dotenv').config();
const { scrapeKumariJob } = require('./src/scrapers/kumariJobScraper');
const { scrapeJagirkhoj } = require('./src/scrapers/jagirkhojScraper');
const { scrapeMerojobLumbini } = require('./src/scrapers/merojobScraper');
const { formatJobPost } = require('./src/ai/postFormatter');
const { postToFacebook } = require('./src/facebook/fbPoster');
const { findCompanyDetails } = require('./src/ai/companyResearch');
const { sendDailyReport } = require('./src/utils/emailReport');
const { isAlreadyPosted, savePostedJob } = require('./src/utils/dedupe');
const fs = require('fs');

async function main() {
  const [merojobs, kumarijobs, jagirjobs] = await Promise.all([
    scrapeMerojobLumbini(),
    scrapeKumariJob(),
    scrapeJagirkhoj()
  ]);

  const allJobs = [...merojobs, ...kumarijobs, ...jagirjobs];
  console.log(`Total jobs: ${allJobs.length}`);

  if (allJobs.length === 0) return;

  // Shuffle jobs
  const shuffled = allJobs.sort(() => Math.random() - 0.5);

  for (const job of shuffled) {
    const jobKey = job.title + job.company;

    // Check if already posted
    const alreadyPosted = await isAlreadyPosted(job);
    if (alreadyPosted) {
      console.log(`Already posted: ${job.title} - Skipping`);
      continue;
    }

    console.log(`\nChecking: ${job.title} - ${job.company}`);
    const companyDetails = await findCompanyDetails(job.company, job.location);

    if (companyDetails.accuracy < 90) {
      console.log(`Accuracy ${companyDetails.accuracy}% - Skipping`);
      continue;
    }

    console.log(`Accuracy ${companyDetails.accuracy}% - Posting!`);

    // Send email
    await sendDailyReport(job, companyDetails);

    // Post to Facebook
    const post = await formatJobPost(job);
    const success = await postToFacebook(post);

    if (success) {
      await savePostedJob(jobKey);
      console.log('Posted and saved to dedupe!');
    }

    break;
  }
}

main();