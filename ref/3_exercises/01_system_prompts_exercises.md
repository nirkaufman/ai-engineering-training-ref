# System Prompts Exercises

These exercises will help you practice and deepen your understanding of crafting effective system prompts for different use cases. Each exercise presents a problematic system prompt that you'll need to improve.

## Exercise 1: Structured Output Formatting
**Difficulty**: Intermediate
**Time**: 20-30 minutes

Improve a system prompt to ensure proper JSON output formatting:
1. Define clear output structure
2. Specify required fields
3. Add validation rules
4. Handle edge cases

```typescript
// Original problematic prompt
const badPrompt = `You know JSON. Just give me what I need.`;

// User prompt to test with
const userPrompt = `Produce a deployment checklist for zero-downtime releases.`;

// Your improved system prompt here
const improvedPrompt = `
You are a deployment automation expert. Your responses must:
1. Always be in valid JSON format
2. Include a 'checklist' array of required steps
3. Each step should have 'id', 'description', and 'critical' fields
4. Include a 'metadata' object with 'estimatedTime' and 'riskLevel'
`;
```

**Learning Objectives**:
- Understanding JSON structure requirements
- Defining clear output constraints
- Handling structured data
- Implementing validation rules

## Exercise 2: Medical Response Guidelines
**Difficulty**: Intermediate
**Time**: 25-35 minutes

Create a system prompt for medical advice that:
1. Maintains professional tone
2. Includes safety disclaimers
3. Provides appropriate guidance
4. Handles emergency situations

```typescript
// Original problematic prompt
const badPrompt = `Be a doctor and help people quickly. Use casual language but stay super formal too. 
Give any advice they ask for.`;

// User prompt to test with
const userPrompt = `I have chest pain—what should I do?`;

// Your improved system prompt here
const improvedPrompt = `
You are a medical information assistant. You must:
1. Always begin with a safety disclaimer
2. Use clear, professional language
3. Provide general information only
4. Direct to emergency services when appropriate
5. Never make specific diagnoses
`;
```

**Learning Objectives**:
- Balancing professional and accessible language
- Implementing safety protocols
- Handling sensitive topics
- Managing user expectations

## Exercise 3: Multilingual Support
**Difficulty**: Intermediate
**Time**: 20-30 minutes

Develop a system prompt for language learning that:
1. Provides accurate translations
2. Includes pronunciation guides
3. Offers cultural context
4. Maintains consistent format

```typescript
// Original problematic prompt
const badPrompt = `Teach vocabulary in different languages however you like. Be creative and fun!`;

// User prompt to test with
const userPrompt = `What is the word for "freedom" in Hebrew?`;

// Your improved system prompt here
const improvedPrompt = `
You are a language learning assistant. For each translation request:
1. Provide the word in the target language
2. Include phonetic pronunciation
3. Add example usage
4. Note any cultural significance
5. Format consistently with headers
`;
```

**Learning Objectives**:
- Structuring language learning content
- Providing cultural context
- Maintaining consistent formatting
- Handling multiple languages

## Exercise 4: Legal Document Analysis
**Difficulty**: Advanced
**Time**: 30-40 minutes

Create a system prompt for legal case summaries that:
1. Maintains accuracy
2. Includes proper citations
3. Provides clear structure
4. Handles complex legal concepts

```typescript
// Original problematic prompt
const badPrompt = `Summarize GDPR court cases but don't be too long and also be thorough.  
You can add or skip citations as you feel.`;

// User prompt to test with
const userPrompt = `Summarize the key points of the Schrems II ruling.`;

// Your improved system prompt here
const improvedPrompt = `
You are a legal document analyst. Your summaries must:
1. Begin with case identification
2. Include all relevant citations
3. Structure in sections: Background, Ruling, Impact
4. Use precise legal terminology
5. Maintain objective tone
`;
```

**Learning Objectives**:
- Legal document analysis
- Citation management
- Complex information structuring
- Professional tone maintenance

## Exercise 5: Content Age Appropriateness
**Difficulty**: Intermediate
**Time**: 25-35 minutes

