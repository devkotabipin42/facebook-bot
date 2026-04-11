require('dotenv').config();
const { scrapeKumariJob } = require('./src/scrapers/kumariJobScraper');
const { scrapeJagirkhoj } = require('./src/scrapers/jagirkhojScraper');
const { scrapeMerojobLumbini } = require('./src/scrapers/merojobScraper');
const { formatJobPost } = require('./src/ai/postFormatter');
const { postToFacebook } = require('./src/facebook/fbPoster');
const { findCompanyDetails } = require('./src/ai/companyResearch');
const { sendDailyReport } = require('./src/utils/emailReport');
const { scrapeMerorojgari } = require('./src/scrapers/merorojgariScraper');
const fs = require('fs');

async function main() {
  const [merojobs, kumarijobs, jagirjobs,merorojgarijobs] = await Promise.all([
    scrapeMerojobLumbini(),
    scrapeKumariJob(),
    scrapeJagirkhoj(),
    scrapeMerorojgari()
  ]);

  const allJobs = [...merojobs, ...kumarijobs, ...jagirjobs];
  console.log(`Total jobs: ${allJobs.length}`);

  if (allJobs.length === 0) return;

  // Shuffle jobs for variety
  const shuffled = allJobs.sort(() => Math.random() - 0.5);

  // Try each job until 90% accuracy found
  for (const job of shuffled) {
    console.log(`\nChecking: ${job.title} - ${job.company}`);

    const companyDetails = await findCompanyDetails(job.company, job.location);

    if (companyDetails.accuracy < 90) {
      console.log(`Accuracy ${companyDetails.accuracy}% - Skipping, trying next job...`);
      continue;
    }

    // 90%+ found!
    console.log(`Accuracy ${companyDetails.accuracy}% - Posting!`);

    // Save report
    const report = {
      date: new Date().toLocaleDateString(),
      job: {
        title: job.title,
        company: job.company,
        location: job.location,
        salary: job.salary,
        deadline: job.deadline,
        applyLink: job.link
      },
      companyDetails: companyDetails
    };

    const reportFile = 'daily_report.json';
    let reports = [];
    try { reports = JSON.parse(fs.readFileSync(reportFile, 'utf8')); } catch { reports = []; }
    reports.push(report);
    fs.writeFileSync(reportFile, JSON.stringify(reports, null, 2));

    console.log('\n========== COMPANY DETAILS ==========');
    console.log(`Job      : ${job.title}`);
    console.log(`Company  : ${companyDetails.companyName || job.company}`);
    console.log(`Address  : ${companyDetails.address || 'Not found'}`);
    console.log(`Phone    : ${companyDetails.phone || 'Not found'}`);
    console.log(`Email    : ${companyDetails.email || 'Not found'}`);
    console.log(`HR       : ${companyDetails.hrContact || 'Not found'}`);
    console.log(`Accuracy : ${companyDetails.accuracy}%`);
    console.log('=====================================\n');

    // Send email report
    await sendDailyReport(job, companyDetails);

    // Post to Facebook
    const post = await formatJobPost(job);
    const success = await postToFacebook(post);
    if (success) console.log('Posted to Facebook!');

    break; // Stop after first 90%+ job
  }
}

main();