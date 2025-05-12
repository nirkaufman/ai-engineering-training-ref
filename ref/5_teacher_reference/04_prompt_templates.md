### Teaching Guide — LangChain JS **Prompt Templates**

---

#### 1. Why Prompt Templates Matter

* **Translate free‑form input into a predictable, reusable prompt.** Templates let you version, test, and share prompts just like code. ([Langchain][1])
* **Return a `PromptValue` bridge object.** That object becomes either a string (for an LLM) or an array of role‑tagged messages (for a chat model), so one template feeds every model type. ([Langchain][1])

**Learning goal ►** Students should be able to choose the right template class, bind variables safely, and pipe the result into any LangChain Runnable.

---

#### 2. Template Families & When to Use Them

| Template                  | Ideal For                                                 | Key Class / Builder                                     | Example Call                                                                     |
| ------------------------- | --------------------------------------------------------- | ------------------------------------------------------- | -------------------------------------------------------------------------------- |
| **String PromptTemplate** | Single text prompt to an LLM                              | `PromptTemplate.fromTemplate()`                         | `.invoke({ topic: "cats" })` → `"Tell me a joke about cats"` ([Langchain][1])    |
| **Chat PromptTemplate**   | Multi‑role conversations                                  | `ChatPromptTemplate.fromMessages()`                     | Formats a `system` + `human` pair with `{topic}`. ([api.js.langchain.com][2])    |
| **MessagesPlaceholder**   | Splicing a dynamic list of messages into a fixed scaffold | `new MessagesPlaceholder("msgs")` inside `fromMessages` | Lets callers inject chat history at a precise point. ([api.js.langchain.com][3]) |

---

#### 3. Anatomy of a **String PromptTemplate**

```text
"You are a naming consultant for new companies.  
What is a good name for a company that makes {product}?"
```

* **Variables** sit in `{}` (F‑string) or `{{}}` (Mustache).
* `PromptTemplate.fromTemplate()` **auto‑detects** the variable list so you never maintain it by hand. ([Langchain][1])

---

#### 3 ▸ Anatomy of a **Chat PromptTemplate**

```ts
import { ChatPromptTemplate } from "@langchain/core/prompts";

const chatPrompt = ChatPromptTemplate.fromMessages([
  ["system",  "You are a helpful, concise assistant."],
  ["human",   "Translate the following text to {language}: {text}"]
]);

// Produces a PromptValue that renders to:
[
  { role: "system", content: "You are a helpful, concise assistant." },
  { role: "user",   content: "Translate the following text to French: Good morning" }
]
```

*Key points*

1. The **array order** defines the conversation skeleton.
2. Each tuple becomes a concrete `SystemMessage` or `HumanMessage` at render time.
3. The result can be passed straight to any `ChatModel`. ([api.js.langchain.com][2])

---

#### 3 ▸ Using **MessagesPlaceholder**

```ts
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { HumanMessage, AIMessage } from "@langchain/core/messages";

const prompt = ChatPromptTemplate.fromMessages([
  ["system", "You are a helpful assistant."],
  new MessagesPlaceholder("history"),          // 👈 dynamic slot
  ["human",  "{input}"]
]);

await prompt.invoke({
  history: [
    new HumanMessage("Hi, who won the 2022 World Cup?"),
    new AIMessage("Argentina won the 2022 FIFA World Cup.")
  ],
  input: "And where was the final played?"
});
```

*What happened?*

* `history` can be **zero or many** messages; they drop exactly where the placeholder sits.
* Keeps chat scaffolding declarative while letting the runtime supply evolving context. ([Langchain][4], [Langchain][5])

---

#### 4. Core API Surface

| Need                     | Method                                               | Notes                                                                                |
| ------------------------ | ---------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Format once              | `.format(vars)` or `.invoke(vars)`                   | Returns the rendered prompt string or chat messages. ([Langchain][1])                |
| Partially bind vars      | `.partial({ foo: "bar" })`                           | Produces a new template with fewer required fields. ([Langchain][1])                 |
| Late‑binding functions   | `.partial({ date: () => new Date().toISOString() })` | Dynamic values stay fresh without plumbing them through every call. ([Langchain][1]) |
| Convert to `PromptValue` | `.formatPromptValue()` (Chat templates)              | Then call `.toString()` or `.toMessages()`. ([api.js.langchain.com][2])              |

---

#### 5. Best‑Practice Rules

1. **Separate concerns**: keep business logic out of templates—use them only for text shaping.
2. **Prefer Chat templates** for chat‑completion models; you get role control and multimodal futures.
3. **Use `MessagesPlaceholder`** instead of string concatenation to insert prior messages.
4. **Partial early**: bind constants (voice, date, userId) once and reuse everywhere.
5. **Validate inputs** with `template.inputVariables`; fail fast when a key is missing.

---

### Classroom Implementation Plan

| Stage                 | Activity                                                                | Outcome                     |
| --------------------- | ----------------------------------------------------------------------- | --------------------------- |
| **Kick‑off (10 min)** | Whiteboard F‑string vs. Mustache, `PromptValue` flow                    | Shared vocabulary           |
| **Lab 1 (20 min)**    | Build a String template; call `.format()` in Node REPL                  | Understand variable binding |
| **Lab 2 (30 min)**    | Convert to Chat template; render messages and feed an OpenAI chat model | Experience role impact      |
| **Lab 3 (25 min)**    | Insert `MessagesPlaceholder` and supply a mock chat history             | See dynamic insertion       |
| **Lab 4 (15 min)**    | Apply `.partial()` for constant date and persona                        | Appreciate partial binding  |
| **Debrief (10 min)**  | Trace template → LLM interaction in LangSmith                           | Observability mindset       |

---

### Key Takeaways for Students

1. **Prompt templates = reproducible, type‑safe prompts.**
2. **`PromptValue` bridges string & chat formats—write once, use anywhere.**
3. **Chat templates + placeholders unlock structured, maintainable conversations.**
4. **Partial binding keeps chain code clean and composable.**
5. **Master templates, messages, and runnables—the rest of LangChain clicks into place.**

[1]: https://js.langchain.com/docs/concepts/prompt_templates/?utm_source=chatgpt.com "Prompt Templates - LangChain.js"
[2]: https://api.js.langchain.com/classes/langchain_core_prompts.ChatPromptTemplate.html?utm_source=chatgpt.com "ChatPromptTemplate - LangChain.js"
[3]: https://api.js.langchain.com/classes/langchain_core_prompts.MessagesPlaceholder.html?utm_source=chatgpt.com "MessagesPlaceholder | LangChain.js"
[4]: https://js.langchain.com/v0.1/docs/use_cases/question_answering/chat_history/?utm_source=chatgpt.com "Add chat history - LangChain.js"
[5]: https://js.langchain.com/docs/concepts/t?utm_source=chatgpt.com "t - LangChain.js"
