# Building a Streaming Entity Extraction Application with Structured Output

This tutorial walks through creating a server action that extracts structured information from text using LangChain, OpenAI, and Zod. You'll learn how to build a real-time entity extraction system with structured output validation and streaming capabilities.

## Table of Contents

1. [Introduction](#introduction)
2. [Prerequisites](#prerequisites)
3. [Understanding Entity Extraction](#understanding-entity-extraction)
4. [Step 1: Setting Up Schema Validation](#step-1-setting-up-schema-validation)
5. [Step 2: Creating the Prompt Template](#step-2-creating-the-prompt-template)
6. [Step 3: Configuring the Language Model](#step-3-configuring-the-language-model)
7. [Step 4: Implementing the Streaming Server Action](#step-4-implementing-the-streaming-server-action)
8. [Step 5: Building the Client Interface](#step-5-building-the-client-interface)
9. [Advanced Considerations](#advanced-considerations)
10. [Troubleshooting](#troubleshooting)

## Introduction

Entity extraction is a fundamental natural language processing task that involves identifying and categorizing specific pieces of information from unstructured text. By using structured output with LLMs, we can extract information in a consistent, typed format that's easy to work with programmatically.

This tutorial builds on previous concepts of server actions and streaming, adding the powerful capability of structured output for more precise and reliable information extraction.

## Prerequisites

Before beginning this tutorial, ensure you have:

- Next.js 14+ (for server actions)
- Node.js 18+
- An OpenAI API key
- LangChain packages installed:
  - `@langchain/openai`
  - `@langchain/core`
  - `zod` (for schema validation)
- Familiarity with TypeScript, React, and async programming
- Understanding of the ReadableStream API

## Understanding Entity Extraction

Entity extraction (also known as Named Entity Recognition) identifies specific information from text. Traditional NER focuses on predefined categories like names, locations, and dates.

Using LLMs with structured output, we can:
- Extract custom entity types beyond standard categories
- Get results in a structured, type-safe format
- Handle complex relationships between entities
- Process ambiguous or implied information

The key advantages of structured extraction:
1. **Type safety** - Validate output formats
2. **Consistent data structure** - Predictable output format for all responses
3. **Nullability handling** - Clear indication when information is unavailable
4. **Developer-friendly** - Work with objects instead of parsing text

## Step 1: Setting Up Schema Validation

First, we'll define a schema using Zod to specify what information we want to extract and how it should be structured.

Create a file named `extraction-chain-action.ts` in your server directory:
