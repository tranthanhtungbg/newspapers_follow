const axios = require('axios');
const cheerio = require('cheerio');
const { JSDOM } = require('jsdom');
const { Readability } = require('@mozilla/readability');

async function testReadability() {
  const url = 'https://vietnamnews.vn/politics-laws/1780781/official-welcome-ceremony-held-for-top-vietnamese-leader-in-new-delhi.html';
  const res = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  
  const doc = new JSDOM(res.data, { url });
  const reader = new Readability(doc.window.document);
  const article = reader.parse();
  
  console.log("Title:", article.title);
  console.log("Length of content:", article.content?.length);
  
  const $content = cheerio.load(article.content);
  const allowed = new Set(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'strong', 'em', 'a', 'img']);
  $content('body').find('*').each((_, el) => {
    const tag = el.tagName?.toLowerCase();
    if (tag) {
       $content(el).removeAttr('class');
       $content(el).removeAttr('id');
    }
    if (tag && !allowed.has(tag) && tag !== 'body' && tag !== 'html' && tag !== 'head') {
      $content(el).replaceWith($content(el).html() ?? '');
    }
  });
  
  const finalHtml = $content('body').html()?.trim();
  console.log("Final HTML Length:", finalHtml?.length);
  console.log("Snippet:", finalHtml?.substring(0, 300));
}

testReadability().catch(console.error);
