# Basic Graph Solutions

This document provides solutions for the basic graph exercises, demonstrating best practices and implementation patterns.

## Exercise 1: Basic Graph Setup

### Solution
```typescript
import { StateGraph, END } from "@langchain/langgraph";
import { Annotation } from "@langchain/core/utils/annotation";

// Define state type
interface GraphState {
  messages: string[];
}

// Create state annotation
const state = Annotation.Root<GraphState>({
  messages: []
});

// Create basic node
const addMessage = async (state: GraphState) => {
  return {
    messages: [...state.messages, "Hello World!"]
  };
};

// Build graph
const graph = new StateGraph({
  channels: state
});

// Add node
graph.addNode("addMessage", addMessage);

// Add edges
graph.addEdge("addMessage", END);

// Compile graph
const compiledGraph = graph.compile();

// Usage
const result = await compiledGraph.invoke({
  messages: []
});
```

### Key Features
- Type-safe state management
- Immutable state updates
- Clear node definition
- Proper graph compilation

## Exercise 2: Multiple Nodes

### Solution
```typescript
import { StateGraph, END } from "@langchain/langgraph";
import { Annotation } from "@langchain/core/utils/annotation";

interface GraphState {
  messages: string[];
  currentStep: string;
}

const state = Annotation.Root<GraphState>({
  messages: [],
  currentStep: "start"
});

// Node implementations
const greetingNode = async (state: GraphState) => {
  return {
    messages: [...state.messages, "Hi!"],
    currentStep: "greeting"
  };
};

const actionNode = async (state: GraphState) => {
  return {
    messages: [...state.messages, "How are you?"],
    currentStep: "action"
  };
};

const responseNode = async (state: GraphState) => {
  return {
    messages: [...state.messages, "I'm doing well!"],
    currentStep: "response"
  };
};

// Build graph
const graph = new StateGraph({
  channels: state
});

// Add nodes
graph.addNode("greeting", greetingNode);
graph.addNode("action", actionNode);
graph.addNode("response", responseNode);

// Add edges
graph.addEdge("greeting", "action");
graph.addEdge("action", "response");
graph.addEdge("response", END);

// Compile graph
const compiledGraph = graph.compile();

// Usage
const result = await compiledGraph.invoke({
  messages: [],
  currentStep: "start"
});
```

### Key Features
- Multiple node types
- State transition tracking
- Sequential execution
- Clear node connections

## Exercise 3: Conditional Logic

### Solution
```typescript
import { StateGraph, END } from "@langchain/langgraph";
import { Annotation } from "@langchain/core/utils/annotation";

interface GraphState {
  messages: string[];
  mood: "positive" | "negative";
}

const state = Annotation.Root<GraphState>({
  messages: [],
  mood: "positive"
});

// Node implementations
const greetingNode = async (state: GraphState) => {
  return {
    messages: [...state.messages, "Hello!"],
    mood: state.mood
  };
};

const decisionNode = async (state: GraphState) => {
  return {
    messages: state.messages,
    mood: Math.random() > 0.5 ? "positive" : "negative"
  };
};

const positiveResponseNode = async (state: GraphState) => {
  return {
    messages: [...state.messages, "That's great!"],
    mood: state.mood
  };
};

const negativeResponseNode = async (state: GraphState) => {
  return {
    messages: [...state.messages, "I'm sorry to hear that."],
    mood: state.mood
  };
};

// Build graph
const graph = new StateGraph({
  channels: state
});

// Add nodes
graph.addNode("greeting", greetingNode);
graph.addNode("decision", decisionNode);
graph.addNode("positive", positiveResponseNode);
graph.addNode("negative", negativeResponseNode);

// Add edges
graph.addEdge("greeting", "decision");
graph.addConditionalEdges(
  "decision",
  (state) => state.mood,
  {
    positive: "positive",
    negative: "negative"
  }
);
graph.addEdge("positive", END);
graph.addEdge("negative", END);

// Compile graph
const compiledGraph = graph.compile();

// Usage
const result = await compiledGraph.invoke({
  messages: [],
  mood: "positive"
});
```

### Key Features
- Conditional routing
- State-based decisions
- Multiple response paths
- Clear edge conditions

## Exercise 4: Streaming Implementation

### Solution
```typescript
import { StateGraph, END } from "@langchain/langgraph";
import { Annotation } from "@langchain/core/utils/annotation";

interface GraphState {
  messages: string[];
  currentStep: string;
}

const state = Annotation.Root<GraphState>({
  messages: [],
  currentStep: "start"
});

// Node implementations
const streamingNode = async function* (state: GraphState) {
  yield {
    type: "greeting",
    content: "Processing greeting..."
  };
  
  yield {
    type: "response",
    content: "Hello! How are you?"
  };
  
  return {
    messages: [...state.messages, "Hello! How are you?"],
    currentStep: "complete"
  };
};

// Build graph
const graph = new StateGraph({
  channels: state
});

// Add nodes
graph.addNode("streaming", streamingNode);

// Add edges
graph.addEdge("streaming", END);

// Compile graph
const compiledGraph = graph.compile();

// Usage
const stream = await compiledGraph.stream({
  messages: [],
  currentStep: "start"
});

for await (const chunk of stream) {
  if (chunk.type === "greeting") {
    console.log("Processing:", chunk.content);
  } else if (chunk.type === "response") {
    console.log("Response:", chunk.content);
  }
}
```

