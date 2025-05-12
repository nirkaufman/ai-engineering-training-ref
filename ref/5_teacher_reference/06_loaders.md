### Teaching Guide — LangChain JS **Document Loaders**

---

#### 1. Why Document Loaders Matter

* **They bring the outside world into LangChain.** A loader converts raw data—from PDFs, web pages, APIs, cloud buckets, Slack channels, you name it—into a standard `Document` object (`pageContent + metadata`). ([Langchain][1])
* **One interface, hundreds of integrations.** Every loader obeys the same `load()` / `lazyLoad()` contract, so downstream pipelines (splitters → embeddings → vector stores) never change when you swap data sources. ([Langchain][2])
* **Foundation layer for RAG.** Clean, well‑tagged documents are the prerequisite for high‑quality retrieval‐augmented generation. ([Langchain][3])

**Learning goal ►** Students should be able to pick, configure, or write a loader, then feed its output directly into text‑splitters and the rest of the LangChain stack.

---

#### 2. The `Document` Cheat‑Sheet

| Field         | Description                                          | Example                                 |
| ------------- | ---------------------------------------------------- | --------------------------------------- |
| `pageContent` | Raw text payload                                     | `"LangChain simplifies LLM apps…"`      |
| `metadata`    | JSON object—file path, URL, author, timestamps, etc. | `{ source: "docs/intro.md", line: 42 }` |

---

#### 3. Loader Interface & Lifecycle

| Step                      | Method                                   | Notes                                                                                               |
| ------------------------- | ---------------------------------------- | --------------------------------------------------------------------------------------------------- |
| **Eager ingest**          | `load()` → `Promise<Document[]>`         | Reads everything into memory. ([v02.api.js.langchain.com][4])                                       |
| **Lazy ingest**           | `lazyLoad()` → `AsyncIterable<Document>` | Stream documents one‑by‑one; great for large corpora. ([Langchain][5])                              |
| **Load & split (legacy)** | `loadAndSplit(textSplitter?)`            | Convenience wrapper—now **deprecated**; call `splitter.splitDocuments()` yourself. ([LangChain][6]) |

*Teacher tip:* Emphasise memory‑saving patterns with `lazyLoad()` during large‑file demos.

---

#### 4. Loader Taxonomy

| Category                                                                       | Typical Classes                                                                 | Use‑cases                       |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- | ------------------------------- |
| **File**                                                                       | `TextLoader`, `CSVLoader`, `PDFLoader`, `DirectoryLoader`, `ImageCaptionLoader` | Local docs, logs, datasets      |
| **Web**                                                                        | `CheerioWebBaseLoader`, `PuppeteerWebLoader`, `SitemapLoader`                   | Crawl sites, scrape HTML        |
| **Cloud / API**                                                                | `S3Loader`, `NotionLoader`, `SlackLoader`, `GoogleDriveLoader`                  | Pull org data, SaaS exports     |
| **Streaming / DB**                                                             | `CouchbaseLoader`, `FaunaLoader`, etc.                                          | Real‑time or structured records |
| These all inherit (directly or indirectly) from `BaseLoader`. ([Langchain][3]) |                                                                                 |                                 |

---

#### 5. Minimal Example (File → Chunks)

```ts
import { TextLoader }          from "@langchain/community/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

// 1 | Load
const loader = new TextLoader("docs/intro.md");
const docs   = await loader.load();                // Document[]

// 2 | Split
const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 500, chunkOverlap: 50 });
const chunks   = await splitter.splitDocuments(docs);  // Ready for embeddings
```

*Mirrors the official quick‑start.* ([Langchain][7])

---

#### 6. Directory‑wide Example

```ts
import { DirectoryLoader } from "@langchain/community/document_loaders/fs/directory";
import { PDFLoader }       from "@langchain/community/document_loaders/fs/pdf";

const dir = new DirectoryLoader(
  "./knowledge_base",
  { ".pdf": path => new PDFLoader(path) }          // per‑extension mapping
);

for await (const doc of dir.lazyLoad()) {          // stream through entire folder
  console.log(doc.metadata.source, doc.pageContent.slice(0, 120));
}
```

