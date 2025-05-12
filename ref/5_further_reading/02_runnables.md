### Teaching Guide — LangChain JS **Runnable** Interface

---

#### 1. Why Runnables Matter

* **Universal contract for every LangChain building‑block**—models, parsers, retrievers, even compiled LangGraph graphs expose the same `Runnable` methods, so pipeline code stays uniform. ([Langchain][1])
* **One mental model, five abilities**: *invoke*, *batch*, *stream*, *inspect*, *compose* via LCEL. ([Langchain][1])

**Learning goal ►** Students should be able to wire together diverse components with a single, predictable API.

---

#### 2. The Five Core APIs

| Capability            | Method                        | Typical Use                     | Tip                            |
| --------------------- | ----------------------------- | ------------------------------- | ------------------------------ |
| **Single call**       | `invoke(input)`               | Send one prompt, get one answer | Accepts `RunnableConfig`       |
| **Parallel calls**    | `batch(inputs, cfg?)`         | Fan‑out queries for speed       | Throttle with `maxConcurrency` |
| **Token‑stream**      | `stream(input)`               | Live UX for users               | Concatenate chunks if needed   |
| **Full event stream** | `streamEvents(input)`         | Debug or push live agent traces | Surface in LangSmith           |
| **Introspection**     | `.schema`, `.inputType`, etc. | Docs & tooling generation       | Great for validation           |

---

#### 3. Streaming APIs at a Glance

1. `stream` – emits final tokens/content.
2. `streamEvents` – granular events incl. tool calls.
3. `streamLog` – legacy, avoid for new code. ([Langchain][1])

---

#### 4. Input ↔ Output Typing

Every Runnable defines its own *internal* types—nothing is hard‑coded to strings. Examples:

| Component       | Input             | Output        |
| --------------- | ----------------- | ------------- |
| Prompt Template | `PromptValue`     | `PromptValue` |
| ChatModel       | string ∕ messages | `ChatMessage` |
| LLM             | string ∕ messages | string        |
| Retriever       | string            | `Document[]`  |
| Tool            | string ∕ object   | any           |

Teach students to inspect `.inputType` and `.outputType` for safety. ([Langchain][1])

---

#### 5. **RunnableConfig** — Runtime Control Center

| Field               | Scope     | Purpose                               |
| ------------------- | --------- | ------------------------------------- |
| `runName`           | local     | Human‑readable label (not inherited)  |
| `runId`             | local     | Custom UUID when you need correlation |
| `tags` / `metadata` | inherited | Trace filtering & analytics           |
| `callbacks`         | inherited | Observability hooks                   |
| `maxConcurrency`    | batch     | Parallelism guardrail                 |
| `recursionLimit`    | advanced  | Safety for self‑returning Runnables   |
| `configurable`      | dynamic   | Pass session IDs, etc.                |

Propagation is automatic for LCEL pipelines; manually forward `config` when wrapping with `RunnableLambda`. ([Langchain][1])

---

#### 6. Optimised Parallel Execution (`batch`)

* Processes an array of inputs **in order**; performance win over loops.
* Some providers override with native bulk APIs (gpt‑3.5‑turbo‑batch, etc.).
* Tune `maxConcurrency` to avoid rate‑limits. ([Langchain][1])

---

#### 7. Creating Custom Runnables

Use functions, not subclasses:

```ts
import { RunnableLambda } from "@langchain/core/runnables";

const redactPII = (text: string) => text.replace(/\d{9}/g, "***");
export const redact = RunnableLambda.from(redactPII);
```

* `RunnableLambda` for simple transforms.
* `RunnableGenerator` when your function itself needs to `yield` streamed chunks. ([Langchain][1])

---

### Classroom Implementation Plan

| Stage                  | Activity                                                                                      | Outcome                            |
| ---------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------- |
| **Concept (10 min)**   | Diagram the five Runnable abilities                                                           | Shared vocabulary                  |
| **Lab 1 (25 min)**     | Wrap OpenAI chat model → `.invoke()`; then wrap with `RunnableLambda` that upper‑cases output | Understand wrapping & piping       |
| **Lab 2 (20 min)**     | Convert the chain to `.batch()` with 50 prompts; measure time vs. loop                        | See parallel gains                 |
| **Lab 3 (30 min)**     | Add `streamEvents` and display live JSON in browser DevTools                                  | Real‑time tracing skills           |
| **Challenge (15 min)** | Students build a PII‑redaction generator and pipe before the model                            | Reinforce custom Runnable creation |
| **Debrief (10 min)**   | Discuss where `RunnableConfig` tags/metadata appeared in LangSmith                            | Observability mindset              |

---

### Key Takeaways for Students

1. **“Runnable first”**—treat every step as a composable brick.
2. **Streaming is default UX**; don’t wait for whole answers.
3. **Batching is your scaling knob**; combine with `maxConcurrency`.
4. **Config is inherited**—exploit tags & callbacks for tracing.
5. **Custom logic ?** Wrap it with `RunnableLambda`, stay in the ecosystem.

Keep this cheat‑sheet alongside the **Messages** guide: together they form the backbone of any LangChain project.

[1]: https://js.langchain.com/docs/concepts/runnables/ "Runnable interface | ️ Langchain"
