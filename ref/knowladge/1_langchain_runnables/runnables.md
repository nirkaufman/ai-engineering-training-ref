**LangChain Runnable — an instructional overview**

---

### 1  |  What it is
A **Runnable** is LangChain’s universal “unit of work”.  
Any component that can *receive* an input and *return* an output implements the Runnable interface: language-models, prompt templates, retrievers, output parsers, LangGraph sub-graphs, and your own utility functions.  ([Runnable interface - ️ LangChain](https://python.langchain.com/docs/concepts/runnables/?utm_source=chatgpt.com), [Runnable interface - LangChain.js](https://js.langchain.com/docs/concepts/runnables/?utm_source=chatgpt.com))

---

### 2  |  Why LangChain introduced it

| Goal | How Runnable delivers it |
|------|--------------------------|
| **Consistent API** | Every component exposes `.invoke()`, `.stream()`, `.batch()` and async equivalents, so you call them the same way regardless of what they do.  ([Runnable — LangChain documentation](https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.Runnable.html?utm_source=chatgpt.com)) |
| **First-class composition** | Runnables can be *piped* into sequences (`a | b | c`) or run in parallel, forming arbitrarily complex pipelines without bespoke glue code.  ([How to chain runnables | 🦜️ LangChain](https://python.langchain.com/docs/how_to/sequence/?utm_source=chatgpt.com), [How to chain runnables - LangChain.js](https://js.langchain.com/docs/how_to/sequence/?utm_source=chatgpt.com)) |
| **Built-in scalability** | Because every pipeline is itself a Runnable, the whole chain automatically inherits streaming, batching and tracing support, making it production-ready out of the box.  ([runnables — LangChain documentation](https://python.langchain.com/api_reference/core/runnables.html?utm_source=chatgpt.com)) |

---

### 3  |  Mental model for students
Think of a Runnable as a **Unix command**:

```bash
cat data.txt | grep "error" | sort
```  

Each command takes stdin, produces stdout, and can be chained with `|`.  
LangChain’s expression language does the same in code:

```ts
const chain = 
  promptTemplate        // Runnable<vars, string>
  | chatModel           // Runnable<string, ChatMessage>
  | outputParser;       // Runnable<ChatMessage, StructuredResult>
```

The `chain` variable *is itself* a Runnable, so later you can simply:

```ts
const answer = await chain.invoke({ topic: "vector databases" });
```

---

### 4  |  Key interface methods (LangChain JS & Python)

| Method | Purpose | One-liner example |
|--------|---------|-------------------|
| `.invoke(input)` | Run once, get the full result | `await llm.invoke("Hello")` |
| `.stream(input)` | Async generator for token-level streaming | `for await (tok of chain.stream(q)) …` |
| `.batch(inputs)` | Run many inputs efficiently | `await chain.batch(listOfQueries)` |
| `.pipe(next)` / `|` operator | Compose into a `RunnableSequence` | `a.pipe(b)` or `a | b` |

---

### 5  |  Minimal hands-on demo (TypeScript)

```ts
import { ChatOpenAI }          from "@langchain/openai";
import { PromptTemplate }      from "@langchain/core/prompts";
import { StringOutputParser }  from "@langchain/core/output_parsers";

const prompt = PromptTemplate.fromTemplate(
  "Answer in 20 words: {question}"
);

const model  = new ChatOpenAI({ modelName: "gpt-4o-mini" });

const chain = prompt
             | model.bind({ temperature: 0.4 })   // bind returns a Runnable
             | new StringOutputParser();

const result = await chain.invoke({ question: "What is LangChain Runnable?" });
console.log(result);
```

Run the script and then try:

*Replace `StringOutputParser` with your own `RunnableLambda` to post-process the text.*  
*Swap `ChatOpenAI` for a local model—the chain still works, proving the interchangeability promise.*

---

### 6  |  Pedagogical tips

* **Debugging** – LangSmith traces every Runnable call automatically; show students the waterfall view to visualise pipeline latency.
* **Refactoring exercise** – Give learners an old `LLMChain` example and ask them to convert it to LCEL using Runnables.
* **Parallel thinking** – Have the class build a `RunnableParallel` that queries two search APIs simultaneously, then merges results.

---

### 7  |  Take-home message
*Runnable* is the abstraction that lets LangChain treat *everything*—from a prompt to an entire DAG—as a composable, stream-capable function. Mastering it unlocks concise pipelines, easier testing, and smooth scaling.
