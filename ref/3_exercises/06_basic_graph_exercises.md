# Basic Graph Exercises

This set of exercises will guide you through building and extending a basic graph system using LangGraph. Each exercise builds upon the previous one, gradually introducing more complex features and optimizations.

## Exercise 1: Basic Graph Setup

### Task
Create a basic graph with a single node that modifies state.

### Requirements
1. Set up the state annotation
2. Create a basic node
3. Implement the graph structure
4. Add basic error handling

### Example Usage
```typescript
const graph = new BasicGraph({
  initialState: "Hello"
});

const result = await graph.process();
// Expected output: "Hello World!"
```

### Hints
- Use `Annotation.Root` for state
- Implement proper typing
- Handle state immutability

### Submission Guidelines
- Submit a TypeScript file
- Include error handling
- Document your code
- Add usage examples

### Evaluation Criteria
- Code organization
- Error handling
- Documentation
- Type safety

## Exercise 2: Multiple Nodes

### Task
Extend the basic graph to include multiple nodes with different behaviors.

### Requirements
1. Add multiple nodes
2. Implement node connections
3. Handle state transitions
4. Add logging

### Example Usage
```typescript
const graph = new MultiNodeGraph({
  nodes: ["greeting", "action", "response"]
});

const result = await graph.process("Hi");
// Expected output: "Hi! How are you? I'm doing well!"
```

### Hints
- Use `StateGraph` for implementation
- Handle node connections properly
- Implement proper logging

### Submission Guidelines
- Submit the multi-node implementation
- Include node definitions
- Add connection handling
- Document the workflow

### Evaluation Criteria
- Node implementation
- Connection handling
- Logging
- Documentation

## Exercise 3: Conditional Logic

### Task
Implement conditional logic in the graph to create different paths.

### Requirements
1. Add decision nodes
2. Implement conditional edges
3. Handle different paths
4. Add path tracking

### Example Usage
```typescript
const graph = new ConditionalGraph({
  conditions: ["positive", "negative"]
});

const result = await graph.process("Hello");
// Possible outputs:
// "Hello! That's great!"
// "Hello! I'm sorry to hear that."
```

### Hints
- Use `addConditionalEdges`
- Implement decision logic
- Track path history

### Submission Guidelines
- Submit the conditional implementation
- Include decision logic
- Add path tracking
- Document the workflow

### Evaluation Criteria
- Conditional logic
- Path handling
- State management
- Documentation

## Exercise 4: Streaming Implementation

### Task
Implement streaming responses for the graph system.

### Requirements
1. Create streaming interface
2. Handle different chunk types
3. Implement progress tracking
4. Add error handling

### Example Usage
```typescript
const stream = await graph.stream("Hello");

for await (const chunk of stream) {
  if (chunk.type === "greeting") {
    console.log("Processing greeting:", chunk.content);
  } else if (chunk.type === "response") {
    console.log("Processing response:", chunk.content);
  }
}
```

### Hints
- Use `ReadableStream`
- Handle different chunk types
- Implement proper error handling
- Add progress indicators

### Submission Guidelines
- Submit the streaming implementation
- Include chunk handling
- Add error handling
- Document the streaming process

### Evaluation Criteria
- Streaming implementation
- Error handling
- Progress tracking
- Documentation

## Exercise 5: Advanced Features

### Task
Add advanced features to the graph system.

### Requirements
1. Implement state validation
2. Add performance monitoring
3. Implement error recovery
4. Add response formatting

### Example Usage
```typescript
const graph = new AdvancedGraph({
  validation: true,
  monitoring: true,
  errorRecovery: true,
  formatting: true
});

const result = await graph.process("Hello");
// Output includes performance metrics and formatted response
```

### Hints
- Implement state validation
- Add performance tracking
- Handle error recovery
- Format responses

### Submission Guidelines
- Submit the advanced features implementation
- Include validation logic
- Add monitoring code
- Document the features

### Evaluation Criteria
- Feature implementation
- Performance optimization
- Error handling
- Documentation

## Final Project

### Task
Create a complete graph system that combines all previous exercises.

### Requirements
1. Combine all previous implementations
2. Add comprehensive error handling
3. Implement performance optimization
4. Add documentation

### Example Usage
```typescript
const graph = new CompleteGraph({
  validation: true,
  monitoring: true,
  errorRecovery: true,
  formatting: true
});

const stream = await graph.process("Hello");
// Process stream with all features enabled
```

### Hints
- Combine all previous implementations
- Add comprehensive error handling
- Implement performance optimization
- Add thorough documentation

### Submission Guidelines
- Submit the complete implementation
- Include all features
- Add comprehensive documentation
- Include usage examples

### Evaluation Criteria
- Complete implementation
- Error handling
- Performance optimization
- Documentation
- Code organization

## Resources

- [LangGraph Documentation](https://js.langchain.com/docs/modules/agents/agent_types/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Streams API](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions) 