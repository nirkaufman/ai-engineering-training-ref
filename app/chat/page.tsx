


'use client'

import { useState, useRef, useEffect, FormEvent } from 'react'

type Message = {
  id: string
  role: 'user' | 'ai'
  content: string
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Automatically scroll to the bottom when messages change
  // It listens to the message array, so it will re-run when it changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // TODO: Mock implantation - remove after implementing
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (!inputValue.trim()) return;

    // Create a new user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim()
    }

    // Add user message to chat
    setMessages(prev => [...prev, userMessage])

    // Placeholder function - just logs the prompt for now
    console.log('User prompt:', inputValue)

    // TODO: Remove after implementing
    // Simulate AI response (in a real app, this would be an API call)
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: 'This is a placeholder AI response.'
      }
      setMessages(prev => [...prev, aiMessage])
    }, 500)

    // Clear input
    setInputValue('')
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Messages container */}
      <div className="flex-1 overflow-y-auto px-4 py-5">
        <div className="max-w-2xl mx-auto">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-10">
              Start a conversation by typing a message below
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`mb-4 p-4 rounded-lg ${
                  message.role === 'user' 
                    ? 'border-white border mr-auto max-w-[80%]' 
                    : 'border-orange-400 border ml-auto max-w-[80%]'
                }`}
              >
                <div className="text-sm font-semibold mb-1">
                  {message.role === 'user' ? 'You:' : 'AI:'}
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
              placeholder="Type your message here..."
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
            />
            <button
              type="submit"
              className="bg-black text-white border border-orange-400 px-4 py-2 rounded-lg hover:bg-orange-400 focus:outline-none cursor-pointer"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
