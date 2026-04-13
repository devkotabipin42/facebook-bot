const axios = require('axios');
require('dotenv').config();

async function postToFacebook(message, imageUrl = null) {
  const pageId = process.env.FB_PAGE_ID;
  const token = process.env.FB_PAGE_ACCESS_TOKEN;

  if (!token || token === 'will_add_later') {
    console.log('Facebook token not set!');
    return false;
  }
  
  
  try {
    let postData = {
      message: message,
      access_token: token
    };

    // Add image if provided
    if (imageUrl) {
      postData.link = imageUrl;
    }

    const response = await axios.post(
  `https://graph.facebook.com/v19.0/${pageId}/feed`,
  {
    message: message,
    access_token: token,
    published: true  // ← add this
  }
);

    console.log('Posted! Post ID:', response.data.id);
    return true;

  } catch (error) {
    console.error('Facebook error:', error.response?.data || error.message);
    return false;
  }
}
module.exports = { postToFacebook };