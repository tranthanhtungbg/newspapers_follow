const axios = require('axios');
const cheerio = require('cheerio');

async function testScrape() {
  const url = 'https://vietnamnews.vn/politics-laws/1780781/official-welcome-ceremony-held-for-top-vietnamese-leader-in-new-delhi.html';
  const res = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const $ = cheerio.load(res.data);
  
  $('script, style, nav, header, footer, aside, .ad, .advertisement').remove();
  
  const contentEl = $('article').first().length ? $('article').first() : $('[class*="content"]').first();
  console.log("Found content element:", contentEl.length > 0);
  console.log("HTML length before cleanup:", contentEl.html().length);
  
  const allowed = new Set(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'strong', 'em', 'a']);
  contentEl.find('*').each((_, el) => {
    const tag = el.tagName?.toLowerCase();
    if (tag && !allowed.has(tag)) {
      $(el).replaceWith($(el).html() || '');
    }
  });
  
  console.log("HTML length after cleanup:", contentEl.html()?.length);
  console.log(contentEl.html()?.substring(0, 500));
}

testScrape().catch(console.error);
