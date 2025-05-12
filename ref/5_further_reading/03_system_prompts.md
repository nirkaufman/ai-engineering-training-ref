**System Prompt (in LLM Development)**  
*A concise definition*  
A **system prompt** is the very first instruction an LLM receives in a chat or API call. It establishes the model’s *global role, constraints, and style* for the entire session—effectively acting as the conversation’s “constitution.”

---

### Why it matters

| Function | Practical Impact for Developers & Educators |
|-----------|--------------------------------------------|
| **Role framing** | Tells the model *who it is* (e.g., “You are a medical triage assistant…”). Prevents drift into unintended personas. |
| **Global policy** | Embeds guardrails (“Never give medical advice…”, “Cite every fact…”) that override later user prompts if they conflict. |
| **Tone & style seed** | Dictates writing style, language, formality, or structure so every answer is cohesive. |
| **Security boundary** | Acts as a first-line defense against prompt injection and policy violations by constraining permissible outputs. |

---

### Anatomy of an Effective System Prompt

1. **Role clause** – *“You are an expert legal researcher …”*
2. **Primary objective** – *“…who summarizes case law for non-lawyers …”*
3. **Operating rules** – *“Avoid legal advice; cite sources in APA format …”*
4. **Style rules** – *“Use formal tone, bullet lists only when clarifying statutes …”*

> **Mnemonic**: **R.O.O.S.** – *Role · Objective · Operating rules · Style*

---

### Minimal Example (OpenAI Chat API)

```json
{
  "model": "gpt-4o",
  "messages": [
    {
      "role": "system",
      "content": "You are a senior DevOps mentor. Answer with actionable checklists and cite RFCs where relevant."
    },
    { "role": "user", "content": "How do I set up zero-downtime deploys?" }
  ]
}
```

The user’s question may roam widely, but every response remains a “senior DevOps mentor” voice with checklist outputs and RFC citations—because the system prompt set that precedent.

---

### Teaching Tips

* **Analogy** – Compare the system prompt to a *movie director’s brief*: it defines genre, mood, and boundaries before actors improvise.
* **Class exercise** – Let students craft two different system prompts for the *same* user question (e.g., “Explain Kubernetes”). Observe how tone, depth, and formatting change.
* **Debugging tactic** – When answers go off-brand, inspect the system prompt first; most issues stem from an imprecise or overly broad directive.

---

### Best-Practice Checklist

- Keep it **short** (1–3 concise paragraphs).
- State **non-negotiables** explicitly (license, safety, confidentiality).
- Prefer **present-tense imperatives** (“Explain…”, “Never…”).
- Version-control your system prompts as you would code—tiny wording changes can radically alter behavior.

---

> **Bottom line:** The system prompt is the *single most powerful lever* for shaping an LLM’s behavior. Treat it as production code—design, test, and iterate with the same rigor.


### Does the system prompt get transmitted on every request?

**Short answer — yes, in practice it does.**  
Large-language-model APIs (including OpenAI’s Chat Completions endpoint) are **stateless**: each call must contain the full message history the model should “remember,” starting with the system prompt. Nothing lives server-side between requests.

| Situation | What actually happens | Implication for you |
|-----------|-----------------------|---------------------|
| **Using the raw API** | Your code sends the *entire* array of `messages` every time, so the `role:"system"` message is literally re-transmitted on every HTTP request. | Keep the system prompt in your local message buffer and prepend it on each call. |
| **Using a higher-level SDK / framework** | The library often stores the growing conversation for you, but *under the hood* it still re-sends the system prompt with the rest of the messages. | Don’t assume persistence; verify that the SDK keeps the history you expect. |
| **ChatGPT web UI** | The front-end shows you only user/assistant messages, but the back-end quietly re-attaches its internal system prompt on every turn before the request hits the model. | You can’t omit or override it, which is why policy guardrails stay in force. |

---

#### Why the repetition is necessary

1. **Stateless safety** – Eliminates long-term server memory of sensitive data.
2. **Determinism** – Each response is a pure function of the supplied context at that moment.
3. **Version control** – You can change the system prompt between calls to A/B test behaviors.

---

#### Engineering tips

* **Encapsulate it:** Store the system prompt in a constant (or database) and prepend it automatically so developers can’t forget it.
* **Token budgeting:** Because the system prompt counts toward the context window every time, keep it terse and use comments in your repository—not in the prompt—to explain why each line exists.
* **Prompt evolution:** Version-tag the prompt (e.g., `v1.3`) inside the text itself so you can audit which version produced a given answer.

---

> **Teaching takeaway:** A system prompt is not a one-time handshake; it’s a *per-call contract* that must travel with every request if you expect the model to honor it.


