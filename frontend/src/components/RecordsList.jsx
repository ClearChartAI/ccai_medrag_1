import { useState } from 'react'
import PropTypes from 'prop-types'
import { FileText, Loader2, UploadCloud, Eye, FileTextIcon, X, FolderOpen } from 'lucide-react'

const badgeStyles = {
  pending: 'bg-orange-100 text-orange-600 border border-orange-200',
  synced: 'bg-green-100 text-green-600 border border-green-200',
  default: 'bg-slate-100 text-slate-500 border border-slate-200',
}

const RecordsList = ({ documents = [], isUploading, onUpload, onViewDocument, onViewSummary }) => {
  const hasDocuments = documents.length > 0
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // Default to expanded (false) if not set
    const saved = localStorage.getItem('recordsCollapsed')
    return saved === 'true'
  })

  const toggleRecords = () => {
    setIsCollapsed(prev => {
      const newValue = !prev
      localStorage.setItem('recordsCollapsed', newValue)
      return newValue
    })
  }

  return (
    <div className="relative h-screen">
      {/* Folder Icon Button - Shows when collapsed */}
      {isCollapsed && (
        <div className="fixed right-6 top-6 z-50">
          <button
            onClick={toggleRecords}
            className="flex items-center justify-center rounded-lg bg-white shadow-lg hover:shadow-xl transition-all p-3 border border-slate-200 hover:border-teal-300"
            title="Show records"
          >
            <FolderOpen size={22} className="text-teal-600" />
          </button>
        </div>
      )}

      {/* Upload Button Peek - Shows when collapsed */}
      {isCollapsed && (
        <div className="fixed right-6 bottom-6 z-50">
          <button
            type="button"
            onClick={onUpload}
            className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:from-teal-600 hover:to-cyan-600 hover:shadow-xl transition"
            title="Upload document"
          >
            <UploadCloud size={18} />
            <span>Upload</span>
          </button>
        </div>
      )}

      {/* Records Panel */}
      <aside className={`flex h-screen flex-col bg-white/50 backdrop-blur-sm text-slate-700 border-l border-slate-200 overflow-hidden ${
        isCollapsed ? 'w-0' : 'w-96'
      }`}>
        <header className="border-b border-slate-200 px-6 py-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-slate-900">Your Records</h2>
            <button
              onClick={toggleRecords}
              className="flex items-center justify-center rounded-lg bg-slate-50 hover:bg-red-50 transition-all p-1.5 border border-slate-200 hover:border-red-300 group"
              title="Close records"
            >
              <X size={18} className="text-slate-600 group-hover:text-red-600" />
            </button>
          </div>
          <p className="text-xs text-slate-500">{documents.length} documents</p>
        </header>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
        {isUploading && (
          <div className="flex items-center justify-center gap-2 rounded-lg bg-teal-50 px-4 py-3 text-sm text-teal-600 border border-teal-200">
            <Loader2 className="animate-spin" size={16} />
            <span>Processing...</span>
          </div>
        )}

        {hasDocuments &&
          documents.map((doc) => (
            <div
              key={doc.document_id || doc.id || doc.filename}
              className="rounded-lg bg-white px-3 py-3 shadow-sm border border-slate-200 hover:border-teal-300 hover:shadow-md transition"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="rounded-md bg-teal-100 p-1.5 text-teal-600">
                  <FileText size={14} />
                </div>
                <p className="flex-1 text-sm font-medium text-slate-900 truncate" title={doc.name}>
                  {doc.name}
                </p>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${
                    badgeStyles[doc.status] || badgeStyles.default
                  }`}
                >
                  {doc.status}
                </span>
              </div>

              {/* View and Summary Buttons */}
              <div className="flex gap-2">
                {onViewDocument && (
                  <button
                    onClick={() => onViewDocument(doc)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-teal-50 px-2 py-1.5 text-xs font-medium text-teal-700 hover:bg-teal-100 transition border border-teal-200"
                  >
                    <Eye size={12} />
                    <span>View</span>
                  </button>
                )}
                {onViewSummary && (
                  <button
                    onClick={() => onViewSummary(doc)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-cyan-50 px-2 py-1.5 text-xs font-medium text-cyan-700 hover:bg-cyan-100 transition border border-cyan-200"
                  >
                    <FileTextIcon size={12} />
                    <span>Summary</span>
                  </button>
                )}
              </div>
            </div>
          ))}

        {!hasDocuments && !isUploading && (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-xs text-slate-400">
            No documents yet. Upload your first medical record to get started.
          </div>
        )}
      </div>

      {/* Upload button fixed to bottom */}
      <div className="border-t border-slate-200 px-6 py-4 bg-white/80 backdrop-blur-sm">
        <button
          type="button"
          onClick={onUpload}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 px-4 py-3 text-sm font-semibold text-white shadow-md hover:from-teal-600 hover:to-cyan-600 hover:shadow-lg transition"
        >
          <UploadCloud size={18} />
          <span>Upload Document</span>
        </button>
      </div>
    </aside>
    </div>
  )
}

RecordsList.propTypes = {
  documents: PropTypes.array,
  isUploading: PropTypes.bool.isRequired,
  onUpload: PropTypes.func.isRequired,
  onViewDocument: PropTypes.func,
  onViewSummary: PropTypes.func,
}

export default RecordsList
