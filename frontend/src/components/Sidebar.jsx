import PropTypes from 'prop-types'

import { MessageSquarePlus, LogOut, Folder } from 'lucide-react'
// Commented out for future use:
// import { Clock3, Search, FileText, StickyNote, Settings } from 'lucide-react'
import logo from '../assets/ClearChartAI_Logo_Transparent saturate.png'

const Sidebar = ({ onNewChat = undefined, onLogout = undefined, onRecords = undefined, user = null }) => {
  return (
    <aside className="flex h-screen w-full max-w-[240px] flex-col bg-gradient-to-br from-teal-50 via-cyan-50 to-teal-50 px-6 py-6 text-slate-700 border-r border-teal-100">
      {/* Top Section */}
      <div className="space-y-8">
        <div className="flex items-center gap-3 text-xl font-semibold text-slate-900">
          <img src={logo} alt="ClearChartAI Logo" className="h-10 w-10 object-contain" />
          <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">ClearChartAI</span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={onNewChat}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-400 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:from-teal-500 hover:to-cyan-500 hover:shadow-lg transform hover:scale-105"
          >
            <MessageSquarePlus size={20} />
            <span>New Chat</span>
          </button>

          <button
            type="button"
            onClick={onRecords}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-400 to-indigo-400 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:from-blue-500 hover:to-indigo-500 hover:shadow-lg transform hover:scale-105"
          >
            <Folder size={20} />
            <span>Records</span>
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
      <div className="space-y-3">
        {user && (
          <div className="flex items-center gap-3 rounded-2xl bg-white px-3 py-3 text-sm shadow-sm border border-teal-100">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-teal-200 to-cyan-200">
              {user.picture ? (
                <img
                  src={user.picture}
                  alt={user.name || user.email}
                  className="h-full w-full object-cover"
                  onError={(event) => {
                    const element = event.currentTarget
                    element.style.display = 'none'
                    const fallback = document.createElement('span')
                    fallback.className = 'text-lg font-semibold text-teal-700'
                    fallback.textContent =
                      user.name?.charAt(0)?.toUpperCase() ||
                      user.email?.charAt(0)?.toUpperCase() ||
                      '?'
                    element.parentElement?.appendChild(fallback)
                  }}
                />
              ) : (
                <span className="text-lg font-semibold text-teal-700">
                  {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || '?'}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">{user.name || 'Signed in'}</p>
              <p className="truncate text-xs text-slate-500">{user.email}</p>
            </div>
          </div>
        )}
        {/* Commented out Settings button for future use:
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-white hover:shadow-sm"
        >
          <Settings size={18} />
          <span>Settings</span>
        </button>
        */}
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-red-500 hover:bg-white hover:shadow-sm transition"
        >
          <LogOut size={18} />
          <span>Log out</span>
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
  user: PropTypes.shape({
    uid: PropTypes.string,
    email: PropTypes.string,
    name: PropTypes.string,
    picture: PropTypes.string,
  }),
}
