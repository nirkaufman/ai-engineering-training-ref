**LangChain “Document Loader” — Teaching-Ready Guide (TypeScript-first)**  
*(ready to paste into slides, LMS, or Google Doc; every snippet runs with LangChain v0.1 +)*
___  

### 1 | What is a Document Loader?
A **Document Loader** is any class that implements a `load(): Promise<Document[]>` (and often `lazyLoad(): AsyncGenerator<Document>`) method. Its sole job is to _ingest raw data_—HTML, PDF, CSV, Airtable rows, GitHub issues, you name it—and emit a **uniform `Document[]`** that the rest of LangChain understands.  ([Document loaders - LangChain.js](https://js.langchain.com/v0.1/docs/modules/data_connection/document_loaders/?utm_source=chatgpt.com))

&nbsp;&nbsp;➡ **Analogy:** Think of loaders as USB adapters: whatever odd-shaped plug (source) you have, the loader turns it into the same USB-C connector (`Document`).

---

### 2 | Why loaders matter (teacher talking points)
* **Plug-and-play ingest** Swap a `CheerioWebLoader` for an `RSSLoader` without touching downstream code.
* **Separation of concerns** Parsing logic lives in loaders; splitting, embedding, and prompting stay pure.
* **Reproducibility** Because loaders attach source-level `metadata`, students can always trace an answer back to the origin.  ([Cheerio - LangChain.js](https://js.langchain.com/docs/integrations/document_loaders/web_loaders/web_cheerio/?utm_source=chatgpt.com), [UnstructuredLoader - LangChain.js](https://js.langchain.com/docs/integrations/document_loaders/file_loaders/unstructured/?utm_source=chatgpt.com))

---

### 3 | Loader API at a glance

```ts
interface BaseLoader {
  load(): Promise<Document[]>           // eager
  lazyLoad?(): AsyncGenerator<Document> // streaming (optional)
}
```

> **In class:** ask students why streaming matters for 2 GB PDFs.

---

### 4 | The Loader Zoo (2025 snapshot)

| Category | Common pick | Typical use | Gotcha |
|----------|-------------|-------------|--------|
| **File** | `TextLoader`, `PDFLoader`, `CSVLoader` | Local corpora, logs | Large PDFs ⇒ use `UnstructuredLoader` for OCR |
| **Web**  | `CheerioWebLoader`, `PuppeteerLoader` | Blogs, JS-heavy sites | Cheerio ≈ fast but no JS; Puppeteer renders JS |
| **Cloud / SaaS** | `NotionLoader`, `SlackLoader`, `GoogleDriveLoader` | Team docs, chat history | Needs API tokens / rate-limits |
| **DB / API** | `SQLLoader`, `GraphQLLoader`, `AirtableLoader` | Structured tables | Decide what goes to `pageContent` vs `metadata` |

*(full catalog: LangChain docs → **Integrations » Document Loaders**)  ([Document loaders - LangChain.js](https://js.langchain.com/docs/concepts/document_loaders/?utm_source=chatgpt.com))*

---

### 5 | Loader composition mini-lab (server-action safe)

```ts
// 0. pnpm add @langchain/community @langchain/openai @langchain/core hnswlib-node
import { TextLoader }     from "@langchain/community/document_loaders/fs/text";
import { CheerioWebLoader }from "@langchain/community/document_loaders/web/cheerio";
import { CSVLoader }      from "@langchain/community/document_loaders/fs/csv";
import { RecursiveCharacterTextSplitter } from "@langchain/community/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import { HNSWLib } from "@langchain/community/vectorstores/hnswlib";

// 1 | Define loaders
const loaders = [
  new TextLoader("legal/privacy.txt"),
  new CheerioWebLoader("https://js.langchain.com/"),
  new CSVLoader("faq.csv", { column: "answer" }),
];

// 2 | Eager-load & merge
const rawDocs = (await Promise.all(loaders.map((l) => l.load()))).flat();

// 3 | Split, embed, store (RAG-ready)
const splitter   = new RecursiveCharacterTextSplitter({ chunkSize: 800 });
const docs       = await splitter.splitDocuments(rawDocs);
const embeddings = new OpenAIEmbeddings({ modelName: "text-embedding-3-small" });
await HNSWLib.fromDocuments(docs, embeddings);
```

**What students learn**
* Three heterogeneous sources funneled into **one** `Document[]` pipeline.
* Loader code is ≤ 10 % of the total—yet determines data quality.

---

### 6 | Common pitfalls & classroom fixes

| Pitfall | Symptom | Quick fix |
|---------|---------|-----------|
| _Forgetting `await`_ | `rawDocs` is `Promise[]` | `const docs = (await loader.load())` |
| Mixing `pageContent` & `metadata` | Embeddings contain boilerplate like “author: Bob” | Keep descriptors strictly in `metadata` |
| Over-eager Puppeteer | Slow / blocked by robots.txt | Use `CheerioWebLoader` first; fall back only when DOM scripts are essential |
| Huge binary files | OOM on load | Stream with `lazyLoad()` or pre-chunk via Unstructured API |

---

### 7 | Exercise for students
> **Goal:** write a _custom_ loader for a JSON REST API that returns an array `{ id, title, body, url }`.

1. Fetch the endpoint.
2. For each item create a `Document` where `pageContent = body`.
3. Store `title` + `url` in `metadata`.
4. Add `loader.lazyLoad()` that yields one doc at a time.
5. Demonstrate it inside a minimal RAG query.

---

#### Instructor reference solution (condensed)

```ts
import fetch from "node-fetch";
import { Document } from "@langchain/core/documents";

export class BlogApiLoader {
  constructor(private endpoint: string) {}
  async load() {
    const items = await fetch(this.endpoint).then((r) => r.json());
    return items.map(
      (p: any) =>
        new Document({
          pageContent: p.body,
          metadata: { title: p.title, source: p.url },
        })
    );
  }
  async *lazyLoad() {
    const items = await fetch(this.endpoint).then((r) => r.json());
    for (const p of items) {
      yield new Document({
        pageContent: p.body,
        metadata: { title: p.title, source: p.url },
      });
    }
  }
}
```

*(Discussion: why `lazyLoad` is HTTP-efficient for paginated APIs.)*

---

### 8 | Wrap-up bullets for your slide deck

* **Loader ⇢ Document** is the **first mile** of every LangChain pipeline—teach it early.
* Pick the simplest loader that fits: _Cheerio > Puppeteer_, _CSV > Unstructured_.
* Always test output with `doc.metadata` inspection before embedding—it saves tokens and headaches.

___  
Armed with this guide, you can walk a class from “what is a loader?” to building custom ingest adapters in under an hour. Happy teaching!
