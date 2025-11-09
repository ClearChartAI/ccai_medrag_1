import { useState } from 'react'
import PropTypes from 'prop-types'

import { MessageSquarePlus, LogOut, Folder, FileText, StickyNote, Clock3, ChevronRight, ChevronLeft } from 'lucide-react'
// Commented out for future use:
// import { Search, Settings } from 'lucide-react'
import logo from '../assets/ClearChartAI_Logo_Transparent saturate.png'

const Sidebar = ({ onNewChat = undefined, onLogout = undefined, onRecords = undefined, onSummaries = undefined, onNotes = undefined, onChatHistory = undefined, user = null }) => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebarCollapsed') === 'true'
  })

  const toggleSidebar = () => {
    setIsCollapsed(prev => {
      const newValue = !prev
      localStorage.setItem('sidebarCollapsed', newValue)
      return newValue
    })
  }

  return (
    <aside className={`relative flex h-screen flex-col bg-white text-slate-700 border-r border-slate-200 overflow-hidden ${
      isCollapsed ? 'w-20' : 'w-64'
    }`}>
      {/* Logo - Always Visible at Top */}
      <div className={`flex items-center ${isCollapsed ? 'justify-center pt-6 pb-4' : 'gap-3 pt-6 pb-4 px-5'}`}>
        <img src={logo} alt="ClearChartAI Logo" className={`object-contain ${isCollapsed ? 'h-8 w-8' : 'h-8 w-8'}`} />
        {!isCollapsed && (
          <button
            onClick={toggleSidebar}
            className="ml-auto flex items-center justify-center rounded-lg bg-slate-50 hover:bg-slate-100 transition-all p-1.5 border border-slate-200"
            title="Collapse sidebar"
          >
            <ChevronLeft size={18} className="text-slate-600" />
          </button>
        )}
      </div>

      {/* Toggle Button when Collapsed - Inside sidebar at top */}
      {isCollapsed && (
        <div className="flex justify-center pb-2">
          <button
            onClick={toggleSidebar}
            className="flex items-center justify-center rounded-lg bg-slate-50 hover:bg-slate-100 transition-all p-1.5 border border-slate-200"
            title="Expand sidebar"
          >
            <ChevronRight size={18} className="text-slate-600" />
          </button>
        </div>
      )}

      {/* Top Section */}
      <div className={`space-y-6 ${isCollapsed ? 'px-2 pt-4' : 'px-5 pt-4'}`}>

        {/* Action Buttons - Uniform Style like Grok */}
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={onNewChat}
            className={`flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors ${
              isCollapsed ? 'justify-center w-full' : 'gap-3 w-full'
            }`}
            title={isCollapsed ? 'New Chat' : ''}
          >
            <MessageSquarePlus size={18} />
            {!isCollapsed && <span>New Chat</span>}
          </button>

          <button
            type="button"
            onClick={onRecords}
            className={`flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors ${
              isCollapsed ? 'justify-center w-full' : 'gap-3 w-full'
            }`}
            title={isCollapsed ? 'Records' : ''}
          >
            <Folder size={18} />
            {!isCollapsed && <span>Records</span>}
          </button>

          <button
            type="button"
            onClick={onSummaries}
            className={`flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors ${
              isCollapsed ? 'justify-center w-full' : 'gap-3 w-full'
            }`}
            title={isCollapsed ? 'Summaries' : ''}
          >
            <FileText size={18} />
            {!isCollapsed && <span>Summaries</span>}
          </button>

          <button
            type="button"
            onClick={onNotes}
            className={`flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors ${
              isCollapsed ? 'justify-center w-full' : 'gap-3 w-full'
            }`}
            title={isCollapsed ? 'Notes' : ''}
          >
            <StickyNote size={18} />
            {!isCollapsed && <span>Notes</span>}
          </button>

          <button
            type="button"
            onClick={onChatHistory}
            className={`flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors ${
              isCollapsed ? 'justify-center w-full' : 'gap-3 w-full'
            }`}
            title={isCollapsed ? 'Chat History' : ''}
          >
            <Clock3 size={18} />
            {!isCollapsed && <span>Chat History</span>}
          </button>
        </div>

        {/* Future navigation items commented out */}
        {/*
        <div className="flex flex-col gap-2">
          <button className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-white hover:shadow-sm">
            <Clock3 size={18} />
            <span>Chat History</span>
          </button>
          <button className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-white hover:shadow-sm">
            <Search size={18} />
            <span>Search</span>
          </button>
          <button className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-white hover:shadow-sm">
            <FileText size={18} />
            <span>Results</span>
          </button>
          <button className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-white hover:shadow-sm">
            <StickyNote size={18} />
            <span>Notes</span>
          </button>
        </div>
        */}
      </div>

      {/* Spacer to push bottom section to bottom */}
      <div className="flex-1"></div>

      {/* Bottom Section - Account & Logout */}
      <div className={`space-y-2 border-t border-slate-200 pt-4 pb-6 ${isCollapsed ? 'px-2' : 'px-5'}`}>
        {user && (
          <div className={`flex items-center rounded-lg px-3 py-2 text-sm hover:bg-slate-50 transition-colors ${
            isCollapsed ? 'justify-center' : 'gap-3'
          }`}>
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-teal-400 to-cyan-400">
              {user.picture ? (
                <img
                  src={user.picture}
                  alt={user.name || user.email}
                  className="h-full w-full object-cover"
                  onError={(event) => {
                    const element = event.currentTarget
                    element.style.display = 'none'
                    const fallback = document.createElement('span')
                    fallback.className = 'text-sm font-semibold text-white'
                    fallback.textContent =
                      user.name?.charAt(0)?.toUpperCase() ||
                      user.email?.charAt(0)?.toUpperCase() ||
                      '?'
                    element.parentElement?.appendChild(fallback)
                  }}
                />
              ) : (
                <span className="text-sm font-semibold text-white">
                  {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || '?'}
                </span>
              )}
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900">{user.name || 'Signed in'}</p>
                <p className="truncate text-xs text-slate-500">{user.email}</p>
              </div>
            )}
          </div>
        )}
        <button
          type="button"
          onClick={onLogout}
          className={`flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-red-50 hover:text-red-600 transition-colors ${
            isCollapsed ? 'justify-center w-full' : 'gap-3 w-full'
          }`}
          title={isCollapsed ? 'Log out' : ''}
        >
          <LogOut size={18} />
          {!isCollapsed && <span>Log out</span>}
        </button>
      </div>
    </aside>
  )
}

export default Sidebar

Sidebar.propTypes = {
  onNewChat: PropTypes.func,
  onLogout: PropTypes.func,
  onRecords: PropTypes.func,
  onSummaries: PropTypes.func,
  onNotes: PropTypes.func,
  onChatHistory: PropTypes.func,
  user: PropTypes.shape({
    uid: PropTypes.string,
    email: PropTypes.string,
    name: PropTypes.string,
    picture: PropTypes.string,
  }),
}
