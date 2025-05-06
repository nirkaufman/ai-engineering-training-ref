# Classification Exercises

These exercises will help you practice and deepen your understanding of implementing classification systems using LangChain and structured output.

## Exercise 1: Multi-Label Classification
**Difficulty**: Intermediate
**Time**: 30-45 minutes

Extend the classification system to support multiple labels for a single text. The system should:
1. Support multiple classification categories
2. Provide confidence scores for each label
3. Handle overlapping categories
4. Implement threshold-based filtering

```typescript
const multiLabelSchema = z.object({
  categories: z.array(z.object({
    name: z.string(),
    confidence: z.number(),
    explanation: z.string()
  })),
  overallConfidence: z.number()
});

// Your implementation here
class MultiLabelClassifier {
  // Add your code
}
```

**Learning Objectives**:
- Working with complex schemas
- Handling multiple classifications
- Confidence scoring
- Threshold management

## Exercise 2: Hierarchical Classification
**Difficulty**: Advanced
**Time**: 45-60 minutes

Implement a hierarchical classification system that:
1. Supports nested categories
2. Maintains parent-child relationships
3. Provides classification at different levels
4. Handles ambiguous classifications

```typescript
const hierarchicalSchema = z.object({
  mainCategory: z.string(),
  subCategories: z.array(z.object({
    name: z.string(),
    confidence: z.number(),
    subSubCategories: z.array(z.string()).optional()
  })),
  path: z.array(z.string())
});

// Your implementation here
class HierarchicalClassifier {
  // Add your code
}
```

**Learning Objectives**:
- Working with hierarchical data
- Managing nested classifications
- Handling classification ambiguity
- Path-based classification

## Exercise 3: Streaming Classification with Feedback
**Difficulty**: Advanced
**Time**: 60-90 minutes

Create a classification system that:
1. Streams intermediate results
2. Accepts user feedback
3. Adjusts classification based on feedback
4. Maintains classification history

```typescript
interface ClassificationFeedback {
  classificationId: string;
  isCorrect: boolean;
  suggestedCategory?: string;
  confidence: number;
}

class AdaptiveClassifier {
  async classifyWithFeedback(
    text: string,
    feedback?: ClassificationFeedback
  ): Promise<StreamingClassificationResult> {
    // Your implementation
  }
}
```

**Learning Objectives**:
- Implementing feedback loops
- Managing streaming state
- Adaptive classification
- History tracking

## Bonus Challenge: Ensemble Classification
**Difficulty**: Expert
**Time**: 90-120 minutes

Implement an ensemble classification system that:
1. Uses multiple models
2. Combines predictions
3. Handles model disagreements
4. Provides confidence intervals

```typescript
class EnsembleClassifier {
  private models: BaseClassifier[];

  async classify(text: string): Promise<EnsembleResult> {
    // Run multiple models
    // Combine results
    // Handle disagreements
    // Calculate confidence
  }
}
```

**Learning Objectives**:
- Working with multiple models
- Result aggregation
- Confidence calculation
- Disagreement resolution

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
- [Streaming Responses](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API)
- [Classification Best Practices](https://js.langchain.com/docs/modules/model_io/output_parsers/structured) 