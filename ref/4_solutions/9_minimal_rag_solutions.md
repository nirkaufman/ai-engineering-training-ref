# Minimal RAG System Solutions

This document provides comprehensive solutions for the minimal RAG system exercises, including detailed implementations, explanations, and best practices.

## Exercise 1: Basic RAG Setup

### Solution Implementation

```typescript
import { ChatOpenAI } from "@langchain/openai";
import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";

class BasicRAG {
  private llm: ChatOpenAI;
  private embeddings: OpenAIEmbeddings;
  private vectorStore: MemoryVectorStore;

  constructor(config: { model: string; embeddings: string }) {
    this.llm = new ChatOpenAI({
      model: config.model,
      temperature: 0
    });

    this.embeddings = new OpenAIEmbeddings({
      model: config.embeddings
    });

    this.vectorStore = new MemoryVectorStore(this.embeddings);
  }

  async loadDocuments(url: string): Promise<void> {
    try {
      const loader = new CheerioWebBaseLoader(url, {
        selector: "p"
      });

      const docs = await loader.load();
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200
      });

      const splits = await splitter.splitDocuments(docs);
      await this.vectorStore.addDocuments(splits);
    } catch (error) {
      console.error("Error loading documents:", error);
      throw new Error("Failed to load documents");
    }
  }

  async retrieve(query: string): Promise<Document[]> {
    try {
      return await this.vectorStore.similaritySearch(query, 3);
    } catch (error) {
      console.error("Error retrieving documents:", error);
      throw new Error("Failed to retrieve documents");
    }
  }
}
```

### Key Features
- Type-safe implementation
- Error handling
- Configurable models
- Document processing
- Vector store integration

### Usage Example
```typescript
const rag = new BasicRAG({
  model: "gpt-4o-mini",
  embeddings: "text-embedding-3-large"
});

try {
  await rag.loadDocuments("https://example.com/article");
  const results = await rag.retrieve("What is the main topic?");
  console.log(results);
} catch (error) {
  console.error("Error:", error);
}
```

## Exercise 2: RAG Pipeline Implementation

### Solution Implementation

```typescript
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { Annotation } from "@langchain/langgraph";
import { Document } from "@langchain/core/documents";

class RAGPipeline {
  private promptTemplate: ChatPromptTemplate;
  private stateConfig: {
    question: string;
    context: Document[];
    answer: string;
  };

  constructor(config: {
    promptTemplate: string;
    stateConfig: {
      question: string;
      context: string;
      answer: string;
    };
  }) {
    this.stateConfig = config.stateConfig;
    this.initializePromptTemplate(config.promptTemplate);
  }

  private async initializePromptTemplate(templateName: string) {
    try {
      this.promptTemplate = await pull<ChatPromptTemplate>(templateName);
    } catch (error) {
      console.error("Error loading prompt template:", error);
      throw new Error("Failed to initialize prompt template");
    }
  }

  async process(question: string) {
    try {
      const state = {
        question,
        context: [],
        answer: ""
      };

      const messages = await this.promptTemplate.formatMessages({
        question: state.question,
        context: state.context.map(doc => doc.pageContent).join("\n")
      });

      return messages;
    } catch (error) {
      console.error("Error processing question:", error);
      throw new Error("Failed to process question");
    }
  }
}
```

### Key Features
- State management
- Prompt template handling
- Type safety
- Error handling

### Usage Example
```typescript
const pipeline = new RAGPipeline({
  promptTemplate: "rlm/rag-prompt",
  stateConfig: {
    question: "string",
    context: "Document[]",
    answer: "string"
  }
});

try {
  const result = await pipeline.process("What are the key concepts?");
  console.log(result);
} catch (error) {
  console.error("Error:", error);
}
```

## Exercise 3: Graph Implementation

### Solution Implementation

