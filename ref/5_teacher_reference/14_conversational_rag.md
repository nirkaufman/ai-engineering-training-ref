### Teaching Guide — LangChain JS **Conversational RAG (Tutorial Walk‑through)**

---

#### 1 | Why Conversational RAG?

Follow‑up questions in chat (“*What about **his** papers?*”) break naive similarity search. Conversational RAG rewrites the user’s latest question **with chat history in mind**, then runs retrieval + generation, so the bot stays on topic, grounded and concise.

---

#### 2 | Two Implementation Paths

| Path      | Idea                                                                                      | When to pick                                                                  |
| --------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| **Chain** | Always run retrieval; logic is predetermined                                              | Simpler, deterministic flows                                                  |
| **Agent** | Give the LLM a **tool set** (retriever + web‑search, etc.) and let it decide what to call | When some turns don’t need retrieval or may need **multiple** retrieval calls |

---

#### 3 | Quick Setup

```bash
npm i langchain @langchain/openai cheerio
export OPENAI_API_KEY=YOUR_KEY
```

The tutorial indexes Lilian Weng’s *“LLM‑Powered Autonomous Agents”* blog post with a `MemoryVectorStore`, an OpenAI embeddings model and `ChatOpenAI`.

---

#### 4 | Chain‑based Conversational RAG — Step‑by‑Step

| Step                          | Key Code (abridged)                                                                                                               | Purpose                                                                                       |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| **a. Vector store**           | `splits → MemoryVectorStore.fromDocuments(splits, new OpenAIEmbeddings())`                                                        | Persist searchable chunks                                                                     |
| **b. Contextualise question** | `contextualizeQPrompt = ChatPromptTemplate.fromMessages([ "system", MessagesPlaceholder("chat_history"), "human" ]) ⟹ .pipe(llm)` | Reformulate the user question using recent chat turns (only when `chat_history` isn’t empty). |
| **c. QA prompt**              | Same pattern but inserts `{context}` + `chat_history` before the new question.                                                    |                                                                                               |
| **d. Full chain**             | `RunnableSequence.from([ … retriever → formatDocs , qaPrompt , llm ])`                                                            | Retrieves docs, pipes them + history into LLM, returns answer.                                |

**Shortcut constructor** – `createHistoryAwareRetriever` packages steps **b**& **retriever** for you; drop it into `createRetrievalChain` to get the same output schema with much less code. ([Langchain][1])

---

#### 5 | Agent‑based Variant (high‑level)

1. Turn the retriever into a **tool**: `createRetrieverTool(retriever, { name, description })`.
2. Optionally add a live web‑search tool (e.g., Tavily).
3. Feed tools to `createOpenAIFunctionsAgent`, wrap with `AgentExecutor`, and the LLM chooses when to call which tool. ([Langchain][2])

---

#### 6 | Persisting Chat History in Production

Instead of manually passing `chat_history`, wrap the chain with **`RunnableWithMessageHistory`** or migrate to a LangGraph workflow compiled with `MemorySaver` and scoped by `thread_id`. This checkpoints messages (and any extra state) per conversation. ([Langchain][1])

---

#### 7 | Design Levers & Tips

| Lever                 | Guidance                                                                              |
| --------------------- | ------------------------------------------------------------------------------------- |
| **History window**    | 3‑6 recent turns is usually enough—longer bloats embeddings.                          |
| **Question rewriter** | Keep prompt *instructional* (“rephrase only, don’t answer”).                          |
| **Retriever**         | Vector k = 4–6; add MMR or rerank if follow‑ups drift.                                |
| **Memory strategy**   | `BufferMemory` for short chats; `ConversationSummaryMemory` to auto‑shrink old turns. |
| **Citations UI**      | Show snippet + turn number to build user trust.                                       |

---

#### 8 | Classroom Implementation Plan

| Stage                  | Activity                                                                    | Outcome             |
| ---------------------- | --------------------------------------------------------------------------- | ------------------- |
| **Concept (10 min)**   | Draw vanilla vs. conversational RAG pipeline                                | Shared mental model |
| **Lab 1 (25 min)**     | Build chain with `createHistoryAwareRetriever`; ask pronoun‑rich follow‑ups | See history fix     |
| **Lab 2 (25 min)**     | Swap to agent variant; inspect tool calls in LangSmith trace                | Understand autonomy |
| **Lab 3 (20 min)**     | Add `RunnableWithMessageHistory`; run two parallel chat sessions            | Per‑thread memory   |
| **Challenge (15 min)** | Add fallback web‑search tool when retriever returns 0 docs                  | Robustness          |
| **Debrief (10 min)**   | Discuss token‑cost vs. accuracy trade‑offs                                  | Evaluation mindset  |

---

#### 9 | Key Takeaways

1. **Conversational RAG = RAG + Memory + Question Rewriting.**
2. **`createHistoryAwareRetriever`** gives you a plug‑and‑play, history‑aware retriever.
3. **Chains** are predictable; **agents** add discretion (and complexity).
4. Persist chat history with `RunnableWithMessageHistory` or a LangGraph graph + `MemorySaver`.
5. Expose citations—grounded answers trump eloquent hallucinations.

---

[1]: https://js.langchain.com/docs/how_to/qa_chat_history_how_to "How to add chat history | ️ Langchain"
[2]: https://js.langchain.com/v0.1/docs/get_started/quickstart/?utm_source=chatgpt.com "Quickstart - LangChain.js"
