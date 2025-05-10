# Minimal RAG System Exercises

This set of exercises will guide you through building a minimal Retrieval-Augmented Generation (RAG) system with streaming responses. Each exercise builds upon the previous one, gradually introducing more complex features and optimizations.

## Exercise 1: Basic RAG Setup

### Task
Create a basic RAG system that can load documents and perform simple retrieval.

### Requirements
1. Set up the language model and embeddings
2. Create a vector store
3. Implement document loading and splitting
4. Add basic retrieval functionality

### Example Usage
```typescript
// Initialize the system
const rag = new BasicRAG({
  model: "gpt-4o-mini",
  embeddings: "text-embedding-3-large"
});

// Load and process documents
await rag.loadDocuments("https://example.com/article");

// Perform retrieval
const results = await rag.retrieve("What is the main topic?");
```

### Hints
- Use `CheerioWebBaseLoader` for document loading
- Implement proper chunk sizing
- Handle document metadata

### Submission Guidelines
- Submit a TypeScript file with the implementation
- Include error handling
- Document your code
- Add usage examples

### Evaluation Criteria
- Code organization
- Error handling
- Documentation
- Performance considerations

## Exercise 2: RAG Pipeline Implementation

### Task
Implement the core RAG pipeline with state management and prompt templates.

### Requirements
1. Set up state annotations
2. Implement the retrieval node
3. Create the generation node
4. Add prompt template handling

### Example Usage
```typescript
const pipeline = new RAGPipeline({
  promptTemplate: "rlm/rag-prompt",
  stateConfig: {
    question: "string",
    context: "Document[]",
    answer: "string"
  }
});

const result = await pipeline.process("What are the key concepts?");
```

### Hints
- Use `Annotation.Root` for state management
- Implement proper type safety
- Handle prompt formatting

### Submission Guidelines
- Submit the pipeline implementation
- Include state management code
- Add type definitions
- Document the workflow

### Evaluation Criteria
- Type safety
- State management
- Code organization
- Documentation

## Exercise 3: Graph Implementation

### Task
Create a graph-based workflow for the RAG system.

### Requirements
1. Implement the state graph
2. Add node connections
3. Handle graph compilation
4. Implement error handling

### Example Usage
```typescript
const graph = new RAGGraph()
  .addNode("retrieve", retrieveNode)
  .addNode("generate", generateNode)
  .addEdge("__start__", "retrieve")
  .addEdge("retrieve", "generate")
  .addEdge("generate", "__end__")
  .compile();

const result = await graph.process("What is the summary?");
```

### Hints
- Use `StateGraph` for implementation
- Handle node connections properly
- Implement proper error handling

### Submission Guidelines
- Submit the graph implementation
- Include node definitions
- Add edge handling
- Document the workflow

### Evaluation Criteria
- Graph implementation
- Error handling
- Code organization
- Documentation

## Exercise 4: Streaming Implementation

### Task
Implement streaming responses for the RAG system.

### Requirements
1. Create a streaming interface
2. Handle different chunk types
3. Implement error handling
4. Add progress feedback

### Example Usage
```typescript
const stream = await rag.stream("What are the main points?");

for await (const chunk of stream) {
  if (chunk.type === "question") {
    console.log("Processing question:", chunk.content);
  } else if (chunk.type === "context") {
    console.log("Retrieved context:", chunk.content);
  } else if (chunk.type === "answer") {
    console.log("Generated answer:", chunk.content);
  }
}
```

### Hints
- Use `ReadableStream` for implementation
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
- Progress feedback
- Documentation

## Exercise 5: Advanced Features

### Task
Add advanced features to the RAG system.

### Requirements
1. Implement caching
2. Add performance monitoring
3. Implement error recovery
4. Add response formatting

### Example Usage
```typescript
const advancedRAG = new AdvancedRAG({
  cache: new LRUCache(1000),
  monitoring: new PerformanceMonitor(),
  errorRecovery: new ErrorRecovery(),
  formatter: new ResponseFormatter()
});

const result = await advancedRAG.process("What is the analysis?");
```

### Hints
- Implement proper caching
- Add performance metrics
- Handle error recovery
- Format responses

### Submission Guidelines
- Submit the advanced features implementation
- Include caching logic
- Add monitoring code
- Document the features

### Evaluation Criteria
- Feature implementation
- Performance optimization
- Error handling
- Documentation

## Final Project

### Task
Create a complete RAG system that combines all previous exercises.

### Requirements
1. Combine all previous implementations
2. Add comprehensive error handling
3. Implement performance optimization
4. Add documentation

### Example Usage
```typescript
const completeRAG = new CompleteRAG({
  model: "gpt-4o-mini",
  embeddings: "text-embedding-3-large",
  cache: new LRUCache(1000),
  monitoring: new PerformanceMonitor()
});

const stream = await completeRAG.process("What is the comprehensive analysis?");
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

- [LangChain Documentation](https://js.langchain.com/docs/)
- [OpenAI API Documentation](https://platform.openai.com/docs/)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions)
- [Streams API](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API) 