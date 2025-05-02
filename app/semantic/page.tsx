'use client'

import { useState, useRef, useEffect, FormEvent } from 'react'

type Message = {
  id: string
  role: 'user' | 'ai'
  content: string
  isSearchResult?: boolean
  pageContent?: string
  metadata?: any
}

// Helper function to generate unique IDs
const generateId = (() => {
  let counter = 0;
  return () => `${Date.now()}-${counter++}`;
})();

// Function to stream semantic search results
async function streamSemanticSearch(query: string) {
  const response = await fetch('/api/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.body;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Automatically scroll to the bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!inputValue.trim() || isStreaming) return

    // Add a user message to the chat with unique ID
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: inputValue.trim()
    }

    setMessages(prev => [...prev, userMessage])

    // Store user input and clear the form
    const userQuery = inputValue

    setInputValue('')
    setIsStreaming(true)

    try {
      // Add a placeholder message for search results
      const resultsMessageId = generateId()

      setMessages(prev => [...prev, {
        id: resultsMessageId,
        role: 'ai',
        content: 'Searching for relevant information...',
        isSearchResult: true
      }])

      // Start streaming search results
      const stream = await streamSemanticSearch(userQuery)

      if (!stream) {
        throw new Error('No stream returned from search API')
      }

      const reader = stream.getReader()

      // Array to collect search results
      const searchResults: any[] = []

      // Process the stream
      while (true) {
        const { done, value } = await reader.read()

        if (done) break

        // Convert the chunk to text
        const chunk = new TextDecoder().decode(value)

        // Handle SSE format (data: {...})
        const lines = chunk.split('\n\n')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const jsonData = JSON.parse(line.substring(6))
              searchResults.push(jsonData)

              // Update the message with search results
              setMessages(prev => {
                return prev.map(msg =>
                  msg.id === resultsMessageId
                    ? {
                        ...msg,
                        content: `Found ${searchResults.length} relevant results from the document.`,
                        pageContent: jsonData.pageContent,
                        metadata: jsonData.metadata
                      }
                    : msg
                )
              })
            } catch (e) {
              console.error('Error parsing JSON:', e)
            }
          }
        }
      }

      // If no results were found
      if (searchResults.length === 0) {
        setMessages(prev => {
          return prev.map(msg =>
            msg.id === resultsMessageId
              ? { ...msg, content: 'No relevant information found in the document.' }
              : msg
          )
        })
      }

      // Add individual search results as separate messages
      searchResults.forEach((result, index) => {
        setMessages(prev => [...prev, {
          id: generateId(),
          role: 'ai',
          content: `Result ${index + 1}:\n\n${result.pageContent}`,
          isSearchResult: true,
          pageContent: result.pageContent,
          metadata: result.metadata
        }])
      })

    } catch (error) {
      console.error('Streaming error:', error)

      // Add an error message with unique ID
      setMessages(prev => [...prev, {
        id: generateId(),
        role: 'ai',
        content: 'Sorry, there was an error processing your search request.',
        isSearchResult: true
      }])
    } finally {
      setIsStreaming(false)
    }
  }

  return (
      <div className="flex flex-col h-screen">
        {/* Messages container */}
        <div className="flex-1 overflow-y-auto px-4 py-5">
          <div className="max-w-2xl mx-auto">
            {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-10">
                  Search the document by typing a query below
                </div>
            ) : (
                messages.map((message) => (
                    <div
                        key={message.id}
                        className={`mb-4 p-4 rounded-lg ${
                            message.role === 'user'
                                ? 'border-white border mr-auto max-w-[80%]'
                                : message.isSearchResult 
                                  ? 'border-blue-400 border ml-auto max-w-[80%]' 
                                  : 'border-orange-400 border ml-auto max-w-[80%]'
                        }`}
                    >
                      <div className="text-sm font-semibold mb-1">
                        {message.role === 'user' ? 'You:' : message.isSearchResult ? 'Search:' : 'AI:'}
                      </div>
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      {message.metadata && (
                        <div className="mt-2 text-xs text-gray-500">
                          Source file: {message.metadata.source?.split('/').pop() || 'unknown'} in
                          Page { message.metadata.loc?.pageNumber || 'unknown'}
                        </div>
                      )}
                    </div>
                ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input form fixed at the bottom */}
        <div className="border-t border-gray-200 bg-black">
          <div className="max-w-2xl mx-auto p-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                  autoFocus
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Search the document..."
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  disabled={isStreaming}
              />
              <button
                  type="submit"
                  className={`bg-black text-white border border-orange-400 px-4 py-2 rounded-lg ${!isStreaming ? 'hover:bg-orange-400' : 'opacity-50'} focus:outline-none cursor-pointer`}
                  disabled={isStreaming}
              >
                {isStreaming ? 'Searching...' : 'Search'}
              </button>
            </form>
          </div>
        </div>
      </div>
  )
}
