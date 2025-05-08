# Stateful Chatbot Solutions

This document provides reference solutions for the stateful chatbot exercises. Each solution includes explanations and best practices.

## Exercise 1: Basic Stateless Chat

```typescript
import { ChatOpenAI } from "@langchain/openai";

// Initialize the model
const model = new ChatOpenAI({
  model: "gpt-4-mini",
  temperature: 0
});

// Stateless chat implementation
export async function statelessChat(prompt: string) {
  try {
    const stream = await model.stream([
      {role: "user", content: prompt},
    ]);

    return new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            controller.enqueue(chunk.content);
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });
  } catch (error) {
    console.error("Chat error:", error);
    throw error;
  }
}
```

**Key Features**:
- Simple stateless implementation
- Error handling
- Streaming response
- Clean error propagation

## Exercise 2: Adding State Management

```typescript
import {
  START,
  END,
  MessagesAnnotation,
  StateGraph,
  MemorySaver,
} from "@langchain/langgraph";
import { v4 as uuidv4 } from "uuid";

// Define the model call function
const callModel = async (state: typeof MessagesAnnotation.State) => {
  try {
    const response = await model.invoke(state.messages);
    return { messages: response };
  } catch (error) {
    console.error("Model call error:", error);
    throw error;
  }
};

// Create the workflow graph
const workflow = new StateGraph(MessagesAnnotation)
    .addNode("model", callModel)
    .addEdge(START, "model")
    .addEdge("model", END);

// Add memory capability
const memory = new MemorySaver();
const app = workflow.compile({ checkpointer: memory });

// Configuration for the chat session
const config = { configurable: { thread_id: uuidv4() } };

// Stateful chat implementation
export async function chatWithMemory(prompt: string) {
  try {
    const stream = await app.stream({
      messages: [{role: "user", content: prompt}],
    }, config);

    return new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            controller.enqueue(chunk.model.messages.content);
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });
  } catch (error) {
    console.error("Chat error:", error);
    throw error;
  }
}
```

**Key Features**:
- State management
- Memory persistence
- Session tracking
- Error handling

## Exercise 3: Custom Prompt Templates

```typescript
import { ChatPromptTemplate } from "@langchain/core/prompts";

// Create a prompt template
const promptTemplate = ChatPromptTemplate.fromMessages([
  [
    "system",
    "You are a helpful assistant with a pirate theme. Always respond in pirate language while maintaining professionalism.",
  ],
  ["placeholder", "{messages}"],
]);

// Enhanced model call function with template
const callModel2 = async (state: typeof MessagesAnnotation.State) => {
  try {
    const prompt = await promptTemplate.invoke(state);
    const response = await model.invoke(prompt);
    return { messages: [response] };
  } catch (error) {
    console.error("Template error:", error);
    throw error;
  }
};

// Update the workflow with the new model call
const workflow = new StateGraph(MessagesAnnotation)
    .addNode("model", callModel2)
    .addEdge(START, "model")
    .addEdge("model", END);

// Themed chat implementation
export async function themedChat(prompt: string) {
  return chatWithMemory(prompt); // Reuse the stateful implementation
}
```

**Key Features**:
- Custom prompt template
- Themed responses
- Error handling
- State management

## Exercise 4: Multi-Node Workflow

```typescript
// Define node functions
const routeQuery = async (state: typeof MessagesAnnotation.State) => {
  const lastMessage = state.messages[state.messages.length - 1].content;
  
  if (lastMessage.toLowerCase().includes("weather")) {
    return { next: "weather" };
  } else if (lastMessage.toLowerCase().includes("time")) {
    return { next: "time" };
  }
  return { next: "general" };
};

const processWeather = async (state: typeof MessagesAnnotation.State) => {
  // Weather processing logic
  return { messages: [/* weather response */] };
};

const processTime = async (state: typeof MessagesAnnotation.State) => {
  // Time processing logic
  return { messages: [/* time response */] };
};

const processGeneral = async (state: typeof MessagesAnnotation.State) => {
  return callModel2(state);
};

// Create the workflow graph
const workflow = new StateGraph(MessagesAnnotation)
    .addNode("router", routeQuery)
    .addNode("weather", processWeather)
    .addNode("time", processTime)
    .addNode("general", processGeneral)
    .addEdge(START, "router")
    .addConditionalEdges(
      "router",
      {
        weather: "weather",
        time: "time",
        general: "general"
      }
    )
    .addEdge("weather", END)
    .addEdge("time", END)
    .addEdge("general", END);
```

**Key Features**:
- Multiple processing nodes
- Conditional routing
- Specialized processing
- State management

## Exercise 5: Error Handling and Recovery

```typescript
// Input validation
const validateInput = (input: string): boolean => {
  return input.trim().length > 0 && input.length <= 1000;
};

// Error recovery
const recoverFromError = async (error: any): Promise<string> => {
  if (error.name === "RateLimitError") {
    return "Please wait a moment before trying again.";
  }
  return "An error occurred. Please try again.";
};

// Robust chat implementation
export async function robustChat(prompt: string) {
  try {
    if (!validateInput(prompt)) {
      throw new Error("Invalid input");
    }

    const response = await chatWithMemory(prompt);
    return response;
  } catch (error) {
    const recoveryMessage = await recoverFromError(error);
    return new ReadableStream({
      start(controller) {
        controller.enqueue(recoveryMessage);
        controller.close();
      },
    });
  }
}
```

