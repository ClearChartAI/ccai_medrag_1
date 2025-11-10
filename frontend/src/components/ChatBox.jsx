import { useState, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import { ArrowUp, Sparkles, Copy, Pin, ThumbsUp, ThumbsDown, Check, FileText, ChevronDown, ChevronUp } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import api from '../utils/api'

const ChatBubble = ({ message, currentChatId, currentChatName, onPinSuccess }) => {
  const isUser = message.role === 'user'
  const [showSources, setShowSources] = useState(false)
  const [copied, setCopied] = useState(false)
  const [liked, setLiked] = useState(false)
  const [disliked, setDisliked] = useState(false)
  const [pinned, setPinned] = useState(false)
  const [documentTitles, setDocumentTitles] = useState({})

  // Fetch document titles for sources
  useEffect(() => {
    const fetchDocumentTitles = async () => {
      if (!message.sources || message.sources.length === 0) return

      const uniqueDocIds = [...new Set(message.sources.map(s => s.document_id).filter(Boolean))]
      const titles = {}

      for (const docId of uniqueDocIds) {
        try {
          const response = await api.get(`/documents/${docId}`)
          titles[docId] = response.data.title || response.data.filename || 'Document'
        } catch (error) {
          console.error(`Failed to fetch document ${docId}:`, error)
          titles[docId] = 'Document'
        }
      }

      setDocumentTitles(titles)
    }

    fetchDocumentTitles()
  }, [message.sources])

  // Get unique document sources with titles
  const uniqueSources = message.sources
    ? Array.from(
        new Map(
          message.sources.map((source) => [
            source.document_id,
            {
              document_id: source.document_id,
              title: documentTitles[source.document_id] || 'Loading...',
              page: source.metadata?.page_number,
            },
          ])
        ).values()
      )
    : []

  // Action handlers
  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleLike = () => {
    setLiked(!liked)
    if (disliked) setDisliked(false)
  }

  const handleDislike = () => {
    setDisliked(!disliked)
    if (liked) setLiked(false)
  }

  const handlePin = async () => {
    if (pinned) {
      setPinned(false)
      return
    }

    try {
      await api.post('/notes', {
        content: message.content,
        pinned_message_id: message.message_id || message.id,
        chat_id: currentChatId,
        chat_name: currentChatName || 'Chat',
        tags: ['pinned', 'from-chat']
      })
      setPinned(true)
      if (onPinSuccess) onPinSuccess()
    } catch (error) {
      console.error('Failed to pin message:', error)
      alert('Failed to pin message. Please try again.')
    }
  }

  return (
    <div className={`flex mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-6 py-4 shadow-md ${
          isUser
            ? 'bg-gradient-to-br from-purple-500 via-indigo-500 to-teal-500 text-white'
            : 'bg-white text-slate-900 border border-slate-200'
        }`}
      >
        {isUser ? (
          <p className="text-base leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
        ) : (
          <>
            <div className="text-base leading-relaxed prose prose-slate max-w-none prose-headings:text-slate-900 prose-strong:text-slate-900 prose-p:text-slate-900 prose-li:text-slate-900 prose-a:text-teal-600 break-words">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-200">
              <button
                onClick={handleCopy}
                className="group flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 transition"
                title="Copy response"
              >
                {copied ? (
                  <>
                    <Check size={14} className="text-green-600" />
                    <span className="text-green-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Copy</span>
                  </>
                )}
              </button>

              <button
                onClick={handlePin}
                className={`group flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  pinned
                    ? 'bg-amber-100 text-amber-700'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
                title="Pin to Notes"
              >
                <Pin size={14} className={pinned ? 'fill-amber-700' : ''} />
                <span>{pinned ? 'Pinned' : 'Pin'}</span>
              </button>

              <button
                onClick={handleLike}
                className={`group flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  liked
                    ? 'bg-teal-100 text-teal-700'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
                title="Like response"
              >
                <ThumbsUp size={14} className={liked ? 'fill-teal-700' : ''} />
              </button>

              <button
                onClick={handleDislike}
                className={`group flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  disliked
                    ? 'bg-red-100 text-red-700'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
                title="Dislike response"
              >
                <ThumbsDown size={14} className={disliked ? 'fill-red-700' : ''} />
              </button>
            </div>

            {/* Sources section */}
            {uniqueSources.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <button
                  onClick={() => setShowSources(!showSources)}
                  className="flex items-center gap-2 text-xs font-medium text-teal-700 hover:text-teal-800 transition"
                >
                  <FileText size={14} />
                  <span>{uniqueSources.length} source{uniqueSources.length > 1 ? 's' : ''} cited</span>
                  {showSources ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {showSources && (
                  <div className="mt-3 space-y-2">
                    {uniqueSources.map((source) => (
                      <div
                        key={source.document_id}
                        className="flex items-center gap-2 text-xs bg-slate-50 rounded-lg px-3 py-2 border border-slate-200"
                      >
                        <FileText size={12} className="text-teal-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-slate-900 truncate block">
                            {source.title}
                          </span>
                          {source.page && (
                            <span className="text-slate-500">Page {source.page}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

ChatBubble.propTypes = {
  message: PropTypes.object.isRequired,
  currentChatId: PropTypes.string,
  currentChatName: PropTypes.string,
  onPinSuccess: PropTypes.func,
}

const TypingIndicator = () => (
  <div className="flex justify-start mb-6">
    <div className="flex items-center gap-3 px-6 py-4 bg-white border border-slate-200 rounded-2xl shadow-md">
      <Sparkles className="text-purple-500 animate-pulse" size={20} />
      <span className="text-sm text-slate-600 font-medium">Clari is thinking...</span>
    </div>
  </div>
)

const ChatBox = ({ messages, onSend, isLoading, suggestions = [], user = null, isProcessing = false, currentChatId = null, currentChatName = null }) => {
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)

  const MAX_CHARS = 2000

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
    <section className="flex h-screen flex-1 flex-col bg-gradient-to-br from-purple-50 via-teal-50 to-cyan-50 relative">
      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-6 py-6 pb-32"
      >
        {messages.length === 0 ? (
          // Empty State - Premium Design
          <div className="flex h-full flex-col items-center justify-center space-y-8">
            <div className="text-center space-y-4">
              <h3 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-teal-600 bg-clip-text text-transparent">
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

              <form onSubmit={handleSubmit} className="bg-white/95 backdrop-blur-md rounded-full shadow-2xl border border-purple-100">
                <div className="flex items-center gap-3 px-6 py-4">
                  <input
                    type="text"
                    placeholder={isProcessing ? "Processing document..." : "Ask Clari..."}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    maxLength={MAX_CHARS}
                    disabled={isLoading || isProcessing}
                    className="flex-1 border-none bg-transparent text-sm text-gray-800 placeholder-slate-400 outline-none disabled:opacity-50"
                  />
                  <span className="text-xs text-slate-400 whitespace-nowrap">
                    {inputValue.length}/{MAX_CHARS}
                  </span>
                  <button
                    type="submit"
                    disabled={isLoading || isProcessing || !inputValue.trim()}
                    className="flex items-center justify-center rounded-full bg-gradient-to-r from-purple-400 via-indigo-400 to-teal-400 p-2.5 text-white shadow-md transition hover:from-purple-500 hover:via-indigo-500 hover:to-teal-500 hover:shadow-lg disabled:cursor-not-allowed disabled:from-gray-300 disabled:to-gray-300"
                    title="Send message"
                  >
                    <ArrowUp size={18} />
                  </button>
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
                  className="rounded-full bg-white border border-purple-200 px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-purple-400 hover:bg-gradient-to-r hover:from-purple-50 hover:via-indigo-50 hover:to-teal-50 hover:text-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
              <ChatBubble
                key={message.id}
                message={message}
                currentChatId={currentChatId}
                currentChatName={currentChatName}
              />
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

          <form onSubmit={handleSubmit} className="bg-white/95 backdrop-blur-md rounded-full shadow-2xl border border-purple-100">
            <div className="flex items-center gap-3 px-6 py-4">
              <input
                type="text"
                placeholder={isProcessing ? "Processing document..." : "Ask Clari..."}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                maxLength={MAX_CHARS}
                disabled={isLoading || isProcessing}
                className="flex-1 border-none bg-transparent text-sm text-gray-800 placeholder-slate-400 outline-none disabled:opacity-50"
              />
              <span className="text-xs text-slate-400 whitespace-nowrap">
                {inputValue.length}/{MAX_CHARS}
              </span>
              <button
                type="submit"
                disabled={isLoading || isProcessing || !inputValue.trim()}
                className="flex items-center justify-center rounded-full bg-gradient-to-r from-purple-400 via-indigo-400 to-teal-400 p-2.5 text-white shadow-md transition hover:from-purple-500 hover:via-indigo-500 hover:to-teal-500 hover:shadow-lg disabled:cursor-not-allowed disabled:from-gray-300 disabled:to-gray-300"
                title="Send message"
              >
                <ArrowUp size={18} />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Disclaimer at bottom - no background, centered within ChatBox */}
      <div className="absolute bottom-0 left-0 right-0 px-6 py-3 z-40 pointer-events-none">
        <div className="flex items-center justify-center">
          <p className="text-xs text-slate-400 text-center">
            For informational purposes only. Not medical advice. Consult your healthcare provider.
          </p>
        </div>
      </div>
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
  currentChatId: PropTypes.string,
  currentChatName: PropTypes.string,
}

export default ChatBox
