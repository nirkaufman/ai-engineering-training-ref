# First Agent Implementation Solutions

This document provides solutions for the First Agent Implementation exercises, demonstrating best practices and implementation patterns for building agents with LangChain.

## Exercise 1: Basic Agent Setup

```typescript
import { TavilySearch } from "@langchain/tavily";
import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { HumanMessage } from "@langchain/core/messages";

export class BasicAgent {
  private agent: any;
  private model: ChatOpenAI;
  private tools: TavilySearch[];

  constructor() {
    // Initialize the language model
    this.model = new ChatOpenAI({
      temperature: 0,
      modelName: "gpt-4-turbo-preview"
    });

    // Configure the search tool
    this.tools = [new TavilySearch({ maxResults: 3 })];

    // Create the agent
    this.agent = createReactAgent({
      llm: this.model,
      tools: this.tools
    });
  }

  async chat(prompt: string): Promise<string> {
    try {
      const response = await this.agent.invoke({
        messages: [new HumanMessage(prompt)]
      });
      return response.messages[0].content;
    } catch (error) {
      console.error("Error in chat:", error);
      throw new Error("Failed to process chat request");
    }
  }
}

// Usage example
const agent = new BasicAgent();
const response = await agent.chat("What is the latest news about AI?");
```

**Key Features**:
- Clean class-based structure
- Proper error handling
- Type safety with TypeScript
- Configurable model and tools

## Exercise 2: Memory Management

```typescript
import { MemorySaver } from "@langchain/langgraph";
import { v4 as uuidv4 } from "uuid";

export class AgentWithMemory extends BasicAgent {
  private memorySaver: MemorySaver;
  private threadId: string;

  constructor() {
    super();
    this.memorySaver = new MemorySaver();
    this.threadId = uuidv4();
  }

  async chat(prompt: string): Promise<string> {
    try {
      const response = await this.agent.invoke(
        { messages: [new HumanMessage(prompt)] },
        { configurable: { thread_id: this.threadId } }
      );
      return response.messages[0].content;
    } catch (error) {
      console.error("Error in chat:", error);
      throw new Error("Failed to process chat request");
    }
  }

  async cleanup(): Promise<void> {
    try {
      await this.memorySaver.clear(this.threadId);
    } catch (error) {
      console.error("Error in cleanup:", error);
      throw new Error("Failed to cleanup memory");
    }
  }
}

// Usage example
const agent = new AgentWithMemory();
const response1 = await agent.chat("What is machine learning?");
const response2 = await agent.chat("Can you explain more about that?");
await agent.cleanup();
```

**Key Features**:
- Memory persistence
- Thread management
- Cleanup procedures
- Error handling

## Exercise 3: Response Streaming

```typescript
export class StreamingAgent extends AgentWithMemory {
  async chat(prompt: string): Promise<ReadableStream> {
    try {
      const stream = await this.agent.stream(
        { messages: [new HumanMessage(prompt)] },
        { configurable: { thread_id: this.threadId } }
      );

      return new ReadableStream({
        async start(controller) {
          for await (const chunk of stream) {
            if (chunk.agent?.messages?.[0]?.content) {
              controller.enqueue(chunk.agent.messages[0].content);
            } else if (chunk.tools?.messages?.[0]?.content) {
              controller.enqueue(`Tool Result: ${chunk.tools.messages[0].content}`);
            } else if (chunk.intermediate_steps) {
              for (const step of chunk.intermediate_steps) {
                if (step.action) {
                  controller.enqueue(`Using tool: ${step.action.tool}`);
                }
                if (step.observation) {
                  controller.enqueue(`Tool result: ${step.observation}`);
                }
              }
            } else if (chunk.generated) {
              controller.enqueue(`Thinking: ${chunk.generated}`);
            }
          }
          controller.close();
        }
      });
    } catch (error) {
      console.error("Error in streaming chat:", error);
      throw new Error("Failed to process streaming chat request");
    }
  }
}

// Usage example
const agent = new StreamingAgent();
const stream = await agent.chat("Research the latest AI developments");
for await (const chunk of stream) {
  console.log(chunk);
}
```

**Key Features**:
- Streaming implementation
- Chunk type handling
- Detailed feedback
- Error handling

## Exercise 4: Custom Tool Integration

```typescript
import { Tool } from "@langchain/core/tools";

class SentimentAnalysisTool extends Tool {
  name = "sentiment_analysis";
  description = "Analyzes the sentiment of a given text";

  async _call(text: string): Promise<string> {
    try {
      // Implement sentiment analysis logic here
      const sentiment = await this.analyzeSentiment(text);
      return `Sentiment: ${sentiment}`;
    } catch (error) {
      console.error("Error in sentiment analysis:", error);
      throw new Error("Failed to analyze sentiment");
    }
  }

  private async analyzeSentiment(text: string): Promise<string> {
    // Implement actual sentiment analysis
    // This is a placeholder implementation
    return "positive";
  }
}

export class AgentWithCustomTool extends StreamingAgent {
  constructor() {
    super();
    this.tools.push(new SentimentAnalysisTool());
  }
}

// Usage example
const agent = new AgentWithCustomTool();
const response = await agent.chat("Calculate the sentiment of this text: 'I love AI'");
```

