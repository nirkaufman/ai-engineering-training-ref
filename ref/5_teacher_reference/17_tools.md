### Teaching Guide — LangChain JS **Tools in Agent Workflows**

---

#### 1 | Why Tools Matter

* **Extend LLM reach.** A tool is a TypeScript function wrapped with a name, description, and input schema; the LLM can “call” it to fetch knowledge, run code, or take actions the model itself cannot. ([Langchain][1])
* **Deterministic side‑effects.** Because LangChain executes the tool and feeds the JSON result back to the model, you get verifiable, traceable steps instead of free‑text speculation. ([LangChain][2])
* **Composable skill set.** Agents choose among any number of tools (DB lookup, calculator, RAG retriever, web search) in whatever order makes sense for the task. ([Langchain][3])

---

#### 2 | Tool Abstraction at a Glance

| Field         | Role                                                  | Example                                          |
| ------------- | ----------------------------------------------------- | ------------------------------------------------ |
| `name`        | Must be *snake\_case*; shown to the LLM               | `"book_flight"`                                  |
| `description` | One‑line capability hint; critical for tool selection | `"Book an airline ticket"`                       |
| `schema`      | Zod object describing inputs                          | `z.object({ from: z.string(), to: z.string() })` |
| `call`        | The function that runs when the LLM picks the tool    | async API call or local logic                    |

All packaged in `tool(asyncFn, { name, description, schema })`. ([Langchain][1])

---

#### 3 | Anatomy of a Minimal Tool

```ts
import { tool } from "@langchain/core/tools";
import { z }    from "zod";

export const calc = tool(
  async ({ expression }: { expression: string }) => {
    return eval(expression);          // demo only!
  },
  {
    name: "calculator",
    description: "Evaluate simple math expressions",
    schema: z.object({
      expression: z.string().describe("Math expression to solve, e.g. '2+2'")
    })
  }
);
```

This definition is all you pass to an agent constructor; LangChain handles JSON formatting and result plumbing. ([Langchain][1])

---

#### 4 | How an Agent Uses Tools (Tool‑Calling Loop)

1. **Prompt assembly:** Agent node embeds each tool’s `name` + `description` + `schema` into the system prompt.
2. **LLM chooses:** Model returns `{"tool_call_id":"…","name":"calculator","args":{"expression":"2+2"}}`.
3. **LangChain execs:** Tool function runs, producing `"4"`.
4. **Result sent back:** Added as a `ToolMessage`; agent asks LLM what to do next.
5. **Finish:** Model eventually replies with `AgentFinish` containing the final answer. ([LangChain][2])

---

#### 5 | Core APIs & Helpers

| Need                     | Helper                                                       | Notes                                          |
| ------------------------ | ------------------------------------------------------------ | ---------------------------------------------- |
| Quick agent with tools   | `createReactAgent({ llm, tools })`                           | Auto‑builds graph & ReAct prompt ([Medium][4]) |
| Turn retriever into tool | `createRetrieverTool(retriever, opts)`                       | Ideal for RAG + agents                         |
| Chat‑model binding only  | `llm.bindTools(tools)`                                       | Use inside custom graphs                       |
| Force‑call always        | Pass `tool_choice: { type: "force", name }` in model options | Guarantees required actions                    |

---

#### 6 | End‑to‑End Example (20 lines)

```ts
import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { MemorySaver } from "@langchain/langgraph";
import { HumanMessage } from "@langchain/core/messages";

const agent = await createReactAgent({
  llm:   new ChatOpenAI({ model: "gpt-4o", temperature: 0 }),
  tools: [new TavilySearchResults({ maxResults: 3 })],
  checkpointSaver: new MemorySaver(),
});

await agent.invoke(
  { messages: [new HumanMessage("summarize the latest on GPT‑4o")] },
  { configurable: { thread_id: "u‑123" } }
);
```

The single call handles tool selection, execution, and state persistence. ([Medium][4])

---

#### 7 | Design Levers & Gotchas

| Lever               | Guidance                                                                                          |
| ------------------- | ------------------------------------------------------------------------------------------------- |
| **Descriptions**    | Be concise & unique; overlap confuses the LLM.                                                    |
| **Input schemas**   | Use strict Zod validation; reject unsafe values early.                                            |
| **Rate limits**     | Wrap heavy tools with queue/throttle to avoid 429s.                                               |
| **Security**        | Never leak secrets in `description`; that text is visible to the model.                           |
| **Mandatory tools** | Use model option `tool_choice` or router guards.                                                  |
| **Retries**         | On schema mismatch, send the error back to the model with *“format mismatch, try again”* message. |

---

#### 8 | Classroom Implementation Plan

| Stage                  | Activity                                             | Outcome               |
| ---------------------- | ---------------------------------------------------- | --------------------- |
| **Concept (10 min)**   | Whiteboard tool‑calling loop                         | Shared mental model   |
| **Lab 1 (20 min)**     | Write `calculator` tool; test via `createReactAgent` | Quick win             |
| **Lab 2 (25 min)**     | Convert RAG retriever → tool; ask fact questions     | See real‑world use    |
| **Lab 3 (20 min)**     | Force a banned website filter tool to run first      | Control flow          |
| **Challenge (15 min)** | Add retry logic for bad args via Zod errors          | Robustness skills     |
| **Debrief (10 min)**   | Inspect LangSmith trace—identify tool messages       | Observability mindset |

---

#### 9 | Key Takeaways

1. **Tools = functions + JSON schema + description.**
2. **Agents pick tools; LangChain executes them and feeds results back.**
3. **`createReactAgent` lets you prototype tool‑aware agents instantly.**
4. **Strict schemas, clear descriptions, and validation retries keep calls safe and accurate.**
5. Master tools, and you unlock weather bots, DB assistants, multi‑step planners—anything your code can do, your agent can now request.

---

[1]: https://js.langchain.com/docs/concepts/tools/?utm_source=chatgpt.com "Tools | 🦜️ Langchain"
[2]: https://python.langchain.com/v0.1/docs/modules/agents/agent_types/tool_calling/?utm_source=chatgpt.com "Tool calling agent | 🦜️ LangChain"
[3]: https://js.langchain.com/v0.1/docs/modules/agents/?utm_source=chatgpt.com "Agents - LangChain.js"
[4]: https://medium.com/%40shravankoninti/agent-tools-basic-code-using-langchain-50e13eb07d92?utm_source=chatgpt.com "Agent & Tools — Basic Code using LangChain | by Shravan Kumar"
