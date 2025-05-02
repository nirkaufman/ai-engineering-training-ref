import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { OpenAIEmbeddings } from '@langchain/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import * as fs from "node:fs";
import path from 'node:path';
import { Document } from 'langchain/document';

// Configuration constants
const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;
const EMBEDDING_MODEL = 'text-embedding-3-large';
const PDF_DIRECTORY = path.join(process.cwd(), 'public/cv');

// Singleton pattern for vector store
let vectorStore: MemoryVectorStore | null = null;

// Loads PDF documents from the specified directory
async function loadPdfDocuments(): Promise<Document[]> {
  try {
    const files = fs.readdirSync(PDF_DIRECTORY);
    const pdfFiles = files.filter(file => file.endsWith('.pdf'));

    if (pdfFiles.length === 0) {
      console.warn('No PDF files found in directory:', PDF_DIRECTORY);
      return [];
    }

    const loaders = pdfFiles.map(file => new PDFLoader(path.join(PDF_DIRECTORY, file)));
    const docs = await Promise.all(loaders.map(loader => loader.load()));

    return docs.flat();
  } catch (error) {
    console.error('Error loading PDF documents:', error);
    throw new Error('Failed to load PDF documents');
  }
}

// Splits documents into smaller chunks for processing
async function splitDocuments(documents: Document[]): Promise<Document[]> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP,
  });
  return await splitter.splitDocuments(documents);
}

// Creates and initializes the vector store with document embeddings
async function createVectorStore(documents: Document[]): Promise<MemoryVectorStore> {
  const embeddings = new OpenAIEmbeddings({ model: EMBEDDING_MODEL });

  const store = new MemoryVectorStore(embeddings);
  await store.addDocuments(documents);

  return store;
}

// Initializes the vector store singleton
async function initVectorStore(): Promise<MemoryVectorStore> {

  // Return an existing store if already initialized
  if (vectorStore) return vectorStore;

  try {
    // Process: Load PDF → Split into chunks → Create vector store
    const documents = await loadPdfDocuments();
    const splits = await splitDocuments(documents);

    vectorStore = await createVectorStore(splits);

    return vectorStore;
  } catch (error) {
    console.error('Failed to initialize vector store:', error);
    throw new Error('Vector store initialization failed');
  }
}

export async function POST(req: Request) {
  try {
    const store = await initVectorStore();
    const { query } = await req.json() as { query?: string };

    if (!query) {
      return new Response('Missing query', { status: 400 });
    }

    const searchResults = await store.similaritySearch(query);
    console.log('Search results:', searchResults);

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
  } catch (error) {
    console.error('Search API error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