```typescript
import { StateGraph } from "@langchain/langgraph";
import { Annotation } from "@langchain/langgraph";

class RAGGraph {
  private graph: StateGraph;
  private stateAnnotation: any;

  constructor() {
    this.initializeStateAnnotation();
    this.initializeGraph();
  }

  private initializeStateAnnotation() {
    this.stateAnnotation = Annotation.Root({
      question: Annotation<string>,
      context: Annotation<Document[]>,
      answer: Annotation<string>
    });
  }

  private initializeGraph() {
    this.graph = new StateGraph(this.stateAnnotation)
      .addNode("retrieve", this.retrieveNode)
      .addNode("generate", this.generateNode)
      .addEdge("__start__", "retrieve")
      .addEdge("retrieve", "generate")
      .addEdge("generate", "__end__")
      .compile();
  }

  private retrieveNode = async (state: any) => {
    try {
      const retrievedDocs = await this.vectorStore.similaritySearch(state.question);
      return { context: retrievedDocs };
    } catch (error) {
      console.error("Error in retrieve node:", error);
      throw new Error("Failed to retrieve documents");
    }
  };

  private generateNode = async (state: any) => {
    try {
      const docsContent = state.context.map((doc: Document) => doc.pageContent).join("\n");
      const messages = await this.promptTemplate.invoke({
        question: state.question,
        context: docsContent
      });
      const response = await this.llm.invoke(messages);
      return { answer: response.content };
    } catch (error) {
      console.error("Error in generate node:", error);
      throw new Error("Failed to generate response");
    }
  };

  async process(question: string) {
    try {
      return await this.graph.invoke({ question });
    } catch (error) {
      console.error("Error processing question:", error);
      throw new Error("Failed to process question");
    }
  }
}
```

### Key Features
- Graph-based workflow
- State management
- Error handling
- Type safety

### Usage Example
```typescript
const graph = new RAGGraph();

try {
  const result = await graph.process("What is the summary?");
  console.log(result);
} catch (error) {
  console.error("Error:", error);
}
```

## Exercise 4: Streaming Implementation

### Solution Implementation

```typescript
class StreamingRAG {
  private rag: BasicRAG;
  private pipeline: RAGPipeline;
  private graph: RAGGraph;

  constructor() {
    this.rag = new BasicRAG({
      model: "gpt-4o-mini",
      embeddings: "text-embedding-3-large"
    });
    this.pipeline = new RAGPipeline({
      promptTemplate: "rlm/rag-prompt",
      stateConfig: {
        question: "string",
        context: "Document[]",
        answer: "string"
      }
    });
    this.graph = new RAGGraph();
  }

  async stream(question: string) {
    return new ReadableStream({
      async start(controller) {
        try {
          const stream = await this.graph.stream({ question }, {
            streamMode: 'updates'
          });

          for await (const chunk of stream) {
            if (chunk.question) {
              controller.enqueue({
                type: "question",
                content: chunk.question
              });
            } else if (chunk.retrieve?.context) {
              controller.enqueue({
                type: "context",
                content: chunk.retrieve.context
              });
            } else if (chunk.generate?.answer) {
              controller.enqueue({
                type: "answer",
                content: chunk.generate.answer
              });
            }
          }

          controller.close();
        } catch (error) {
          console.error("Error in stream:", error);
          controller.error(error);
        }
      }
    });
  }
}
```

### Key Features
- Streaming implementation
- Chunk handling
- Error handling
- Progress feedback

### Usage Example
```typescript
const streamingRAG = new StreamingRAG();

try {
  const stream = await streamingRAG.stream("What are the main points?");
  const reader = stream.getReader();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    console.log(value);
  }
} catch (error) {
  console.error("Error:", error);
}
```

## Exercise 5: Advanced Features

### Solution Implementation

