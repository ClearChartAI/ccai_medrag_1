import PropTypes from 'prop-types'
import { FileText, ArrowRight, Loader2, UploadCloud, ChevronRight } from 'lucide-react'

const badgeStyles = {
  pending: 'bg-orange-100 text-orange-600 border border-orange-200',
  synced: 'bg-green-100 text-green-600 border border-green-200',
  default: 'bg-slate-100 text-slate-500 border border-slate-200',
}

const RecordsList = ({ documents = [], isUploading, onUpload }) => {
  const hasDocuments = documents.length > 0

  return (
    <aside className="flex h-full w-full max-w-[320px] flex-col bg-gradient-to-br from-teal-50 via-cyan-50 to-teal-50 px-6 py-6 text-slate-700 border-l border-teal-100">
      <header className="flex items-center justify-between border-b border-teal-200 pb-4">
        <h2 className="text-lg font-semibold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">Your Records</h2>
      </header>

      <div className="mt-6 flex-1 space-y-4 overflow-y-auto pr-1">
        {isUploading && (
          <div className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm text-teal-600 shadow-sm border border-teal-200">
            <Loader2 className="animate-spin" size={18} />
            <span>Processing new document...</span>
          </div>
        )}

        {hasDocuments &&
          documents.map((doc) => (
            <div
              key={doc.document_id || doc.id || doc.filename}
              className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm border border-teal-100 hover:shadow-md transition"
            >
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-gradient-to-br from-teal-100 to-cyan-100 p-2 text-teal-600">
                  <FileText size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{doc.name}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span>{doc.date}</span>
                    {doc.file_size ? (
                      <>
                        <span>•</span>
                        <span>{Math.max(doc.file_size / 1024, 1).toFixed(0)} KB</span>
                      </>
                    ) : null}
                    {doc.page_count ? (
                      <>
                        <span>•</span>
                        <span>{doc.page_count} pages</span>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold capitalize ${
                    badgeStyles[doc.status] || badgeStyles.default
                  }`}
                >
                  {doc.status}
                </span>
                <ChevronRight size={16} className="text-teal-300" />
              </div>
            </div>
          ))}

        {!hasDocuments && !isUploading && (
          <div className="rounded-xl border border-dashed border-teal-300 bg-white px-4 py-8 text-center text-sm text-slate-400">
            No documents yet. Upload your first medical record to get started.
          </div>
        )}
      </div>

      <footer className="flex items-center justify-between border-t border-teal-200 pt-4 text-xs text-slate-500">
        <span>{documents.length} Documents Synced</span>
        <ArrowRight size={16} className="text-teal-400" />
      </footer>

      <button
        type="button"
        onClick={onUpload}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-400 px-4 py-3 text-sm font-semibold text-white shadow-md hover:from-teal-500 hover:to-cyan-500 hover:shadow-lg transition"
      >
        <UploadCloud size={18} />
        <span>+ Upload Document</span>
      </button>
    </aside>
  )
}

RecordsList.propTypes = {
  documents: PropTypes.array,
  isUploading: PropTypes.bool.isRequired,
  onUpload: PropTypes.func.isRequired,
}

export default RecordsList
