# Basic Graphs with LangGraph: Concepts & API

This resource explains the foundational concepts, terminology, and APIs for building basic graphs using LangGraph, as demonstrated in the tutorial. It is designed to help you understand state management, node logic, graph construction, and streaming in LangGraph.

---

## Overview

A **graph** in LangGraph is a structure that models computation as a series of nodes (functions) connected by edges (transitions). Each node processes state and passes it along, enabling complex workflows, branching, and streaming outputs.

---

## Key Concepts & Terms

### 1. State & Annotation
- **State**: The data that flows through the graph. It is typically an object whose shape is defined at the root.
- **Annotation**: LangGraph's way to define and type the state. Use `Annotation.Root` to declare the root state and `Annotation<Type>()` for fields.

```typescript
const state = Annotation.Root({
  graphState: Annotation<string>()
});
type StateType = typeof state.State;
```

### 2. Nodes
- **Node**: A function that receives the current state and returns a new state. Nodes encapsulate logic for each step in the graph.

```typescript
function node_1(state: StateType): StateType {
  return { graphState: state.graphState + " I am" };
}
```

### 3. Edges
- **Edge**: A connection between nodes. Edges define the flow of execution. Use `.addEdge(from, to)` to connect nodes.
- **Conditional Edges**: Use `.addConditionalEdges` to branch based on logic.

### 4. Special Nodes
- **START**: The entry point of the graph.
- **END**: The exit point of the graph.

### 5. Decision Logic
- **Decision Node**: A node that determines the next path based on state or logic.

```typescript
function decideMood(state: StateType): "node_2" | "node_3" {
  // ...logic...
}
```

### 6. Streaming
- **Streaming**: Processing and emitting results as the graph executes, chunk by chunk. Useful for real-time feedback.

---

## Core API & Usage

### 1. State & Annotation
- `Annotation.Root<T>()`: Defines the root state type.
- `Annotation<Type>()`: Defines a field in the state.

### 2. Graph Construction
- `new StateGraph(state)`: Creates a new graph with the given state definition.
- `.addNode(name, fn)`: Adds a node to the graph.
- `.addEdge(from, to)`: Adds an edge between nodes.
- `.addConditionalEdges(from, decisionFn)`: Adds conditional branching.
- `.compile()`: Compiles the graph for execution.

### 3. Execution & Streaming
- `graph.stream(initialState, { streamMode })`: Runs the graph and returns a stream of results.
- `ReadableStream`: Standard web API for reading streamed data.

---

## Example: Building a Basic Graph

```typescript
import { Annotation, END, START, StateGraph } from "@langchain/langgraph";

const state = Annotation.Root({
  graphState: Annotation<string>()
});
type StateType = typeof state.State;

function node_1(state: StateType): StateType {
  return { graphState: state.graphState + " I am" };
}
function node_2(state: StateType): StateType {
  return { graphState: state.graphState + " happy!" };
}
function node_3(state: StateType): StateType {
  return { graphState: state.graphState + " sad!" };
}
function decideMood(state: StateType): "node_2" | "node_3" {
  return Math.random() < 0.5 ? "node_2" : "node_3";
}

const graph = new StateGraph(state)
  .addNode("node_1", node_1)
  .addNode("node_2", node_2)
  .addNode("node_3", node_3)
  .addEdge(START, "node_1")
  .addConditionalEdges("node_1", decideMood)
  .addEdge("node_2", END)
  .addEdge("node_3", END)
  .compile();
```

---

## Streaming Example

```typescript
export async function runSimpleGraph(initialMessage: string = "Hello") {
  const initialState = { graphState: initialMessage };
  const stream = await graph.stream(initialState, { streamMode: 'updates' });
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (chunk.node_1) controller.enqueue(`Node 1: ${chunk.node_1.graphState}\n`);
          if (chunk.node_2) controller.enqueue(`Happy: ${chunk.node_2.graphState}\n`);
          if (chunk.node_3) controller.enqueue(`Sad: ${chunk.node_3.graphState}\n`);
        }
        controller.enqueue("Graph execution complete\n");
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}
```

---

## Best Practices

- Use immutable state updates
- Keep node logic focused and well-documented
- Validate state at each step
- Handle errors in streaming and node logic
- Use clear naming for nodes and edges

---

## Common Pitfalls

- Mutating state directly (always return a new object)
- Forgetting to connect nodes with edges
- Not handling all possible branches in decision nodes
- Not closing streams on error

---

## Resources & Further Reading

- [LangGraph Documentation](https://js.langchain.com/docs/modules/agents/agent_types/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Streams API](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions) 