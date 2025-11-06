import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Trash2, Eye, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';

import { useAuth } from '../contexts/AuthContext.jsx';
import api from '../utils/api.js';
import { auth } from '../config/firebase';

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
    try {
      await api.delete(`/documents/${documentId}`);
      setDocuments((prev) => prev.filter((doc) => doc.document_id !== documentId));
      setDeleteConfirmId(null);
      if (viewingDoc?.document_id === documentId) {
        setViewingDoc(null);
      }
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

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  if (!currentUser) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
          <p className="text-lg text-slate-700">Please log in to view your records</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
      {/* Header */}
      <div className="border-b border-teal-100 bg-white/80 backdrop-blur-sm px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBackToDashboard}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-teal-50 transition"
            >
              <ArrowLeft size={18} />
              <span>Back to Dashboard</span>
            </button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              My Records
            </h1>
          </div>
          <div className="text-sm text-slate-500">
            {documents.length} {documents.length === 1 ? 'document' : 'documents'}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 size={48} className="animate-spin text-teal-500" />
          </div>
        ) : documents.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <FileText size={64} className="mb-4 text-slate-300" />
            <h2 className="mb-2 text-xl font-semibold text-slate-700">No documents yet</h2>
            <p className="mb-4 text-sm text-slate-500">Upload your first document to get started</p>
            <button
              onClick={handleBackToDashboard}
              className="rounded-lg bg-gradient-to-r from-teal-400 to-cyan-400 px-4 py-2 text-sm font-semibold text-white hover:from-teal-500 hover:to-cyan-500"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {documents.map((doc) => (
              <div
                key={doc.document_id}
                className="relative flex flex-col rounded-2xl border border-teal-100 bg-white p-4 shadow-sm hover:shadow-md transition"
              >
                {/* Document Icon & Title */}
                <div className="mb-3 flex items-start gap-3">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-100 to-cyan-100">
                    <FileText size={24} className="text-teal-600" />
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
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-sm font-medium text-teal-700 hover:bg-teal-100 transition"
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
                          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleDelete(doc.document_id)}
                          className="flex-1 rounded-lg bg-red-500 px-3 py-2 text-sm font-semibold text-white hover:bg-red-600"
                        >
                          Delete
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
                  <Loader2 size={48} className="animate-spin text-teal-500" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
