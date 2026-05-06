require('dotenv').config();
const { OpenAI } = require('openai');

async function testSDK() {
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/'
  });

  const prompt = `Translate the following en text to vi.

Context paragraph: """India media hails Vietnamese leader's visit as catalyst for stronger strategic partnership"""
Target text: """catalyst"""

Respond ONLY in JSON (no markdown, no preamble):
{
  "translation": "string",
  "partOfSpeech": "noun|verb|adj|adv|phrase|other",
  "ipa": "/pronunciation/",
  "contextMeaning": "meaning specific to this context",
  "alternativeMeanings": ["meaning2", "meaning3"],
  "examples": [{ "en": "example in English", "vi": "translation" }],
  "collocations": ["common phrase 1", "common phrase 2"],
  "register": "formal|informal|neutral|technical"
}`;

  const response = await client.chat.completions.create({
    model: 'gemini-2.5-flash',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3
  });

  const raw = response.choices[0]?.message?.content || '{}';
  console.log("=== RAW ===");
  console.log(raw);
  console.log("=== END RAW ===");
  
  try {
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    JSON.parse(cleaned);
    console.log("JSON Parse OK");
  } catch(e) {
    console.error("Parse Error:", e.message);
  }
}

testSDK();
