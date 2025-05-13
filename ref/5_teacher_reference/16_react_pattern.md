### Teaching Guide — LangGraph JS **`createReactAgent`**

---

#### 1 | What *is* `createReactAgent`?

A one‑liner helper that **assembles, compiles, and checkpoints** a ReAct‑style tool‑calling agent as a LangGraph graph. Give it an LLM and a list of tools; it gives you back a fully‑streamable `Runnable` with START → LLM ↔ Tool → END wiring. ([LangChain AI][1], [LangChain AI][2])

---

#### 2 | Why Use It Instead of Hand‑Rolling?

| Pain Point                     | How `createReactAgent` Helps                                                                                                        |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| Boilerplate node / edge wiring | Generates the Agent node, Tool node, conditional loop, and END edge for you. ([LangChain AI][2])                                    |
| Safe ReAct prompt              | Ships with a production‑tested prompt that binds JSON tool calls. ([Stack Overflow][3])                                             |
| Checkpointing built‑in         | Accepts any `Checkpointer` (defaults to `MemorySaver`) so multi‑turn chat state survives serverless restarts. ([LangChain Blog][4]) |
| LCEL‑compatible                | Returns a `Runnable` you can `.invoke`, `.stream`, or pipe into bigger chains. ([LangChain AI][1])                                  |

**Learning goal ►** Students should be able to spin up an agent in 20 lines, swap prompts or tools, and persist per‑user state with `thread_id`.

---

#### 3 | API Surface (v0.3)\*\*

| Param           | Type                 | Purpose                                                  |
| --------------- | -------------------- | -------------------------------------------------------- |
| `llm`           | `ChatModel`          | Must support JSON tool calling (OpenAI, Anthropic, etc.) |
| `tools`         | `BaseTool[]`         | Each exposes `.name`, `.description`, `.schema`          |
| `prompt?`       | `ChatPromptTemplate` | Override default ReAct prompt                            |
| `system?`       | `string`             | Extra system message prepended to prompt                 |
| `checkpointer?` | `BaseSaver`          | Where to persist state (`MemorySaver`, Redis, S3…)       |

Return → `Runnable<{ messages: ChatMessage[] }, AgentFinish | AgentAction>` ([LangChain AI][1])

---

#### 4 | Minimum Viable Example

```ts
import { ChatOpenAI } from "@langchain/openai";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { MemorySaver } from "@langchain/langgraph";
import { HumanMessage } from "@langchain/core/messages";

const agent = await createReactAgent({
  llm:   new ChatOpenAI({ model: "gpt-4o-mini", temperature: 0 }),
  tools: [new TavilySearchResults({ maxResults: 3 })],
  checkpointSaver: new MemorySaver()
});

const reply = await agent.invoke(
  { messages: [new HumanMessage("Who won the 2022 World Cup?")] },
  { configurable: { thread_id: "chat‑42" } }   // per‑session memory
);

console.log(reply);  // Final answer or next AgentAction
```

Runs out‑of‑the‑box; subsequent turns with the same `thread_id` resume the conversation. ([LangChain AI][2])

---

#### 5 | Graph Anatomy (Auto‑generated)

```
START → agent_node ──┐
                     ├─▶ tool_node (executes JSON tool calls)
                     └─▶ END      (if no tool calls requested)
```

* **agent\_node** binds the LLM with tool metadata and the ReAct prompt.
* **tool\_node** runs the selected tool(s) and appends results as `ToolMessage`.
* **Conditional edge** routes back to `agent_node` until the model returns `AgentFinish`. ([LangChain AI][2])

---

#### 6 | Customization Levers

| Lever                  | How‑to                                                           |
| ---------------------- | ---------------------------------------------------------------- |
| **Custom prompt**      | Pass `prompt: ChatPromptTemplate.fromMessages([...])`            |
| **Extra system rules** | `system: "You are terse and cite sources."`                      |
| **More tools**         | Include any LC‑compatible tool (`Calculator`, `SQLDBTool`, etc.) |
| **Persistent DB**      | `checkpointSaver: new RedisSaver({ url })`                       |
| **Telemetry**          | Wrap agent with LangSmith callbacks to trace each step           |

---

#### 7 | Classroom Implementation Plan

| Stage                  | Activity                                                                   | Outcome               |
| ---------------------- | -------------------------------------------------------------------------- | --------------------- |
| **Concept (10 min)**   | Sketch auto‑generated graph                                                | Visual model          |
| **Lab 1 (20 min)**     | Build agent with Tavily; ask multi‑step question                           | Quick win             |
| **Lab 2 (25 min)**     | Override prompt to enforce French answers; observe behavior                | Prompt control        |
| **Lab 3 (20 min)**     | Swap `MemorySaver` for file‑based saver; restart node process; resume chat | Persistence proof     |
| **Challenge (15 min)** | Add second tool (`Calculator`) and watch agent choose between them         | Tool routing insight  |
| **Debrief (10 min)**   | Open LangSmith run; trace agent ↔ tool loops                               | Observability mindset |

---

#### 8 | Key Takeaways

1. **`createReactAgent` = ReAct graph factory**—ideal for prototypes and simple production bots.
2. **Zero manual edge wiring** but still returns a fully‑typed `Runnable` you can compose.
3. **Checkpoint + `thread_id`** give instant, horizontally‑scalable chat memory.
4. **Swap prompts/tools/savers** without touching the rest of your stack.
5. Start here, then graduate to manual `StateGraph` when you need bespoke branches or extra nodes.

---

[1]: https://langchain-ai.github.io/langgraph/reference/prebuilt/?utm_source=chatgpt.com "Prebuilt components - GitHub Pages"
[2]: https://langchain-ai.github.io/langgraph/how-tos/create-react-agent/?utm_source=chatgpt.com "How to use the pre-built ReAct agent"
[3]: https://stackoverflow.com/questions/79582142/does-langgraph-prebuilt-create-react-agent-in-langgraph-0-3-x-use-a-default-reac?utm_source=chatgpt.com "Does langgraph.prebuilt.create_react_agent in LangGraph 0.3.x ..."
[4]: https://blog.langchain.dev/langgraph-0-3-release-prebuilt-agents/?utm_source=chatgpt.com "LangGraph 0.3 Release: Prebuilt Agents - LangChain Blog"
