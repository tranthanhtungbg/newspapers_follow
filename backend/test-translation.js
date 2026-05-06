const axios = require('axios');

async function testTranslation() {
  try {
    const res = await axios.post('http://localhost:3001/api/v1/translation/contextual', {
      text: "catalyst",
      contextParagraph: "India media hails Vietnamese leader's visit as catalyst for stronger strategic partnership",
      sourceLang: "en",
      targetLang: "vi"
    }, {
      // we need to pass the cookie or just bypass auth for the test?
      // Wait, /translation/contextual might require auth!
    });
    console.log(res.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
  }
}

testTranslation();
