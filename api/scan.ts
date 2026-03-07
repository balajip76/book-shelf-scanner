import Anthropic from '@anthropic-ai/sdk';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface ScanRequest {
  imageBase64: string;
  imageMediaType: 'image/jpeg' | 'image/png' | 'image/webp';
  sessionId: string;
}

interface SpineReading {
  tempId: string;
  title: string | null;
  author: string | null;
  readable: boolean;
}

interface RecognizedBook {
  tempId: string;
  title: string | null;
  author: string | null;
  readable: boolean;
  genre: 'fiction' | 'non-fiction' | 'uncategorized';
  subCategory: string | null;
  classificationConfidence: 'high' | 'low' | null;
}

function log(agent: string, inputSummary: string, outcome: string) {
  console.info(JSON.stringify({ timestamp: new Date().toISOString(), agent, inputSummary, outcome }));
}

async function runVisionAgent(imageBase64: string, imageMediaType: string, sessionId: string): Promise<SpineReading[]> {
  log('vision-agent', `sessionId=${sessionId}, imageMediaType=${imageMediaType}`, 'starting');

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    tools: [{
      name: 'extract_books',
      description: 'Return all book spines visible in the image',
      input_schema: {
        type: 'object' as const,
        properties: {
          books: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                author: { type: 'string' },
                readable: { type: 'boolean' }
              },
              required: ['readable']
            }
          }
        },
        required: ['books']
      }
    }],
    tool_choice: { type: 'tool', name: 'extract_books' },
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: { type: 'base64', media_type: imageMediaType as 'image/jpeg', data: imageBase64 }
        },
        {
          type: 'text',
          text: `You are scanning a bookshelf image. Extract every visible book spine, left to right.

For each spine:
- Return the title exactly as written (omit if unreadable)
- Return the author exactly as written (omit if not present or unreadable)
- Set readable: false if you cannot determine the title at all

Rules:
- Never guess or fabricate title or author
- Include ALL spines, even partially visible ones — set readable: false rather than omitting`
        }
      ]
    }]
  });

  const toolUse = response.content.find(b => b.type === 'tool_use');
  if (!toolUse || toolUse.type !== 'tool_use') {
    log('vision-agent', `sessionId=${sessionId}`, 'no tool_use in response');
    return [];
  }

  const input = toolUse.input as { books: Array<{ title?: string; author?: string; readable: boolean }> };
  const books: SpineReading[] = (input.books || []).map((b, i) => ({
    tempId: `temp-${sessionId}-${i}`,
    title: b.title ?? null,
    author: b.author ?? null,
    readable: b.readable,
  }));

  log('vision-agent', `sessionId=${sessionId}`, `${books.length} spines, ${books.filter(b => !b.readable).length} unreadable`);
  return books;
}

async function classifyBook(tempId: string, title: string, author: string | null): Promise<{
  genre: 'fiction' | 'non-fiction' | 'uncategorized';
  subCategory: string | null;
  confidence: 'high' | 'low';
}> {
  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 256,
      tools: [{
        name: 'classify_book',
        description: 'Classify a book by genre and sub-category',
        input_schema: {
          type: 'object' as const,
          properties: {
            genre: { type: 'string', enum: ['fiction', 'non-fiction', 'uncategorized'] },
            subCategory: { type: 'string', nullable: true },
            confidence: { type: 'string', enum: ['high', 'low'] }
          },
          required: ['genre', 'confidence']
        }
      }],
      tool_choice: { type: 'tool', name: 'classify_book' },
      messages: [{
        role: 'user',
        content: [{
          type: 'text',
          text: `Classify the following book:\nTitle: "${title}"\nAuthor: "${author ?? 'Unknown'}"\n\nReturn genre, subCategory (from the standard list or null), and confidence.\n\nFiction sub-categories: literary-fiction, science-fiction, mystery, romance, fantasy, thriller, historical-fiction, horror, short-stories, graphic-novel\nNon-Fiction sub-categories: self-help, biography, memoir, history, science, business, travel, cooking, philosophy, psychology, politics, true-crime`
        }]
      }]
    });

    const toolUse = response.content.find(b => b.type === 'tool_use');
    if (!toolUse || toolUse.type !== 'tool_use') {
      return { genre: 'uncategorized', subCategory: null, confidence: 'low' };
    }
    const input = toolUse.input as { genre: string; subCategory?: string; confidence: string };
    log('classifier-agent', `tempId=${tempId}, title=${title}`, `genre=${input.genre}, confidence=${input.confidence}`);
    return {
      genre: (input.genre as 'fiction' | 'non-fiction' | 'uncategorized') ?? 'uncategorized',
      subCategory: input.subCategory ?? null,
      confidence: (input.confidence as 'high' | 'low') ?? 'low',
    };
  } catch (err) {
    log('classifier-agent', `tempId=${tempId}, title=${title}`, `ERROR: ${String(err)}`);
    return { genre: 'uncategorized', subCategory: null, confidence: 'low' };
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const start = Date.now();
  const { imageBase64, imageMediaType, sessionId } = req.body as ScanRequest;

  if (!imageBase64 || !sessionId) {
    return res.status(400).json({ error: 'Missing imageBase64 or sessionId' });
  }

  log('orchestrator', `sessionId=${sessionId}`, 'pipeline started');

  try {
    const spines = await runVisionAgent(imageBase64, imageMediaType ?? 'image/jpeg', sessionId);

    const readableBooks = spines.filter(b => b.readable && b.title);
    const classificationPromises = readableBooks.map(b =>
      classifyBook(b.tempId, b.title!, b.author)
    );
    const classifications = await Promise.all(classificationPromises);

    const books: RecognizedBook[] = spines.map((spine) => {
      if (!spine.readable || !spine.title) {
        return {
          tempId: spine.tempId,
          title: spine.title,
          author: spine.author,
          readable: false,
          genre: 'uncategorized' as const,
          subCategory: null,
          classificationConfidence: null,
        };
      }
      const readableIdx = readableBooks.findIndex(b => b.tempId === spine.tempId);
      const cls = readableIdx >= 0 ? classifications[readableIdx] : null;
      return {
        tempId: spine.tempId,
        title: spine.title,
        author: spine.author,
        readable: true,
        genre: cls?.genre ?? ('uncategorized' as const),
        subCategory: cls?.subCategory ?? null,
        classificationConfidence: cls?.confidence ?? null,
      };
    });

    log('orchestrator', `sessionId=${sessionId}`, `pipeline complete: ${books.length} books`);

    return res.status(200).json({ sessionId, books, durationMs: Date.now() - start });
  } catch (err) {
    log('orchestrator', `sessionId=${sessionId}`, `ERROR: ${String(err)}`);
    return res.status(500).json({ error: 'Scan failed', message: String(err) });
  }
}
