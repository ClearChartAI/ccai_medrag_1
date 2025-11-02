import { useState, useRef, useEffect } from 'react'
import { EllipsisVertical, Send } from 'lucide-react'

const ChatBubble = ({ message }) => {
  const isUser = message.role === 'user'
  return (
    <div className={`flex mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-5 py-3 shadow-sm ${
          isUser
            ? 'bg-brand-blue text-white rounded-br-sm'
            : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm'
        }`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        <span className={`text-[10px] mt-2 block ${isUser ? 'text-blue-100' : 'text-gray-400'}`}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
        </span>
      </div>
    </div>
  )
}

const TypingIndicator = () => (
  <div className="flex items-center gap-2 px-5 py-4 bg-white border border-gray-200 rounded-2xl rounded-bl-sm max-w-[100px] shadow-sm">
    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0ms' }} />
    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '150ms' }} />
    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '300ms' }} />
  </div>
)

const ChatBox = ({ messages, onSend, isLoading, suggestions = [] }) => {
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return
    onSend(inputValue.trim())
    setInputValue('')
  }

  const handleSuggestion = (text) => {
    if (isLoading) return
    onSend(text)
  }

  return (
    <section className="flex h-screen flex-1 flex-col bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Chat Box</h2>
          <p className="text-xs text-gray-500">Ask Clari anything about your medical records</p>
        </div>
        <button type="button" className="rounded-full p-2 text-gray-400 hover:bg-gray-100 transition">
          <EllipsisVertical size={20} />
        </button>
      </header>

      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-6 py-6"
        style={{ height: 'calc(100vh - 140px)' }}
      >
        {messages.length === 0 ? (
          // Empty State - Centered
          <div className="flex h-full flex-col items-center justify-center space-y-6">
            <div className="text-center space-y-3">
              <h3 className="text-4xl font-bold text-gray-800">Hey Dhruv</h3>
              <p className="text-sm text-gray-500 max-w-md">
                Upload your medical records and ask questions to summarize, explain, or plan your care.
              </p>
            </div>

            {/* Suggestion Pills */}
            <div className="flex flex-wrap justify-center gap-3 pt-4">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => handleSuggestion(suggestion)}
                  disabled={isLoading}
                  className="rounded-full bg-white border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:border-brand-blue hover:bg-blue-50 hover:text-brand-blue disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          // Messages
          <div className="space-y-4 pb-4">
            {messages.map((message) => (
              <ChatBubble key={message.id} message={message} />
            ))}
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Box - Fixed at Bottom */}
      <form onSubmit={handleSubmit} className="border-t border-gray-200 bg-white px-6 py-4 shadow-lg">
        <div className="flex items-center gap-3 rounded-xl border-2 border-gray-200 bg-white px-4 py-2 focus-within:border-brand-blue transition">
          <input
            type="text"
            placeholder="Ask Clari..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
            className="flex-1 border-none bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="flex items-center gap-2 rounded-lg bg-brand-blue px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            <span>Send</span>
            <Send size={16} />
          </button>
        </div>
      </form>
    </section>
  )
}

export default ChatBox
