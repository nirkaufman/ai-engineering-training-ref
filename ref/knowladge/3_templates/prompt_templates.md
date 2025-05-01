**LangChain Templates — teaching-ready guide (TypeScript, real LLM, clean template literal)**

---

### 1 | What is a template?
A **LangChain template** is a *blueprint* for prompts.  
It’s a string (or chat-message array) with placeholders such as `{topic}` or `{tone}` that LangChain fills at runtime before sending the text to the model. The same abstraction powers both `PromptTemplate` and `ChatPromptTemplate`.

---

### 2 | Why templates matter

| Design goal | How the template API delivers |
|-------------|------------------------------|
| **Re-use & versioning** | One canonical prompt; supply fresh values per call. |
| **Type-safety** | `.inputVariables` lets TypeScript flag missing keys at compile time.  |
| **Composability** | Templates are Runnables, so they pipe directly into chains (`template | llm`). |
| **Few-shot / mixed format** | Helpers support examples, multi-role chat, and Handlebars syntax.  |

---

### 3 | Mental model
A template is a **mail-merge document** for AI: write once (“Dear {name}…”) and merge with live data on each call.

---

### 4 | Anatomy of a template

```text
(1) System directive:   "You are an expert {domain} tutor."
(2) Task instruction:   "Explain {concept} in max {words} words."
(3) Output constraint:  "Respond in {language} only."
```

Variables → `{domain}`, `{concept}`, `{words}`, `{language}` — all must be supplied or an error is thrown.

---

### 5 | End-to-end example — **Next.js server action** with `gpt-4o`

> *Goal:* expose a server action that receives (`concept`, `words`), injects them into a chat template that **includes a system prompt**, invokes OpenAI `gpt-4o`, and returns the parsed answer to the client.

#### `app/actions.ts`

```ts
"use server";

import { ChatOpenAI }            from "@langchain/openai";
import { ChatPromptTemplate }    from "@langchain/core/prompts";
import { StringOutputParser }    from "@langchain/core/output_parsers";

// 1. Instantiate the model.
const model = new ChatOpenAI({
  modelName: "gpt-4o",
  temperature: 0.4,
  openAIApiKey: process.env.OPENAI_API_KEY,   // keep key on the server
});

// 2. Build the chat template with a clean multi-line template literal.
const systemMsg = `
You are a concise senior-dev tutor.
Always answer in exactly {words} words.
`.trim();

const explainPrompt = ChatPromptTemplate.fromMessages([
  ["system", systemMsg],
  ["human",  "Explain {concept}."]
]);

// 3. Wrap everything in a server action callable from the client.
export async function explainConcept(
  concept: string,
  words: number
): Promise<string> {
  const chain = explainPrompt          // Runnable<vars, ChatMessages>
              .pipe(model)             // Runnable<vars, ChatResponse>
              .pipe(new StringOutputParser()); // Runnable<vars, string>

  const result = await chain.invoke({ concept, words });
  return result;                       // plain text to the client
}
```

#### `app/demo-client.tsx`

```tsx
"use client";
import { useState } from "react";
import { explainConcept } from "./actions";

export default function Demo() {
  const [reply, setReply] = useState("");

  async function handleClick() {
    const txt = await explainConcept("vector databases", 30);
    setReply(txt);
  }

  return (
    <div>
      <button onClick={handleClick}>Explain in 30 words</button>
      <pre>{reply}</pre>
    </div>
  );
}
```

**Why this is cleaner**

* The **system prompt** is written once, with natural line breaks; `trim()` strips the leading newline.
* No `+` concatenation; readability improves and accidental spaces are avoided.
* The rest of the logic (model, chain, server action) is unchanged—showing that prompt wording is decoupled from pipeline code.

---

### 6 | Advanced patterns (quick recap)

| Pattern | One-liner example | Use-case |
|---------|------------------|----------|
| **Partial application** | `tmpl.partial({ words: 50 })` | Fix common vars once. |
| **Few-shot** | `FewShotPromptTemplate(...)` | Show model canonical examples. |
| **Multi-role chat** | `ChatPromptTemplate.fromMessages([...])` | Complex setups with system / assistant / user roles. |

---

### 7 | Classroom exercises

1. **Bug hunt** – Misspell a variable in the template and watch TS complain.
2. **Few-shot remix** – Convert the template to include two Q&A examples and compare output quality.
3. **A/B testing** – Create “formal” vs “casual” system prompts and swap them in `explainPrompt.bind({ … })`.

---

### 8 | Key takeaway
LangChain templates decouple prompt wording from data. Using a *clean* template literal keeps the text readable, while a **Next.js server action** provides a safe, type-checked bridge between your UI and production-grade LLM pipelines.
