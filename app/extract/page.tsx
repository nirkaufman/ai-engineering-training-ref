'use client'


import {FormEvent, useEffect, useRef, useState} from 'react'
import {streamExtraction} from '@/server/extraction-chain-action'

type Message = {
  id: string
  role: 'user' | 'ai'
  content: string
  isExtraction?: boolean
  extraction?: string
}

// Helper function to generate unique IDs
const generateId = (() => {
  let counter = 0;
  return () => `${Date.now()}-${counter++}`;
})();

export default function ExtractionPage() {
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
    const userText = inputValue

    setInputValue('')
    setIsStreaming(true)

    try {
      // Add an empty AI message that will be populated with streaming content
      const aiMessageId = generateId()

      setMessages(prev => [...prev, {
        id: aiMessageId,
        role: 'ai',
        content: 'Extracting from your text...',
        isExtraction: true
      }])

      // Start streaming classification
      const stream = await streamExtraction(userText)

      if (!stream) {
        throw new Error('No stream returned from extraction API')
      }

      const reader = stream.getReader()
      let fullResponse = ''

      // Process the stream
      while (true) {
        const { done, value } = await reader.read()

        if (done) break

        // Convert the chunk to text and append to full response
        fullResponse += value

        // Update the AI message content with each chunk
        setMessages(prev => {
          return prev.map(msg =>
              msg.id === aiMessageId
                  ? {
                    ...msg,
                    content: fullResponse || 'Analyzing...',
                  }
                  : msg
          )
        })
      }

      // When stream is complete, update with final classification
      setMessages(prev => {
        return prev.map(msg =>
            msg.id === aiMessageId
                ? {
                  ...msg,
                  content: fullResponse,
                  classification: 'Complete'
                }
                : msg
        )
      })

    } catch (error) {
      console.error('Streaming error:', error)

      // Add an error message with unique ID
      setMessages(prev => [...prev, {
        id: generateId(),
        role: 'ai',
        content: 'Sorry, there was an error processing your extraction request.',
        isClassification: true
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
                  Enter text to extract below
                </div>
            ) : (
                messages.map((message) => (
                    <div
                        key={message.id}
                        className={`mb-4 p-4 rounded-lg ${
                            message.role === 'user'
                                ? 'border-white border mr-auto max-w-[80%]'
                                : message.isExtraction
                                    ? 'border-blue-400 border ml-auto max-w-[80%]'
                                    : 'border-orange-400 border ml-auto max-w-[80%]'
                        }`}
                    >
                      <div className="text-sm font-semibold mb-1">
                        {message.role === 'user' ? 'You:' : message.isExtraction ? 'Extraction:' : 'AI:'}
                      </div>
                      <div className="whitespace-pre-wrap">{message.content}</div>
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
                  placeholder="Enter text to extract from..."
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  disabled={isStreaming}
              />
              <button
                  type="submit"
                  className={`bg-black text-white border border-green-400 px-4 py-2 rounded-lg ${!isStreaming ? 'hover:bg-green-400' : 'opacity-50'} focus:outline-none cursor-pointer`}
                  disabled={isStreaming}
              >
                {isStreaming ? 'Extracting...' : 'Extract'}
              </button>
            </form>
          </div>
        </div>
      </div>
  )
}
