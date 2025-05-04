### Classification Practice — Student Exercise Set

> All tasks build on the **classifyText** server‑action you saw in class.  
> Fork the starter repo, create a branch named `classification‑lab`, and commit after each exercise.

---

#### Exercise 1 Sentiment basics
**Goal** Return just one field: `sentiment` with values **positive**, **neutral**, or **negative**.

1. Replace the existing Zod schema with a single enum field.
2. Prompt: “Classify the passage sentiment as strictly one of positive, neutral, negative.”
3. Run the action on five provided sentences and record results in `lab1.md`.

*Stretch* Try the same sentences with temperature 0.7 and note any label changes.

---

#### Exercise 2 Add urgency scoring
**Goal** Extend the schema to include an integer `urgency` from 1 (low) to 5 (high).

1. Update the Zod schema and prompt description.
2. Classify ten real support tickets (CSV supplied).
3. Plot a quick bar chart of urgency distribution (use any tool).

*Checkpoint* Commit `urgency_results.json` and the chart screenshot.

---

#### Exercise 3 Few‑shot anchoring
**Goal** Improve accuracy on borderline texts.

1. Prepend two role‑tagged examples to the prompt template:  
   *Example 1*: highly negative, urgency 5.  
   *Example 2*: slightly negative, urgency 2.
2. Re‑run Exercise 2 and compare label differences.

*Reflection* Add a paragraph in `lab3.md` on how few‑shot examples affected results.

---

#### Exercise 4 Batch processing API route
**Goal** Create a new POST `/api/classify/batch` that accepts an array of strings and returns an array of JSON labels.

1. Use `classifier.batch` behind the scenes.
2. Preserve the indivi­dual order of inputs in the output array.
3. Add basic error handling for empty items.

*Deliverable* Postman (or curl) command plus sample response in `lab4.md`.

---

#### Exercise 5 Multi‑label topic tagging
**Goal** Tag each passage with **all** applicable topics: `billing`, `bug`, `feature`, `praise`.

1. Modify the schema so `topics` is an array of those strings (enum).
2. Update the prompt: “Return an array named topics containing every matching category.”
3. Classify the same ten tickets from Exercise 2.

*Stretch* Compute precision and recall versus an answer key provided by the instructor.

---

### Submission checklist
| ✔ | Item |
|---|------|
|  | `classification‑lab` branch pushed to GitHub. |
|  | `lab1.md` — sentiment results. |
|  | `urgency_results.json` and chart image. |
|  | `lab3.md` reflection. |
|  | `lab4.md` batch route demo. |
|  | `lab5_topics.json` plus metrics if stretch completed. |

Complete any three exercises for a pass; all five for full credit.
