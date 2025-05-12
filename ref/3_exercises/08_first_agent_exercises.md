# First Agent Implementation Exercises

These exercises will help you build and enhance your first agent using LangChain's ReAct framework. Each exercise builds upon the previous one, gradually introducing more complex concepts and features.

## Exercise 1: Basic Agent Setup

**Task**: Create a basic agent with a single search tool.

**Requirements**:
- Set up the necessary imports
- Configure the Tavily search tool
- Initialize the language model
- Create a basic agent instance

**Example Usage**:
```typescript
const agent = createBasicAgent();
const response = await agent.chat("What is the latest news about AI?");
```

**Hints**:
- Use `ChatOpenAI` for the language model
- Configure the search tool with appropriate parameters
- Set temperature to 0 for consistent results

**Submission Guidelines**:
- Submit a single TypeScript file
- Include all necessary imports
- Document your configuration choices

**Evaluation Criteria**:
- Correct tool configuration
- Proper model initialization
- Clean code structure
- Appropriate error handling

## Exercise 2: Memory Management

**Task**: Implement memory persistence for the agent.

**Requirements**:
- Add memory saver functionality
- Implement thread management
- Handle conversation state
- Add cleanup procedures

**Example Usage**:
```typescript
const agent = createAgentWithMemory();
const response1 = await agent.chat("What is machine learning?");
const response2 = await agent.chat("Can you explain more about that?");
// Should maintain context from previous messages
```

**Hints**:
- Use `MemorySaver` for state persistence
- Implement unique thread IDs
- Add proper cleanup methods

**Submission Guidelines**:
- Submit a TypeScript file with memory implementation
- Include memory cleanup procedures
- Document memory management approach

**Evaluation Criteria**:
- Proper state persistence
- Thread management
- Memory cleanup
- Context maintenance

## Exercise 3: Response Streaming

**Task**: Implement streaming responses with detailed feedback.

**Requirements**:
- Set up response streaming
- Handle different types of chunks
- Provide detailed feedback
- Implement proper error handling

**Example Usage**:
```typescript
const agent = createStreamingAgent();
const stream = await agent.chat("Research the latest AI developments");
for await (const chunk of stream) {
  console.log(chunk);
  // Should show different types of responses
}
```

**Hints**:
- Use `ReadableStream` for streaming
- Handle different chunk types
- Implement proper error handling
- Add detailed logging

**Submission Guidelines**:
- Submit a TypeScript file with streaming implementation
- Include chunk handling logic
- Document streaming approach

**Evaluation Criteria**:
- Proper stream handling
- Chunk type management
- Error handling
- Response formatting

## Exercise 4: Custom Tool Integration

**Task**: Add a custom tool to the agent.

**Requirements**:
- Create a custom tool
- Integrate it with the agent
- Handle tool responses
- Implement error handling

**Example Usage**:
```typescript
const agent = createAgentWithCustomTool();
const response = await agent.chat("Calculate the sentiment of this text: 'I love AI'");
// Should use custom sentiment analysis tool
```

**Hints**:
- Create a tool class
- Implement tool interface
- Add proper error handling
- Document tool usage

**Submission Guidelines**:
- Submit a TypeScript file with custom tool
- Include tool implementation
- Document tool usage

**Evaluation Criteria**:
- Tool implementation
- Integration with agent
- Error handling
- Documentation

## Exercise 5: Advanced Agent Features

**Task**: Implement advanced agent features and optimizations.

**Requirements**:
- Add response formatting
- Implement retry logic
- Add performance monitoring
- Optimize tool usage

**Example Usage**:
```typescript
const agent = createAdvancedAgent();
const response = await agent.chat("Analyze this complex query with multiple steps");
// Should show optimized tool usage and formatted responses
```

**Hints**:
- Implement response formatting
- Add retry mechanisms
- Monitor performance
- Optimize tool calls

**Submission Guidelines**:
- Submit a TypeScript file with advanced features
- Include performance monitoring
- Document optimizations

**Evaluation Criteria**:
- Feature implementation
- Performance optimization
- Error handling
- Code quality

## Final Project

**Task**: Create a complete agent implementation with all features.

**Requirements**:
- Combine all previous exercises
- Add additional features
- Implement comprehensive error handling
- Add documentation

**Example Usage**:
```typescript
const agent = createCompleteAgent();
const response = await agent.chat("Perform a complex analysis with multiple steps");
// Should demonstrate all implemented features
```

**Hints**:
- Review all previous exercises
- Add comprehensive error handling
- Implement all features
- Add thorough documentation

**Submission Guidelines**:
- Submit a complete TypeScript implementation
- Include all features
- Add comprehensive documentation
- Provide usage examples

**Evaluation Criteria**:
- Feature completeness
- Code quality
- Error handling
- Documentation
- Performance
- User experience

## Resources

- [LangChain Agents Documentation](https://js.langchain.com/docs/modules/agents/)
- [ReAct Agent Guide](https://js.langchain.com/docs/modules/agents/agent_types/react)
- [Tavily Search API](https://tavily.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/) 