### Key Features
- Streaming interface
- Chunk type handling
- Progress tracking
- Error handling

## Exercise 5: Advanced Features

### Solution
```typescript
import { StateGraph, END } from "@langchain/langgraph";
import { Annotation } from "@langchain/core/utils/annotation";

interface GraphState {
  messages: string[];
  currentStep: string;
  performance: {
    startTime: number;
    endTime?: number;
  };
  errors: Error[];
}

const state = Annotation.Root<GraphState>({
  messages: [],
  currentStep: "start",
  performance: {
    startTime: Date.now()
  },
  errors: []
});

// Validation function
const validateState = (state: GraphState) => {
  if (!state.messages) {
    throw new Error("Messages array is required");
  }
  return true;
};

// Node implementations
const advancedNode = async (state: GraphState) => {
  try {
    validateState(state);
    
    const result = {
      messages: [...state.messages, "Advanced processing complete"],
      currentStep: "complete",
      performance: {
        ...state.performance,
        endTime: Date.now()
      },
      errors: state.errors
    };
    
    return result;
  } catch (error) {
    return {
      ...state,
      errors: [...state.errors, error as Error]
    };
  }
};

// Build graph
const graph = new StateGraph({
  channels: state
});

// Add nodes
graph.addNode("advanced", advancedNode);

// Add edges
graph.addEdge("advanced", END);

// Compile graph
const compiledGraph = graph.compile();

// Usage
const result = await compiledGraph.invoke({
  messages: [],
  currentStep: "start",
  performance: {
    startTime: Date.now()
  },
  errors: []
});
```

### Key Features
- State validation
- Performance monitoring
- Error tracking
- Response formatting

## Final Project Solution

### Solution
```typescript
import { StateGraph, END } from "@langchain/langgraph";
import { Annotation } from "@langchain/core/utils/annotation";

interface GraphState {
  messages: string[];
  currentStep: string;
  performance: {
    startTime: number;
    endTime?: number;
  };
  errors: Error[];
  mood: "positive" | "negative";
}

const state = Annotation.Root<GraphState>({
  messages: [],
  currentStep: "start",
  performance: {
    startTime: Date.now()
  },
  errors: [],
  mood: "positive"
});

// Validation function
const validateState = (state: GraphState) => {
  if (!state.messages) {
    throw new Error("Messages array is required");
  }
  return true;
};

// Node implementations
const streamingNode = async function* (state: GraphState) {
  try {
    validateState(state);
    
    yield {
      type: "greeting",
      content: "Processing greeting..."
    };
    
    yield {
      type: "response",
      content: "Hello! How are you?"
    };
    
    return {
      messages: [...state.messages, "Hello! How are you?"],
      currentStep: "complete",
      performance: {
        ...state.performance,
        endTime: Date.now()
      },
      errors: state.errors,
      mood: state.mood
    };
  } catch (error) {
    return {
      ...state,
      errors: [...state.errors, error as Error]
    };
  }
};

// Build graph
const graph = new StateGraph({
  channels: state
});

// Add nodes
graph.addNode("streaming", streamingNode);

// Add edges
graph.addEdge("streaming", END);

// Compile graph
const compiledGraph = graph.compile();

// Usage
const stream = await compiledGraph.stream({
  messages: [],
  currentStep: "start",
  performance: {
    startTime: Date.now()
  },
  errors: [],
  mood: "positive"
});

for await (const chunk of stream) {
  if (chunk.type === "greeting") {
    console.log("Processing:", chunk.content);
  } else if (chunk.type === "response") {
    console.log("Response:", chunk.content);
  }
}
```

### Key Features
- Combined functionality
- Comprehensive error handling
- Performance optimization
- Thorough documentation

## Best Practices

1. **State Management**
   - Use immutable updates
   - Implement proper typing
   - Validate state changes

2. **Error Handling**
   - Implement try-catch blocks
   - Track error history
   - Provide meaningful error messages

3. **Performance**
   - Monitor execution time
   - Optimize node operations
   - Track resource usage

4. **Documentation**
   - Document node purposes
   - Explain state structure
   - Provide usage examples

## Common Pitfalls

1. **State Mutability**
   - Avoid direct state mutation
   - Use spread operator for updates
   - Maintain immutability

2. **Error Handling**
   - Don't swallow errors
   - Implement proper error recovery
   - Track error context

3. **Performance**
   - Monitor memory usage
   - Optimize node operations
   - Track execution time

## Resources

- [LangGraph Documentation](https://js.langchain.com/docs/modules/agents/agent_types/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Streams API](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions) 