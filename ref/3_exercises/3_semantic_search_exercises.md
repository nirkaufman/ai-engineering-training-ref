# Semantic Search Exercises

These exercises will help you practice and deepen your understanding of semantic search implementation using LangChain and vector stores.

## Exercise 1: Custom Document Loader
**Difficulty**: Intermediate
**Time**: 30-45 minutes

Create a custom document loader that can handle both PDF and TXT files. The loader should:
1. Support multiple file types
2. Extract metadata (file name, creation date, file size)
3. Handle different text encodings
4. Implement error handling for corrupted files

```typescript
// Your implementation here
class CustomDocumentLoader {
  // Add your code
}
```

**Learning Objectives**:
- Understanding document loading process
- Working with different file types
- Implementing robust error handling
- Managing document metadata

## Exercise 2: Chunking Strategy Optimization
**Difficulty**: Advanced
**Time**: 45-60 minutes

Implement different chunking strategies and compare their effectiveness:
1. Create a sliding window chunker
2. Implement a semantic chunker that splits on sentence boundaries
3. Add overlap handling for different chunk sizes
4. Measure and compare search quality with different strategies

```typescript
// Example structure
class ChunkingStrategy {
  static slidingWindow(text: string, size: number, overlap: number): string[] {
    // Your implementation
  }

  static semanticChunking(text: string, minSize: number, maxSize: number): string[] {
    // Your implementation
  }
}
```

**Learning Objectives**:
- Understanding different chunking approaches
- Impact of chunk size on search quality
- Performance optimization
- Measuring search effectiveness

## Exercise 3: Hybrid Search Implementation
**Difficulty**: Advanced
**Time**: 60-90 minutes

Create a hybrid search system that combines:
1. Semantic search using embeddings
2. Keyword-based search
3. Metadata filtering
4. Result ranking and scoring

```typescript
class HybridSearch {
  async search(query: string, options: SearchOptions): Promise<SearchResult[]> {
    // Combine semantic and keyword search
    // Implement ranking
    // Add metadata filtering
  }
}
```

**Learning Objectives**:
- Combining different search strategies
- Implementing result ranking
- Working with metadata
- Optimizing search performance

## Bonus Challenge: Persistent Vector Store
**Difficulty**: Expert
**Time**: 90-120 minutes

Implement a persistent vector store using a database:
1. Choose a database (e.g., PostgreSQL with pgvector)
2. Implement CRUD operations for vectors
3. Add indexing for faster searches
4. Implement caching layer

```typescript
class PersistentVectorStore {
  async addDocuments(documents: Document[]): Promise<void> {
    // Your implementation
  }

  async similaritySearch(query: string, k: number): Promise<Document[]> {
    // Your implementation
  }
}
```

**Learning Objectives**:
- Working with databases
- Implementing vector storage
- Performance optimization
- Caching strategies

## Submission Guidelines

For each exercise:
1. Create a new branch in your repository
2. Implement the solution
3. Add tests for your implementation
4. Document your approach and any challenges faced
5. Create a pull request with your solution

## Evaluation Criteria

Your solutions will be evaluated based on:
- Code quality and organization
- Error handling and edge cases
- Performance considerations
- Documentation and comments
- Test coverage

## Resources

- [LangChain Document Loaders](https://js.langchain.com/docs/modules/data_connection/document_loaders/)
- [Vector Store Documentation](https://js.langchain.com/docs/modules/data_connection/vectorstores/)
- [Text Splitting Strategies](https://js.langchain.com/docs/modules/data_connection/text_splitter/)
- [Embedding Models](https://js.langchain.com/docs/modules/data_connection/text_embedding/) 