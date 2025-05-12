### Teaching Guide — LangChain JS **Extracting Structured Information from Unstructured Text**

---

#### 1. Why This Topic Matters

* **LLMs talk, databases don’t.** Business systems need clean JSON, SQL rows, or event objects—not prose. Structured extraction is the bridge. ([Langchain][1])
* **Cheaper than humans, lighter than fine‑tuning.** You can retrofit structure onto any text corpus or live chat without labeling thousands of examples or training a custom model. ([Langchain][2])

---

#### 2. Three Extraction Approaches

| Approach                             | When to Prefer                                                          | Key API / Helper                                               | Notes                                                                                                                 |
| ------------------------------------ | ----------------------------------------------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Tool / Function Calling**          | Model natively supports JSON schema returns (OpenAI, Anthropic, Gemini) | `model.withStructuredOutput(schema)`                           | Easiest, most reliable; LLM enforces the schema. ([Langchain][3], [Langchain][4])                                     |
| **Structured Output Parser**         | Any chat/LLM without built‑in function mode                             | `StructuredOutputParser.fromZodSchema(schema)` + manual prompt | Works everywhere, but you must include “formatting instructions” in the prompt and parse afterwards. ([Langchain][5]) |
| **Post‑parse (Regex / JSON Parser)** | Fast hacks, legacy code, partial structure                              | `RegexParser`, `JsonOutputParser`                              | Least robust—use only for simple key‑value grabs. ([Langchain][6])                                                    |

---

#### 3. Anatomy of the **withStructuredOutput** Helper

```ts
import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";

const personSchema = z.object({
  name: z.string(),
  age:  z.number().int().min(0),
  email: z.string().email().optional()
});

const llm = new ChatOpenAI({ model: "gpt-4o", temperature: 0 });

// Bind schema ➜ returns a new model proxy
const extractor = llm.withStructuredOutput(personSchema);

const result = await extractor.invoke(
  "Contact: Alice Jones, 29 years old, alice@example.com"
);
/* result ⟶ { name: "Alice Jones", age: 29, email: "alice@example.com" } */
```

* **Zero parsing code**—the helper injects JSON‑format instructions and validates the response against the Zod schema. ([Langchain][3])

---

#### 4. Anatomy of a **StructuredOutputParser** Flow

```ts
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";

const schema = z.object({
  ticker: z.string(),
  price:  z.number(),
  currency: z.enum(["USD", "EUR", "GBP"])
});

const parser  = StructuredOutputParser.fromZodSchema(schema);
const format  = parser.getFormatInstructions();      // ← insert into prompt

const prompt = `
Extract the following JSON. ${format}

Text:
"Apple shares closed at $189.95"
`;

const model  = new ChatOpenAI({ model: "gpt-4o-mini" });
const raw    = await model.invoke(prompt);
const data   = await parser.parse(raw);              // validated JSON
```

* **Works with any model**; you control how strict the schema is. ([Langchain][5])

---

#### 5. Extraction Chain in One Line

```ts
import { createExtractionChainFromZod } from "langchain/chains";

const chain = createExtractionChainFromZod(llm, personSchema);
const { raw, structured } = await chain.call({ input: resumeText });
```

Wraps prompt, validation, and error handling in a reusable Runnable. ([Langchain][7])

---

#### 6. Design Levers & Best Practices

| Lever                  | Practical Guidance                                                                                                      |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Schema scope**       | Start minimal; over‑detailed schemas increase failure rate.                                                             |
| **Temperature**        | Keep at 0–0.3; creativity hurts deterministic JSON.                                                                     |
| **Chunking long text** | Run a splitter first or ask the model to process by sections; tool calling has 128 k‑token limits but you still pay.    |
| **Error handling**     | Wrap `.parse()` in try/catch and feed errors back into a “fix‑it” prompt if you need robustness.                        |
| **Streaming**          | Function‑calling endpoints stream partial JSON tokens; pipe straight to a UI for real‑time dashboards. ([Langchain][8]) |

---

#### 7. Classroom Implementation Plan

| Stage                  | Activity                                                              | Outcome                       |
| ---------------------- | --------------------------------------------------------------------- | ----------------------------- |
| **Kick‑off (10 min)**  | Whiteboard the three extraction approaches                            | Shared mental model           |
| **Lab 1 (20 min)**     | Use `withStructuredOutput` to pull contact info from support emails   | End‑to‑end “happy path”       |
| **Lab 2 (25 min)**     | Switch same schema to `StructuredOutputParser`; inspect failures      | See portability vs. fragility |
| **Lab 3 (20 min)**     | Embed chain in a Next.js route; stream structured JSON to client      | Full‑stack integration        |
| **Challenge (15 min)** | Extend schema to nested arrays (e.g., order items) and handle fix‑ups | Advanced validation           |
| **Debrief (10 min)**   | Review LangSmith trace—note schema, generation, and parse events      | Observability mindset         |

---

#### 8. Key Takeaways for Students

1. **Schema‑bound extraction > regex hacks**—use tool calling or structured parsers first.
2. **`withStructuredOutput` gives instant, schema‑validated JSON on supported models.**
3. **`StructuredOutputParser` works everywhere**—just remember to embed its formatting instructions.
4. **Low temperature, clear examples, and small schemas** are your reliability triad.
5. **Once data is structured, the rest of the pipeline (vector store, SQL insert, analytics) is trivial.**

[1]: https://js.langchain.com/docs/how_to/?utm_source=chatgpt.com "How-to guides - LangChain.js"
[2]: https://js.langchain.com/v0.1/docs/use_cases/extraction/?utm_source=chatgpt.com "Extraction - LangChain.js"
[3]: https://js.langchain.com/docs/concepts/structured_outputs/?utm_source=chatgpt.com "Structured outputs - LangChain.js"
[4]: https://js.langchain.com/docs/concepts/chat_models?utm_source=chatgpt.com "Chat models - LangChain.js"
[5]: https://js.langchain.com/docs/how_to/output_parser_structured?utm_source=chatgpt.com "How to use output parsers to parse an LLM response into structured ..."
[6]: https://js.langchain.com/docs/how_to/output_parser_json?utm_source=chatgpt.com "How to parse JSON output - LangChain.js"
[7]: https://js.langchain.com/docs/tutorials/extraction?utm_source=chatgpt.com "Build an Extraction Chain - LangChain.js"
[8]: https://js.langchain.com/docs/how_to/stream_tool_client/?utm_source=chatgpt.com "How to stream structured output to the client - LangChain.js"
