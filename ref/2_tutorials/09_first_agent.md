# Building Your First Agent with LangChain

This tutorial guides you through creating an agent that can use tools and maintain state, using LangChain's ReAct agent framework.

## Prerequisites

- Node.js environment
- LangChain packages installed
- OpenAI API key configured
- Tavily API key configured

## 1. Basic Agent Setup

Let's start by setting up the basic agent with tools and model configuration.

```typescript
import { TavilySearch } from "@langchain/tavily";
import { ChatOpenAI } from "@langchain/openai";
import { MemorySaver } from "@langchain/langgraph";
import { HumanMessage } from "@langchain/core/messages";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { v4 as uuidv4 } from "uuid";

// Define the tools for the agent to use
const agentTools = [new TavilySearch({ maxResults: 3 })];
const agentModel = new ChatOpenAI({ temperature: 0 });

// Initialize memory to persist state between graph runs
const agentCheckPointer = new MemorySaver();

// Create the agent
const agent = createReactAgent({
  llm: agentModel,
  tools: agentTools,
  checkpointSaver: agentCheckPointer,
});

// Create a unique id for the thread
const config = { configurable: { thread_id: uuidv4() } };
```

This setup:
- Configures the search tool
- Initializes the language model
- Sets up memory persistence
- Creates the agent instance

## 2. Implementing the Chat Function

Now, let's implement the chat function that will handle user interactions.

```typescript
export async function chatWithAgent(prompt: string) {
  const stream = await agent.stream(
    { messages: [new HumanMessage(prompt)] },
    config
  );

  return new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        console.log("Agent chunk:", chunk);
        
        // Handle different types of chunks
        if (chunk.agent?.messages?.[0]?.content) {
          // Final answer from the agent
          controller.enqueue(chunk.agent.messages[0].content);
        } 
        else if (chunk.tools?.messages?.[0]?.content) {
          // Tool response
          controller.enqueue(`Tool Result: ${chunk.tools.messages[0].content}`);
        }
        else if (chunk.intermediate_steps) {
          // Intermediate steps (reasoning, etc.)
          for (const step of chunk.intermediate_steps) {
            if (step.action) {
              controller.enqueue(`Using tool: ${step.action.tool} with input: ${step.action.toolInput}`);
            }
            if (step.observation) {
              controller.enqueue(`Tool result: ${step.observation}`);
            }
          }
        }
        else if (chunk.generated) {
          // Generated reasoning
          controller.enqueue(`Thinking: ${chunk.generated}`);
        }
      }
      controller.close();
    },
  });
}
```

This implementation:
- Streams agent responses
- Handles different types of chunks
- Provides detailed feedback
- Maintains conversation flow

## 3. Understanding Agent Components

### Tools
```typescript
const agentTools = [new TavilySearch({ maxResults: 3 })];
```
- **TavilySearch**: Web search tool
- **maxResults**: Limits search results
- **Tool Integration**: Extends agent capabilities

### Memory Management
```typescript
const agentCheckPointer = new MemorySaver();
```
- **MemorySaver**: Persists agent state
- **State Management**: Maintains conversation context
- **Thread Management**: Tracks conversation threads

### Agent Configuration
```typescript
const agent = createReactAgent({
  llm: agentModel,
  tools: agentTools,
  checkpointSaver: agentCheckPointer,
});
```
- **ReAct Agent**: Uses reasoning and acting
- **Tool Integration**: Enables tool usage
- **State Persistence**: Maintains conversation state

## 4. Response Handling

The agent can return different types of responses:

1. **Final Answers**
   ```typescript
   if (chunk.agent?.messages?.[0]?.content) {
     controller.enqueue(chunk.agent.messages[0].content);
   }
   ```

2. **Tool Results**
   ```typescript
   if (chunk.tools?.messages?.[0]?.content) {
     controller.enqueue(`Tool Result: ${chunk.tools.messages[0].content}`);
   }
   ```

3. **Intermediate Steps**
   ```typescript
   if (chunk.intermediate_steps) {
     for (const step of chunk.intermediate_steps) {
       // Handle tool usage and observations
     }
   }
   ```

4. **Reasoning**
   ```typescript
   if (chunk.generated) {
     controller.enqueue(`Thinking: ${chunk.generated}`);
   }
   ```

## Usage Examples

### Basic Query
```typescript
const response = await chatWithAgent("What's the latest news about AI?");
// Agent will search and provide information
```

### Complex Query
```typescript
const response = await chatWithAgent("Compare the latest AI models and their capabilities");
// Agent will search, analyze, and provide comparison
```

## Best Practices

1. **Tool Selection**
   - Choose appropriate tools
   - Configure tool parameters
   - Handle tool errors

2. **Memory Management**
   - Implement proper cleanup
   - Monitor memory usage
   - Handle session timeouts

3. **Error Handling**
   - Catch tool errors
   - Handle stream errors
   - Provide user feedback

## Common Issues and Solutions

1. **Tool Errors**
   - Problem: Tool execution failures
   - Solution: Implement error handling and fallbacks

2. **Memory Issues**
   - Problem: Memory leaks
   - Solution: Implement cleanup procedures

3. **Response Handling**
   - Problem: Inconsistent responses
   - Solution: Implement proper chunk handling

## Next Steps

1. Add more tools
2. Implement custom tools
3. Add response formatting
4. Implement error recovery
5. Add performance monitoring

## Resources

- [LangChain Agents](https://js.langchain.com/docs/modules/agents/)
- [ReAct Agent](https://js.langchain.com/docs/modules/agents/agent_types/react)
- [Tavily Search](https://tavily.com/docs) 