Develop a system prompt for age-appropriate content that:
1. Maintains appropriate tone
2. Adjusts content for age groups
3. Handles sensitive topics
4. Provides educational value

```typescript
// Original problematic prompt
const badPrompt = `Tell kids a fairy tale but make it gritty, dark, and PG-18 realistic. Keep it light-hearted.`;

// User prompt to test with
const userPrompt = `Tell me a bedtime story about dragons.`;

// Your improved system prompt here
const improvedPrompt = `
You are a children's storyteller. Your stories must:
1. Be appropriate for the target age group
2. Include positive messages
3. Use age-appropriate vocabulary
4. Maintain engaging narrative
5. Avoid sensitive or scary content
`;
```

**Learning Objectives**:
- Age-appropriate content creation
- Balancing engagement and safety
- Managing sensitive topics
- Educational content development

## Exercise 6: Educational Content
**Difficulty**: Intermediate
**Time**: 25-35 minutes

Create a system prompt for educational content that:
1. Provides clear explanations
2. Shows step-by-step solutions
3. Includes examples
4. Maintains educational value

```typescript
// Original problematic prompt
const badPrompt = `Solve the math problem instantly. Show no steps, but include all steps so learners understand.`;

// User prompt to test with
const userPrompt = `What is the integral of x² dx from 0 to 3?`;

// Your improved system prompt here
const improvedPrompt = `
You are a mathematics tutor. Your solutions must:
1. Show all steps clearly
2. Explain each step
3. Include relevant formulas
4. Provide final answer
5. Add practice problems
`;
```

**Learning Objectives**:
- Educational content structuring
- Step-by-step explanation
- Mathematical notation
- Learning reinforcement

## Exercise 7: Code Documentation
**Difficulty**: Intermediate
**Time**: 20-30 minutes

Develop a system prompt for code documentation that:
1. Provides clear explanations
2. Includes examples
3. Follows best practices
4. Maintains consistent style

```typescript
// Original problematic prompt
const badPrompt = `Write some code to sort numbers however you like. Keep it short, maybe some explanation.`;

// User prompt to test with
const userPrompt = `Provide a quick function to sort an array of numbers in ascending order.`;

// Your improved system prompt here
const improvedPrompt = `
You are a code documentation expert. Your responses must:
1. Include clear function documentation
2. Provide usage examples
3. Explain time/space complexity
4. Follow language best practices
5. Include error handling
`;
```

**Learning Objectives**:
- Code documentation standards
- Example implementation
- Best practices adherence
- Error handling

## Exercise 8: Technical Summarization
**Difficulty**: Advanced
**Time**: 30-40 minutes

Create a system prompt for technical paper summaries that:
1. Maintains technical accuracy
2. Provides clear structure
3. Includes key concepts
4. Handles complex topics

```typescript
// Original problematic prompt
const badPrompt = `Summarize this research paper in detail but also keep it very short and not too technical yet still scientific. Citations optional.`;

// User prompt to test with
const userPrompt = `Summarize "Attention Is All You Need".`;

// Your improved system prompt here
const improvedPrompt = `
You are a technical paper summarizer. Your summaries must:
1. Begin with paper identification
2. Include all relevant citations
3. Structure in sections: Abstract, Key Concepts, Methodology, Results
4. Use appropriate technical terminology
5. Maintain scientific accuracy
`;
```

**Learning Objectives**:
- Technical content summarization
- Citation management
- Complex concept explanation
- Scientific accuracy

## Submission Guidelines

For each exercise:
1. Create a new branch in your repository
2. Implement your improved system prompt
3. Test with the provided user prompt
4. Document your improvements and reasoning
5. Create a pull request with your solution

## Evaluation Criteria

Your solutions will be evaluated based on:
- Clarity and specificity
- Appropriate tone and style
- Handling of edge cases
- Consistency in formatting
- Educational value

## Resources

- [OpenAI System Prompt Best Practices](https://platform.openai.com/docs/guides/prompt-engineering)
- [LangChain Prompt Templates](https://js.langchain.com/docs/modules/model_io/prompts/)
- [Prompt Engineering Guide](https://www.promptingguide.ai/)
- [Technical Writing Guidelines](https://developers.google.com/tech-writing)
