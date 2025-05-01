'use client'

import { useState, useRef, useEffect, FormEvent } from 'react'
import {chatResponse} from "@/server/chat-action";

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

  //  Simple log response
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    const response = await chatResponse();
    console.log(response);
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