**Key Features**:
- Custom tool implementation
- Tool integration
- Error handling
- Type safety

## Exercise 5: Advanced Agent Features

```typescript
export class AdvancedAgent extends AgentWithCustomTool {
  private retryCount: number = 3;
  private performanceMetrics: Map<string, number> = new Map();

  async chat(prompt: string): Promise<ReadableStream> {
    const startTime = Date.now();
    let attempts = 0;

    while (attempts < this.retryCount) {
      try {
        const stream = await super.chat(prompt);
        this.recordPerformance("chat", Date.now() - startTime);
        return this.formatStream(stream);
      } catch (error) {
        attempts++;
        if (attempts === this.retryCount) {
          throw error;
        }
        await this.delay(1000 * attempts);
      }
    }
    throw new Error("Failed after maximum retry attempts");
  }

  private async formatStream(stream: ReadableStream): Promise<ReadableStream> {
    return new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const formattedChunk = this.formatChunk(chunk);
          controller.enqueue(formattedChunk);
        }
        controller.close();
      }
    });
  }

  private formatChunk(chunk: string): string {
    // Implement custom formatting logic
    return `[${new Date().toISOString()}] ${chunk}`;
  }

  private recordPerformance(operation: string, duration: number): void {
    this.performanceMetrics.set(operation, duration);
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getPerformanceMetrics(): Map<string, number> {
    return this.performanceMetrics;
  }
}

// Usage example
const agent = new AdvancedAgent();
const stream = await agent.chat("Analyze this complex query with multiple steps");
for await (const chunk of stream) {
  console.log(chunk);
}
console.log(agent.getPerformanceMetrics());
```

**Key Features**:
- Retry logic
- Performance monitoring
- Response formatting
- Error handling

## Final Project Solution

```typescript
export class CompleteAgent extends AdvancedAgent {
  private readonly MAX_RETRIES = 3;
  private readonly TIMEOUT = 30000;
  private readonly MAX_TOKENS = 4000;

  constructor() {
    super();
    this.configureModel();
    this.setupErrorHandling();
  }

  private configureModel(): void {
    this.model = new ChatOpenAI({
      temperature: 0,
      modelName: "gpt-4-turbo-preview",
      maxTokens: this.MAX_TOKENS,
      timeout: this.TIMEOUT
    });
  }

  private setupErrorHandling(): void {
    process.on('unhandledRejection', (error) => {
      console.error('Unhandled promise rejection:', error);
    });
  }

  async chat(prompt: string): Promise<ReadableStream> {
    try {
      const stream = await super.chat(prompt);
      return this.enhanceStream(stream);
    } catch (error) {
      console.error("Error in complete agent chat:", error);
      throw new Error("Failed to process chat request");
    }
  }

  private async enhanceStream(stream: ReadableStream): Promise<ReadableStream> {
    return new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const enhancedChunk = await this.processChunk(chunk);
            controller.enqueue(enhancedChunk);
          }
        } catch (error) {
          console.error("Error in stream processing:", error);
          controller.error(error);
        } finally {
          controller.close();
        }
      }
    });
  }

  private async processChunk(chunk: string): Promise<string> {
    // Implement additional processing logic
    return chunk;
  }

  async cleanup(): Promise<void> {
    try {
      await super.cleanup();
      this.performanceMetrics.clear();
    } catch (error) {
      console.error("Error in cleanup:", error);
      throw new Error("Failed to cleanup agent");
    }
  }
}

// Usage example
const agent = new CompleteAgent();
try {
  const stream = await agent.chat("Perform a complex analysis with multiple steps");
  for await (const chunk of stream) {
    console.log(chunk);
  }
} catch (error) {
  console.error("Error:", error);
} finally {
  await agent.cleanup();
}
```

**Key Features**:
- Comprehensive error handling
- Performance optimization
- Resource cleanup
- Enhanced streaming
- Configuration management

## Best Practices

1. **Error Handling**
   - Use try-catch blocks
   - Implement retry logic
   - Provide meaningful error messages
   - Handle cleanup in finally blocks

2. **Performance**
   - Monitor execution time
   - Implement caching where appropriate
   - Optimize tool usage
   - Handle timeouts

3. **Code Organization**
   - Use class inheritance
   - Implement interfaces
   - Follow SOLID principles
   - Document code

4. **Testing**
   - Write unit tests
   - Test error cases
   - Verify performance
   - Check memory usage

## Common Pitfalls

1. **Memory Leaks**
   - Always cleanup resources
   - Monitor memory usage
   - Implement proper error handling
   - Use proper async/await patterns

2. **Error Handling**
   - Don't swallow errors
   - Provide meaningful error messages
   - Implement proper retry logic
   - Handle cleanup properly

3. **Performance**
   - Monitor execution time
   - Optimize tool usage
   - Implement caching
   - Handle timeouts

4. **Streaming**
   - Handle all chunk types
   - Implement proper error handling
   - Close streams properly
   - Monitor memory usage

## Resources

- [LangChain Documentation](https://js.langchain.com/docs/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Node.js Streams](https://nodejs.org/api/stream.html)
- [Error Handling Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/by-example.html) 