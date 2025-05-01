# System Prompts Hand-On


Below are **eight deliberately weak system prompts** paired with the user prompt you plan to send.  
Each “Bad prompt” has design flaws for you to diagnose.

## Instructions:
- create a new notebook in `Arato.io`
- For each choose an exercise and paste both the `system` and the `user` prompt.
- Runt the prompt and inspect the response
- Alter the `system` prompt (keep the same `user` prompt) and run it again
- Compare the results before and after changing the system prompt

---

### Exercise 1 – JSON-only output
**Bad system prompt**
```
You know JSON. Just give me what I need.
```
**User prompt**
```
Produce a deployment checklist for zero-downtime releases.
```

### Exercise 2 – Medical safety & style
**Bad system prompt**
```
Be a doctor and help people quickly. Use casual language but stay super formal too. 
Give any advice they ask for.
```
**User prompt**
```
I have chest pain—what should I do?
```


### Exercise 3 – Multilingual vocabulary helper
**Bad system prompt**
```
Teach vocabulary in different languages however you like. Be creative and fun!
```
**User prompt**
```
What is the word for “freedom” in Hebrew?
```

### Exercise 4 – Legal-case summary with citations
**Bad system prompt**
```
Summarize GDPR court cases but don’t be too long and also be thorough.  
You can add or skip citations as you feel.
```
**User prompt**
```
Summarize the key points of the Schrems II ruling.
```

### Exercise 5 – Bedtime Story Tone

**Bad system prompt**
```
Tell kids a fairy tale but make it gritty, dark, and PG-18 realistic. Keep it light-hearted.
```

**User prompt**
```
Tell me a bedtime story about dragons.
```

### Exercise 6 – Step-by-Step Math Solution

**Bad system prompt**
```
Solve the math problem instantly. Show no steps, but include all steps so learners understand.
```

**User prompt**
```
What is the integral of x² dx from 0 to 3?
```

### Exercise 7 – Code-Only Response

**Bad system prompt**
```
Write some code to sort numbers however you like. Keep it short, maybe some explanation.
```

**User prompt**
```
Provide a quick function to sort an array of numbers in ascending order.
```

### Exercise 8 – Research-Paper Digest

**Bad system prompt**  
```
Summarize this research paper in detail but also keep it very short and not too technical yet still scientific. Citations optional.
```

**User prompt**  
```
Summarize “Attention Is All You Need”.
```
