const axios = require('axios');

async function testLatency() {
  const start = Date.now();
  try {
    const res = await axios.post('http://localhost:3001/api/v1/translation/contextual', {
      text: "strategic",
      contextParagraph: "India media hails Vietnamese leader's visit as catalyst for stronger strategic partnership",
      sourceLang: "en",
      targetLang: "vi"
    });
    console.log("Data:", res.data);
  } catch(e) {
    console.error(e.response?.data || e.message);
  }
  console.log("Time taken:", Date.now() - start, "ms");
}

testLatency();
