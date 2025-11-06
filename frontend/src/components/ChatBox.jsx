import { useState, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Send, Sparkles, AlertCircle } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

const ChatBubble = ({ message }) => {
  const isUser = message.role === 'user'
  return (
    <div className={`flex mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-5 py-3.5 shadow-sm break-words ${
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-slate-100 text-slate-900'
        }`}
      >
        {isUser ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words overflow-wrap-anywhere">{message.content}</p>
        ) : (
          <div className="text-sm leading-relaxed prose prose-sm max-w-none prose-headings:text-slate-900 prose-strong:text-slate-900 prose-p:text-slate-900 prose-li:text-slate-900 break-words">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}
        <span className={`text-[10px] mt-2 block ${isUser ? 'text-blue-100' : 'text-slate-500'}`}>
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

  const MAX_CHARS = 2000
  const charCount = inputValue.length
  const charPercentage = (charCount / MAX_CHARS) * 100

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
    <section className="flex h-screen flex-1 flex-col bg-gradient-to-br from-teal-50 via-cyan-50 to-teal-50 relative">
      {/* Subtle Disclaimer */}
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5">
        <div className="flex items-center justify-center">
          <p className="text-xs text-slate-400 text-center">
            Clari helps you understand your medical records for clarity and is NOT a substitute for professional medical advice. Always consult a healthcare provider for medical concerns.
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-6 py-6 pb-32"
      >
        {messages.length === 0 ? (
          // Empty State - Premium Design
          <div className="flex h-full flex-col items-center justify-center space-y-8">
            <div className="text-center space-y-4">
              <h3 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Hey {getUserFirstName()}!
              </h3>
              <p className="text-sm text-slate-600 max-w-md">
                Upload your medical records and ask questions to summarize, explain, or plan your care.
              </p>
            </div>

            {/* Chat Input - Centered in empty state */}
            <div className="w-full max-w-2xl px-6">
              {isProcessing && (
                <div className="mb-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-full px-4 py-3 shadow-lg backdrop-blur-sm">
                  <div className="flex items-center justify-center gap-3">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-amber-500" style={{ animationDelay: '0ms' }} />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-amber-500" style={{ animationDelay: '150ms' }} />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-amber-500" style={{ animationDelay: '300ms' }} />
                    </div>
                    <p className="text-xs text-amber-800 font-medium">
                      Processing document... Chat will be enabled soon.
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="bg-white/95 backdrop-blur-md rounded-full shadow-2xl border border-teal-100">
                <div className="flex flex-col">
                  <div className="flex items-center gap-3 px-6 py-3.5">
                    <input
                      type="text"
                      placeholder={isProcessing ? "Processing document..." : "Ask Clari anything..."}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      maxLength={MAX_CHARS}
                      disabled={isLoading || isProcessing}
                      className="flex-1 border-none bg-transparent text-sm text-gray-800 placeholder-slate-400 outline-none disabled:opacity-50"
                    />
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium ${charCount > MAX_CHARS * 0.9 ? 'text-red-600' : 'text-slate-400'}`}>
                        {charCount}/{MAX_CHARS}
                      </span>
                      <button
                        type="submit"
                        disabled={isLoading || isProcessing || !inputValue.trim()}
                        className="flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-400 to-cyan-400 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:from-teal-500 hover:to-cyan-500 hover:shadow-lg disabled:cursor-not-allowed disabled:from-gray-300 disabled:to-gray-300"
                      >
                        <span>Send</span>
                        <Send size={16} />
                      </button>
                    </div>
                  </div>
                  {/* Character limit progress bar */}
                  {charCount > 0 && (
                    <div className="px-6 pb-2">
                      <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-200 ${
                            charPercentage > 90 ? 'bg-red-500' : charPercentage > 75 ? 'bg-amber-500' : 'bg-teal-400'
                          }`}
                          style={{ width: `${charPercentage}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </form>
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

      {/* Floating Chat Input Island - Only shown when there are messages */}
      {messages.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-3xl px-6 z-50">
          {isProcessing && (
            <div className="mb-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-full px-4 py-3 shadow-lg backdrop-blur-sm">
              <div className="flex items-center justify-center gap-3">
                <div className="flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-amber-500" style={{ animationDelay: '0ms' }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-amber-500" style={{ animationDelay: '150ms' }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-amber-500" style={{ animationDelay: '300ms' }} />
                </div>
                <p className="text-xs text-amber-800 font-medium">
                  Processing document... Chat will be enabled soon.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white/95 backdrop-blur-md rounded-full shadow-2xl border border-teal-100">
            <div className="flex flex-col">
              <div className="flex items-center gap-3 px-6 py-3.5">
                <input
                  type="text"
                  placeholder={isProcessing ? "Processing document..." : "Ask Clari anything..."}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  maxLength={MAX_CHARS}
                  disabled={isLoading || isProcessing}
                  className="flex-1 border-none bg-transparent text-sm text-gray-800 placeholder-slate-400 outline-none disabled:opacity-50"
                />
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium ${charCount > MAX_CHARS * 0.9 ? 'text-red-600' : 'text-slate-400'}`}>
                    {charCount}/{MAX_CHARS}
                  </span>
                  <button
                    type="submit"
                    disabled={isLoading || isProcessing || !inputValue.trim()}
                    className="flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-400 to-cyan-400 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:from-teal-500 hover:to-cyan-500 hover:shadow-lg disabled:cursor-not-allowed disabled:from-gray-300 disabled:to-gray-300"
                  >
                    <span>Send</span>
                    <Send size={16} />
                  </button>
                </div>
              </div>
              {/* Character limit progress bar */}
              {charCount > 0 && (
                <div className="px-6 pb-2">
                  <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-200 ${
                        charPercentage > 90 ? 'bg-red-500' : charPercentage > 75 ? 'bg-amber-500' : 'bg-teal-400'
                      }`}
                      style={{ width: `${charPercentage}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>
      )}
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
