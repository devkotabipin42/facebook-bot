const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendDailyReport(job, companyDetails) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; }
    .header { background: #1a73e8; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .header p { margin: 5px 0 0; opacity: 0.9; font-size: 14px; }
    .section { background: #f8f9fa; border-left: 4px solid #1a73e8; padding: 15px 20px; margin: 15px 0; border-radius: 0 8px 8px 0; }
    .section h3 { margin: 0 0 10px; color: #1a73e8; font-size: 16px; }
    .row { display: flex; padding: 8px 0; border-bottom: 1px solid #eee; }
    .row:last-child { border-bottom: none; }
    .label { font-weight: bold; width: 140px; color: #555; font-size: 14px; }
    .value { color: #333; font-size: 14px; }
    .action { background: #e8f5e9; border: 1px solid #4caf50; padding: 15px 20px; border-radius: 8px; margin: 15px 0; }
    .action h3 { color: #2e7d32; margin: 0 0 10px; }
    .btn { display: inline-block; background: #1a73e8; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; font-weight: bold; margin-top: 10px; }
    .accuracy { display: inline-block; background: ${companyDetails.accuracy >= 80 ? '#4caf50' : '#ff9800'}; color: white; padding: 3px 10px; border-radius: 20px; font-size: 13px; }
    .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; border-top: 1px solid #eee; margin-top: 20px; }
  </style>
</head>
<body>

  <div class="header">
    <h1>JobMate Daily Report</h1>
    <p>${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
  </div>

  <div class="section">
    <h3>Job Vacancy Details</h3>
    <div class="row"><span class="label">Position</span><span class="value">${job.title}</span></div>
    <div class="row"><span class="label">Company</span><span class="value">${job.company}</span></div>
    <div class="row"><span class="label">Location</span><span class="value">${job.location}</span></div>
    <div class="row"><span class="label">Salary</span><span class="value">${job.salary || 'Negotiable'}</span></div>
    <div class="row"><span class="label">Deadline</span><span class="value">${job.deadline}</span></div>
    <div class="row"><span class="label">Source</span><span class="value">${job.source}</span></div>
    <div class="row"><span class="label">Apply Link</span><span class="value"><a href="${job.link}" style="color:#1a73e8;">View Job</a></span></div>
  </div>

  <div class="section">
    <h3>Company Research <span class="accuracy">${companyDetails.accuracy}% Accuracy</span></h3>
    <div class="row"><span class="label">Company Name</span><span class="value">${companyDetails.companyName || job.company}</span></div>
    <div class="row"><span class="label">Address</span><span class="value">${companyDetails.address || 'Not found'}</span></div>
    <div class="row"><span class="label">Phone</span><span class="value"><b style="color:#1a73e8;">${companyDetails.phone || 'Not found'}</b></span></div>
    <div class="row"><span class="label">Email</span><span class="value">${companyDetails.email || 'Not found'}</span></div>
    <div class="row"><span class="label">HR Contact</span><span class="value">${companyDetails.hrContact || 'Not found'}</span></div>
    <div class="row"><span class="label">Website</span><span class="value">${companyDetails.website || 'Not found'}</span></div>
  </div>

  <div class="action">
    <h3>Action Required</h3>
    <p>Call the company and introduce a qualified candidate from JobMate.</p>
    <p><b>Script:</b> "Hello, this is JobMate calling. We have a qualified candidate for your ${job.title} position. Are you available to discuss?"</p>
    <p><b>Placement Fee:</b> NPR 2,000 - 5,000 per successful hire</p>
    <a href="tel:${companyDetails.phone}" class="btn">Call Now</a>
  </div>

  <div class="footer">
    <p>JobMate — Lumbini Province's Most Trusted Job Portal</p>
    <p>This is an automated report. Do not reply to this email.</p>
  </div>

</body>
</html>
  `;

  await transporter.sendMail({
    from: `"JobMate Bot" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_TO,
    subject: `[JobMate] New Job Alert: ${job.title} at ${job.company}`,
    html: html
  });

  console.log('Email report sent!');
}

module.exports = { sendDailyReport };