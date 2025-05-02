Below is a Next.js–based re-implementation of the LangChain retrievers tutorial (semantic search over a PDF) that streams matching document chunks back to the browser in real time.

## 1. Dependencies and Setup

Install the same packages used in the tutorial:

```bash
  npm install @langchain/community pdf-parse @langchain/textsplitters
```

- We’ll use **PDFLoader** to load a PDF into LangChain Documents
- We split pages into 1 000-character chunks via **RecursiveCharacterTextSplitter**
- Embeddings come from **OpenAIEmbeddings** 
- Store vectors in memory with **MemoryVectorStore**
- Place your `*.pdf` file `public/` folder.

## 2. Next.js API Route with Streaming

- Create **`app/api/search/route.ts`**:

```ts
// pages/api/search.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { OpenAIEmbeddings } from '@langchain/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';

let vectorStore: MemoryVectorStore | null = null;

async function initVectorStore() {
  if (vectorStore) return vectorStore;

  // 1. Load PDF
  const loader = new PDFLoader('public/sample.pdf');
  const docs = await loader.load();

  // 2. Split into chunks
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  const splits = await splitter.splitDocuments(docs);

  // 3. Embed & index
  const embeddings = new OpenAIEmbeddings({ model: 'text-embedding-3-large' });
  const store = new MemoryVectorStore(embeddings);
  await store.addDocuments(splits);

  vectorStore = store;
  return store;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const { query } = req.body as { query?: string };
  if (!query) return res.status(400).json({ error: 'Missing query.' });

  const store = await initVectorStore();
  const retriever = store.asRetriever({ searchType: 'similarity', searchKwargs: { k: 5 } });

  // Set up Server-Sent Events headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  // Stream each matching Document as a JSON chunk
  const docs = await retriever.getRelevantDocuments(query);
  for (const doc of docs) {
    res.write(`data: ${JSON.stringify({
      content: doc.pageContent,
      metadata: doc.metadata,
    })}\n\n`);
  }

  // Signal end of stream
  res.write('event: end\ndata: null\n\n');
  res.end();
}
```

## 3. Client-Side Streaming Component

Create **`pages/index.tsx`**:

```tsx
// pages/index.tsx
import { useState, useRef } from 'react';

type Doc = { content: string; metadata: any };

export default function Home() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Doc[]>([]);
  const controllerRef = useRef<AbortController>();

  const handleSearch = async () => {
    setResults([]);
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    const res = await fetch('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
      signal: controller.signal,
    });

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      if (value) {
        const chunk = decoder.decode(value);
        // Split by SSE frame
        const lines = chunk.split('\n\n').filter(Boolean);
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const payload = line.replace(/^data: /, '');
            if (payload === 'null') return;
            const doc: Doc = JSON.parse(payload);
            setResults((r) => [...r, doc]);
          }
        }
      }
    }
  };

  return (
    <main style={{ padding: 20 }}>
      <h1>Semantic Search</h1>
      <input
        style={{ width: '80%', padding: 8 }}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Ask about Nike..."
      />
      <button onClick={handleSearch} style={{ marginLeft: 8, padding: '8px 16px' }}>
        Search
      </button>
      <section style={{ marginTop: 20 }}>
        {results.map((doc, i) => (
          <div key={i} style={{ marginBottom: 16, borderBottom: '1px solid #ccc', paddingBottom: 8 }}>
            <p>{doc.content}</p>
            <small>{JSON.stringify(doc.metadata)}</small>
          </div>
        ))}
      </section>
    </main>
  );
}
```

## 4. How It Works

1. **Initialization**  
   On first request, we load and split the PDF, generate embeddings, and build an in-memory vector store  ([Build a semantic search engine | ️ Langchain](https://js.langchain.com/docs/tutorials/retrievers)).
2. **Retrieval**  
   We call `asRetriever` on the store to get a Retriever Runnable, and invoke `getRelevantDocuments(query)`  ([Build a semantic search engine | ️ Langchain](https://js.langchain.com/docs/tutorials/retrievers)).
3. **Streaming**  
   The API route writes each document chunk as a Server-Sent Event (`data: …`), and the client reads the stream via `ReadableStream.getReader()`, appending results as they arrive.

This approach mirrors the LangChain tutorial’s feature set—only now wrapped in a Next.js app with live streaming of search hits to the browser.
