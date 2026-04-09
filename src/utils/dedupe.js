const fs = require('fs');
const path = require('path');

const POSTED_FILE = path.join(__dirname, '../../data/postedJobs.json');

function getPostedJobs() {
  try {
    const data = fs.readFileSync(POSTED_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function savePostedJob(job) {
  const posted = getPostedJobs();
  const key = job.title + job.company;
  if (!posted.includes(key)) {
    posted.push(key);
    fs.writeFileSync(POSTED_FILE, JSON.stringify(posted, null, 2));
  }
}

function isAlreadyPosted(job) {
  const posted = getPostedJobs();
  const key = job.title + job.company;
  return posted.includes(key);
}

module.exports = { isAlreadyPosted, savePostedJob };