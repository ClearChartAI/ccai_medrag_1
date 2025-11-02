import PropTypes from 'prop-types'

import { HeartPulse, Plus, Clock3, Search, Folder, FileText, StickyNote, Settings, LogOut } from 'lucide-react'

const Sidebar = ({ onNewChat = undefined, onLogout = undefined, user = null }) => {
  const navItems = [
    { label: '+ New Chat', icon: Plus, action: onNewChat, highlight: false },
    { label: 'Chat History', icon: Clock3, highlight: false },
    { label: 'Search', icon: Search, highlight: true },
    { label: 'Records', icon: Folder, highlight: false },
    { label: 'Results', icon: FileText, highlight: false },
    { label: 'Notes', icon: StickyNote, highlight: false },
  ]

  return (
    <aside className="flex h-full w-full max-w-[240px] flex-col justify-between bg-brand-gray px-6 py-6 text-slate-700">
      <div className="space-y-8">
        <div className="flex items-center gap-3 text-xl font-semibold text-slate-900">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-blue text-white">
            <HeartPulse size={22} />
          </div>
          <span>ClearChartAI</span>
        </div>
        <div className="flex flex-col gap-2">
          {navItems.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={item.action}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                item.highlight
                  ? 'bg-brand-blue text-white shadow'
                  : 'text-slate-600 hover:bg-white'
              }`}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        {user && (
          <div className="flex items-center gap-3 rounded-2xl bg-white px-3 py-3 text-sm">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-blue/10">
              {user.picture ? (
                <img
                  src={user.picture}
                  alt={user.name || user.email}
                  className="h-full w-full object-cover"
                  onError={(event) => {
                    const element = event.currentTarget
                    element.style.display = 'none'
                    const fallback = document.createElement('span')
                    fallback.className = 'text-lg font-semibold text-brand-blue'
                    fallback.textContent =
                      user.name?.charAt(0)?.toUpperCase() ||
                      user.email?.charAt(0)?.toUpperCase() ||
                      '?'
                    element.parentElement?.appendChild(fallback)
                  }}
                />
              ) : (
                <span className="text-lg font-semibold text-brand-blue">
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
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-white"
        >
          <Settings size={18} />
          <span>Settings</span>
        </button>
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-red-500 hover:bg-white"
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
  user: PropTypes.shape({
    uid: PropTypes.string,
    email: PropTypes.string,
    name: PropTypes.string,
    picture: PropTypes.string,
  }),
}
