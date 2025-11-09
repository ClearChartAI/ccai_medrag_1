import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, MessageSquare, Calendar, Star, ArrowLeft, MessageCircle, ArrowRight } from 'lucide-react'
import { auth } from '../config/firebase'

const ChatHistoryPage = () => {
  const navigate = useNavigate()
  const [chats, setChats] = useState([])
  const [selectedChat, setSelectedChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

  const handleContinueChat = (chat) => {
    // Navigate back to dashboard with the chat context
    navigate('/dashboard', {
      state: {
        loadChatId: chat.chat_id,
        loadChatName: chat.title || 'Chat'
      }
    })
  }

  useEffect(() => {
    fetchChats()
  }, [])

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat.chat_id)
    }
  }, [selectedChat])

  const fetchChats = async () => {
    try {
      const user = auth.currentUser
      if (!user) return

      const token = await user.getIdToken()

      // Fetch all chats for the user from Firestore
      const response = await fetch(`${API_BASE_URL}/chats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setChats(data)
      }
    } catch (error) {
      console.error('Error fetching chats:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (chatId) => {
    try {
      const user = auth.currentUser
      if (!user) return

      const token = await user.getIdToken()

      const response = await fetch(`${API_BASE_URL}/chats/${chatId}/messages`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setMessages(data)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const filteredChats = chats.filter(chat => {
    if (!searchQuery) return true
    const title = chat.title || 'New Chat'
    return title.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const filteredMessages = messages.filter(msg => {
    if (!searchQuery) return true
    return msg.content.toLowerCase().includes(searchQuery.toLowerCase())
  })

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar - Chat List (Grok Style) */}
      <div className="w-64 border-r border-slate-200 bg-white flex flex-col">
        {/* Header */}
        <div className="border-b border-slate-200 px-4 py-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition mb-4"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Back</span>
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-sm text-slate-900 placeholder-slate-500 focus:border-slate-300 focus:outline-none focus:bg-white transition"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-slate-300 border-r-transparent"></div>
              <p className="mt-4 text-slate-500 text-sm">Loading...</p>
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="text-center py-12 px-6">
              <MessageSquare className="mx-auto text-slate-300 mb-4" size={48} />
              <p className="text-slate-500 text-sm">No chats found</p>
            </div>
          ) : (
            <div className="p-2">
              {filteredChats.map((chat) => (
                <div
                  key={chat.chat_id}
                  onClick={() => setSelectedChat(chat)}
                  className={`group relative rounded-lg px-3 py-2 mb-1 cursor-pointer transition-colors ${
                    selectedChat?.chat_id === chat.chat_id
                      ? 'bg-slate-100'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <MessageCircle className="text-slate-400 mt-0.5 flex-shrink-0" size={16} />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-slate-900 line-clamp-2 mb-0.5">
                        {chat.title || 'New Chat'}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {chat.message_count || 0} msg · {new Date(chat.created_at).toLocaleDateString([], {month: 'short', day: 'numeric'})}
                      </p>
                    </div>
                  </div>

                  {/* Continue Chat Button - shows when selected */}
                  {(selectedChat?.chat_id === chat.chat_id) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleContinueChat(chat)
                      }}
                      className="mt-2 w-full flex items-center justify-center gap-1.5 rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 transition"
                    >
                      <span>Continue Chat</span>
                      <ArrowRight size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content - Messages */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="border-b border-slate-200 px-8 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{selectedChat.title || 'New Chat'}</h2>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {messages.length} messages · {new Date(selectedChat.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleContinueChat(selectedChat)}
                  className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition"
                >
                  <span>Continue</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-auto px-8 py-6 bg-slate-50">
              <div className="mx-auto max-w-3xl space-y-4">
                {filteredMessages.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-slate-500">No messages found</p>
                  </div>
                ) : (
                  filteredMessages.map((message) => (
                    <div
                      key={message.message_id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          message.role === 'user'
                            ? 'bg-slate-900 text-white'
                            : 'bg-white text-slate-900 border border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={`text-xs font-medium ${message.role === 'user' ? 'text-white/90' : 'text-slate-600'}`}>
                            {message.role === 'user' ? 'You' : 'Clari'}
                          </span>
                          {message.pinned && (
                            <Star className="text-amber-400 fill-amber-400" size={12} />
                          )}
                          <span className={`text-xs ml-auto ${message.role === 'user' ? 'text-white/60' : 'text-slate-400'}`}>
                            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className={`text-sm whitespace-pre-wrap leading-relaxed ${message.role === 'user' ? 'text-white' : 'text-slate-800'}`}>
                          {message.content}
                        </p>
                        {message.sources && message.sources.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-slate-700/20">
                            <p className={`text-xs font-medium mb-2 ${message.role === 'user' ? 'text-white/70' : 'text-slate-500'}`}>
                              Sources:
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {message.sources.map((source, idx) => (
                                <span
                                  key={idx}
                                  className={`rounded px-2 py-0.5 text-xs ${
                                    message.role === 'user'
                                      ? 'bg-white/20 text-white/90'
                                      : 'bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  {source.metadata?.document_title || `Source ${idx + 1}`}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-slate-50">
            <div className="text-center">
              <MessageSquare className="mx-auto text-slate-300 mb-4" size={64} />
              <p className="text-slate-600 text-base font-medium mb-1">Select a chat to view messages</p>
              <p className="text-slate-400 text-sm">Choose from your history</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatHistoryPage
