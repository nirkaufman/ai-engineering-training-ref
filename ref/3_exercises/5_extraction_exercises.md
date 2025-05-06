# Extraction Exercises

These exercises will help you practice and deepen your understanding of implementing information extraction systems using LangChain and structured output.

## Exercise 1: Nested Entity Extraction
**Difficulty**: Intermediate
**Time**: 30-45 minutes

Extend the extraction system to handle nested entities and relationships. The system should:
1. Extract nested objects (e.g., address within person)
2. Handle relationships between entities
3. Support optional fields
4. Validate nested structures

```typescript
const nestedSchema = z.object({
  person: z.object({
    name: z.string(),
    address: z.object({
      street: z.string(),
      city: z.string(),
      country: z.string()
    }),
    contacts: z.array(z.object({
      type: z.string(),
      value: z.string()
    }))
  }),
  metadata: z.object({
    source: z.string(),
    confidence: z.number()
  })
});

// Your implementation here
class NestedEntityExtractor {
  // Add your code
}
```

**Learning Objectives**:
- Working with nested schemas
- Handling complex relationships
- Optional field management
- Nested validation

## Exercise 2: Temporal Information Extraction
**Difficulty**: Advanced
**Time**: 45-60 minutes

Implement a system that extracts and normalizes temporal information:
1. Extract dates, times, and durations
2. Normalize to standard formats
3. Handle relative time expressions
4. Support multiple time zones

```typescript
const temporalSchema = z.object({
  events: z.array(z.object({
    description: z.string(),
    startTime: z.string(),
    endTime: z.string().optional(),
    duration: z.string().optional(),
    timezone: z.string()
  })),
  relativeReferences: z.array(z.string())
});

// Your implementation here
class TemporalExtractor {
  // Add your code
}
```

**Learning Objectives**:
- Temporal information processing
- Date/time normalization
- Relative time handling
- Timezone management

## Exercise 3: Multi-Document Extraction
**Difficulty**: Advanced
**Time**: 60-90 minutes

Create a system that extracts information across multiple documents:
1. Handle cross-document references
2. Resolve entity conflicts
3. Merge related information
4. Track information sources

```typescript
interface CrossDocumentEntity {
  id: string;
  mentions: Array<{
    documentId: string;
    content: string;
    confidence: number;
  }>;
  resolvedContent: any;
  conflicts: Array<{
    type: string;
    resolution: string;
  }>;
}

class MultiDocumentExtractor {
  async extractAcrossDocuments(
    documents: Document[],
    options: ExtractionOptions
  ): Promise<CrossDocumentEntity[]> {
    // Your implementation
  }
}
```

**Learning Objectives**:
- Cross-document processing
- Entity resolution
- Conflict handling
- Source tracking

## Bonus Challenge: Adaptive Extraction
**Difficulty**: Expert
**Time**: 90-120 minutes

Implement an adaptive extraction system that:
1. Learns from user corrections
2. Adapts to domain-specific patterns
3. Improves extraction accuracy over time
4. Handles ambiguous cases

```typescript
interface ExtractionFeedback {
  extractionId: string;
  originalResult: any;
  correctedResult: any;
  confidence: number;
}

class AdaptiveExtractor {
  private feedbackHistory: ExtractionFeedback[];
  
  async extractWithLearning(
    text: string,
    domain: string
  ): Promise<ExtractionResult> {
    // Apply learned patterns
    // Handle ambiguities
    // Update learning model
  }
}
```

**Learning Objectives**:
- Implementing learning systems
- Pattern recognition
- Accuracy improvement
- Ambiguity resolution

## Submission Guidelines

For each exercise:
1. Create a new branch in your repository
2. Implement the solution
3. Add tests for your implementation
4. Document your approach and any challenges faced
5. Create a pull request with your solution

## Evaluation Criteria

Your solutions will be evaluated based on:
- Code quality and organization
- Error handling and edge cases
- Performance considerations
- Documentation and comments
- Test coverage

## Resources

- [LangChain Structured Output](https://js.langchain.com/docs/modules/model_io/output_parsers/structured)
- [Zod Documentation](https://zod.dev/)
- [Information Extraction Best Practices](https://js.langchain.com/docs/modules/model_io/output_parsers/structured)
- [Entity Resolution Techniques](https://en.wikipedia.org/wiki/Entity_resolution) 