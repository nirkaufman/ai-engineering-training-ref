# Building a Basic Graph with LangGraph

This tutorial guides you through creating a basic graph using LangGraph, demonstrating state management, node connections, and streaming responses.

## Prerequisites

- Next.js environment
- LangGraph package installed
- Basic understanding of TypeScript
- Knowledge of async/await and streams

## 1. Setting Up the Environment

First, let's set up our basic graph structure.

```typescript
import { Annotation, END, START, StateGraph } from "@langchain/langgraph";

// Define the state using LangGraph's Annotation system
const state = Annotation.Root({
  graphState: Annotation<string>()
});

// Type for the state
type StateType = typeof state.State;
```

This setup:
- Imports necessary components
- Defines state structure
- Sets up type safety

## 2. Implementing Graph Nodes

Next, let's create our graph nodes.

```typescript
// Basic node that adds text to state
function node_1(state: StateType): StateType {
  return { graphState: state.graphState + " I am" };
}

// Happy path node
function node_2(state: StateType): StateType {
  return { graphState: state.graphState + " happy!" };
}

// Sad path node
function node_3(state: StateType): StateType {
  return { graphState: state.graphState + " sad!" };
}

// Decision node
function decideMood(state: StateType): "node_2" | "node_3" {
  console.log("User input:", state.graphState);
  
  // Random decision for demonstration
  if (Math.random() < 0.5) {
    return "node_2";
  }
  return "node_3";
}
```

This implementation:
- Creates basic nodes
- Implements state transformation
- Adds decision logic

## 3. Building the Graph

Now, let's construct our graph.

```typescript
const graph = new StateGraph(state)
  // Add Nodes
  .addNode("node_1", node_1)
  .addNode("node_2", node_2)
  .addNode("node_3", node_3)

  // Add Edges
  .addEdge(START, "node_1")
  .addConditionalEdges("node_1", decideMood)
  .addEdge("node_2", END)
  .addEdge("node_3", END)

  // Compile the graph
  .compile();
```

This setup:
- Creates the graph structure
- Adds nodes
- Defines edges
- Compiles the graph

## 4. Implementing Streaming

Finally, let's implement the streaming functionality.

```typescript
export async function runSimpleGraph(initialMessage: string = "Hello") {
  // Initialize state
  const initialState = {
    graphState: initialMessage
  };

  // Create stream
  const stream = await graph.stream(initialState, {
    streamMode: 'updates'
  });

  // Return readable stream
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          console.log('**chunk**', chunk);

          if (chunk.node_1) {
            controller.enqueue(`🔍 Node 1 processed: "${chunk.node_1.graphState}"\n\n`);
          }

          if (chunk.node_2) {
            controller.enqueue(`😀 Node 2 (Happy Path): "${chunk.node_2.graphState}"\n\n`);
          }

          if (chunk.node_3) {
            controller.enqueue(`😢 Node 3 (Sad Path): "${chunk.node_3.graphState}"\n\n`);
          }
        }

        controller.enqueue("✅ Graph execution complete\n");
        controller.close();
      } catch (error) {
        console.error("Error in graph stream:", error);
        controller.error(error);
      }
    },
  });
}
```

This implementation:
- Handles state initialization
- Creates streaming interface
- Processes different chunk types
- Manages errors

## Usage Examples

### Basic Graph Execution
```typescript
const stream = await runSimpleGraph("Hello");
const reader = stream.getReader();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  console.log(value);
}
```

### Custom Initial Message
```typescript
const stream = await runSimpleGraph("Greetings");
// Process stream as above
```

## Best Practices

1. **State Management**
   - Use proper typing
   - Handle state immutability
   - Validate state changes

2. **Node Implementation**
   - Keep nodes focused
   - Handle errors properly
   - Document node behavior

3. **Streaming**
   - Handle different chunk types
   - Provide meaningful feedback
   - Implement proper error handling

## Common Issues and Solutions

1. **State Issues**
   - Problem: State mutation
   - Solution: Use immutable updates
   - Best Practice: Type safety

2. **Streaming Problems**
   - Problem: Chunks not processing
   - Solution: Check chunk types
   - Best Practice: Proper error handling

3. **Graph Structure**
   - Problem: Circular dependencies
   - Solution: Validate graph structure
   - Best Practice: Clear node relationships

## Next Steps

1. Add more complex nodes
2. Implement custom decision logic
3. Add state validation
4. Implement error recovery
5. Add performance monitoring

## Resources

- [LangGraph Documentation](https://js.langchain.com/docs/modules/agents/agent_types/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Streams API](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions) 