### 1 Semantic search in plain words
* **Standard (lexical) search** looks for exact words or phrases. If the query is “car,” it only matches documents that contain the literal token *car*.
* **Semantic search** first converts text into fixed‑length numeric vectors (embeddings). It then finds documents whose vectors lie close to the query vector in high‑dimensional space. Two texts can match even when they share zero surface words (for example “automobile” and “car”).

Result: users retrieve meaning‑level matches, synonyms, paraphrases, or topic‑related passages that keyword search would miss.

---

### 2 Core ideas and terms
| Term | What it means in practice | Where it appears in the code |
|------|---------------------------|------------------------------|
| **Embedding** | A dense vector that captures the semantic content of text. Similar meanings → nearby vectors. | OpenAIEmbeddings |
| **Chunk / Split** | A slice of a larger document. Splitting avoids hitting context‑length limits and improves recall. | RecursiveCharacterTextSplitter |
| **Chunk overlap** | Extra characters included at each boundary so that ideas crossing a split are not lost. | CHUNK_OVERLAP constant |
| **Vector store** | An index that stores embeddings alongside their source text and lets you run similarity search. | MemoryVectorStore |
| **Similarity search** | A nearest‑neighbor query that returns the chunks whose vectors are closest to the query vector. | store.similaritySearch(query) |

---

### 3 End‑to‑end flow (matching the snippet)

1. **Load PDFs**
    * PDFLoader reads every PDF file in *public/cv*.
    * Each file becomes one LangChain Document object containing the text and metadata.

2. **Split documents**
    * RecursiveCharacterTextSplitter breaks each document into roughly 1000‑character chunks with 200‑character overlap.
    * Output is a flat array of smaller Document instances.

3. **Embed and index**
    * OpenAIEmbeddings generates one vector per chunk using the model text‑embedding‑3‑large.
    * MemoryVectorStore stores those vectors entirely in RAM and links them back to the chunk text.

4. **Serve search requests**
    * The first request initializes the singleton vector store (load → split → embed). Subsequent requests reuse it.
    * The POST handler reads a JSON body with query, performs similaritySearch, and streams results as server‑sent events (SSE).

---

### 4 LangChain classes in play

| LangChain component | Responsibility | Key methods used |
|---------------------|----------------|------------------|
| PDFLoader | Extract raw text from a PDF file path. | load() |
| RecursiveCharacterTextSplitter | Divide long text into overlapping chunks. | splitDocuments() |
| OpenAIEmbeddings | Call the OpenAI embedding endpoint and return vectors. | embedDocuments() inside addDocuments() |
| MemoryVectorStore | Hold vectors in memory and run nearest‑neighbor lookups. | addDocuments(), similaritySearch() |

All of these classes share the same ergonomic patterns: asynchronous methods, sensible defaults, and TypeScript types for safety.

---

### 5 Streaming the response
* **ReadableStream** is created manually.
* For every similarity match, the chunk’s JSON is pushed as one `data:` line, compatible with EventSource in the browser.
* When all results are sent, `controller.close()` ends the stream.

Benefits: zero latency between first match and first byte on the client, easy progressive rendering, no extra libraries.

---

### 6 Teaching pointers

* **Parameter tuning**
    * Increase CHUNK_SIZE for fewer, broader chunks (better summary quality, weaker pinpoint recall).
    * Decrease CHUNK_OVERLAP to save tokens if the text has neat paragraph boundaries.
* **Memory versus persistent stores**
    * MemoryVectorStore is ideal for demos or small corpora.
    * For production, switch to a persistent backend (like Pinecone, Chroma, Supabase, or Weaviate) with a one‑line import change.
* **Cold‑start optimisation**
    * The singleton pattern prevents duplicate indexing work when the API route hot‑reloads during development.
* **Security**
    * Validate and sanitise query input if your API becomes public.
    * Protect your OpenAI key; do not embed it in client code.
* **Evaluation**
    * Prepare a set of representative queries and manually grade relevance to spot over‑ or under‑splitting issues.

With these concepts and the annotated workflow, you can guide students from “what is semantic search” to a fully working semantic search endpoint in less than an hour.
