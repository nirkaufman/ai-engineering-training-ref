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
