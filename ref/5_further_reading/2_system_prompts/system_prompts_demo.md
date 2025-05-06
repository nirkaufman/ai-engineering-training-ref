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
