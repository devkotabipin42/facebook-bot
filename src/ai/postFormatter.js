const Groq = require('groq-sdk');
require('dotenv').config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

async function formatJobPost(job) {
  const prompt = `You are a professional Nepali job posting expert for Facebook. Create an engaging job post.

STRICT RULES - FOLLOW EXACTLY:
1. Use ONLY the exact format below
2. NO markdown bold (**text**) anywhere
3. NO underscores (__text__) anywhere  
4. NO extra sentences or paragraphs
5. Apply link MUST be: Message Recruiter on WhatsApp. https://wa.me/9779743474919
6. NEVER mention Play Store or any app download
7. NEVER mention KumariJob, JagirKhoj or any other job portal name

═══════════════════════════
🔥 JOB ALERT | LUMBINI PROVINCE 🔥
═══════════════════════════

💼 Job: ${job.title}
🏢 Company: ${job.company}
📍 Location: ${job.location}
💰 Salary: ${job.salary || 'Negotiable'}
⏳ Deadline: ${job.deadline}
🕐 Type: ${job.jobType || 'Full Time'}

के तपाईं यो अवसर खोज्दै हुनुहुन्छ? आजै apply गर्नुस्! 🙏

✅ Apply गर्नुस्:
Message Recruiter on WhatsApp. https://wa.me/9779743474919

📲 Contact: +977-974-3474919

━━━━━━━━━━━━━━━━━━━━━
📲 Daily jobs को लागि JobMate Follow गर्नुस्!
━━━━━━━━━━━━━━━━━━━━━
#LumbiniJobs #NepalJobs #NawalparasiJobs #ButwalJobs #Rojgar #JobVacancy #JobMate

IMPORTANT: Return ONLY the post text above. No explanations. No extra text.`;
  const completion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'llama-3.3-70b-versatile',
    max_tokens: 1024,
  });

  return completion.choices[0].message.content;
}

module.exports = { formatJobPost };