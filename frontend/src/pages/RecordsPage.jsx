import { useCallback, useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Trash2, Eye, AlertCircle, Loader2, CheckCircle } from 'lucide-react';

import { useAuth } from '../contexts/AuthContext.jsx';
import api from '../utils/api.js';
import { auth } from '../config/firebase';
import '../components/UploadModal.css';
import Sidebar from '../components/Sidebar.jsx';

const getStatusColor = (status) => {
  const normalized = (status || '').toLowerCase();
  if (['processed', 'completed', 'ready', 'synced'].includes(normalized)) {
    return 'bg-green-100 text-green-700 border-green-200';
  }
  if (['pending', 'processing', 'in_progress', 'queued'].includes(normalized)) {
    return 'bg-yellow-100 text-yellow-700 border-yellow-200';
  }
  if (['failed', 'error'].includes(normalized)) {
    return 'bg-red-100 text-red-700 border-red-200';
  }
  return 'bg-gray-100 text-gray-700 border-gray-200';
};

const getStatusText = (status) => {
  const normalized = (status || '').toLowerCase();
  if (['processed', 'completed', 'ready', 'synced'].includes(normalized)) {
    return 'Processed';
  }
  if (['pending', 'processing', 'in_progress', 'queued'].includes(normalized)) {
    return 'Processing';
  }
  if (['failed', 'error'].includes(normalized)) {
    return 'Failed';
  }
  return 'Unknown';
};

