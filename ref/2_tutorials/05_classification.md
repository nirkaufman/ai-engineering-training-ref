# Building a Streaming Classification Server Action with Structured Output

This tutorial provides a detailed explanation of how to implement a server action that streams classification results from a large language model (LLM). We'll use LangChain, OpenAI, and Zod to create a real-time, streaming classification system with structured output validation.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Understanding Server Actions](#understanding-server-actions)
3. [Understanding Streaming Responses](#understanding-streaming-responses)
4. [Step 1: Setting Up the Environment](#step-1-setting-up-the-environment)
5. [Step 2: Defining Structured Output Schema](#step-2-defining-structured-output-schema)
6. [Step 3: Creating Prompt Templates](#step-3-creating-prompt-templates)
7. [Step 4: Implementing the Classification Logic](#step-4-implementing-the-classification-logic)
8. [Step 5: Creating the Streaming Response](#step-5-creating-the-streaming-response)
9. [Step 6: Error Handling](#step-6-error-handling)
10. [Step 7: Consuming the Streaming Response](#step-7-consuming-the-streaming-response)
11. [Advanced Customizations](#advanced-customizations)
12. [Troubleshooting](#troubleshooting)

## Prerequisites

Before starting this tutorial, make sure you have:

- Next.js 14 or later installed (for server actions support)
- Node.js 18 or later
- An OpenAI API key
- Basic understanding of TypeScript and async programming
- LangChain packages installed:
  - `@langchain/openai`
  - `@langchain/core`
  - `zod` (for schema validation)

## Understanding Server Actions

Server Actions are a feature in Next.js that allows you to define asynchronous functions that execute on the server. They're perfect for:

- Processing data before sending it to the client
- Interacting with external APIs securely (hiding API keys)
- Performing computations that would be too intensive for the client

By marking a function with the `'use server'` directive, you're telling Next.js that this function should only run on the server, even if it's imported into client components.

## Understanding Streaming Responses

Streaming responses allow you to send data to the client gradually as it becomes available, instead of waiting for the entire response to be ready. This is particularly useful when:

- Working with LLMs that generate text token by token
- Providing real-time feedback to users
- Reducing perceived latency in applications

The Web Streams API (`ReadableStream`) is used to create streaming responses.

## Step 1: Setting Up the Environment

First, let's create a file named `classification-action.ts` in the `server` directory and import the necessary dependencies:

```typescript
'use server'

import { ChatPromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
```

## Step 2: Defining Structured Output Schema

We'll use Zod to define a schema for our classification output. This ensures type safety and validation:

```typescript
const classificationSchema = z.object({
  sentiment: z.string().describe("The sentiment of the text"),
  aggressiveness: z
    .number()
    .int()
    .describe("How aggressive the text is on a scale from 1 to 10"),
  language: z.string().describe("The language the text is written in"),
});
```

## Step 3: Creating Prompt Templates

Create a prompt template that will guide the LLM in extracting the desired information:

```typescript
const taggingPrompt = ChatPromptTemplate.fromTemplate(
  `Extract the desired information from the following passage.

  Only extract the properties mentioned in the 'Classification' function.
  
  Passage:
  {input}
  `
);
```

## Step 4: Implementing the Classification Logic

Set up the LLM with structured output capabilities:

```typescript
const llm = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0
});

const llmWihStructuredOutput = llm.withStructuredOutput(classificationSchema, {
  name: "extractor",
});
```

## Step 5: Creating the Streaming Response

Implement the main classification function that streams results:

```typescript
export async function streamClassification(text: string) {
  const prompt = await taggingPrompt.invoke({ input: text });

  const messages = [
    new SystemMessage(
      "You are a content classifier. Analyze the text and classify it into one of these categories: " +
      "Business, Technology, Health, Education, Entertainment, or Other. " +
      "First, provide the classification category in a single word. " +
      "Then, on a new line, provide a brief explanation for why you classified it this way."
    ),
    new HumanMessage(prompt.toString()),
  ];

  const stream = await llmWihStructuredOutput.stream(messages);

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          controller.enqueue(JSON.stringify(chunk, null, 2));
        }
        controller.close();
      } catch (error) {
        console.error("Error in classification stream:", error);
        controller.error(error);
      }
    },
  });
}
```

## Step 6: Error Handling

The implementation includes basic error handling in the streaming process. When an error occurs:
- It's logged to the console
- The error is propagated to the client through the stream
- The stream is properly closed

## Step 7: Consuming the Streaming Response

To consume the streaming response in your frontend, you can use the following pattern:

```typescript
const response = await streamClassification(text);
const reader = response.getReader();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  // Process the chunk of data
  const result = JSON.parse(value);
  // Update UI with the result
}
```

## Advanced Customizations

You can customize the implementation by:

1. Modifying the classification schema to include additional fields
2. Adjusting the LLM parameters (temperature, model, etc.)
3. Enhancing the prompt template for more specific classifications
4. Adding additional validation or processing steps

## Troubleshooting

Common issues and solutions:

1. **Stream not starting**
   - Check if the OpenAI API key is properly configured
   - Verify that the text input is not empty
   - Ensure the server action is properly marked with 'use server'

2. **Invalid output format**
   - Verify that the schema matches the expected output
   - Check the prompt template for clarity
   - Ensure the LLM model supports structured output

3. **Performance issues**
   - Consider using a smaller model for faster responses
   - Implement caching for frequently classified texts
   - Optimize the prompt template for efficiency

## Conclusion

This implementation provides a robust foundation for streaming classification using LLMs. The structured output ensures type safety, while the streaming response enables real-time feedback to users. The modular design allows for easy customization and extension of the classification capabilities.