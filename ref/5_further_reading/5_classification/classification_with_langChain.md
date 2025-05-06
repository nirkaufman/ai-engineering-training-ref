### Classification with LangChain – Teacher Reference 

#### 1 What is text classification?
Text classification (a.k.a. tagging or labeling) assigns predefined categories to an input string — for example *positive / neutral / negative* sentiment, *Spanish / English* language, or *bug / feature request* ticket type. Classic approaches rely on keyword rules or supervised models trained per label. Modern LLMs can perform the same task zero‑shot when you describe the desired schema, saving training effort and covering long‑tail cases.

---

#### 2 Why use LangChain for classification?
LangChain’s chat‑model wrappers expose a helper called **withStructuredOutput**. You give it a schema (built with Zod) and the model returns JSON that exactly matches the schema. This removes fragile string‑parsing and lets your code consume strongly typed objects.

---

#### 3 Essential terms

| Term | Meaning in this context | LangChain class / feature |
|------|------------------------|---------------------------|
| **Label / tag** | One category in the output (e.g. “happy”) | Part of the Zod schema |
| **Schema** | Formal definition of expected keys, types, and allowed values | `z.object({ … })` |
| **Function calling** | LLM capability to emit structured JSON by “calling” a virtual function | Enabled via `withStructuredOutput` |
| **Prompt template** | Message that instructs the model to classify the passage | `ChatPromptTemplate` |
| **Structured LLM** | A chat model wrapped by `withStructuredOutput` so it enforces the schema | Returns typed JSON |

---

#### 4 Reference workflow – Next.js **server action** version

> Place this file in `src/app/actions/classify.ts`.
> Call it from React components with `await classifyText('your text')`.

```ts
'use server'

import { ChatOpenAI }         from '@langchain/openai'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { z }                  from 'zod'

// 1 Define the output schema
const classificationSchema = z.object({
  sentiment:      z.string().describe('Sentiment of the text'),
  aggressiveness: z.number().int().describe('Aggression 1–10'),
  language:       z.string().describe('Language of the text'),
})

// 2 Create the chat model and wrap it for structured output
const llm        = new ChatOpenAI({ model: 'gpt-4o-mini', temperature: 0 })
const classifier = llm.withStructuredOutput(classificationSchema, { name: 'extractor' })

// 3 Prepare a reusable prompt template
const prompt = ChatPromptTemplate.fromTemplate(
  `Extract the desired information from the following passage.
   Only extract the properties mentioned in the 'Classification' function.

   Passage:
   {input}`
)

// 4 Export the server action
export async function classifyText(input: string) {
  const readyPrompt = await prompt.invoke({ input })
  return await classifier.invoke(readyPrompt)
}

/*
Usage in a Client Component (simplified):

'use client'
import { useState } from 'react'
import { classifyText } from '@/app/actions/classify'

export default function Demo() {
  const [result, setResult] = useState(null)

  async function handleClick() {
    const data = await classifyText('Estoy increiblemente contento …')
    setResult(data)
  }

  return (
    <>
      <button onClick={handleClick}>Classify</button>
      <pre>{JSON.stringify(result, null, 2)}</pre>
    </>
  )
}
```

**Flow summary**

1. **Define schema** – every key, type, and optional enum of valid values.
2. **Create chat model** – any provider that supports function calling.
3. **Wrap model** – `withStructuredOutput(schema)` enforces JSON output.
4. **Craft prompt** – reminds the model to output only the requested fields.
5. **Invoke** – server action returns a JavaScript object ready for downstream logic.

---

#### 5 Practical classroom use case – support‑ticket triage
*Inputs*: free‑text tickets from users.
*Goal*: assign **priority** (high, normal, low), **area** (billing, bug, feature), and **sentiment** so the help‑desk queue is auto‑sorted.
*Steps*:
1. Replace the tutorial’s sentiment/aggressiveness/language fields with your own keys and enums.
2. Feed each incoming ticket through the server action.
3. Store the returned JSON in your ticketing DB or route based on labels.

---

#### 6 Design levers & tips

* Enum values – prefer enums over free‑form strings to avoid drift (happy vs. positive).
* Temperature – keep temperature 0 for deterministic labels.
* Few‑shot examples – add one or two role‑tagged examples above the placeholder to anchor borderline cases.
* Error handling – wrap `classifyText` in `try / catch`; invalid JSON throws.
* Performance – batch‐classify with `classifier.batch([...prompts])` when processing many documents.
* Provider choice – Groq, Anthropic, Gemini, Mistral, and Vertex AI all work the same once wrapped.

---

#### 7 Extending the lesson

| Extension idea | Value for students |
|----------------|-------------------|
| Add a **confidence** float to the schema and ask the model to self‑grade certainty. | Discuss calibration of LLM judgments. |
| Create a **multi‑label** field (array of topics) to illustrate one‑to‑many tagging. | Highlights difference between single‑choice vs. list outputs. |
| Compare LLM tags to an embeddings‑based k‑NN classifier on the same dataset. | Encourages critical thinking about accuracy vs. latency / cost. |

These materials give you a concise yet complete pathway to teach LLM‑powered classification: concept, code, schema design, and classroom applications—now tailored for Next.js server‑action workflows.
