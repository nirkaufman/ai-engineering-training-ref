### Teaching Guide — LangChain JS **Vector Stores**

---

#### 1. Why Vector Stores Matter

* **Semantic search backbone.** A vector store *stores* embeddings and *searches* them for you, turning any unstructured corpus into a query‑able knowledge base without keyword indexes. ([Langchain][1], [Langchain][2])
* **Plug‑and‑play across providers.** LangChain exposes one uniform interface (`addDocuments`, `similaritySearch`, `.asRetriever()`) so you can swap Chroma for Supabase or Pinecone with only a constructor change. ([Langchain][2])
* **First step to RAG.** Cleanly indexed chunks + fast similarity search = the context you feed back into the LLM. Without a vector store, RAG cannot scale. ([Langchain][2])

**Learning goal ►** Students should be able to choose, initialize, populate, query, and tune a vector store—and know when to replace it with a different backend.

---

#### 2. Core Interface & Methods

| Method                                     | What it does                          | Typical Return        |
| ------------------------------------------ | ------------------------------------- | --------------------- |
| `addDocuments(docs, opts?)`                | Embeds & writes `Document[]`          | void                  |
| `deleteDocuments(ids)` / `delete({ ids })` | Removes by ID                         | void                  |
| `similaritySearch(query, k)`               | Top‑*k* most similar docs             | `Promise<Document[]>` |
| `.asRetriever(cfg?)`                       | Wraps store as a `Retriever` Runnable | `BaseRetriever`       |

All stores honour these calls—anything else (filters, hybrid search) is backend‑specific. ([Langchain][2])

---

#### 3. Quick‑Start Example (MemoryVectorStore)

```ts
import { MemoryVectorStore }   from "langchain/vectorstores/memory";
import { OpenAIEmbeddings }    from "@langchain/openai";
import { TextLoader }          from "langchain/document_loaders/fs/text";

// 1 | Load raw docs
const docs = await new TextLoader("speech.txt").load();

// 2 | Index in‑memory
const store = await MemoryVectorStore.fromDocuments(
  docs,
  new OpenAIEmbeddings()
);

// 3 | Query
const hits = await store.similaritySearch("What did she say about climate?", 3);
console.log(hits.map(h => h.metadata.source));
```

Uses the ephemeral, in‑process store—perfect for demos and unit tests. ([Langchain][1])

---

#### 4. Turning a Store into a Retriever

```ts
const retriever = store.asRetriever({ k: 4, searchType: "similarity" });
const contexts  = await retriever.invoke("renewable energy subsidies");
```

`asRetriever()` lets you drop the store straight into LCEL pipelines or a RAG chain. ([Langchain][3])

---

#### 5. Choosing the Right Backend

| Need                       | Recommended Store(s)               |
| -------------------------- | ---------------------------------- |
| **Local, no server**       | HNSWLib, FAISS, LanceDB            |
| **Browser / Edge**         | MemoryVectorStore, CloseVector     |
| **Docker‑friendly OSS DB** | Chroma, Weaviate                   |
| **Postgres‑first**         | Supabase (pgvector), PGVectorStore |
| **Fully‑managed cloud**    | Pinecone, SingleStore              |

LangChain ships >25 integrations—swap by changing the import path. ([Langchain][1])

---

#### 6. Similarity Metrics & Index Algorithms

* Most stores default to **cosine similarity**; some let you pick Euclidean or dot‑product. ([Langchain][2])
* Indexing tricks (HNSW, IVF‑Flat, product quantization) decide speed vs. recall—under the hood for managed DBs, optional knobs for local libraries. ([Langchain][2])

---

#### 7. Design Levers & Gotchas

| Lever               | Guidance                                                                                      |
| ------------------- | --------------------------------------------------------------------------------------------- |
| **Chunk quality**   | Garbage in → garbage vectors; split text with `RecursiveCharacterTextSplitter` first.         |
| **Embedding model** | Small = cheap; large = better recall—swap without touching the store.                         |
| **IDs**             | Pass stable IDs when calling `addDocuments` to enable updates & deletions. ([Langchain][2])   |
| **Filters**         | Some backends support metadata filters—encode searchable fields up front.                     |
| **Cold‑start cost** | Indexing large corpora is I/O bound; stream docs (`lazyLoad`) + batch embeds for speed.       |
| **Custom store**    | Extend `VectorStore` and override a few methods if your DB isn’t integrated. ([Langchain][4]) |

---

#### 8. Classroom Implementation Plan

| Stage                  | Activity                                                        | Outcome               |
| ---------------------- | --------------------------------------------------------------- | --------------------- |
| **Concept (10 min)**   | Diagram: Loader → Splitter → **VectorStore** → Retriever → LLM  | Mental model          |
| **Lab 1 (20 min)**     | Build MemoryVectorStore; run `.similaritySearch()`              | Hands‑on basics       |
| **Lab 2 (25 min)**     | Switch to Chroma (Docker) with no code changes but constructor  | See swapability       |
| **Lab 3 (20 min)**     | Call `.asRetriever()` and plug into a RAG chain                 | Full pipeline         |
| **Challenge (15 min)** | Measure cosine vs. dot‑product recall on the same query         | Metric insight        |
| **Debrief (10 min)**   | Inspect LangSmith trace—spot vector search vs. generation steps | Observability mindset |

---

#### 9. Key Takeaways for Students

1. **Vector store = embeddings database + similarity search API.**
2. **LangChain’s uniform interface means one codebase, many backends.**
3. **`.asRetriever()` is the bridge from storage to RAG chains.**
4. **Choose backend by latency, persistence, and hosting constraints—not by API differences.**
5. **Tune embeddings, chunking, and similarity metric before blaming the model.**

[1]: https://js.langchain.com/docs/how_to/vectorstores/ "How to create and query vector stores | ️ Langchain"
[2]: https://js.langchain.com/docs/concepts/vectorstores/ "Vector stores | ️ Langchain"
[3]: https://js.langchain.com/docs/how_to/vectorstore_retriever/ "How use a vector store to retrieve data | ️ Langchain"
[4]: https://js.langchain.com/v0.1/docs/modules/data_connection/vectorstores/custom/?utm_source=chatgpt.com "Custom vectorstores - LangChain.js"
