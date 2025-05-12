### Teaching Guide — LangChain JS **Text Splitters**

---

#### 1. Why Text Splitters Matter

* **Context‑window fit.** Models and embedding APIs impose hard token/char limits; splitting guarantees every chunk falls inside those bounds. ([Langchain][1])
* **Better recall & precision.** Smaller, focused chunks give higher‑quality embeddings and let retrievers hit exactly the passage the question needs. ([Langchain][1])
* **Uniform preprocessing.** Real‑world corpora mix tweets with white‑papers; splitting normalizes them for downstream pipelines and parallel processing. ([Langchain][1])

**Learning goal ►** Students should understand the main splitting strategies, choose the right splitter class, and tune chunk size/overlap for their task.

---

#### 2. Four Splitting Strategies

| Strategy               | When to choose                  | Typical Class                                                                  | One‑liner Example                                                         |
| ---------------------- | ------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| **Length‑based**       | Quick, size‑capped chunks       | `CharacterTextSplitter`, `TokenTextSplitter`                                   | `new CharacterTextSplitter({ chunkSize: 100 })` ([Langchain][1])          |
| **Text‑structure**     | Preserve paragraphs / sentences | `RecursiveCharacterTextSplitter`                                               | `new RecursiveCharacterTextSplitter({ chunkSize: 100 })` ([Langchain][1]) |
| **Document‑structure** | Leverage HTML/MD/JSON hierarchy | `MarkdownHeaderTextSplitter`, `HTMLSectionSplitter`, `JSFrameworkTextSplitter` | Splits on headings, tags, or component blocks ([Langchain][1])            |
| **Semantic**           | Content changes drive breaks    | Custom sliding‑window embedding splitter                                       | Detect cosine‑drop to cut sections ([Langchain][1])                       |

---

#### 3. Anatomy of `RecursiveCharacterTextSplitter`

| Parameter       | Default                   | Role                                                                        |
| --------------- | ------------------------- | --------------------------------------------------------------------------- |
| `separators`    | `["\n\n", "\n", " ", ""]` | Try each in order; fall through until chunk ≤ `chunkSize`. ([Langchain][2]) |
| `chunkSize`     | `1000`                    | Hard size cap per chunk.                                                    |
| `chunkOverlap`  | `200`                     | Tokens/chars re‑used at window edges—improves cross‑chunk context.          |
| `keepSeparator` | `"end"`                   | Attach split char to previous or next chunk.                                |

**Mental model:** it starts at the largest separator (paragraph), then backs down to sentence, word, character until the piece fits.

---

#### 4. Code Walk‑throughs

##### 4 A | Character Length Split

```ts
import { CharacterTextSplitter } from "@langchain/textsplitters";

const splitter = new CharacterTextSplitter({ chunkSize: 120, chunkOverlap: 0 });
const chunks = await splitter.splitText(longArticle);
```

Produces fixed‑width slices—fast, but may tear sentences. ([Langchain][1])

##### 4 B | Recursive Paragraph‑Safe Split

```ts
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 250,
  chunkOverlap: 50,
});
const chunks = await splitter.splitDocuments(docs);   // accepts Document[]
```

Keeps natural boundaries whenever possible. ([Langchain][1])

##### 4 C | Markdown Header Split

```ts
import { MarkdownHeaderTextSplitter } from "@langchain/textsplitters";

const mdSplitter = new MarkdownHeaderTextSplitter({
  headersToSplitOn: ["#", "##", "###"],
  chunkOverlap: 30,
});
const mdChunks = await mdSplitter.splitText(markdownString);
```

Ideal for docs sites where each header is a topical unit. ([Langchain][1])

---

#### 5. Design Levers & Gotchas

| Lever                      | Practical Guidance                                                                   |
| -------------------------- | ------------------------------------------------------------------------------------ |
| **`chunkSize`**            | Start with ½ × model‑context‑window; increase if answer spans >1 chunk.              |
| **`chunkOverlap`**         | 10‑20 % overlap keeps antecedents alive; too big wastes tokens.                      |
| **Separator list**         | For code, include `"\nfunction"`, `"\nclass"`; for HTML, `"<div>"`, `"<p>"`.         |
| **Metadata carry‑through** | Splitters replicate original `metadata` and add `loc` fields—use them for citations. |
| **Performance**            | Use `splitDocuments()` on an `AsyncIterable` from `lazyLoad()` to keep memory flat.  |

---

#### 6. Classroom Implementation Plan

| Stage                  | Activity                                                                  | Outcome                |
| ---------------------- | ------------------------------------------------------------------------- | ---------------------- |
| **Concept (10 min)**   | Draw a 3‑layer text pyramid (paragraph → sentence → word) & map splitters | Shared vocabulary      |
| **Lab 1 (20 min)**     | Character splitter on *War & Peace* extract; inspect chunk count & tears  | Feel naive slicing     |
| **Lab 2 (25 min)**     | Switch to `RecursiveCharacterTextSplitter`; compare sentence integrity    | See qualitative gain   |
| **Lab 3 (20 min)**     | Markdown splitter on docs folder; show header metadata in chunks          | Document‑aware insight |
| **Challenge (15 min)** | Build a mini semantic splitter: sliding window embeddings + cosine drop   | Stretch task           |
| **Debrief (10 min)**   | Trace splitter events in LangSmith; discuss token vs. char trade‑offs     | Observability mindset  |

---

#### 7. Key Takeaways for Students

1. **Splitting is not optional**—RAG quality hinges on well‑shaped chunks.
2. **Choose strategy by structure:** length → text hierarchy → document tags → semantics.
3. **Tune three knobs:** `chunkSize`, `chunkOverlap`, `separators`.
4. **RecursiveCharacterTextSplitter is the generalist default—master its anatomy first.**
5. **Keep metadata intact**; the path from chunk to citation must remain unbroken.

[1]: https://js.langchain.com/docs/concepts/text_splitters/ "Text splitters | ️ Langchain"
[2]: https://js.langchain.com/docs/how_to/recursive_text_splitter/?utm_source=chatgpt.com "How to recursively split text by characters - LangChain.js"
