# Stateful Chatbot Exercises

This set of exercises will help you practice implementing and enhancing stateful chatbots using LangChain and StateGraph. Each exercise builds upon the previous one, gradually introducing more complex features.

## Exercise 1: Basic Stateless Chat

### Task
Implement a basic stateless chat function that uses the ChatOpenAI model to respond to user messages.

### Requirements
- Create a new file `stateless-chat.ts`
- Implement the `statelessChat` function
- Use the ChatOpenAI model with gpt-4-mini
- Stream the response back to the user

### Example
```typescript
const response = await statelessChat("Hello, how are you?");
// Should return a streamed response
```

### Hints
- Use the `stream` method for real-time responses
- Implement proper error handling
- Return a ReadableStream

## Exercise 2: Adding State Management

### Task
Enhance the stateless chat to maintain conversation history using StateGraph.

### Requirements
- Create a new file `stateful-chat.ts`
- Implement the `chatWithMemory` function
- Use StateGraph for workflow management
- Add memory capability with MemorySaver
- Generate unique thread IDs for sessions

### Example
```typescript
// First message
const response1 = await chatWithMemory("My name is Alice");
// Second message
const response2 = await chatWithMemory("What's my name?");
// Should remember the name from the first message
```

### Hints
- Use MessagesAnnotation for state type
- Implement proper state management
- Handle message history

## Exercise 3: Custom Prompt Templates

### Task
Add custom prompt templates to create a themed chatbot.

### Requirements
- Create a new file `themed-chat.ts`
- Implement a prompt template
- Create a themed system message
- Update the model call function
- Maintain state management

### Example
```typescript
const response = await themedChat("Tell me a story");
// Should respond in the theme's style
```

### Hints
- Use ChatPromptTemplate
- Define clear system messages
- Maintain conversation context

## Exercise 4: Multi-Node Workflow

### Task
Create a more complex chatbot with multiple processing nodes.

### Requirements
- Create a new file `advanced-chat.ts`
- Implement multiple processing nodes
- Add conditional routing
- Handle different types of queries
- Maintain state across nodes

### Example
```typescript
const response = await advancedChat("What's the weather in New York?");
// Should route to weather processing node
```

### Hints
- Use multiple nodes in StateGraph
- Implement conditional edges
- Handle different query types

## Exercise 5: Error Handling and Recovery

### Task
Implement robust error handling and recovery mechanisms.

### Requirements
- Create a new file `robust-chat.ts`
- Add comprehensive error handling
- Implement recovery mechanisms
- Add input validation
- Handle streaming errors

### Example
```typescript
try {
  const response = await robustChat("Invalid input");
} catch (error) {
  // Should handle error gracefully
}
```

### Hints
- Use try-catch blocks
- Implement input validation
- Add error recovery logic

## Exercise 6: Session Management

### Task
Implement session management for the chatbot.

### Requirements
- Create a new file `session-chat.ts`
- Add session creation and cleanup
- Implement session timeouts
- Handle multiple concurrent sessions
- Add session state persistence

### Example
```typescript
const session = await createSession();
const response = await sessionChat("Hello", session.id);
// Should maintain session state
```

### Hints
- Use unique session IDs
- Implement timeout mechanisms
- Handle session cleanup

## Exercise 7: Performance Optimization

### Task
Optimize the chatbot's performance and resource usage.

### Requirements
- Create a new file `optimized-chat.ts`
- Implement response caching
- Add rate limiting
- Optimize memory usage
- Add performance monitoring

### Example
```typescript
const response = await optimizedChat("Frequently asked question");
// Should use cached response if available
```

### Hints
- Implement caching strategies
- Add rate limiting
- Monitor resource usage

## Bonus Exercise: Custom Memory Implementation

### Task
Create a custom memory implementation for the chatbot.

### Requirements
- Create a new file `custom-memory-chat.ts`
- Implement custom memory storage
- Add memory compression
- Handle memory persistence
- Implement memory cleanup

### Example
```typescript
const response = await customMemoryChat("Remember this: important information");
// Should store and retrieve from custom memory
```

### Hints
- Design efficient memory structure
- Implement compression
- Handle persistence

## Submission Guidelines

1. Create a new directory for your solutions
2. Implement each exercise in a separate file
3. Include proper error handling
4. Add comments explaining your implementation
5. Include example usage
6. Test your implementation thoroughly

## Evaluation Criteria

1. **Functionality**
   - Correct implementation
   - Proper error handling
   - Expected behavior

2. **Code Quality**
   - Clean code structure
   - Proper documentation
   - Efficient implementation

3. **Advanced Features**
   - Implementation of bonus features
   - Performance optimization
   - Resource management

## Resources

- [LangChain Documentation](https://js.langchain.com/docs/)
- [StateGraph Documentation](https://js.langchain.com/docs/modules/agents/agent_types/)
- [OpenAI API Documentation](https://platform.openai.com/docs/api-reference) 