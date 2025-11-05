import { useState, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Send, Sparkles } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

const ChatBubble = ({ message }) => {
  const isUser = message.role === 'user'
  return (
    <div className={`flex mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-5 py-3 shadow-sm ${
          isUser
            ? 'bg-gradient-to-r from-teal-300 to-cyan-300 text-slate-800 rounded-br-sm'
            : 'bg-white border border-teal-100 text-gray-800 rounded-bl-sm'
        }`}
      >
        {isUser ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="text-sm leading-relaxed prose prose-sm max-w-none prose-headings:text-slate-800 prose-strong:text-slate-900 prose-p:text-gray-800 prose-li:text-gray-800">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}
        <span className={`text-[10px] mt-2 block ${isUser ? 'text-teal-700' : 'text-gray-400'}`}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
        </span>
      </div>
    </div>
  )
}

const TypingIndicator = () => (
  <div className="flex items-center gap-2 px-5 py-4 bg-white border border-teal-100 rounded-2xl rounded-bl-sm max-w-[100px] shadow-sm">
    <span className="h-2 w-2 animate-bounce rounded-full bg-teal-400" style={{ animationDelay: '0ms' }} />
    <span className="h-2 w-2 animate-bounce rounded-full bg-teal-400" style={{ animationDelay: '150ms' }} />
    <span className="h-2 w-2 animate-bounce rounded-full bg-teal-400" style={{ animationDelay: '300ms' }} />
  </div>
)

const ChatBox = ({ messages, onSend, isLoading, suggestions = [], user = null, isProcessing = false }) => {
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading || isProcessing) return
    onSend(inputValue.trim())
    setInputValue('')
  }

  const handleSuggestion = (text) => {
    if (isLoading || isProcessing) return
    onSend(text)
  }

  // Get user's first name
  const getUserFirstName = () => {
    if (!user) return 'there'
    if (user.name) {
      return user.name.split(' ')[0]
    }
    if (user.email) {
      return user.email.split('@')[0]
    }
    return 'there'
  }

  return (
    <section className="flex h-screen flex-1 flex-col bg-gradient-to-br from-teal-50 via-cyan-50 to-teal-50">
      {/* Header - Premium Style */}
      <header className="flex items-center justify-between border-b border-teal-100 bg-white/80 backdrop-blur-sm px-6 py-4 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Sparkles className="text-teal-400" size={20} />
            Chat with Clari
          </h2>
          <p className="text-xs text-slate-500">Your AI-powered medical insights assistant</p>
        </div>
      </header>

      {/* Processing Banner */}
      {isProcessing && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              <span className="h-2 w-2 animate-bounce rounded-full bg-amber-500" style={{ animationDelay: '0ms' }} />
              <span className="h-2 w-2 animate-bounce rounded-full bg-amber-500" style={{ animationDelay: '150ms' }} />
              <span className="h-2 w-2 animate-bounce rounded-full bg-amber-500" style={{ animationDelay: '300ms' }} />
            </div>
            <p className="text-sm text-amber-800 font-medium">
              Processing your document... This usually takes 20-30 seconds. Chat will be enabled once complete.
            </p>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-6 py-6"
        style={{ height: 'calc(100vh - 140px)' }}
      >
        {messages.length === 0 ? (
          // Empty State - Premium Design
          <div className="flex h-full flex-col items-center justify-center space-y-6">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-teal-200 to-cyan-200 mb-4">
                <Sparkles className="text-teal-600" size={32} />
              </div>
              <h3 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Hey {getUserFirstName()}!
              </h3>
              <p className="text-sm text-slate-600 max-w-md">
                Upload your medical records and ask questions to summarize, explain, or plan your care.
              </p>
            </div>

            {/* Suggestion Pills - Premium Style */}
            <div className="flex flex-wrap justify-center gap-3 pt-4">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => handleSuggestion(suggestion)}
                  disabled={isLoading || isProcessing}
                  className="rounded-full bg-white border border-teal-200 px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-teal-400 hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 hover:text-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Input Box - Premium Style */}
      <form onSubmit={handleSubmit} className="border-t border-teal-100 bg-white/80 backdrop-blur-sm px-6 py-4 shadow-lg">
        <div className="flex items-center gap-3 rounded-xl border-2 border-teal-200 bg-white px-4 py-2 focus-within:border-teal-400 focus-within:shadow-md transition">
          <input
            type="text"
            placeholder={isProcessing ? "Processing document..." : "Ask Clari anything..."}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading || isProcessing}
            className="flex-1 border-none bg-transparent text-sm text-gray-800 placeholder-slate-400 outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || isProcessing || !inputValue.trim()}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-teal-400 to-cyan-400 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:from-teal-500 hover:to-cyan-500 hover:shadow-md disabled:cursor-not-allowed disabled:from-gray-300 disabled:to-gray-300"
          >
            <span>Send</span>
            <Send size={16} />
          </button>
        </div>
      </form>
    </section>
  )
}

ChatBox.propTypes = {
  messages: PropTypes.array.isRequired,
  onSend: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  suggestions: PropTypes.array,
  user: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
  }),
  isProcessing: PropTypes.bool,
}

export default ChatBox
