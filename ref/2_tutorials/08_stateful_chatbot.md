# Building a Stateful Chatbot with LangChain

This tutorial guides you through building a stateful chatbot using LangChain and StateGraph, starting from a simple stateless implementation and gradually adding more advanced features.

## Prerequisites

- Node.js environment
- LangChain packages installed
- OpenAI API key configured

## 1. Basic Stateless Chat Implementation

Let's start with a simple stateless chat implementation that doesn't maintain conversation history.

```typescript
import { ChatOpenAI } from "@langchain/openai";

// Initialize the model
const model = new ChatOpenAI({
  model: "gpt-4-mini",
  temperature: 0
});

// Stateless chat implementation
export async function statelessChat(prompt: string) {
  const stream = await model.stream([
    {role: "user", content: prompt},
  ]);

  return new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        controller.enqueue(chunk.content);
      }
      controller.close();
    },
  });
}
```

This implementation:
- Creates a new model instance
- Takes a single prompt
- Streams the response back to the user
- Doesn't maintain any conversation history

## 2. Adding State Management with StateGraph

Now, let's enhance our chatbot with state management using StateGraph.

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
  const response = await model.invoke(state.messages);
  return { messages: response };
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
  const stream = await app.stream({
    messages: [{role: "user", content: prompt}],
  }, config);

  return new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        controller.enqueue(chunk.model.messages.content);
      }
      controller.close();
    },
  });
}
```

Key improvements in this version:
- Maintains conversation history
- Uses StateGraph for workflow management
- Implements memory saving
- Generates unique thread IDs for sessions

## 3. Adding Prompt Templates

Finally, let's add prompt templates to customize the chatbot's behavior.

```typescript
import { ChatPromptTemplate } from "@langchain/core/prompts";

// Create a prompt template
const promptTemplate = ChatPromptTemplate.fromMessages([
  [
    "system",
    "You talk like a pirate. Answer all questions to the best of your ability.",
  ],
  ["placeholder", "{messages}"],
]);

// Enhanced model call function with template
const callModel2 = async (state: typeof MessagesAnnotation.State) => {
  const prompt = await promptTemplate.invoke(state);
  const response = await model.invoke(prompt);
  return { messages: [response] };
};

// Update the workflow with the new model call
const workflow = new StateGraph(MessagesAnnotation)
    .addNode("model", callModel2)
    .addEdge(START, "model")
    .addEdge("model", END);
```

This version adds:
- Custom prompt templates
- System message configuration
- Message formatting
- Consistent response structure

## Usage Examples

### 1. Stateless Chat
```typescript
const response = await statelessChat("What's the weather like?");
// Response won't remember previous messages
```

### 2. Stateful Chat with Memory
```typescript
const response = await chatWithMemory("What's my name?");
// Response can reference previous conversation
```

### 3. Templated Chat
```typescript
const response = await chatWithMemory("How are you?");
// Response will be in pirate style due to the template
```

## Best Practices

1. **Error Handling**
   - Implement try-catch blocks
   - Handle streaming errors
   - Validate input

2. **Memory Management**
   - Clean up old sessions
   - Monitor memory usage
   - Implement session timeouts

3. **Performance Optimization**
   - Use appropriate model size
   - Implement caching
   - Optimize prompt templates

## Common Issues and Solutions

1. **Memory Leaks**
   - Problem: Accumulating conversation history
   - Solution: Implement session cleanup

2. **Response Formatting**
   - Problem: Inconsistent response structure
   - Solution: Use standardized templates

3. **State Management**
   - Problem: Lost conversation context
   - Solution: Implement proper state tracking

## Next Steps

1. Add error handling
2. Implement session management
3. Add response validation
4. Implement rate limiting
5. Add logging and monitoring

## Resources

- [LangChain Documentation](https://js.langchain.com/docs/)
- [StateGraph Documentation](https://js.langchain.com/docs/modules/agents/agent_types/)
- [OpenAI API Documentation](https://platform.openai.com/docs/api-reference) 