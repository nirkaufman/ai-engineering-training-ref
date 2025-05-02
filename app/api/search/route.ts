import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { OpenAIEmbeddings } from '@langchain/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import * as fs from "node:fs";

// the store should have one instance
let vectorStore: MemoryVectorStore | null = null;

async function initVectorStore(): Promise<MemoryVectorStore> {

  //  Don't create another store if exist
  if (vectorStore) return vectorStore;

  // 1. Load PDF
  const cvPath = process.cwd() + '/public/cv';
  const files = fs.readdirSync(cvPath);
  const pdfFiles = files.filter(file => file.endsWith('.pdf'));

  const loaders = pdfFiles.map(file => new PDFLoader(`${cvPath}/${file}`));
  const docs = await Promise.all(loaders.map(loader => loader.load()));
  const allDocs = docs.flat();

  // const loader = new PDFLoader(process.cwd() + '/public/sample.pdf');
  // const docs = await loader.load();

  // 2. Split into chunks

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  const splits = await splitter.splitDocuments(allDocs);

  // 3. Embed & index
  const embeddings = new OpenAIEmbeddings({ model: 'text-embedding-3-large' });
  const store = new MemoryVectorStore(embeddings);

  await store.addDocuments(splits);

  vectorStore = store;
  return store;
}

export async function POST(req: Request) {
  const store = await initVectorStore();
  const {query} = await req.json() as { query?: string };

  if (!query) {
    return new Response('Missing query', { status: 400 });
  }

  // similaritySearch is a method from store
  const searchResults = await store.similaritySearch(query);

  const stream = new ReadableStream({
    start(controller) {
      searchResults.forEach((result) => {
        controller.enqueue(`data: ${JSON.stringify(result)}\n\n`);
      });
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