export default function RecordsPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [viewingDoc, setViewingDoc] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState(null);

  const loadDocuments = useCallback(async () => {
    if (!currentUser) return;

    setIsLoading(true);
    try {
      const response = await api.get('/documents/list');
      const docs = Array.isArray(response.data) ? response.data : (response.data?.documents ?? []);

      const formatted = docs.map((doc) => ({
        id: doc.document_id,
        document_id: doc.document_id,
        title: doc.title || doc.filename || 'Untitled',
        filename: doc.filename || 'unknown.pdf',
        status: doc.processing_status || 'unknown',
        uploaded_at: doc.created_at || doc.upload_date || doc.uploaded_at,
        gcs_path: doc.gcs_path || '',
        size: doc.size || 0,
        pages: doc.pages || 0,
      }));

      setDocuments(formatted);
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleDelete = async (documentId) => {
    setDeletingId(documentId);

    // Find the document to get its name before deletion
    const docToDelete = documents.find((doc) => doc.document_id === documentId);
    const docName = docToDelete?.title || docToDelete?.filename || 'document';

    try {
      await api.delete(`/documents/${documentId}`);
      setDocuments((prev) => prev.filter((doc) => doc.document_id !== documentId));
      setDeleteConfirmId(null);
      if (viewingDoc?.document_id === documentId) {
        setViewingDoc(null);
      }

      // Show success notification
      setDeleteSuccess(`Successfully deleted "${docName}"`);

      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        setDeleteSuccess(null);
      }, 5000);
    } catch (error) {
      console.error('Failed to delete document:', error);
      alert('Failed to delete document. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleView = async (doc) => {
    setViewingDoc(doc);
    setPdfUrl(null);

    try {
      const token = await auth.currentUser.getIdToken();
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const url = `${API_URL}/documents/${doc.document_id}/view?token=${token}`;
      setPdfUrl(url);
    } catch (error) {
      console.error('Failed to generate PDF URL:', error);
      alert('Failed to load document. Please try again.');
      setViewingDoc(null);
    }
  };

  const sidebarUser = useMemo(() => {
    if (!currentUser) return null;
    return {
      name: currentUser.displayName || currentUser.email || 'Signed in',
      email: currentUser.email || '',
      picture: currentUser.photoURL || '',
    };
  }, [currentUser]);

  const handleNewChat = useCallback(() => {
    navigate('/dashboard');
  }, [navigate]);

  const handleLogout = useCallback(async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  }, [navigate]);

  const handleSummaries = useCallback(() => {
    navigate('/summaries');
  }, [navigate]);

  const handleNotes = useCallback(() => {
    navigate('/notes');
  }, [navigate]);

  const handleChatHistory = useCallback(async (chat) => {
    if (chat && chat.chat_id) {
      navigate('/dashboard', {
        state: {
          loadChatId: chat.chat_id,
          loadChatName: chat.title || 'Chat'
        }
      });
    } else {
      navigate('/chat-history');
    }
  }, [navigate]);

  if (!currentUser) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-teal-50 to-cyan-50">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
          <p className="text-lg text-slate-700">Please log in to view your records</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-row bg-gradient-to-br from-purple-50 via-teal-50 to-cyan-50">
      {/* Sidebar */}
      <Sidebar
        onNewChat={handleNewChat}
        onLogout={handleLogout}
        onRecords={() => {}}
        onSummaries={handleSummaries}
        onNotes={handleNotes}
        onChatHistory={handleChatHistory}
        user={sidebarUser}
      />

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <div className="border-b border-purple-100 bg-white/80 backdrop-blur-sm px-8 py-6 shadow-sm">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-teal-600 bg-clip-text text-transparent mb-2">
              My Records
            </h1>
            <p className="text-sm text-slate-600">
              {documents.length} {documents.length === 1 ? 'document' : 'documents'} uploaded
            </p>
          </div>
        </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {/* Success Banner */}
        {deleteSuccess && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-3">
              <CheckCircle size={18} className="text-green-600 flex-shrink-0" />
              <p className="text-sm font-medium text-green-800">{deleteSuccess}</p>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 size={48} className="animate-spin text-purple-500" />
          </div>
        ) : documents.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <FileText size={64} className="mb-4 text-slate-300" />
            <h2 className="mb-2 text-xl font-semibold text-slate-700">No documents yet</h2>
            <p className="mb-4 text-sm text-slate-500">Upload your first document to get started</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {documents.map((doc) => (
              <div
                key={doc.document_id}
                className="relative flex flex-col rounded-2xl border border-purple-100 bg-white p-4 shadow-sm hover:shadow-md transition"
              >
                {/* Document Icon & Title */}
                <div className="mb-3 flex items-start gap-3">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 via-indigo-100 to-teal-100">
                    <FileText size={24} className="text-purple-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold text-slate-900" title={doc.title}>
                      {doc.title}
                    </h3>
                    <p className="truncate text-xs text-slate-500" title={doc.filename}>
                      {doc.filename}
                    </p>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="mb-3">
                  <span
                    className={`inline-block rounded-full border px-2 py-1 text-xs font-medium ${getStatusColor(
                      doc.status
                    )}`}
                  >
                    {getStatusText(doc.status)}
                  </span>
                </div>

                {/* Metadata */}
                <div className="mb-4 flex-1 space-y-1 text-xs text-slate-500">
                  {doc.uploaded_at && (
                    <p>Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}</p>
                  )}
                  {doc.pages > 0 && <p>Pages: {doc.pages}</p>}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleView(doc)}
                    className="btn-animated flex flex-1 items-center justify-center gap-2 px-3 py-2 text-sm"
                  >
                    <Eye size={16} />
                    <span>View</span>
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(doc.document_id)}
                    disabled={deletingId === doc.document_id}
                    className="flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 transition disabled:opacity-50"
                  >
                    {deletingId === doc.document_id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>

                {/* Delete Confirmation */}
                {deleteConfirmId === doc.document_id && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50 backdrop-blur-sm">
                    <div className="rounded-xl bg-white p-4 shadow-lg">
                      <p className="mb-3 text-sm font-semibold text-slate-900">Delete this document?</p>
                      <p className="mb-4 text-xs text-slate-500">This action cannot be undone.</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          disabled={deletingId === doc.document_id}
                          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleDelete(doc.document_id)}
                          disabled={deletingId === doc.document_id}
                          className="flex-1 rounded-lg bg-red-500 px-3 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {deletingId === doc.document_id ? (
                            <>
                              <Loader2 size={14} className="animate-spin" />
                              <span>Deleting...</span>
                            </>
                          ) : (
                            'Delete'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      </div>

      {/* PDF Viewer Modal */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="relative h-full max-h-[90vh] w-full max-w-6xl rounded-2xl bg-white shadow-xl flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 p-4 flex-shrink-0">
              <h2 className="text-lg font-semibold text-slate-900">{viewingDoc.title}</h2>
              <button
                onClick={() => setViewingDoc(null)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
              >
                Close
              </button>
            </div>

            {/* PDF Viewer */}
            <div className="flex-1 overflow-hidden">
              {pdfUrl ? (
                <iframe
                  src={pdfUrl}
                  className="h-full w-full"
                  title={viewingDoc.title}
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Loader2 size={48} className="animate-spin text-purple-500" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