Below are **ready-to-run examples** you can drop into the `chat/completions` endpoint (or any OpenAI SDK).  
Each pair shares the *same* user question so you can observe how the quality of the **system prompt** shapes the model’s response.

---

## 1 · “Explain Kubernetes”

### ✅ Good system prompt
```json
{
  "model": "gpt-4o",
  "messages": [
    {
      "role": "system",
      "content": "You are a senior cloud-native trainer. • Goal: teach Kubernetes to mid-level DevOps engineers. • Constraints: use formal tone, limit jargon, give one concrete example per concept, end with a 2-item takeaway list."
    },
    { "role": "user", "content": "Give me a quick overview of Kubernetes." }
  ]
}
```
**What to inspect**

* Answers stay on-topic, formal, and developer-centric.
* Every key concept (“Pod”, “Service”, etc.) is accompanied by a single example.
* Output ends with exactly two bullet takeaways—no more, no less.

---

### ❌ Bad system prompt
```json
{
  "model": "gpt-4o",
  "messages": [
    {
      "role": "system",
      "content": "You know about Kubernetes. Be helpful."
    },
    { "role": "user", "content": "Give me a quick overview of Kubernetes." }
  ]
}
```
**Likely outcome**  
The reply meanders, mixes audience levels, may drown in buzzwords, and has no enforced structure—making it harder for learners to follow.

---

## 2 · “Summarise a legal case”

### ✅ Good system prompt
```json
{
  "model": "gpt-4o",
  "messages": [
    {
      "role": "system",
      "content": "You are an EU privacy-law analyst. Task: summarise judicial decisions for software engineers. Constraints: • 250 words max • plain-English (CEFR B2) • cite the exact article of GDPR after each point in brackets."
    },
    { "role": "user", "content": "Summarise the Schrems II ruling." }
  ]
}
```

### ❌ Bad system prompt (contradictory + verbose)
```json
{
  "model": "gpt-4o",
  "messages": [
    {
      "role": "system",
      "content": "You are a lawyer who must: (1) write in plain English, (2) use complex legalese, (3) avoid any references, (4) include full citations. Be concise but also very detailed and flowery. At all times be extremely short but elaborate."
    },
    { "role": "user", "content": "Summarise the Schrems II ruling." }
  ]
}
```
**What to inspect**  
The model receives mutually exclusive orders, so you’ll see it “thrash” (e.g., half legalese, half plain language) or ignore parts of the prompt.

---

## 3 · “Generate a JSON checklist”

### ✅ Good system prompt
```json
{
  "model": "gpt-4o",
  "messages": [
    {
      "role": "system",
      "content": "You are a JSON-only generator. Produce a deployment checklist object with keys: step, description, owner. Do not add any other text."
    },
    { "role": "user", "content": "Checklist for zero-downtime deploy." }
  ]
}
```

### ❌ Bad system prompt (missing non-negotiables)
```json
{
  "model": "gpt-4o",
  "messages": [
    {
      "role": "system",
      "content": "Give me a deployment checklist."
    },
    { "role": "user", "content": "Checklist for zero-downtime deploy." }
  ]
}
```
**Result**  
The “bad” version typically spits out markdown paragraphs or bullets instead of strict JSON, breaking any downstream parser.

---

## 4 · “Teach me Hebrew vocabulary”

### ✅ Good system prompt
```json
{
  "model": "gpt-4o",
  "messages": [
    {
      "role": "system",
      "content": "You are a Hebrew language teacher. Answer only in Hebrew, add Latin transliteration in brackets, keep sentences < 15 words, and finish with one usage example."
    },
    { "role": "user", "content": "What is the word for ‘freedom’?" }
  ]
}
```

### ❌ Bad system prompt (vague + redundant)
```json
{
  "model": "gpt-4o",
  "messages": [
    {
      "role": "system",
      "content": "Explain Hebrew words to me. Use Hebrew but also English and maybe other languages. Be creative."
    },
    { "role": "user", "content": "What is the word for ‘freedom’?" }
  ]
}
```
**Observation**  
Without tight rules, the answer might mix English, stray into etymology, or forget the transliteration—confusing for beginners.

---

### How to use these in class

1. **Live demo** – Run each pair back-to-back and highlight the differences in tone, structure, and compliance.
2. **Token lens** – Show students how the good prompts are shorter *yet* yield more controlled outputs, saving context window.
3. **Refactor exercise** – Ask learners to “fix” the bad prompts by applying the R.O.O.S. framework (Role, Objective, Operating rules, Style).

---

**Key takeaway for students**  
A *good* system prompt is *specific, consistent, and minimal*; a *bad* one is vague, conflicting, or overloaded— and the contrast is obvious the moment you run them.