**Key Features**:
- Input validation
- Error recovery
- Graceful degradation
- User feedback

## Exercise 6: Session Management

```typescript
interface Session {
  id: string;
  created: Date;
  lastActive: Date;
  messages: any[];
}

class SessionManager {
  private sessions: Map<string, Session> = new Map();
  private readonly TIMEOUT = 30 * 60 * 1000; // 30 minutes

  createSession(): Session {
    const session: Session = {
      id: uuidv4(),
      created: new Date(),
      lastActive: new Date(),
      messages: [],
    };
    this.sessions.set(session.id, session);
    return session;
  }

  getSession(id: string): Session | undefined {
    const session = this.sessions.get(id);
    if (session) {
      session.lastActive = new Date();
    }
    return session;
  }

  cleanupSessions() {
    const now = new Date();
    for (const [id, session] of this.sessions.entries()) {
      if (now.getTime() - session.lastActive.getTime() > this.TIMEOUT) {
        this.sessions.delete(id);
      }
    }
  }
}

const sessionManager = new SessionManager();

export async function sessionChat(prompt: string, sessionId: string) {
  const session = sessionManager.getSession(sessionId);
  if (!session) {
    throw new Error("Session not found");
  }

  session.messages.push({ role: "user", content: prompt });
  const response = await chatWithMemory(prompt);
  session.messages.push({ role: "assistant", content: response });
  
  return response;
}
```

**Key Features**:
- Session management
- Timeout handling
- Message history
- Cleanup mechanism

## Exercise 7: Performance Optimization

```typescript
import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes cache
const rateLimiter = new Map<string, number[]>();

// Rate limiting
const checkRateLimit = (userId: string): boolean => {
  const now = Date.now();
  const userRequests = rateLimiter.get(userId) || [];
  const recentRequests = userRequests.filter(time => now - time < 60000);
  
  if (recentRequests.length >= 60) { // 60 requests per minute
    return false;
  }
  
  recentRequests.push(now);
  rateLimiter.set(userId, recentRequests);
  return true;
};

// Optimized chat implementation
export async function optimizedChat(prompt: string, userId: string) {
  // Check rate limit
  if (!checkRateLimit(userId)) {
    throw new Error("Rate limit exceeded");
  }

  // Check cache
  const cacheKey = `${userId}:${prompt}`;
  const cachedResponse = cache.get(cacheKey);
  if (cachedResponse) {
    return cachedResponse;
  }

  // Process request
  const response = await chatWithMemory(prompt);
  
  // Cache response
  cache.set(cacheKey, response);
  
  return response;
}
```

**Key Features**:
- Response caching
- Rate limiting
- Performance monitoring
- Resource optimization

## Bonus Exercise: Custom Memory Implementation

```typescript
class CompressedMemory {
  private memory: Map<string, any> = new Map();
  private readonly MAX_SIZE = 1000;

  async compress(data: any): Promise<string> {
    // Implement compression logic
    return JSON.stringify(data);
  }

  async decompress(data: string): Promise<any> {
    // Implement decompression logic
    return JSON.parse(data);
  }

  async store(key: string, value: any) {
    const compressed = await this.compress(value);
    this.memory.set(key, compressed);
    
    if (this.memory.size > this.MAX_SIZE) {
      this.cleanup();
    }
  }

  async retrieve(key: string): Promise<any> {
    const compressed = this.memory.get(key);
    if (!compressed) return null;
    
    return await this.decompress(compressed);
  }

  private cleanup() {
    // Remove oldest entries
    const keys = Array.from(this.memory.keys());
    const toRemove = keys.slice(0, keys.length - this.MAX_SIZE);
    toRemove.forEach(key => this.memory.delete(key));
  }
}

const memory = new CompressedMemory();

export async function customMemoryChat(prompt: string) {
  const response = await chatWithMemory(prompt);
  await memory.store(prompt, response);
  return response;
}
```

**Key Features**:
- Custom memory implementation
- Compression support
- Size management
- Cleanup mechanism

## Best Practices

1. **Error Handling**
   - Comprehensive error catching
   - Graceful recovery
   - User feedback
   - Error logging

2. **State Management**
   - Clear state structure
   - Proper initialization
   - State validation
   - Cleanup procedures

3. **Performance**
   - Efficient caching
   - Rate limiting
   - Resource management
   - Monitoring

4. **Security**
   - Input validation
   - Session management
   - Rate limiting
   - Error handling

## Common Pitfalls to Avoid

1. **Memory Management**
   - Memory leaks
   - Unbounded growth
   - Missing cleanup
   - Resource exhaustion

2. **Error Handling**
   - Uncaught exceptions
   - Poor error messages
   - Missing recovery
   - Inadequate logging

3. **Performance**
   - Missing caching
   - Inefficient processing
   - Resource waste
   - Poor monitoring

4. **State Management**
   - State corruption
   - Missing validation
   - Poor cleanup
   - Session issues 