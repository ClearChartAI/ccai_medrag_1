import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Tag, X, GripVertical, Trash2, Edit2, Save, ArrowLeft } from 'lucide-react'
import { auth } from '../config/firebase'

const NotesPage = () => {
  const navigate = useNavigate()
  const [notes, setNotes] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [tagFilter, setTagFilter] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [newNoteContent, setNewNoteContent] = useState('')
  const [newNoteTags, setNewNoteTags] = useState('')
  const [editingNoteId, setEditingNoteId] = useState(null)
  const [editContent, setEditContent] = useState('')
  const [editTags, setEditTags] = useState('')
  const [loading, setLoading] = useState(true)

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

  useEffect(() => {
    fetchNotes()
  }, [])

  const fetchNotes = async () => {
    try {
      const user = auth.currentUser
      if (!user) return

      const token = await user.getIdToken()
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      if (tagFilter) params.append('tags', tagFilter)

      const response = await fetch(`${API_BASE_URL}/notes?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setNotes(data)
      }
    } catch (error) {
      console.error('Error fetching notes:', error)
    } finally {
      setLoading(false)
    }
  }

  const createNote = async () => {
    if (!newNoteContent.trim()) return

    try {
      const user = auth.currentUser
      if (!user) return

      const token = await user.getIdToken()
      const tags = newNoteTags.split(',').map(t => t.trim()).filter(Boolean)

      const response = await fetch(`${API_BASE_URL}/notes`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newNoteContent,
          tags,
        }),
      })

      if (response.ok) {
        setNewNoteContent('')
        setNewNoteTags('')
        setIsCreating(false)
        fetchNotes()
      }
    } catch (error) {
      console.error('Error creating note:', error)
    }
  }

  const updateNote = async (noteId) => {
    try {
      const user = auth.currentUser
      if (!user) return

      const token = await user.getIdToken()
      const tags = editTags.split(',').map(t => t.trim()).filter(Boolean)

      const response = await fetch(`${API_BASE_URL}/notes/${noteId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: editContent,
          tags,
        }),
      })

      if (response.ok) {
        setEditingNoteId(null)
        setEditContent('')
        setEditTags('')
        fetchNotes()
      }
    } catch (error) {
      console.error('Error updating note:', error)
    }
  }

  const deleteNote = async (noteId) => {
    if (!confirm('Are you sure you want to delete this note?')) return

    try {
      const user = auth.currentUser
      if (!user) return

      const token = await user.getIdToken()

      const response = await fetch(`${API_BASE_URL}/notes/${noteId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        fetchNotes()
      }
    } catch (error) {
      console.error('Error deleting note:', error)
    }
  }

  const startEditing = (note) => {
    setEditingNoteId(note.note_id)
    setEditContent(note.content)
    setEditTags(note.tags.join(', '))
  }

  const cancelEditing = () => {
    setEditingNoteId(null)
    setEditContent('')
    setEditTags('')
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (!loading) fetchNotes()
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery, tagFilter])

  return (
    <div className="flex h-screen flex-col bg-gradient-to-br from-teal-50 via-white to-cyan-50">
      {/* Header */}
      <div className="border-b border-teal-100 bg-white/80 backdrop-blur-sm px-8 py-6">
        <div className="mx-auto max-w-6xl">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-slate-600 hover:text-teal-600 transition mb-4"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </button>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">My Notes</h1>
          <p className="text-slate-600">Create, organize, and search your personal notes</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto px-8 py-6">
        <div className="mx-auto max-w-6xl space-y-6">
          {/* Search and Filter Bar */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-slate-900 placeholder-slate-400 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400/20"
              />
            </div>
            <div className="relative w-64">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Filter by tags..."
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-slate-900 placeholder-slate-400 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400/20"
              />
            </div>
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-3 text-white font-semibold shadow-md hover:from-teal-600 hover:to-cyan-600 transition transform hover:scale-105"
            >
              <Plus size={20} />
              New Note
            </button>
          </div>

          {/* Create Note Form */}
          {isCreating && (
            <div className="rounded-2xl border border-teal-200 bg-white p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Create New Note</h3>
              <textarea
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                placeholder="Write your note here..."
                className="w-full rounded-xl border border-slate-200 p-4 text-slate-900 placeholder-slate-400 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400/20 min-h-[120px]"
              />
              <input
                type="text"
                value={newNoteTags}
                onChange={(e) => setNewNoteTags(e.target.value)}
                placeholder="Tags (comma-separated)"
                className="w-full rounded-xl border border-slate-200 p-3 text-slate-900 placeholder-slate-400 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400/20 mt-3"
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={createNote}
                  className="flex items-center gap-2 rounded-xl bg-teal-500 px-4 py-2 text-white font-semibold hover:bg-teal-600 transition"
                >
                  <Save size={18} />
                  Save Note
                </button>
                <button
                  onClick={() => {
                    setIsCreating(false)
                    setNewNoteContent('')
                    setNewNoteTags('')
                  }}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-slate-700 font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Notes List */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-teal-500 border-r-transparent"></div>
                <p className="mt-4 text-slate-600">Loading notes...</p>
              </div>
            ) : notes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-500 text-lg">No notes found. Create your first note!</p>
              </div>
            ) : (
              notes.map((note) => (
                <div
                  key={note.note_id}
                  className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all"
                >
                  {editingNoteId === note.note_id ? (
                    <>
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 p-4 text-slate-900 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400/20 min-h-[120px]"
                      />
                      <input
                        type="text"
                        value={editTags}
                        onChange={(e) => setEditTags(e.target.value)}
                        placeholder="Tags (comma-separated)"
                        className="w-full rounded-xl border border-slate-200 p-3 text-slate-900 mt-3 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400/20"
                      />
                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={() => updateNote(note.note_id)}
                          className="flex items-center gap-2 rounded-xl bg-teal-500 px-4 py-2 text-white font-semibold hover:bg-teal-600 transition"
                        >
                          <Save size={18} />
                          Save
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="rounded-xl border border-slate-300 px-4 py-2 text-slate-700 font-semibold hover:bg-slate-50 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <GripVertical className="text-slate-400 cursor-move" size={20} />
                          {note.pinned_message_id && (
                            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                              Pinned from Chat
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => startEditing(note)}
                            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 transition"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => deleteNote(note.note_id)}
                            className="rounded-lg p-2 text-red-600 hover:bg-red-50 transition"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                      <p className="text-slate-900 whitespace-pre-wrap mb-3">{note.content}</p>
                      {note.chat_name && (
                        <p className="text-sm text-slate-500 mb-2">
                          From: <span className="font-medium">{note.chat_name}</span>
                        </p>
                      )}
                      {note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {note.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-700"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-slate-400">
                        {new Date(note.created_at).toLocaleString()}
                      </p>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotesPage
