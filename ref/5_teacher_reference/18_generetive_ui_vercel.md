### Teaching Guide — Generative UI with **Streaming Components**

---

#### 1 | What Students Will Build

A React‑Server‑Component workflow that **streams UI fragments as soon as data arrives**, powered by an LLM tool‑call that fetches weather data. It covers custom components, a mock weather service, the `streamUI` helper from Vercel AI SDK, and a typed tool definition.&#x20;

---

#### 2 | Prerequisites & Setup

| Requirement                  | Why                                             |
| ---------------------------- | ----------------------------------------------- |
| **Next.js (App Router)**     | Server components + async/stream support        |
| **AI SDK & OpenAI key**      | Access to the `streamUI` helper and GPT‑4 model |
| **Basic React + TypeScript** | Components and prop typing                      |

```bash
npm i ai @ai-sdk/openai zod
export OPENAI_API_KEY=sk‑…
```



---

#### 3 | Step‑by‑Step Walk‑through

| Stage                     | Key Code / Idea                                                | What It Teaches                                                                     |
| ------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| **a. Components**         | `LoadingComponent`, `WeatherComponent`, `WeatherProps`         | Skeleton UI, TS interfaces                                                          |
| **b. Weather Service**    | Fake `getWeather()` with `setTimeout`                          | Async I/O simulation                                                                |
| **c. Streaming Function** | `streamComponent()` using `streamUI({ model, prompt, tools })` | Ties model output to tool calls + JSX chunks                                        |
| **d. Tool Definition**    | `getWeather` tool with `z.object({ location })` schema         | Input validation + generator that `yield`s loading UI then returns final component  |
| **e. States**             | Loading → Data → (optional) Error                              | How to handle progressive rendering                                                 |

---

#### 4 | Tool Anatomy (in this tutorial)

```ts
tools: {
  getWeather: {
    description: 'Get the weather for a location',
    parameters: z.object({ location: z.string() }),
    generate: async function* ({ location }) {
      yield <LoadingComponent />;
      const weather = await getWeather(location);
      return <WeatherComponent weather={weather} location={location} />;
    },
  },
}
```

*Highlights*

* **Description** guides the LLM.
* **Schema** guarantees a `location` string.
* **`generate` as async generator** enables granular streaming via `yield`.&#x20;

---

#### 5 | Design Levers & Best Practices

| Lever                 | Guidance                                                                 |
| --------------------- | ------------------------------------------------------------------------ |
| **Loading UX**        | Always yield a placeholder *before* the slow call.                       |
| **Typed props**       | Define interfaces (`WeatherProps`) for every component.                  |
| **Schema strictness** | `z.object({ location: z.string() })` avoids malformed tool calls.        |
| **Error handling**    | Wrap `getWeather` in `try/catch`; render fallback UI.                    |
| **Prompt clarity**    | Keep `prompt` short (“Get the weather for X”)—LLM acts, doesn’t narrate. |
| **Performance**       | Cache results or memoise heavy tool calls in prod.                       |
|                       |                                                                          |

---

#### 6 | Common Pitfalls & Fixes

| Problem                 | Likely Cause                                | Quick Fix                                             |
| ----------------------- | ------------------------------------------- | ----------------------------------------------------- |
| Component never updates | Forgot `yield` or `return` inside generator | Ensure generator yields loading and returns final JSX |
| Type errors             | Missing/incorrect `WeatherProps`            | Strict interfaces + `zod` validation                  |
| Slow UX                 | Simulated or real latency                   | Show loading pulse, reduce chunk size                 |
|                         |                                             |                                                       |

---

#### 7 | Classroom Implementation Plan

| Stage                  | Activity                                                     | Outcome              |
| ---------------------- | ------------------------------------------------------------ | -------------------- |
| **Concept (10 min)**   | Diagram Streaming UI timeline (Loading → Data)               | Mental model         |
| **Lab 1 (20 min)**     | Implement `LoadingComponent` & `WeatherComponent`            | React + TS practice  |
| **Lab 2 (25 min)**     | Write `getWeather` service & fake delay                      | Async fundamentals   |
| **Lab 3 (30 min)**     | Build `streamComponent()` with tool schema; run in localhost | End‑to‑end streaming |
| **Challenge (15 min)** | Extend with a second tool (`getTimeZone`) and a mixed prompt | Multi‑tool skills    |
| **Debrief (10 min)**   | Discuss production concerns—caching, error boundaries        | Scaling mindset      |

---

#### 8 | Key Takeaways

1. **Streaming components let users see progress instantly**—`yield` early, `return` when ready.
2. **Tools are typed, validated gateways** to external data; the LLM orchestrates them.
3. **`streamUI` binds model, prompt, tools, and UI renderer** into a single async pipeline.
4. **Clear prompts + strict Zod schemas = fewer hallucinations & errors.**
5. Master this pattern and you can swap `getWeather` for *any* business function—payments, DB queries, personalized dashboards—while keeping a fluid React‑Server UI.

---
