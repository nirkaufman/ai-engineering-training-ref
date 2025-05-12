### Teaching Guide — LangGraph JS **Basics**

---

#### 1 | Why LangGraph?

| Need                      | How LangGraph Helps                                                                                                                       |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Stateful workflows**    | Lets you model an entire multi‑step, multi‑agent flow as a single, typed graph rather than scattered async functions. ([LangChain AI][1]) |
| **Explicit control‑flow** | START / END edges, branches, and conditional routing make execution paths crystal‑clear and debuggable. ([LangChain AI][2])               |
| **Composable nodes**      | Any sync/async function becomes a drop‑in “node”, so you can reuse existing code without wrappers. ([Medium][3])                          |

**Learning goal ►** Students should know how to declare graph state, add nodes, wire edges (including conditional), compile, and stream execution results.

---

#### 2 | Core Concepts at a Glance

| Concept              | What it is                                                                          | Key API                                                         |
| -------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| **State**            | A typed object whose fields act as channels between nodes                           | `Annotation.Root({...})` ([LangChain AI][4])                    |
| **Node**             | A JS/TS function that receives the current state and returns a partial state update | `addNode(name, fn)` ([LangChain AI][2])                         |
| **Edge**             | Connection that tells the graph which node to visit next                            | `addEdge("A","B")`                                              |
| **Conditional Edge** | Branching logic decided at runtime by a router function                             | `addConditionalEdges("A", routerFn)` ([Medium][5], [Medium][6]) |
| **START / END**      | Built‑in pseudo‑nodes marking entry and exit points                                 | `START`, `END` constants                                        |

---

#### 3 | Anatomy of the Example Snippet

| Line(s)                                                | Purpose                                                                                                                 |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `const state = Annotation.Root({...})`                 | Declares a single‐field channel `graphState` (type `string`). ([LangChain AI][4])                                       |
| `function node_1(state){...}`                          | A node appending `" I am"` to the channel. Nodes always return **partial** state. ([LangChain AI][2])                   |
| `function decideMood(state){...}`                      | Router that returns **the name** of the next node (`"node_2"` or `"node_3"`), enabling dynamic branching. ([Medium][5]) |
| `new StateGraph(state)...compile()`                    | Builder pattern: add nodes → edges → compile into an executable graph. ([TECHCOMMUNITY.MICROSOFT.COM][7])               |
| `graph.stream(initialState, { streamMode:'updates' })` | Runs the graph and yields per‑node deltas that you can pipe to a UI.                                                    |

---

#### 4 | Step‑by‑Step Build Recipe

```ts
import { Annotation, StateGraph, START, END } from "@langchain/langgraph";

/** 1 | Define state channels */
const State = Annotation.Root({
  graphState: Annotation<string>()
});

/** 2 | Write nodes (pure or async) */
const greet   = (s: State) => ({ graphState: s.graphState + " I am" });
const happy   = (s: State) => ({ graphState: s.graphState + " happy!" });
const sad     = (s: State) => ({ graphState: s.graphState + " sad!" });

/** 3 | Router for branching */
const decideMood = (s: State) => (Math.random() < 0.5 ? "happy" : "sad");

/** 4 | Assemble the graph */
const graph = new StateGraph(State)
  .addNode("greet", greet)
  .addNode("happy", happy)
  .addNode("sad",   sad)
  .addEdge(START, "greet")
  .addConditionalEdges("greet", decideMood)
  .addEdge("happy", END)
  .addEdge("sad",   END)
  .compile();

/** 5 | Invoke */
await graph.invoke({ graphState: "Hello," });   // returns final state
```

---

#### 5 | Streaming Results to the Client

```ts
const updates = await graph.stream({ graphState:"Hello," }, { streamMode:"updates" });
for await (const chunk of updates) {
  if (chunk.greet) console.log("🔍 Greet:", chunk.greet.graphState);
  if (chunk.happy) console.log("😀 Happy:", chunk.happy.graphState);
  if (chunk.sad)   console.log("😢 Sad:",   chunk.sad.graphState);
}
```

Each emitted `chunk` is a **delta** keyed by node name, perfect for progressive UI feedback.

---

#### 6 | Design Levers & Best Practices

| Lever                    | Practical Guidance                                                                        |
| ------------------------ | ----------------------------------------------------------------------------------------- |
| **Granularity**          | Prefer many small nodes over one giant node; easier to unit‑test and reuse.               |
| **Pure functions first** | Keep side‑effects (API calls) at the edge nodes; pure nodes are deterministic.            |
| **State immutability**   | Always return a *new* object (partial); LangGraph merges it for you.                      |
| **Typed channels**       | Use explicit `Annotation<Type>()`; TypeScript will warn if a node returns malformed data. |
| **Tracing**              | Wrap `graph.stream()` with LangSmith callbacks for timeline‑level debugging.              |

---

#### 7 | Classroom Implementation Plan

| Stage                  | Activity                                                            | Outcome                   |
| ---------------------- | ------------------------------------------------------------------- | ------------------------- |
| **Concept (10 min)**   | Draw a node‑edge diagram of the sample graph                        | Visual intuition          |
| **Lab 1 (20 min)**     | Students build the three‑node happy/sad graph                       | Hands‑on basics           |
| **Lab 2 (25 min)**     | Replace random router with sentiment classifier using an LLM        | Real‑world branching      |
| **Lab 3 (20 min)**     | Stream updates into a React component with Server Actions           | Full‑stack integration    |
| **Challenge (15 min)** | Add a retry edge from `sad` back to `greet` until happy path is hit | Loop & termination skills |
| **Debrief (10 min)**   | Inspect LangSmith trace—identify state deltas & conditional jumps   | Observability mindset     |

---

#### 8 | Key Takeaways for Students

1. **State + Nodes + Edges = a LangGraph.** Understand these three and the rest is composition.
2. **Conditional edges** turn static pipelines into adaptive workflows without spaghetti code.
3. **Streaming execution** gives immediate UI feedback and easier debugging.
4. **Type‑safe state channels** prevent silent failures—embrace `Annotation.Root`.
5. Once comfortable with these basics, you can scale the same pattern to multi‑agent, tool‑calling systems.

[1]: https://langchain-ai.github.io/langgraphjs/tutorials/quickstart/?utm_source=chatgpt.com "LangGraph.js - Quickstart"
[2]: https://langchain-ai.github.io/langgraphjs/concepts/low_level/?utm_source=chatgpt.com "LangGraph Glossary - GitHub Pages"
[3]: https://medium.com/%40barsegyan96armen/langgraph-101-understanding-the-core-concepts-of-state-nodes-and-edges-in-javascript-f91068683d7d?utm_source=chatgpt.com "LangGraph 101: Understanding the Core Concepts of State, Nodes ..."
[4]: https://langchain-ai.github.io/langgraphjs/how-tos/define-state/?utm_source=chatgpt.com "How to define graph state - GitHub Pages"
[5]: https://medium.com/ai-agents/langgraph-for-beginners-part-3-conditional-edges-16a3aaad9f31?utm_source=chatgpt.com "LangGraph for Beginners, Part 3: Conditional Edges - Medium"
[6]: https://medium.com/%40Shamimw/langgraph-simplified-understanding-conditional-edge-using-hotel-guest-check-in-process-36adfe3380a8?utm_source=chatgpt.com "LangGraph Simplified: Understanding Conditional edge using Hotel ..."
[7]: https://techcommunity.microsoft.com/blog/educatordeveloperblog/an-absolute-beginners-guide-to-langgraph-js/4212496?utm_source=chatgpt.com "An Absolute Beginner's Guide to LangGraph.js"
