require('dotenv').config();
const { findCompanyDetails } = require('./src/ai/companyResearch');

const company = process.argv[2];
const location = process.argv[3];

if (!company) {
  console.log('Usage: node search.js "Company Name" "Location"');
  process.exit(1);
}

(async () => {
  const details = await findCompanyDetails(company, location || 'Nepal');
  
  console.log('\n========== COMPANY DETAILS ==========');
  console.log(`Company  : ${details.companyName}`);
  console.log(`Address  : ${details.address}`);
  console.log(`Phone    : ${details.phone}`);
  console.log(`Email    : ${details.email}`);
  console.log(`HR       : ${details.hrContact}`);
  console.log(`Website  : ${details.website}`);
  console.log(`Accuracy : ${details.accuracy}%`);
  console.log('=====================================\n');
})();