# Building a Semantic Search System with PDF Documents

This tutorial provides a detailed explanation of how to implement a semantic search system that can search through PDF documents using embeddings and vector similarity. We'll use LangChain, OpenAI embeddings, and Next.js API routes to create a powerful document search system.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Understanding Semantic Search](#understanding-semantic-search)
3. [Understanding Vector Stores](#understanding-vector-stores)
4. [Step 1: Setting Up the Environment](#step-1-setting-up-the-environment)
5. [Step 2: Document Processing Pipeline](#step-2-document-processing-pipeline)
6. [Step 3: Implementing the Vector Store](#step-3-implementing-the-vector-store)
7. [Step 4: Creating the Search API](#step-4-creating-the-search-api)
8. [Step 5: Building the Frontend Interface](#step-5-building-the-frontend-interface)
9. [Step 6: Error Handling](#step-6-error-handling)
10. [Advanced Customizations](#advanced-customizations)
11. [Troubleshooting](#troubleshooting)

## Prerequisites

Before starting this tutorial, make sure you have:

- Next.js 14 or later installed
- Node.js 18 or later
- An OpenAI API key
- Basic understanding of TypeScript and React
- LangChain packages installed:
  - `@langchain/openai`
  - `@langchain/community`
  - `@langchain/textsplitters`

## Understanding Semantic Search

Semantic search goes beyond traditional keyword matching by understanding the meaning and context of both the query and the content. This is achieved through:

- Converting text into vector embeddings
- Using vector similarity to find relevant content
- Processing documents in chunks for better context
- Maintaining semantic relationships between content

## Understanding Vector Stores

Vector stores are specialized databases that:
- Store document embeddings
- Enable efficient similarity search
- Support semantic queries
- Maintain document metadata

## Step 1: Setting Up the Environment

First, let's set up our configuration constants and imports:

```typescript
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
```

## Step 2: Document Processing Pipeline

Implement the document loading and processing functions:

```typescript
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
```

## Step 3: Implementing the Vector Store

Create and manage the vector store with a singleton pattern:

```typescript
// Singleton pattern for vector store
let vectorStore: MemoryVectorStore | null = null;

// Creates and initializes the vector store with document embeddings
async function createVectorStore(documents: Document[]): Promise<MemoryVectorStore> {
  const embeddings = new OpenAIEmbeddings({ model: EMBEDDING_MODEL });
  const store = new MemoryVectorStore(embeddings);
  await store.addDocuments(documents);
  return store;
}

// Initializes the vector store singleton
async function initVectorStore(): Promise<MemoryVectorStore> {
  if (vectorStore) return vectorStore;

  try {
    const documents = await loadPdfDocuments();
    const splits = await splitDocuments(documents);
    vectorStore = await createVectorStore(splits);
    return vectorStore;
  } catch (error) {
    console.error('Failed to initialize vector store:', error);
    throw new Error('Vector store initialization failed');
  }
}
```

## Step 4: Creating the Search API

Implement the search API endpoint:

```typescript
export async function POST(req: Request) {
  try {
    const store = await initVectorStore();
    const { query } = await req.json() as { query?: string };

    if (!query) {
      return new Response('Missing query', { status: 400 });
    }

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
  } catch (error) {
    console.error('Search API error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
```

## Step 5: Building the Frontend Interface

Create a React component for the search interface:

```typescript
'use client'

import { FormEvent, useEffect, useRef, useState } from 'react'

type SearchResult = {
  pageContent: string;
  metadata: {
    source: string;
    page: number;
  };
}

export default function SemanticSearchPage() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isSearching) return;

    setIsSearching(true);
    setResults([]);

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: inputValue }),
      });

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = new TextDecoder().decode(value);
        const lines = text.split('\n\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            setResults(prev => [...prev, data]);
          }
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      // Handle error state
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Search form */}
      <div className="border-t border-gray-200 bg-black">
        <div className="max-w-2xl mx-auto p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Search through documents..."
              className="flex-1 p-3 border border-gray-300 rounded-lg"
              disabled={isSearching}
            />
            <button
              type="submit"
              className={`px-4 py-2 rounded-lg ${
                isSearching ? 'opacity-50' : 'hover:bg-green-400'
              }`}
              disabled={isSearching}
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </form>
        </div>
      </div>

      {/* Results display */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto">
          {results.map((result, index) => (
            <div key={index} className="mb-4 p-4 border rounded-lg">
              <div className="text-sm text-gray-500 mb-2">
                Source: {result.metadata.source} (Page {result.metadata.page})
              </div>
              <div className="whitespace-pre-wrap">{result.pageContent}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

## Step 6: Error Handling

The implementation includes comprehensive error handling:

1. Document loading errors
2. Vector store initialization errors
3. Search API errors
4. Frontend error states
5. Stream processing errors

## Advanced Customizations

You can customize the implementation by:

1. Adjusting chunk size and overlap for different document types
2. Using different embedding models
3. Implementing caching for frequently searched queries
4. Adding filters for metadata
5. Customizing the UI components and styling
6. Adding support for different document types
7. Implementing pagination for large result sets

## Troubleshooting

Common issues and solutions:

1. **PDF Loading Issues**
   - Verify PDF files are in the correct directory
   - Check file permissions
   - Ensure PDFs are not corrupted

2. **Vector Store Initialization**
   - Check OpenAI API key configuration
   - Verify sufficient memory for document processing
   - Monitor embedding generation progress

3. **Search Performance**
   - Adjust chunk size for better context
   - Consider using a persistent vector store
   - Implement caching for frequent queries

4. **Memory Usage**
   - Monitor memory consumption
   - Implement cleanup for unused vectors
   - Consider using a database-backed vector store

## Conclusion

This implementation provides a robust foundation for semantic search using PDF documents. The combination of document processing, vector embeddings, and streaming responses creates a powerful and user-friendly search experience. The modular design allows for easy customization and extension of the search capabilities.

The system demonstrates how to effectively combine LangChain's document processing capabilities with OpenAI's embeddings to create a sophisticated search system that understands the semantic meaning of both queries and content. 