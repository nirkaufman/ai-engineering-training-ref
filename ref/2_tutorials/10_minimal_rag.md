# Building a Minimal RAG System with Streaming Responses

This tutorial guides you through creating a minimal Retrieval-Augmented Generation (RAG) system that uses streaming responses to provide real-time feedback during the retrieval and generation process.

## Prerequisites

- Next.js environment
- LangChain packages installed
- OpenAI API key configured
- Basic understanding of TypeScript
- Knowledge of React and streaming concepts

## 1. Setting Up the Environment

First, let's set up our models and vector store.

```typescript
// Instantiate the language model
const llm = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0
});

// Instantiate the embedding model
const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-large"
});

// Create a vector store
const vectorStore = new MemoryVectorStore(embeddings);
```

This setup:
- Configures the language model
- Sets up embeddings
- Initializes the vector store

## 2. Loading and Processing Documents

Next, we'll load and process our documents.

```typescript
// Load documents using CheerioWebBaseLoader
const cheerioLoader = new CheerioWebBaseLoader(
  "https://lilianweng.github.io/posts/2023-06-23-agent/",
  {
    selector: "p",
  }
);

// Load and split documents
const docs = await cheerioLoader.load();
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

const allSplits = await splitter.splitDocuments(docs);
await vectorStore.addDocuments(allSplits);
```

This implementation:
- Loads web content
- Splits documents into chunks
- Stores documents in the vector store

## 3. Setting Up the RAG Pipeline

Let's set up the RAG pipeline components.

```typescript
// Get the RAG prompt template
const promptTemplate = await pull<ChatPromptTemplate>("rlm/rag-prompt");

// Define state annotations
const InputStateAnnotation = Annotation.Root({
  question: Annotation<string>,
});

const StateAnnotation = Annotation.Root({
  question: Annotation<string>,
  context: Annotation<Document[]>,
  answer: Annotation<string>,
});
```

This setup:
- Configures the prompt template
- Defines state types
- Sets up type safety

## 4. Implementing the Graph Nodes

Now, let's implement the core RAG functionality.

```typescript
// Retrieval node
const retrieve = async (state: typeof InputStateAnnotation.State) => {
  const retrievedDocs = await vectorStore.similaritySearch(state.question);
  return { context: retrievedDocs };
};

// Generation node
const generate = async (state: typeof StateAnnotation.State) => {
  const docsContent = state.context.map((doc) => doc.pageContent).join("\n");
  const messages = await promptTemplate.invoke({
    question: state.question,
    context: docsContent,
  });
  const response = await llm.invoke(messages);
  return { answer: response.content };
};
```

This implementation:
- Handles document retrieval
- Processes context
- Generates responses

## 5. Building the Graph

Let's create the graph that ties everything together.

```typescript
const graph = new StateGraph(StateAnnotation)
  .addNode("retrieve", retrieve)
  .addNode("generate", generate)
  .addEdge("__start__", "retrieve")
  .addEdge("retrieve", "generate")
  .addEdge("generate", "__end__")
  .compile();
```

This setup:
- Defines the workflow
- Connects the nodes
- Compiles the graph

## 6. Implementing Streaming

Finally, let's implement the streaming functionality.

```typescript
export async function chatWithRag(question: string) {
  // Format the question
  const formattedQuestion = await promptTemplate.formatMessages({
    question: question,
    context: ""
  });

  // Ensure we have a string content
  const formattedContent = typeof formattedQuestion[0].content === 'string'
    ? formattedQuestion[0].content
    : question;

  // Stream the response
  const stream = await graph.stream({ question: formattedContent }, {
    streamMode: 'updates'
  });

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          // Format and send different types of chunks
          if (chunk.question) {
            controller.enqueue(`{ question: '${chunk.question}' }\n\n---\n\n`);
          }
          else if (chunk.retrieve?.context) {
            const contextStr = `{\n  retrieve: { context: [ ${chunk.retrieve.context.map(() => '[Document]').join(', ')} ] }\n}\n\n---\n\n`;
            controller.enqueue(contextStr);
          }
          else if (chunk.generate?.answer) {
            const answerStr = `{\n  generate: {\n    answer: '${chunk.generate.answer}'\n  }\n}\n\n----\n`;
            controller.enqueue(answerStr);
          }
        }
        controller.close();
      } catch (error) {
        console.error("Error in RAG chat stream:", error);
        controller.error(error);
      }
    },
  });
}
```

This implementation:
- Formats the question
- Handles streaming
- Provides real-time feedback
- Manages errors

## Usage Examples

### Basic RAG Query
```typescript
const stream = await chatWithRag("What is an agent?");
const reader = stream.getReader();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  console.log(value);
}
```

### Error Handling
```typescript
try {
  const stream = await chatWithRag(question);
  // Process stream
} catch (error) {
  console.error("RAG error:", error);
  // Handle error
}
```

## Best Practices

1. **Document Processing**
   - Use appropriate chunk sizes
   - Implement proper overlap
   - Handle document metadata

2. **Retrieval**
   - Optimize similarity search
   - Handle empty results
   - Manage context window

3. **Generation**
   - Format prompts properly
   - Handle context limits
   - Manage response quality

4. **Streaming**
   - Handle different chunk types
   - Provide meaningful feedback
   - Implement proper error handling

## Common Issues and Solutions

1. **Streaming Issues**
   - Problem: Chunks not processing
   - Solution: Check chunk types
   - Best Practice: Implement proper type checking

2. **Retrieval Problems**
   - Problem: Poor context relevance
   - Solution: Adjust chunk size
   - Best Practice: Fine-tune similarity search

3. **Generation Quality**
   - Problem: Inconsistent responses
   - Solution: Improve prompt template
   - Best Practice: Add context validation

## Next Steps

1. Add more document sources
2. Implement caching
3. Add response formatting
4. Implement error recovery
5. Add performance monitoring

## Resources

- [LangChain Documentation](https://js.langchain.com/docs/)
- [OpenAI API Documentation](https://platform.openai.com/docs/)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions)
- [Streams API](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API) 