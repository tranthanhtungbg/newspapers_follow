import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';

// Load .env
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

const WORDS_TO_SCRAPE = [
  'Accomplish', 'Acknowledge', 'Adequate', 'Analyze', 'Anticipate', 
  'Attribute', 'Comprehend', 'Contribute', 'Demonstrate', 'Evaluate',
  'Facilitate', 'Implement', 'Incorporate', 'Maintain', 'Obtain',
  'Perceive', 'Subsequent', 'Sufficient', 'Utilize', 'Validate'
]; // High frequency academic words

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

async function main() {
  console.log(`Starting AI Vocabulary Scraper (Model: ${model})...`);
  let addedCount = 0;

  for (const word of WORDS_TO_SCRAPE) {
    // Check if already exists
    const existing = await prisma.vocabularyItem.findFirst({
      where: { userId: ADMIN_USER_ID, word }
    });

    if (!existing) {
      try {
        console.log(`[AI] Processing: ${word}...`);
        const result = await translateWord(word);
        
        await prisma.vocabularyItem.create({
          data: {
            userId: ADMIN_USER_ID,
            word,
            translation: result.translation,
            ipa: result.ipa,
            partOfSpeech: result.partOfSpeech,
            contextMeaning: result.contextMeaning,
            alternativeMeanings: result.alternativeMeanings || [],
            register: result.register,
            examples: result.examples || [],
            collocations: result.collocations || [],
            tags: ['AI-Generated', 'Academic'],
            sourceLang: 'en',
            targetLang: 'vi',
            difficulty: 3,
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
        
        console.log(`  -> Saved: ${word} (${result.translation})`);
        addedCount++;
      } catch (err: any) {
        console.error(`  -> Failed to process ${word}: ${err.message}`);
      }
    } else {
      console.log(`~ Skipped (Exists): ${word}`);
    }
  }

  console.log(`\nImport completed! Successfully AI-generated and added ${addedCount} words.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
