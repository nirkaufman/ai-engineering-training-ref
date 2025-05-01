**LangChain “Document” — Teaching-Ready Guide (JavaScript/TypeScript focus)**  
*(copy-paste straight into your course hand-outs or Google Doc; every code block is runnable as-is with LangChain v0.1+)*

---

### 1 | What is a Document?
A **Document** is LangChain’s canonical wrapper for *any* piece of content you intend to feed an LLM (text, HTML, PDF pages, SQL rows, audio transcripts, …).  
It carries two fields only:

| field | type | purpose |
|-------|------|---------|
| `pageContent` | `string` | the raw text you want the model to read |
| `metadata` | `Record<string, any>` | key–value context that never reaches the model directly but flows with the doc through every chain—source URL, page number, authorship, user ACL, embedding ID, … |

Think of it as a **plain envelope** around your text: the address on the front (`metadata`) guides processing; the letter inside (`pageContent`) is what the model actually reads.

---

### 2 | Why Documents matter — three teaching bullets
1. **Uniform IO** All loaders, text splitters, and vector stores speak the same `Document[]` dialect—so you can reshuffle them like Lego.
2. **Auditability & traceability** `metadata` survives every transformation; when a student asks *“where did that answer come from?”* you can point to `source: "contracts.pdf", page 7`.
3. **RAG glue** Retrieval-Augmented Generation is nothing more than *queries → similarity search → relevant `Document[]` → prompt*. Master the docs, master RAG.

---

### 3 | Mental model
> *A Document is a JSON “capsule” flying down a conveyor belt.*  
> Loaders place raw text in the capsule → splitters clone and crop capsules → embeddings tag capsules with vectors → stores shelve capsules → retrievers fetch them back → the LLM reads `pageContent`.

---

### 4 | Anatomy of a Document (quick code peek)

```ts
import { Document } from "@langchain/core/documents";

const contract = new Document({
  pageContent: "Section 4.2: The Contractor shall…",
  metadata: {
    source: "contracts/msa.pdf",
    page: 3,
    language: "en",
    uuid: crypto.randomUUID(),
  },
});
```

> **Tip for class discussion:** ask students which metadata keys they would add for GDPR, multi-lingual search, or user-specific ACLs.

---

### 5 | Document lifecycle cheat-sheet

1. **Load** `UnstructuredLoader`, `CheerioWebLoader`, custom DB fetch → returns `Document[]`
2. **Transform** `RecursiveCharacterTextSplitter`, `MarkdownHeaderSplitter`, custom pipeline → still `Document[]`
3. **Embed & Store** `OpenAIEmbeddings` + `HNSWLib` / `Pinecone` / `Weaviate` → vectors linked to the same metadata
4. **Retrieve** vector store’s retriever → `Document[]` for a given query
5. **Prompt** merge docs into system / context messages → `model.invoke()`

*(Five steps, one data structure ­— makes a great whiteboard flow for the classroom.)*

---

### 6 | Hands-on TypeScript mini-lab (server-action ready)

```ts
// 0. pnpm add @langchain/community @langchain/openai @langchain/core hnswlib-node
import { RecursiveCharacterTextSplitter } from "@langchain/community/text_splitter";
import { CheerioWebLoader } from "@langchain/community/document_loaders/web/cheerio";
import { OpenAIEmbeddings } from "@langchain/openai";
import { HNSWLib } from "@langchain/community/vectorstores/hnswlib";
import { OpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { runOnServer } from "next-server-actions"; // fictional helper

export const answerWithSources = runOnServer(async (question: string) => {
  // 1 | Load a web article
  const rawDocs = await new CheerioWebLoader(
    "https://langchain.readthedocs.io/en/latest/"
  ).load();

  // 2 | Split into 1k-char chunks
  const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 });
  const docs = await splitter.splitDocuments(rawDocs);

  // 3 | Embed & index
  const embeddings = new OpenAIEmbeddings({ modelName: "text-embedding-3-small" });
  const store = await HNSWLib.fromDocuments(docs, embeddings);

  // 4 | Retrieve relevant docs
  const k = 4;
  const related = await store.similaritySearch(question, k);

  // 5 | Chat prompt with inline citations
  const template = ChatPromptTemplate.fromMessages([
    ["system", "You are an expert technical tutor."],
    [
      "human",
      `Answer the question using only the sources.\n\nQuestion: {question}\n\nSources:\n{sources}`,
    ],
  ]);

  const chat = new OpenAI({ modelName: "gpt-4o-mini", temperature: 0.2 });
  const response = await chat.invoke(
    await template.format({
      question,
      sources: related
        .map(
          (d, i) =>
            `[${i + 1}] ${d.pageContent.slice(0, 80).trim()}… (${d.metadata.source})`
        )
        .join("\n"),
    })
  );

  return response;
});
```

**What students learn here**
* end-to-end RAG in <50 LOC
* the Document object appears **five** times and never changes shape
* how `metadata` becomes in-prompt citations

---

### 7 | Common pitfalls (teacher notes)

| Mistake | Why it hurts | Classroom fix |
|---------|--------------|---------------|
| Dropping metadata during `map()` | Traceability lost; duplicates can’t be collapsed | Emphasise `return new Document({ ...doc, pageContent: newText })` |
| Storing huge `pageContent` blobs (e.g., full PDF) | Embedding cost ↑, retrieval recall ↓ | Always split before embedding |
| Using mutable objects inside `metadata` | JSON.stringify fails in vector DBs | Keep metadata JSON-serialisable |

---

### 8 | Exercise for students
> *Design a product FAQ chatbot*

1. **Loader** Write a custom loader that converts rows from a CSV (`question,answer,url`) into `Document[]` where `pageContent = answer`.
2. **Metadata enrichment** Add the original question and URL as metadata.
3. **Splitter** Decide if you need to split; justify your answer.
4. **Vector store** Use a local HNSW index.
5. **Query function** Implement `askFaq(question: string): Promise<string>` returning an answer + citation list.

---

#### Answers (for instructor eyes)

1. Loader code:

```ts
import fs from "fs/promises";
import { Document } from "@langchain/core/documents";
export async function csvFaqLoader(path: string) {
  const csv = await fs.readFile(path, "utf8");
  return csv
    .trim()
    .split("\n")
    .slice(1)
    .map((line) => {
      const [q, a, url] = line.split(",");
      return new Document({
        pageContent: a,
        metadata: { question: q, source: url },
      });
    });
}
```

2. Metadata reasoning: keeps the “question” for later re-ranking; URL enables hyperlink-rich answers.
3. Splitting unnecessary if answers < 1 kToken; discuss trade-offs.  
   4–5. Same pattern as the mini-lab above.

---

### 9 | Wrap-up talking points (for your slide deck)

* Documents are the **currency** of LangChain pipelines.
* Keep them small, keep them rich in metadata.
* Teach students that every chain stage should be **pure**: `Document[] in → Document[] out`.
* Once they master this, they can swap loaders, stores, or LLMs without rewriting business logic.

---

Now you have a turnkey resource: theory, live code, pitfalls, and an exercise set. Happy teaching!
