# LangChain Templates Exercises

These exercises will help you practice and master the art of crafting effective LangChain templates. You'll learn how to create, diagnose, and improve templates for different use cases.

## Prerequisites

Before starting, ensure you have the following server action scaffold:

```typescript
export async function runTemplate(
  prompt: ChatPromptTemplate,
  vars: Record<string, any>
): Promise<string> {
  const chain = prompt.pipe(model).pipe(new StringOutputParser());
  return await chain.invoke(vars);
}
```

## Exercise 1: Template Diagnosis
**Difficulty**: Intermediate
**Time**: 20-30 minutes

Analyze and identify issues in the following templates:

```typescript
// Template 1: International Answer
const template1 = `You are a helpful assistant.
Answer the user in {language}.`;

// Template 2: Word Count
const template2 = `Use exactly {words} words.
Explain: {concept}`;

// Template 3: JSON Output
const template3 = `Return JSON with keys "term" and "definition".
Term: {term}`;

// Template 4: Tone Management
const template4 = `Be sarcastic and professional at the same time.
Comment on: {topic}`;
```

**Tasks**:
1. Run each template using the provided `runTemplate` function
2. Identify at least two issues per template
3. Document the specific output tokens that demonstrate these issues

**Learning Objectives**:
- Template structure analysis
- Variable handling
- Output format validation
- Tone consistency

## Exercise 2: International Answer Template
**Difficulty**: Intermediate
**Time**: 25-35 minutes

Improve the international answer template to:
1. Clearly define the assistant's role
2. Enforce single-sentence output
3. Implement language fallback

```typescript
// Original template
const originalTemplate = `You are a helpful assistant.
Answer the user in {language}.`;

// Your improved template here
const improvedTemplate = `
You are a multilingual assistant specializing in clear, concise responses.
Your task is to provide a single-sentence answer in the specified language.
If no language is specified, default to English.

Language: {language || "English"}
Question: {question}
`;
```

**Success Criteria**:
- Output is exactly one sentence
- Language defaults to English if omitted
- Maintains consistent tone across languages

## Exercise 3: Word Count Control
**Difficulty**: Advanced
**Time**: 30-40 minutes

Create a template that strictly enforces word count limits:

```typescript
// Original template
const originalTemplate = `Use exactly {words} words.
Explain: {concept}`;

// Your improved template here
const improvedTemplate = `
You are a precise content writer who must adhere to strict word counts.
Your response must be exactly {words} words, with no more than 3% deviation.
After writing, count your words and adjust if necessary.

Concept to explain: {concept}
Target word count: {words}
`;
```

**Success Criteria**:
- Word count within 3% of target
- Consistent across multiple concepts
- Maintains clarity despite length constraint

## Exercise 4: Structured JSON Output
**Difficulty**: Intermediate
**Time**: 25-35 minutes

Develop a template that guarantees valid JSON output:

```typescript
// Original template
const originalTemplate = `Return JSON with keys "term" and "definition".
Term: {term}`;

// Your improved template here
const improvedTemplate = `
You are a technical documentation expert.
Your response must be a valid JSON object with the following structure:
{
  "term": string,
  "definition": string,
  "example": string
}

Any malformed JSON will be rejected by the system.

Term to define: {term}
`;
```

**Success Criteria**:
- Output always parses as valid JSON
- Contains all required fields
- Maintains consistent structure

## Exercise 5: Tone Management
**Difficulty**: Advanced
**Time**: 30-40 minutes

Create separate templates for different tones:

```typescript
// Original template
const originalTemplate = `Be sarcastic and professional at the same time.
Comment on: {topic}`;

// Your improved templates here
const professionalTemplate = `
You are a professional business consultant.
Provide a formal, objective analysis of the topic.
Use industry-standard terminology and maintain a serious tone.

Topic: {topic}
`;

const sarcasticTemplate = `
You are a witty commentator.
Provide humorous, satirical commentary on the topic.
Use irony and wit while maintaining professionalism.

Topic: {topic}
`;
```

**Success Criteria**:
- Clear distinction between tones
- Consistent style within each template
- Appropriate for business context

## Exercise 6: Technical Acronym Translation
**Difficulty**: Intermediate
**Time**: 25-35 minutes

Create a few-shot template for technical acronym translation:

```typescript
const acronymTemplate = `
You are a technical translator specializing in acronyms.
Translate the following technical acronyms into plain English:

Example 1:
Acronym: "RAG"
Translation: "Retrieval-Augmented Generation, a technique that enhances AI responses by retrieving relevant information from a knowledge base."

Example 2:
Acronym: "RPC"
Translation: "Remote Procedure Call, a protocol that allows a program to execute code on another computer as if it were local."

Now translate this acronym:
Acronym: {acronym}
`;
```

**Success Criteria**:
- Clear, concise translations
- Consistent format
- Under 35 words per translation
- Includes practical context

## Submission Guidelines

For each exercise:
1. Create a new branch in your repository
2. Implement your improved templates
3. Test with various input variables
4. Document your improvements and reasoning
5. Create a pull request with your solution

## Evaluation Criteria

Your solutions will be evaluated based on:
- Template clarity and specificity
- Variable handling
- Output consistency
- Error prevention
- Educational value

## Resources

- [LangChain Prompt Templates](https://js.langchain.com/docs/modules/model_io/prompts/)
- [Prompt Engineering Guide](https://www.promptingguide.ai/)
- [JSON Schema Validation](https://json-schema.org/)
- [Technical Writing Guidelines](https://developers.google.com/tech-writing)
