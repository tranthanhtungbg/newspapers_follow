import { PrismaClient } from '@prisma/client';
import * as https from 'https';

const prisma = new PrismaClient();
const ADMIN_USER_ID = '00000000-0000-0000-0000-000000000001';

// We'll use a simple regex to parse RSS since it's just a script
function fetchRss(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => { resolve(data); });
    }).on('error', (err) => { reject(err); });
  });
}

function extractTag(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}[^>]*>(.*?)<\/${tag}>`, 'i'));
  if (match && match[1]) {
    // Handle CDATA
    return match[1].replace(/<!\[CDATA\[(.*?)\]\]>/, '$1').trim();
  }
  return '';
}

async function main() {
  console.log('Fetching latest news from VNExpress International...');
  const rssXml = await fetchRss('https://e.vnexpress.net/rss/news.rss');

  // Split into items
  const items = rssXml.split('<item>').slice(1);
  let savedCount = 0;

  for (const itemXml of items) {
    const title = extractTag(itemXml, 'title');
    const url = extractTag(itemXml, 'link');
    const descriptionXml = extractTag(itemXml, 'description');
    
    // Extract description text and thumbnail from CDATA description
    // Example: <![CDATA[<a href="..."><img src="thumb.jpg" ...></a> Text description]]>
    const thumbMatch = descriptionXml.match(/<img[^>]+src="([^">]+)"/);
    const thumbnail = thumbMatch ? thumbMatch[1] : null;
    
    // Strip HTML from description
    const description = descriptionXml.replace(/<[^>]+>/g, '').trim();

    if (title && url) {
      // Check if already exists
      const existing = await prisma.savedResource.findFirst({
        where: { userId: ADMIN_USER_ID, url }
      });

      if (!existing) {
        await prisma.savedResource.create({
          data: {
            userId: ADMIN_USER_ID,
            url,
            title,
            thumbnail,
            description,
            type: 'article',
            tags: ['News', 'VNExpress'],
            folder: 'Daily Reading',
            isRead: false,
            isFavorite: false
          }
        });
        console.log(`+ Saved: ${title}`);
        savedCount++;
      } else {
        console.log(`~ Skipped (Exists): ${title}`);
      }
    }
  }

  console.log(`\nImport completed! Added ${savedCount} new articles to Library.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