---

#### 7. Writing a Custom Loader (API → Docs)

```ts
import { BaseDocumentLoader } from "@langchain/core/document_loaders";
import { Document }           from "@langchain/core/documents";

class GitHubIssuesLoader extends BaseDocumentLoader {
  constructor(private repo: string) { super(); }

  async load() {
    const res  = await fetch(`https://api.github.com/repos/${this.repo}/issues`);
    const json = await res.json();
    return json.map((issue: any) =>
      new Document({
        pageContent: `${issue.title}\n\n${issue.body}`,
        metadata: { url: issue.html_url, id: issue.number }
      })
    );
  }
}
```

Key points to highlight in class: implement **`load()`** only; inherit `loadAndSplit` for free; include rich metadata for later citations.

---

#### 8. Design Levers & Gotchas

| Lever                    | Practical Guidance                                                         |
| ------------------------ | -------------------------------------------------------------------------- |
| **Chunk size & overlap** | Adjust *after* seeing loader output—source format matters.                 |
| **Metadata hygiene**     | Capture canonical URL / file path early; vital for citations and deduping. |
| **Binary formats**       | Use dedicated loaders (PDF, DOCX, audio), not generic text.                |
| **Rate limits**          | Web/API loaders often need back‑off or concurrency caps.                   |
| **`lazyLoad()`**         | Combine with a streaming text‑splitter to keep RAM usage flat.             |

---

#### 9. Classroom Implementation Plan

| Stage                  | Activity                                                           | Outcome                        |
| ---------------------- | ------------------------------------------------------------------ | ------------------------------ |
| **Kick‑off (10 min)**  | Diagram loader → splitter → vector store pipeline                  | Shared mental model            |
| **Lab 1 (20 min)**     | TextLoader → splitter; inspect `Document` JSON in console          | Understand structure           |
| **Lab 2 (20 min)**     | Switch to `DirectoryLoader` with mixed PDF/MD files                | Experience polymorphic loaders |
| **Lab 3 (25 min)**     | Implement `GitHubIssuesLoader`; stream with `lazyLoad()`           | Write a custom loader          |
| **Challenge (15 min)** | Add a `source_url` metadata field and show later in search results | Metadata best‑practice         |
| **Debrief (10 min)**   | Trace loader runs in LangSmith; discuss memory vs. speed           | Observability mindset          |

---

### Key Takeaways for Students

1. **Loaders standardise raw data into `Document` objects—master them first.**
2. **`load()` for small jobs, `lazyLoad()` for big ones; avoid `loadAndSplit()` in new code.**
3. **Rich metadata now = traceable, cite‑able answers later.**
4. **File, web, cloud, or custom—the downstream chain never changes.**
5. **Good loader hygiene underpins reliable RAG pipelines and search quality.**

[1]: https://js.langchain.com/docs/concepts/document_loaders/ "Document loaders | ️ Langchain"
[2]: https://js.langchain.com/docs/concepts/document_loaders/?utm_source=chatgpt.com "Document loaders - LangChain.js"
[3]: https://js.langchain.com/docs/integrations/document_loaders/?utm_source=chatgpt.com "Document loaders - LangChain.js"
[4]: https://v02.api.js.langchain.com/interfaces/langchain.document_loaders_base.DocumentLoader.html?utm_source=chatgpt.com "DocumentLoader | LangChain.js"
[5]: https://js.langchain.com/docs/integrations/document_loaders/web_loaders/couchbase/?utm_source=chatgpt.com "Couchbase | 🦜️ Langchain"
[6]: https://api.js.langchain.com/classes/langchain_document_loaders_base.BaseDocumentLoader.html?utm_source=chatgpt.com "BaseDocumentLoader - LangChain.js"
[7]: https://js.langchain.com/v0.1/docs/modules/data_connection/document_loaders/?utm_source=chatgpt.com "Document loaders - LangChain.js"
