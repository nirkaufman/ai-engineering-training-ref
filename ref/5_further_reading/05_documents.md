### Teaching Guide — LangChain JS **Document** Abstraction

---

#### 1 | Why **Document** Matters

* **Single canonical container.** Every text chunk that flows through loaders, splitters, retrievers, and vector stores is wrapped in a `Document`—so the entire pipeline speaks one data language. ([Langchain][1])
* **Rich metadata → traceable answers.** `Document.metadata` carries source URLs, timestamps, authors, chunk indices, and more—vital for citations, deduplication, and analytics. ([Langchain][2], [Langchain][3])
* **Model‑agnostic & language‑agnostic.** The `Document` class exists in both JS and Python cores, letting you port data or split compute across runtimes without re‑formatting. ([LangChain API][4])

**Learning goal ►** Students should create, inspect, and propagate `Document` objects confidently, ensuring metadata integrity throughout the RAG workflow.

---

#### 2 | Anatomy of a **Document**

| Field         | Type                 | Purpose & Notes                                                                                                      |
| ------------- | -------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `pageContent` | `string`             | The raw text payload (often one chunk of a larger source). ([Langchain][5])                                          |
| `metadata`    | `Record<string,any>` | Arbitrary JSON—file path, URL, author, page #, vector‑store id, etc. ([v03.api.js.langchain.com][6], [Langchain][3]) |
| `id?`         | `string \| UUID`     | Optional but recommended unique identifier; not enforced by the library. ([LangChain][7], [GitHub][8])               |

*Rule of thumb* ► Store every fact needed for debugging or user‑visible citations in `metadata` up front; retro‑patching after indexing is painful.

---

#### 3 | Minimal Example — Create & Split

```ts
import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

// 1 | Create a source document
const baseDoc = new Document({
  pageContent: await fs.readFile("report.pdf", "utf8"),
  metadata:    { source: "report.pdf", author: "ACME Labs" }
});

// 2 | Chunk it for retrieval
const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 512, chunkOverlap: 50 });
const chunks   = await splitter.splitDocuments([baseDoc]);    // → Document[]
```

The resulting `chunks` retain the **same metadata** object plus automatic `loc` fields for start/end positions—ready for embeddings. ([Langchain][5], [Langchain][3])

---

#### 4 | Lifecycle & Helper APIs

| Need                    | Call                                             | Practical note                                                                  |
| ----------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------- |
| **Create**              | `new Document({ pageContent, metadata })`        | Type‑safe constructor. ([Langchain][5])                                         |
| **Eager load**          | Loader `.load()` → `Document[]`                  | Memory‑heavy; fine for small corpora. ([LangChain API][4])                      |
| **Streaming load**      | Loader `.lazyLoad()` → `AsyncIterable<Document>` | Pair with streaming splitter to stay RAM‑light. ([v03.api.js.langchain.com][6]) |
| **Add to vector store** | `vectorStore.addDocuments(docs)`                 | Store‑agnostic because all docs share the same shape. ([Langchain][1])          |
| **Cite sources**        | Pass retrieved `Document[]` back with the answer | Render `metadata.source` links in UI. ([Langchain][2])                          |

---

#### 5 | Design Levers & Gotchas

| Lever                 | Guidance                                                                       |
| --------------------- | ------------------------------------------------------------------------------ |
| **Chunk granularity** | Smaller chunks ⇒ precise answers but more tokens per query; find a balance.    |
| **Metadata hygiene**  | Always include a canonical `source` key (URL or file path) and a stable `id`.  |
| **Binary formats**    | Use dedicated loaders (PDF, DOCX, audio) rather than stripping bytes yourself. |
| **Versioning**        | When documents change, regenerate embeddings or track `metadata.version`.      |
| **Privacy**           | Scrub PII in `pageContent` *and* metadata before shipping to third‑party LLMs. |

---

#### 6 | Classroom Implementation Plan

| Stage                  | Activity                                                                          | Outcome               |
| ---------------------- | --------------------------------------------------------------------------------- | --------------------- |
| **Concept (10 min)**   | Whiteboard the Document schema                                                    | Shared mental model   |
| **Lab 1 (20 min)**     | Hand‑craft a `Document`, push to an in‑memory vector store, do a similarity query | End‑to‑end feel       |
| **Lab 2 (25 min)**     | Load a markdown folder with `DirectoryLoader`, inspect streamed docs              | Streaming awareness   |
| **Lab 3 (25 min)**     | Add author + page# metadata; surface in answer citations                          | Traceability skills   |
| **Challenge (15 min)** | Implement a custom API loader that returns `Document[]` with rich metadata        | Extensibility         |
| **Debrief (10 min)**   | Review LangSmith traces to see metadata travel through the chain                  | Observability mindset |

---

#### 7 | Key Takeaways for Students

1. **`Document` is the lingua franca** of the LangChain ecosystem—master it first.
2. **Metadata is not optional.** Good upstream tagging enables reliable retrieval, evaluation, and user trust.
3. **Streams scale.** Use `lazyLoad()` + streaming splitters to handle gigabyte corpora without drama.
4. **Consistent IDs unlock versioning, deduplication, and audit trails.**
5. Once you internalize the Document pattern, everything else in RAG (loaders, splitters, retrievers, models) snaps neatly into place.

[1]: https://js.langchain.com/docs/concepts/vectorstores/?utm_source=chatgpt.com "Vector stores - LangChain.js"
[2]: https://js.langchain.com/docs/how_to/qa_sources?utm_source=chatgpt.com "How to return sources - LangChain.js"
[3]: https://js.langchain.com/docs/tutorials/retrievers?utm_source=chatgpt.com "Build a semantic search engine - LangChain.js"
[4]: https://api.python.langchain.com/en/latest/documents/langchain_core.documents.base.Document.html?utm_source=chatgpt.com "langchain_core.documents.base. - Langchain Python API Reference"
[5]: https://js.langchain.com/v0.1/docs/modules/data_connection/document_loaders/creating_documents/?utm_source=chatgpt.com "Creating documents - LangChain.js"
[6]: https://v03.api.js.langchain.com/interfaces/_langchain_core.documents.DocumentInterface.html?utm_source=chatgpt.com "DocumentInterface | LangChain.js"
[7]: https://api.js.langchain.com/classes/langchain_core.documents.Document.html?utm_source=chatgpt.com "Class Document<Metadata> - LangChain.js"
[8]: https://github.com/langchain-ai/langchain/discussions/22352?utm_source=chatgpt.com "Is there a way of adding id field in the Class Document which uses ..."