```typescript
class AdvancedRAG {
  private rag: StreamingRAG;
  private cache: LRUCache;
  private monitoring: PerformanceMonitor;
  private errorRecovery: ErrorRecovery;
  private formatter: ResponseFormatter;

  constructor(config: {
    cacheSize: number;
    monitoring: boolean;
    errorRecovery: boolean;
    formatting: boolean;
  }) {
    this.rag = new StreamingRAG();
    this.cache = new LRUCache(config.cacheSize);
    this.monitoring = new PerformanceMonitor();
    this.errorRecovery = new ErrorRecovery();
    this.formatter = new ResponseFormatter();
  }

  async process(question: string) {
    try {
      // Check cache
      const cachedResult = this.cache.get(question);
      if (cachedResult) {
        return cachedResult;
      }

      // Start monitoring
      this.monitoring.start();

      // Process with error recovery
      const result = await this.errorRecovery.execute(async () => {
        const stream = await this.rag.stream(question);
        return this.formatter.format(stream);
      });

      // Cache result
      this.cache.set(question, result);

      // End monitoring
      this.monitoring.end();

      return result;
    } catch (error) {
      console.error("Error in advanced processing:", error);
      throw new Error("Failed to process question");
    }
  }
}
```

### Key Features
- Caching
- Performance monitoring
- Error recovery
- Response formatting

### Usage Example
```typescript
const advancedRAG = new AdvancedRAG({
  cacheSize: 1000,
  monitoring: true,
  errorRecovery: true,
  formatting: true
});

try {
  const result = await advancedRAG.process("What is the analysis?");
  console.log(result);
} catch (error) {
  console.error("Error:", error);
}
```

## Final Project Solution

### Complete Implementation

```typescript
class CompleteRAG {
  private advancedRAG: AdvancedRAG;
  private config: {
    model: string;
    embeddings: string;
    cacheSize: number;
    monitoring: boolean;
    errorRecovery: boolean;
    formatting: boolean;
  };

  constructor(config: {
    model: string;
    embeddings: string;
    cacheSize: number;
    monitoring: boolean;
    errorRecovery: boolean;
    formatting: boolean;
  }) {
    this.config = config;
    this.initialize();
  }

  private initialize() {
    this.advancedRAG = new AdvancedRAG({
      cacheSize: this.config.cacheSize,
      monitoring: this.config.monitoring,
      errorRecovery: this.config.errorRecovery,
      formatting: this.config.formatting
    });
  }

  async process(question: string) {
    try {
      return await this.advancedRAG.process(question);
    } catch (error) {
      console.error("Error in complete RAG:", error);
      throw new Error("Failed to process question");
    }
  }
}
```

### Key Features
- Complete implementation
- Comprehensive error handling
- Performance optimization
- Documentation

### Usage Example
```typescript
const completeRAG = new CompleteRAG({
  model: "gpt-4o-mini",
  embeddings: "text-embedding-3-large",
  cacheSize: 1000,
  monitoring: true,
  errorRecovery: true,
  formatting: true
});

try {
  const stream = await completeRAG.process("What is the comprehensive analysis?");
  const reader = stream.getReader();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    console.log(value);
  }
} catch (error) {
  console.error("Error:", error);
}
```

## Best Practices

1. **Error Handling**
   - Use try-catch blocks
   - Provide meaningful error messages
   - Implement error recovery
   - Log errors properly

2. **Performance**
   - Implement caching
   - Monitor performance
   - Optimize document processing
   - Handle streaming efficiently

3. **Code Organization**
   - Use TypeScript
   - Follow SOLID principles
   - Implement proper interfaces
   - Document code thoroughly

4. **Testing**
   - Write unit tests
   - Test error cases
   - Test performance
   - Test streaming

## Common Pitfalls

1. **Memory Management**
   - Problem: Memory leaks in streaming
   - Solution: Proper cleanup
   - Best Practice: Use proper stream handling

2. **Error Recovery**
   - Problem: Unhandled errors
   - Solution: Implement recovery
   - Best Practice: Use error boundaries

3. **Performance**
   - Problem: Slow processing
   - Solution: Implement caching
   - Best Practice: Monitor performance

4. **Type Safety**
   - Problem: Type errors
   - Solution: Use TypeScript
   - Best Practice: Define proper types

## Resources

- [LangChain Documentation](https://js.langchain.com/docs/)
- [OpenAI API Documentation](https://platform.openai.com/docs/)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions)
- [Streams API](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API) 