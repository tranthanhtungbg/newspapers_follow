const axios = require('axios');
require('dotenv').config();

async function testGemini() {
  try {
    const res = await axios.post('https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', {
      model: process.env.OPENAI_MODEL || 'gemini-2.0-flash',
      messages: [{ role: 'user', content: 'hello' }],
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    console.log("Success:", res.data);
  } catch (err) {
    console.error("Error Status:", err.response?.status);
    console.error("Error Data:", JSON.stringify(err.response?.data, null, 2) || err.message);
  }
}

testGemini();
