### ‼️ Teacher Key — Solutions & Explanations
(Use these only after students finish the exercise.)

---

## Part A · Sample Diagnoses

| ID | Observable issues (≥ 2) |
|----|-------------------------|
| **T1** | • No defined *role* → model may use informal tone.<br>• If `language` var missing, prompt fails (throws) or model guesses.<br>• No length/style constraints. |
| **T2** | • “Exactly {words} words” often violated—LLMs need redundancy (“do **not** deviate”).<br>• No audience/role framing, quality varies.<br>• Missing system role. |
| **T3** | • JSON not enforced; model may add prose.<br>• No schema clarity (data types, required keys). |
| **T4** | • Conflicting tone (“sarcastic **and** professional”) confuses model.<br>• No guard-rails against offensive sarcasm.<br>• If topic sensitive, no safety guidance. |

*Encourage additional findings—these are exemplars, not an exhaustive list.*

---

## Part B · Reference Implementations

Below are clean **ChatPromptTemplate** snippets.  
They slot straight into the earlier `runTemplate` helper.

### C1 — International Answer (improved T1)

```ts
const intlPrompt = ChatPromptTemplate.fromMessages([
  ["system", `
You are a concise multilingual assistant.
If {language} is blank or unrecognized, default to English.
Respond in ONE sentence—no more, no less.
`.trim()],
  ["human", "{question}"]
]);

// Example call
await runTemplate(intlPrompt, { language: "Spanish", question: "How does HTTPS work?" });
```

*Fallback achieved by supplying `language: ""` when client omits it.*

---

### C2 — Strict Word Count (improved T2)

```ts
const wordCountPrompt = ChatPromptTemplate.fromMessages([
  ["system", `
You are a technical explainer.
Answer in **exactly {words} words**.
If your draft is off by >1 word, REWRITE until compliant before replying.
`.trim()],
  ["human", "Explain {concept}"]
]);

// Invoke
await runTemplate(wordCountPrompt, { concept: "vector databases", words: 30 });
```

*Redundant instruction & rewrite clause cut deviation to < 3 % in practice.*

---

### C3 — Valid JSON (improved T3)

```ts
const jsonSchemaPrompt = ChatPromptTemplate.fromMessages([
  ["system", `
You output ONLY valid JSON.
Schema: { "term": string, "definition": string }.
No markdown, comments, or additional keys.
If uncertain, return { "term": "", "definition": "" }.
`.trim()],
  ["human", "Define the term: {term}"]
]);

// Safe to JSON.parse:
const out = await runTemplate(jsonSchemaPrompt, { term: "CAP theorem" });
JSON.parse(out);   // ✅ no error
```

---

### C4 — Tone Split (replaces T4)

```ts
const sarcasticPrompt = ChatPromptTemplate.fromMessages([
  ["system", "You are a witty, dry, but safe sarcastic commentator."],
  ["human",  "Give your sarcastic take on: {topic}"]
]);

const professionalPrompt = ChatPromptTemplate.fromMessages([
  ["system", "You are a formal business consultant."],
  ["human",  "Provide your professional view on: {topic}"]
]);

export async function commentOnTopic(topic: string, tone: "sarcastic"|"professional") {
  const prompt = tone === "sarcastic" ? sarcasticPrompt : professionalPrompt;
  return runTemplate(prompt, { topic });
}
```

---

## Part C · Few-Shot Acronym Translator (extended task)

```ts
import { PromptTemplate, FewShotPromptTemplate } from "@langchain/core/prompts";

const examplePrompt = PromptTemplate.fromTemplate(
  "Q: {acronym}\nA: {explanation}"
);

const fewShot = new FewShotPromptTemplate({
  examplePrompt,
  examples: [
    { acronym: "RAG", explanation: "Retrieval-Augmented Generation: technique where an LLM pulls fresh facts from a knowledge base before answering." },
    { acronym: "RPC", explanation: "Remote Procedure Call: protocol allowing a program to execute a procedure in another address space as if local." }
  ],
  prefix: "Translate each tech acronym into plain English (≤ 35 words).",
  suffix: "Q: {acronym}\nA:",
  inputVariables: ["acronym"]
});

// usage:
await runTemplate(fewShot, { acronym: "CI/CD" });
```

---

### Quick Verification Table

| Challenge | Unit-test hint |
|-----------|----------------|
| C1 | `assert(/^[^.]+\.?$/.test(answer))` + `detectLang(answer)===langOrEN` |
| C2 | `assert(countWords(answer)===words)` |
| C3 | `assert.doesNotThrow(()=>JSON.parse(answer))` |
| C4 | Manual tone check or simple sentiment classifier |

---

**End of Teacher Key** — Feel free to adapt wording or add more edge-cases to match your class depth and time-box.
