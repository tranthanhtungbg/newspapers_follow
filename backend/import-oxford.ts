import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';
import * as https from 'https';

dotenv.config();

const prisma = new PrismaClient();
const ADMIN_USER_ID = '00000000-0000-0000-0000-000000000001';

const model = process.env.OPENAI_MODEL || 'gpt-4o';
const baseURL = model.startsWith('gemini') 
  ? 'https://generativelanguage.googleapis.com/v1beta/openai/' 
  : undefined;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL
});

import * as http from 'http';

const OXFORD_URL = 'http://d.testimg.com/d/en/The_Oxford_3000.txt';

function fetchWords(url: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        // Split by newline and clean up
        const words = data.split('\n')
          .map(w => w.trim())
          .filter(w => w.length > 0 && !w.includes(' ')); // only single words to be safe
        resolve(words);
      });
    }).on('error', (err) => reject(err));
  });
}

async function translateWord(word: string): Promise<any> {
  const prompt = `Translate the English word "${word}" to Vietnamese.
Provide a general context meaning.

Respond ONLY in JSON:
{
  "translation": "Vietnamese meaning",
  "partOfSpeech": "noun|verb|adj|adv|phrase|other",
  "ipa": "/pronunciation/",
  "contextMeaning": "general usage context",
  "alternativeMeanings": ["meaning2", "meaning3"],
  "examples": [{ "en": "example sentence", "vi": "translation" }],
  "collocations": ["common phrase 1", "common phrase 2"],
  "register": "formal|informal|neutral"
}`;

  const response = await openai.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3
  });

  const raw = response.choices[0]?.message?.content ?? '{}';
  const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
  return JSON.parse(cleaned);
}

// Function to process with concurrency
async function processConcurrently(words: string[], concurrency: number) {
  let index = 0;
  let addedCount = 0;
  
  const worker = async () => {
    while (index < words.length) {
      const i = index++;
      const word = words[i];
      
      // Check if already exists to skip
      const existing = await prisma.vocabularyItem.findFirst({
        where: { userId: ADMIN_USER_ID, word: { equals: word, mode: 'insensitive' } }
      });

      if (!existing) {
        try {
          console.log(`[${i+1}/${words.length}] Translating: ${word}...`);
          const result = await translateWord(word);
          
          await prisma.vocabularyItem.create({
            data: {
              userId: ADMIN_USER_ID,
              word,
              translation: result.translation || 'N/A',
              ipa: result.ipa,
              partOfSpeech: result.partOfSpeech,
              contextMeaning: result.contextMeaning,
              alternativeMeanings: result.alternativeMeanings || [],
              register: result.register,
              examples: result.examples || [],
              collocations: result.collocations || [],
              tags: ['Oxford 3000', 'AI-Generated'],
              sourceLang: 'en',
              targetLang: 'vi',
              difficulty: 2, // Oxford 3000 are relatively basic
              flashcardSession: {
                create: {
                  userId: ADMIN_USER_ID,
                  score: 0,
                  easeFactor: 2.5,
                  intervalDays: 1,
                  nextReviewDate: new Date(),
                }
              }
            }
          });
          
          addedCount++;
          console.log(`  -> Saved: ${word} (${result.translation})`);
        } catch (err: any) {
          console.error(`  -> Failed: ${word} - ${err.message}`);
        }
      } else {
        console.log(`[${i+1}/${words.length}] Skipped (Exists): ${word}`);
      }
    }
  };

  const workers = Array(concurrency).fill(null).map(() => worker());
  await Promise.all(workers);
  
  return addedCount;
}

async function main() {
  console.log('Downloading Oxford 3000 list from provided URL...');
  let words = [];
  try {
    words = await fetchWords(OXFORD_URL);
    console.log(`Downloaded ${words.length} words.`);
  } catch (err: any) {
    console.error('Failed to download list:', err.message);
    words = ['apple', 'book']; // Fallback
  }

  // We will process all of them. Concurrency of 5 to not hit rate limits too hard.
  console.log(`Starting massive AI processing for ${words.length} words (Concurrency: 5)...`);
  console.log('NOTE: This will take a long time to complete.');
  
  const added = await processConcurrently(words, 5);
  
  console.log(`\nImport completed! Successfully added ${added} words from Oxford 3000.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
