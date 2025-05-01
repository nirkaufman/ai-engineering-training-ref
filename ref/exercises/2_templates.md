## Hands-On Exercise — Mastering LangChain Templates

> **Objective**
> 1. Recognize how template wording changes model behavior.
> 2. Practise writing and refactoring templates for specific output goals.
> 3. Learn to spot and fix common template mistakes (missing variables, conflicting rules, vague instructions).

All examples assume you have the **server action scaffold** shown earlier:

```ts
export async function runTemplate(
  prompt: ChatPromptTemplate,
  vars: Record<string, any>
): Promise<string> {
  const chain = prompt.pipe(model).pipe(new StringOutputParser());
  return await chain.invoke(vars);
}
```

You will **only edit the templates** and the `vars` object in each task.

---

### Starter Templates

| ID | Template (multi-line literal) | Input vars | Typical output |
|----|------------------------------|-----------|----------------|
| **T1** | ```You are a helpful assistant.```<br>```Answer the user in {language}.``` | `language` | Plain paragraph |
| **T2** | ```Use exactly {words} words.```<br>```Explain: {concept}``` | `words`, `concept` | Fixed-length answer |
| **T3** | ```Return JSON with keys "term" and "definition".```<br>```Term: {term}``` | `term` | JSON object |
| **T4** | ```Be sarcastic and professional at the same time.```<br>```Comment on: {topic}``` | `topic` | Tone clash |

---

### Part A — Template Diagnosis (10 min)

1. **Run** each template via `runTemplate` and note the behaviour.
2. Identify at least **two issues** per template (e.g., missing guard-rails, tone conflicts, vague wording).
3. Record the exact output tokens that illustrate the issues.

---

### Part B — Refactor Challenges

| Challenge | Task | Success criteria |
|-----------|------|------------------|
| **C1 — International Answer** | Improve **T1** so:<br>• System prompt clarifies *who* the assistant is.<br>• Output is exactly one sentence.<br>• Language choice defaults to English if `language` omitted. | Running with `{ language:"Spanish" }` gives one Spanish sentence. Running with `{}` gives one English sentence. |
| **C2 — Strict Word Count** | Rewrite **T2** so the model *always* obeys the word limit (≤ 3% deviation). Hint: add a post-condition clause. | Run 5 different `concept` values; observe correct counts. |
| **C3 — Valid JSON** | Fix **T3** so malformed JSON is impossible. Hint: add *system* role explaining repercussions + specify output schema. | Pipe output into `JSON.parse()` with no errors. |
| **C4 — Tone Split** | Replace **T4** with **two separate templates** — one sarcastic, one professional. Decide at runtime which to invoke by passing `tone`. | Passing `{ topic:"meetings", tone:"sarcastic" }` gives sarcasm; `"professional"` gives formal style. |

---

### Part C — Extension (optional)

Create a **Few-Shot PromptTemplate** that teaches the model to translate technical acronyms (e.g., “RAG”, “RPC”) into plain English. Requirements:

* At least **two** example Q-A pairs.
* Variable `{acronym}` for the student-supplied term.
* Output limited to **35 words** in a single paragraph.

---

### Submission

* **Code snippets** for each refactored template.
* A short **README** describing:
    * Detected issues in Part A.
    * How your changes solved them.
    * Screenshots or console logs proving outputs meet criteria.

---

> **Teaching tip:** run the original vs. refactored templates side-by-side in class, using `stream()` to watch token-level differences live.
