### Teaching Guide — LangChain JS **Text Classification**

---

#### 1. Why Classification Matters

* **Routing & control‑flow.** Label a prompt (“question”, “task request”, “small‑talk”) and dispatch it to the right agent, index, or micro‑service. ([Langchain][1])
* **Metadata enrichment.** Add sentiment, intent, language, or compliance tags to every document for smarter retrieval and analytics. ([Langchain][2])
* **Zero‑setup ML.** LLM‑based classification needs no training data; a schema and a few examples are enough. ([LangChain][3])

---

#### 2. Two Main Approaches

| Approach                           | Best When                                                                                     | Key Helper                                  | Reliability                                                                      |
| ---------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------- | -------------------------------------------------------------------------------- |
| **Native tool / function calling** | Using models that support JSON or function calls (OpenAI, Anthropic, Gemini, Mistral, Vertex) | `model.withStructuredOutput(zodEnumSchema)` | ★★★★★ (schema enforced) ([Langchain][2])                                         |
| **Prompt + parser**                | Any chat model, or when you need legacy support                                               | `StructuredOutputParser.fromZodSchema()`    | ★★★☆☆ (prompt must include format instructions) ([Langchain][4], [Langchain][2]) |

---

#### 3. Quick‑Start — **withStructuredOutput** (Zero‑Shot Tagging)

```ts
import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";

const sentimentSchema = z.object({
  label: z.enum(["positive", "neutral", "negative"])
});

const classifier = new ChatOpenAI({ model: "gpt-4o", temperature: 0 })
                     .withStructuredOutput(sentimentSchema);

const result = await classifier.invoke(
  "I absolutely loved the product! It exceeded expectations."
);
// → { label: "positive" }
```

The helper injects the JSON instructions, parses, and validates—all in one line. ([Langchain][4])

---

#### 4. Universal Approach — **StructuredOutputParser**

```ts
import { ChatOpenAI } from "@langchain/openai";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";

const topicSchema = z.object({ topic: z.enum(["tech", "sports", "politics", "other"]) });
const parser      = StructuredOutputParser.fromZodSchema(topicSchema);

const prompt = `
Classify the text into one topic. ${parser.getFormatInstructions()}
Text: "The new GPU architecture outperforms last year’s models."
`;

const raw  = await new ChatOpenAI({ model: "gpt-4o-mini", temperature: 0 }).invoke(prompt);
const data = await parser.parse(raw);    // { topic: "tech" }
```

Works with *any* chat model; you own the prompt. ([Langchain][4])

---

#### 5. Building a **Classification Chain**

```ts
import { createExtractionChainFromZod } from "langchain/chains";

const chain = createExtractionChainFromZod(
  new ChatOpenAI({ model: "gpt-4o", temperature: 0 }),
  z.object({ intent: z.enum(["search", "faq", "chitchat"]) })
);

const { structured } = await chain.call({ input: "How do I reset my password?" });
// structured.intent → "search"
```

Wraps prompt, parsing, retries, and error surfacing—ready for LCEL piping. ([LangChain][3])

---

#### 6. Design Levers & Gotchas

| Lever                | Guidance                                                                                    |
| -------------------- | ------------------------------------------------------------------------------------------- |
| **Schema size**      | Fewer, disjoint labels = higher accuracy.                                                   |
| **Temperature**      | Keep ≤ 0.3 for deterministic JSON.                                                          |
| **“Unknown” bucket** | Add an “other” class to capture edge cases.                                                 |
| **Examples**         | One‑shot examples in the system prompt can boost label clarity.                             |
| **Error repair**     | Wrap `.parse()` in `try / catch`; retry with a “format error” message if needed.            |
| **Streaming**        | Tool‑calling endpoints stream JSON tokens—useful for real‑time dashboards. ([LangChain][5]) |

---

#### 7. Classroom Implementation Plan

| Stage                  | Activity                                                                   | Outcome               |
| ---------------------- | -------------------------------------------------------------------------- | --------------------- |
| **Concept (10 min)**   | Diagram classification vs. extraction                                      | Shared mental model   |
| **Lab 1 (20 min)**     | Sentiment tagging with `withStructuredOutput`                              | One‑line happy path   |
| **Lab 2 (25 min)**     | Swap to `StructuredOutputParser`; purposely break format and fix           | Robustness skills     |
| **Lab 3 (20 min)**     | Plug classifier into a Router chain that directs queries to FAQ vs. Search | See routing in action |
| **Challenge (15 min)** | Extend schema to multi‑label tagging (array enum)                          | Advanced schema       |
| **Debrief (10 min)**   | Review LangSmith traces; identify classification node                      | Observability         |

---

#### 8. Key Takeaways for Students

1. **Classification = schema‑bounded JSON, not prose.**
2. **Use `withStructuredOutput` whenever the model supports it; fall back to parser + prompt otherwise.**
3. **Keep labels clear, mutually exclusive, and include an “other”.**
4. **Low temperature and concise examples raise accuracy.**
5. **Classifiers power routing, analytics, and safer RAG—master them early.**

[1]: https://js.langchain.com/docs/how_to/routing?utm_source=chatgpt.com "How to route execution within a chain - LangChain.js"
[2]: https://js.langchain.com/docs/tutorials/classification?utm_source=chatgpt.com "Tagging | 🦜️ Langchain"
[3]: https://python.langchain.com/docs/tutorials/classification/?utm_source=chatgpt.com "Tagging | 🦜️ LangChain"
[4]: https://js.langchain.com/docs/concepts/structured_outputs/?utm_source=chatgpt.com "Structured outputs - LangChain.js"
[5]: https://python.langchain.com/docs/how_to/structured_output/?utm_source=chatgpt.com "How to return structured data from a model | 🦜️ LangChain"
