const { tavily } = require('@tavily/core');
const axios = require('axios');
const Groq = require('groq-sdk');
require('dotenv').config();

const tavilyClient = tavily({ apiKey: process.env.TAVILY_API_KEY });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function findCompanyDetails(companyName, location) {
  console.log(`Searching: ${companyName} - ${location}...`);

  try {
    // Step 1: Search company website
    const searchResult = await tavilyClient.search(
      `${companyName} ${location} Nepal phone email contact`,
      { searchDepth: 'advanced', maxResults: 5 }
    );

    let websiteUrl = null;
    let searchContent = searchResult.results.map(r => r.content).join('\n');

    // Step 2: Find official website
    for (const result of searchResult.results) {
      const url = result.url || '';
      if (
        !url.includes('facebook') &&
        !url.includes('kumarijob') &&
        !url.includes('hamrojob') &&
        !url.includes('merojob') &&
        !url.includes('linkedin')
      ) {
        websiteUrl = url;
        break;
      }
    }

    // Step 3: Scrape website with Axios
    let websiteContent = '';
    if (websiteUrl) {
      try {
        console.log(`  Scraping: ${websiteUrl}`);
        const response = await axios.get(websiteUrl, {
          timeout: 10000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        // Extract text from HTML
        websiteContent = response.data
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .slice(0, 3000);
        console.log(`  Scraped ${websiteContent.length} chars`);
      } catch (e) {
        console.log(`  Scrape failed: ${e.message}`);
      }
    }

    // Step 4: AI extract details
    const completion = await groq.chat.completions.create({
      messages: [{
        role: 'user',
        content: `Extract company contact details for "${companyName}" in "${location}" Nepal.

Search Results:
${searchContent}

Website Content:
${websiteContent}

Return JSON only:
{
  "companyName": "",
  "address": "",
  "phone": "",
  "email": "",
  "hrContact": "",
  "website": "${websiteUrl || ''}",
  "accuracy": 0
}

accuracy = 0-100 based on how much real contact info was found.
Return JSON only, no other text.`
      }],
      model: 'llama-3.3-70b-versatile',
      max_tokens: 500
    });

    const text = completion.choices[0].message.content;
    const clean = text.replace(/```json|```/g, '').trim();
    const data = JSON.parse(clean);

    console.log(`  Found: ${data.companyName} | Accuracy: ${data.accuracy}%`);
    return data;

  } catch (error) {
    console.error(`Search error:`, error.message);
    return { accuracy: 0 };
  }
}

module.exports = { findCompanyDetails };