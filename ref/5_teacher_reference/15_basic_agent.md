### Teaching Guide — LangGraph JS **Quick‑Start Agent**

---

#### 1 | What You’ll Build

A minimal **ReAct agent** (Reason + Act loop) that calls Tavily web‑search when the LLM decides a tool is needed, and keeps state across turns via checkpointing. ([LangChain AI][1])

---

#### 2 | Prerequisites & One‑Time Setup

| Requirement        | Why                                                                                                     |
| ------------------ | ------------------------------------------------------------------------------------------------------- |
| **Node ≥ 18**      |  ESM and fetch built‑in                                                                                 |
| **OpenAI API key** |  LLM backbone                                                                                           |
| **Tavily API key** | Web search tool                                                                                         |
| **Packages**       | `npm i @langchain/core @langchain/langgraph @langchain/openai @langchain/community` ([LangChain AI][1]) |

*Optional* — set `LANGCHAIN_API_KEY` et al. to stream traces to **LangSmith** for observability. ([LangChain AI][1])

---

#### 3 | Fastest Path: `createReactAgent` (20 lines)

```ts
// agent.ts
process.env.OPENAI_API_KEY = "sk‑…";
process.env.TAVILY_API_KEY = "tvly‑…";

import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { ChatOpenAI } from "@langchain/openai";
import { MemorySaver } from "@langchain/langgraph";
import { HumanMessage } from "@langchain/core/messages";
import { createReactAgent } from "@langchain/langgraph/prebuilt";

const agent = createReactAgent({
  llm:   new ChatOpenAI({ temperature: 0 }),
  tools: [new TavilySearchResults({ maxResults: 3 })],
  checkpointSaver: new MemorySaver(),          // persists state
});

await agent.invoke(
  { messages: [new HumanMessage("what is the weather in sf")] },
  { configurable: { thread_id: "42" } }        // per‑chat memory
);
```

Run with `npx tsx agent.ts`; ask follow‑ups (“*what about ny?*”) and LangGraph re‑uses the same thread. ([LangChain AI][1])

**What just happened?**

```
START ➜ agent (calls model) ─┐
                             ├─► tool_node (Tavily) ➜ agent … (loop)
                             └─► END
```

Graph can be rendered as Mermaid for docs/debug. ([LangChain AI][1])

---

#### 4 | Under‑the‑Hood Build (Full Control)

```ts
import { StateGraph, MessagesAnnotation } from "@langchain/langgraph";
import { ToolNode }                       from "@langchain/langgraph/prebuilt";
import { TavilySearchResults }            from "@langchain/community/tools/tavily_search";
import { ChatOpenAI, HumanMessage, AIMessage } from "@langchain/*";

const tools   = [new TavilySearchResults({ maxResults: 3 })];
const toolN   = new ToolNode(tools);
const model   = new ChatOpenAI({ model: "gpt-4o-mini", temperature: 0 }).bindTools(tools);

function callModel({ messages }: typeof MessagesAnnotation.State) {
  return model.invoke(messages).then(res => ({ messages: [res] }));
}

function shouldContinue({ messages }: typeof MessagesAnnotation.State) {
  return (messages.at(-1) as AIMessage).tool_calls?.length ? "tools" : "__end__";
}

const app = new StateGraph(MessagesAnnotation)
  .addNode("agent", callModel)
  .addNode("tools", toolN)
  .addEdge("__start__", "agent")
  .addEdge("tools", "agent")
  .addConditionalEdges("agent", shouldContinue)
  .compile();
```

Here you explicitly wire nodes and branching logic—ideal when you need extra guards, retries, or metrics. ([LangChain AI][1])

---

#### 5 | Design Levers & Best Practices

| Lever              | Guidance                                                      |
| ------------------ | ------------------------------------------------------------- |
| **Checkpointing**  | Use `MemorySaver` for demos; swap in Redis/S3 saver for prod. |
| **Thread IDs**     | A stable `thread_id` per chat keeps memory separated.         |
| **Tool limits**    | Restrict tool APIs (rate, domains) inside `ToolNode` configs. |
| **Temperature**    | Keep at 0 for deterministic tool routing.                     |
| **Graph refactor** | Break large workflows into sub‑graphs for reuse.              |

---

#### 6 | Classroom Implementation Plan

| Stage                  | Activity                                                   | Outcome              |
| ---------------------- | ---------------------------------------------------------- | -------------------- |
| **Concept (10 min)**   | Diagram the ReAct loop vs. one‑shot chain                  | Mental model         |
| **Lab 1 (20 min)**     | Run `createReactAgent`; test multi‑turn chat               | Quick win            |
| **Lab 2 (25 min)**     | Convert to manual `StateGraph`; add a second tool (calc)   | Deepen control       |
| **Lab 3 (20 min)**     | Render graph to PNG; annotate nodes/edges                  | Visualization skills |
| **Challenge (15 min)** | Persist checkpoints to file system; restore after restart  | Production thinking  |
| **Debrief (10 min)**   | Inspect LangSmith trace—identify tool calls & state deltas | Observability        |

---

#### 7 | Key Takeaways

1. **`createReactAgent` gets you from zero to agent in seconds** but hides execution flow.
2. **StateGraph + Annotations expose every edge**—perfect for audits, custom branching, or extra tooling.
3. **Checkpoint + `thread_id` = chat memory** without server sessions.
4. **Tools are just nodes**; add, swap, or throttle them freely.
5. **LangGraph Graphs are Runnables**—pipe them into larger LCEL pipelines or LangSmith for full‑stack visibility. ([LangChain AI][1])

[1]: https://langchain-ai.github.io/langgraphjs/tutorials/quickstart/ "Learn the basics"
