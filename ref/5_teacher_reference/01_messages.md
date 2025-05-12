### Teaching Guide — LangChain JS **Messages** Concept

---

#### 1. Why Messages Matter

* **Messages are the canonical I/O unit for chat models**: every prompt you send or receive is a structured “message” with a role, content, and optional metadata. ([Langchain][1])
* **LangChain normalizes message formats** so you can swap model back‑ends (OpenAI, Anthropic, local) without rewriting glue code. ([Langchain][1])

**Learning goal ►** Students should be able to explain the anatomy of a message and use LangChain’s message classes to build reliable chat pipelines.

---

#### 2. What’s Inside a Message?

| Field        | Purpose                          | Notes                                                                                 |
| ------------ | -------------------------------- | ------------------------------------------------------------------------------------- |
| **role**     | Tells the model who’s “speaking” | `system`, `user`, `assistant`, `tool`, `function (legacy)` ([Langchain][1])           |
| **content**  | The actual payload               | Usually text; can be multimodal array blocks (images, audio, video). ([Langchain][1]) |
| **metadata** | Provider‑specific extras         | IDs, names, token counts, tool‑call stubs, etc. ([Langchain][1])                      |

---

#### 3. Core Message Roles

| Role                  | Typical Use                                      | LangChain Class                            |
| --------------------- | ------------------------------------------------ | ------------------------------------------ |
| `system`              | Set global instructions, persona, or constraints | `SystemMessage`                            |
| `user`                | Human input                                      | `HumanMessage`                             |
| `assistant`           | Model output                                     | `AIMessage` / `AIMessageChunk` (streaming) |
| `tool`                | Return value from an external tool call          | `ToolMessage`                              |
| `function` *(legacy)* | Old OpenAI function‑call echo                    | `FunctionMessage` (avoid—use tool role)    |

*Teacher tip*: Have students map a real chat transcript to these roles to test comprehension.

---

#### 4. LangChain Message Classes at a Glance

* **`SystemMessage`** – automatically routed to the correct API field or merged if provider lacks explicit system support. ([Langchain][1])
* **`HumanMessage`** – created for you when you pass a plain string to `.invoke()`, handy for quick tests. ([Langchain][1])
* **`AIMessage`** – rich object with `content`, `tool_calls`, `usage_metadata`, etc. ([Langchain][1])
* **`AIMessageChunk`** – incremental slice used when streaming; can be concatenated for a final message. ([Langchain][1])
* **`ToolMessage`** – includes `tool_call_id` and optional `artifact` blob to feed results back to the model. ([Langchain][1])
* **`RemoveMessage`** – housekeeping symbol for pruning history in LangGraph workflows. ([Langchain][1])

---

#### 5. Conversation Structure Rules

1. **System** instruction (optional)
2. **User** message
3. **Assistant** reply (may request tool)
4. **Tool** result (if any)
5. Repeat…

Maintaining this order helps every provider parse context consistently. ([Langchain][1])

---

#### 6. Streaming Best Practice

Use `for await…model.stream()` to yield `AIMessageChunk` objects; concatenate when you need the final answer. ([Langchain][1])

---

#### 7. Interoperability with OpenAI Format

* **Input**: You can pass raw `{role, content}` objects instead of LangChain classes. ([Langchain][1])
* **Output**: LangChain still returns its own classes; convert if you must forward to an OpenAI‑style consumer. ([Langchain][1])

---

### Classroom Implementation Plan

| Stage                   | Activity                                                                         | Outcome                               |
| ----------------------- | -------------------------------------------------------------------------------- | ------------------------------------- |
| **Kick‑off (15 min)**   | Whiteboard breakdown of message anatomy; map Slack chat to roles                 | Students identify roles instinctively |
| **Lab 1 (30 min)**      | Code snippet: send `System`‑`Human` pair to an LLM; print structured `AIMessage` | Hands‑on creation of message objects  |
| **Lab 2 (30 min)**      | Add a dummy calculator tool; demonstrate `tool` call round‑trip                  | Understand `ToolMessage` plumbing     |
| **Lab 3 (20 min)**      | Switch `.invoke()` to `.stream()` and inspect `AIMessageChunk` flow              | Experience real‑time streaming        |
| **Discussion (10 min)** | When to trim history with `RemoveMessage`? When to merge chunks?                 | Best‑practice mindset                 |

**Extension idea**
Assign groups to integrate a second provider (e.g., Anthropic) and show zero‑code changes to message handling—reinforcing LangChain’s abstraction power.

---

### Key Takeaways for Students

1. **Message classes are your cross‑provider Rosetta Stone**—embrace them for portable code.
2. **Always label content with the correct role**; models respond differently to system vs. user text.
3. **Use streaming early**; it improves UX and teaches incremental reasoning patterns.
4. **Treat tool results as first‑class messages** to keep the conversation deterministic and debuggable.

Keep this cheat‑sheet handy while building agents or teaching prompt design—the message layer underpins everything else.

[1]: https://js.langchain.com/docs/concepts/messages/ "Messages | ️ Langchain"
