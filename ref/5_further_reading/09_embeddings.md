### Teaching Guide — LangChain JS **Embeddings**

---

#### 1 | Why Embeddings Matter

* **Semantic key for search and reasoning.** Embedding models convert any piece of text into a fixed‑length numeric vector that captures its meaning, enabling similarity search, clustering, and retrieval‑augmented generation (RAG). ([Langchain][1])
* **Foundation of every vector store.** Without embeddings you cannot populate or query a vector index; they are the first step in the RAG pipeline. ([Langchain][2])

---

#### 2 | Core Interface & Methods

| Method                                                  | Signature                       | Purpose                     |
| ------------------------------------------------------- | ------------------------------- | --------------------------- |
| `embedDocuments(texts: string[]) → Promise<number[][]>` | Batch‑encode multiple documents | Populate a vector store     |
| `embedQuery(text: string) → Promise<number[]>`          | Encode a single search query    | Runtime similarity look‑ups |

The separate methods exist because some providers expose different endpoints or models for doc vs. query embeddings. ([v03.api.js.langchain.com][3], [Langchain][2])

---

#### 3 | Anatomy of an Embedding Call (OpenAI)

```ts
import { OpenAIEmbeddings } from "@langchain/openai";

const embedder = new OpenAIEmbeddings({
  model:      "text-embedding-3-small",   // provider‑specific
  batchSize:  100,                        // auto‑chunk large inputs
  timeout:    60_000                      // ms
});

const vecDocs  = await embedder.embedDocuments(["LangChain is 🔥", "Embeddings rock"]);
const vecQuery = await embedder.embedQuery("Why are embeddings useful?");
```

OpenAIEmbedding batches requests under the hood and respects rate‑limits. ([api.js.langchain.com][4])

---

#### 4 | Quick‑Start Pipeline (Docs → Vectors → Search)

```ts
import { MemoryVectorStore }   from "langchain/vectorstores/memory";
import { TextLoader }          from "@langchain/community/document_loaders/fs/text";
import { OpenAIEmbeddings }    from "@langchain/openai";

// 1 | Load raw docs
const docs = await new TextLoader("knowledge/faq.txt").load();

// 2 | Create vector store
const store = await MemoryVectorStore.fromDocuments(docs, new OpenAIEmbeddings());

// 3 | Semantic search
const hits = await store.similaritySearch("reset my password", 3);
```

This end‑to‑end snippet mirrors the docs and shows how embeddings plug directly into a store. ([Langchain][5])

---

#### 5 | Choosing an Embedding Provider

| Scenario                          | Provider Class                                                | Notes                                         |
| --------------------------------- | ------------------------------------------------------------- | --------------------------------------------- |
| **Cloud, best‑in‑class accuracy** | `OpenAIEmbeddings`, `CohereEmbeddings`, `MistralAIEmbeddings` | Highest recall, pay‑per‑token                 |
| **Self‑host / browser**           | `TransformerEmbeddings` (Hugging Face)                        | Runs locally with transformers.js, no API key |
| **Enterprise GCP**                | `VertexAIEmbeddings` / *Multimodal* variant                   | Supports text, image, and hybrid queries      |

LangChain lists >10 ready‑to‑use integrations; swap providers by changing a single constructor line. ([Langchain][5], [Langchain][6], [Langchain][7])

---

#### 6 | Design Levers & Gotchas

| Lever                      | Practical Guidance                                                                                               |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Model dimension**        | Larger vectors (1 k+) often retrieve better but cost more storage and latency.                                   |
| **Batch size**             | Tune to stay under provider token limits and avoid rate‑limit errors.                                            |
| **Caching**                | Wrap any embedder with `CacheBackedEmbeddings` to avoid recomputing identical texts. ([api.js.langchain.com][8]) |
| **Domain relevance**       | Pick models trained on code, legal, or medical text when domain specificity matters.                             |
| **Pre‑norm vs. post‑norm** | Most APIs output unit‑norm vectors; if not, normalise before indexing.                                           |

---

#### 7 | Classroom Implementation Plan

| Stage                  | Activity                                                                                  | Outcome                                |
| ---------------------- | ----------------------------------------------------------------------------------------- | -------------------------------------- |
| **Concept (10 min)**   | Show 2‑D PCA plot of sentence embeddings vs. keyword TF‑IDF                               | Intuitive grasp of “semantic distance” |
| **Lab 1 (20 min)**     | Use `OpenAIEmbeddings.embedQuery` on three related sentences; compute cosine similarities | Hands‑on numbers                       |
| **Lab 2 (25 min)**     | Batch‑embed 100 docs, create `MemoryVectorStore`, run similarity search                   | End‑to‑end RAG prep                    |
| **Lab 3 (20 min)**     | Swap to `TransformerEmbeddings`; compare latency & recall                                 | Provider comparison                    |
| **Challenge (15 min)** | Implement `CacheBackedEmbeddings` with a simple file‑based store                          | Performance optimisation               |
| **Debrief (10 min)**   | Inspect LangSmith trace; highlight where embeddings are generated & reused                | Observability mindset                  |

---

#### 8 | Key Takeaways for Students

1. **Embeddings = semantic fingerprints**—everything else in RAG builds on them.
2. **Two methods, two use‑cases**: `embedDocuments` for indexing, `embedQuery` for lookup.
3. **Provider swap is trivial** in LangChain; choose based on cost, privacy, and domain.
4. **Cache aggressively**—identical text should never hit the network twice.
5. **Tune batch size, normalisation, and model dimension** before blaming retrieval quality.

[1]: https://js.langchain.com/docs/concepts/embedding_models/?utm_source=chatgpt.com "Embedding models - LangChain.js"
[2]: https://js.langchain.com/v0.1/docs/modules/data_connection/text_embedding/?utm_source=chatgpt.com "Text embedding models - LangChain.js"
[3]: https://v03.api.js.langchain.com/interfaces/_langchain_core.embeddings.EmbeddingsInterface.html?utm_source=chatgpt.com "Interface EmbeddingsInterface - LangChain.js"
[4]: https://api.js.langchain.com/classes/langchain_openai.OpenAIEmbeddings.html?utm_source=chatgpt.com "Class OpenAIEmbeddings - LangChain.js"
[5]: https://js.langchain.com/docs/integrations/text_embedding/?utm_source=chatgpt.com "Embeddings - LangChain.js"
[6]: https://js.langchain.com/docs/integrations/text_embedding/transformers/?utm_source=chatgpt.com "HuggingFace Transformers - LangChain.js"
[7]: https://js.langchain.com/v0.1/docs/modules/data_connection/experimental/multimodal_embeddings/google_vertex_ai/?utm_source=chatgpt.com "Google Vertex AI - LangChain.js"
[8]: https://api.js.langchain.com/classes/langchain.embeddings_cache_backed.CacheBackedEmbeddings.html?utm_source=chatgpt.com "CacheBackedEmbeddings - LangChain.js"
