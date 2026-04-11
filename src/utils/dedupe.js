const axios = require('axios');
require('dotenv').config();

const GIST_ID_FILE = 'gist_id.txt';
const fs = require('fs');

async function getPostedJobs() {
  try {
    const gistId = process.env.GIST_ID;
    if (!gistId) return [];

    const response = await axios.get(
      `https://api.github.com/gists/${gistId}`,
      {
        headers: {
          Authorization: `token ${process.env.GIST_TOKEN}`
        }
      }
    );

    const content = response.data.files['posted_jobs.json']?.content;
    return content ? JSON.parse(content) : [];
  } catch {
    return [];
  }
}

async function savePostedJob(jobKey) {
  try {
    const posted = await getPostedJobs();
    if (posted.includes(jobKey)) return;

    posted.push(jobKey);

    // Keep only last 100 jobs
    const trimmed = posted.slice(-100);

    const gistId = process.env.GIST_ID;

    if (gistId) {
      // Update existing gist
      await axios.patch(
        `https://api.github.com/gists/${gistId}`,
        {
          files: {
            'posted_jobs.json': {
              content: JSON.stringify(trimmed, null, 2)
            }
          }
        },
        {
          headers: {
            Authorization: `token ${process.env.GITHUB_TOKEN_GIST}`
          }
        }
      );
    } else {
      // Create new gist
      const response = await axios.post(
        'https://api.github.com/gists',
        {
          description: 'JobMate posted jobs tracker',
          public: false,
          files: {
            'posted_jobs.json': {
              content: JSON.stringify(trimmed, null, 2)
            }
          }
        },
        {
          headers: {
            Authorization: `token ${process.env.GITHUB_TOKEN_GIST}`
          }
        }
      );
      console.log('New Gist created! ID:', response.data.id);
      console.log('Add GIST_ID secret:', response.data.id);
    }

    console.log('Dedupe updated!');
  } catch (error) {
    console.error('Dedupe error:', error.message);
  }
}

async function isAlreadyPosted(job) {
  const posted = await getPostedJobs();
  const key = job.title + job.company;
  return posted.includes(key);
}

module.exports = { isAlreadyPosted, savePostedJob };