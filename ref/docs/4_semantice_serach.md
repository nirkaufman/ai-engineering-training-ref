# Building a Semantic Search API with Vector Embeddings

This tutorial provides a comprehensive guide to implementing a semantic search API that processes PDF documents, creates vector embeddings, and enables advanced search capabilities using LangChain and OpenAI. The implementation follows a structured approach with proper error handling and performance considerations.

## Table of Contents

1. [Introduction to Semantic Search](#introduction-to-semantic-search)
2. [Prerequisites](#prerequisites)
3. [Architecture Overview](#architecture-overview)
4. [Step 1: Setting Up Dependencies](#step-1-setting-up-dependencies)
5. [Step 2: Implementing PDF Document Loading](#step-2-implementing-pdf-document-loading)
6. [Step 3: Creating Text Splitters](#step-3-creating-text-splitters)
7. [Step 4: Implementing Vector Store](#step-4-implementing-vector-store)
8. [Step 5: Building the API Route Handler](#step-5-building-the-api-route-handler)
9. [Step 6: Streaming Search Results](#step-6-streaming-search-results)
10. [Advanced Optimizations](#advanced-optimizations)
11. [Troubleshooting](#troubleshooting)
12. [Next Steps](#next-steps)

## Introduction to Semantic Search

Traditional search methods rely on keyword matching, which can miss conceptually related content. Semantic search, on the other hand, understands the intent and contextual meaning behind a search query, providing more relevant results even when exact keywords aren't present.

Vector embeddings enable semantic search by converting text into numerical vectors that capture semantic meaning. Documents with similar meaning have vectors that are close together in high-dimensional space, allowing for similarity-based retrieval.

## Prerequisites

Before starting this tutorial, ensure you have:

- Next.js 14 or later
- Node.js 18+
- An OpenAI API key (for creating embeddings)
- Basic understanding of TypeScript and asynchronous programming
- The following packages installed:
   - `@langchain/community`
   - `@langchain/openai`
   - `@langchain/textsplitters`
   - `langchain/vectorstores`
   - `pdf-parse`

## Architecture Overview

Our implementation follows this pattern:

1. **Data Loading**: Load PDF documents from a specified directory
2. **Text Processing**: Split documents into manageable chunks for embedding
3. **Embedding Creation**: Generate vector embeddings for each chunk
4. **Vector Storage**: Store embeddings in memory for quick retrieval
5. **API Endpoint**: Create an API route that accepts queries and returns matches
6. **Result Streaming**: Stream search results back to the client for responsive UX

## Step 1: Setting Up Dependencies

Let's start by importing all necessary dependencies and setting up configuration constants:
