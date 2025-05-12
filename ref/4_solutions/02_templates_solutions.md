# LangChain Templates Solutions

This document provides reference solutions for the LangChain templates exercises. Each solution includes explanations and best practices.

## Exercise 1: Template Diagnosis

### Issues Found in Original Templates

1. **International Answer Template**
```typescript
// Original
const template1 = `You are a helpful assistant.
Answer the user in {language}.`;

// Issues:
// - No role definition
// - No language fallback
// - No output structure
// - No error handling
```

2. **Word Count Template**
```typescript
// Original
const template2 = `Use exactly {words} words.
Explain: {concept}`;

// Issues:
// - No validation for word count
// - No structure for explanation
// - No error handling for invalid counts
// - No formatting guidelines
```

3. **JSON Output Template**
```typescript
// Original
const template3 = `Return JSON with keys "term" and "definition".
Term: {term}`;

// Issues:
// - No schema validation
// - No error handling
// - No example format
// - No type definitions
```

4. **Tone Management Template**
```typescript
// Original
const template4 = `Be sarcastic and professional at the same time.
Comment on: {topic}`;

// Issues:
// - Conflicting tone requirements
// - No clear structure
// - No context guidelines
// - No formatting rules
```

## Exercise 2: International Answer Template

```typescript
const improvedTemplate = `
You are a multilingual assistant specializing in clear, concise responses.
Your task is to provide a single-sentence answer in the specified language.
If no language is specified, default to English.

Language: {language || "English"}
Question: {question}

Response Format:
1. Single sentence answer
2. No additional context
3. Clear and concise
4. Natural language flow
`;
```

**Key Improvements**:
- Clear role definition
- Language fallback
- Output structure
- Error prevention

## Exercise 3: Word Count Control

```typescript
const improvedTemplate = `
You are a precise content writer who must adhere to strict word counts.
Your response must be exactly {words} words, with no more than 3% deviation.
After writing, count your words and adjust if necessary.

Concept to explain: {concept}
Target word count: {words}

Response Format:
1. Main explanation ({words * 0.8} words)
2. Supporting details ({words * 0.2} words)
3. Word count verification
4. Adjustment if needed
`;
```

**Key Improvements**:
- Word count validation
- Structured response
- Automatic adjustment
- Clear formatting

## Exercise 4: Structured JSON Output

```typescript
const improvedTemplate = `
You are a technical documentation expert.
Your response must be a valid JSON object with the following structure:
{
  "term": string,
  "definition": string,
  "example": string,
  "relatedTerms": string[]
}

Any malformed JSON will be rejected by the system.

Term to define: {term}

Validation Rules:
1. All fields must be present
2. Strings must be non-empty
3. Arrays must contain at least one item
4. No nested objects allowed
`;
```

**Key Improvements**:
- Clear schema definition
- Validation rules
- Error prevention
- Type safety

## Exercise 5: Tone Management

```typescript
const professionalTemplate = `
You are a professional business consultant.
Provide a formal, objective analysis of the topic.
Use industry-standard terminology and maintain a serious tone.

Topic: {topic}

Response Format:
1. Executive Summary
2. Key Points
3. Recommendations
4. Implementation Steps
`;

const sarcasticTemplate = `
You are a witty commentator.
Provide humorous, satirical commentary on the topic.
Use irony and wit while maintaining professionalism.

Topic: {topic}

Response Format:
1. Opening Hook
2. Main Commentary
3. Witty Conclusion
4. Professional Note
`;
```

**Key Improvements**:
- Separate tone templates
- Clear structure
- Consistent style
- Professional boundaries

## Exercise 6: Technical Acronym Translation

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

Response Format:
1. Full name
2. Brief explanation
3. Common use case
4. Technical context
`;
```

**Key Improvements**:
- Clear examples
- Consistent format
- Context inclusion
- Word limit enforcement

## Best Practices

1. **Template Structure**
   - Clear role definition
   - Explicit requirements
   - Consistent formatting
   - Error handling

2. **Variable Handling**
   - Default values
   - Type validation
   - Error messages
   - Fallback options

3. **Output Format**
   - Clear structure
   - Example outputs
   - Validation rules
   - Format guidelines

4. **Error Prevention**
   - Input validation
   - Output verification
   - Error messages
   - Recovery options

5. **Documentation**
   - Clear examples
   - Usage guidelines
   - Limitations
   - Best practices

## Common Pitfalls to Avoid

1. **Vague Instructions**
   - Be specific about requirements
   - Provide clear examples
   - Define success criteria

2. **Inconsistent Formatting**
   - Maintain consistent structure
   - Use clear separators
   - Follow style guidelines

3. **Missing Validation**
   - Validate inputs
   - Check outputs
   - Handle errors
   - Provide feedback

4. **Poor Error Handling**
   - Define error cases
   - Provide recovery options
   - Include error messages
   - Log issues

5. **Unclear Boundaries**
   - Set clear limits
   - Define scope
   - Specify constraints
   - Document assumptions 