import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Loader2, ArrowLeft, AlertCircle, ChevronRight, Eye, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

import { useAuth } from '../contexts/AuthContext.jsx';
import api from '../utils/api.js';
import { auth } from '../config/firebase';

export default function SummariesPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showPdf, setShowPdf] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);

  const loadSummaries = useCallback(async () => {
    if (!currentUser) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get('/documents/summaries');
      const docs = response.data?.documents || [];
      setDocuments(docs);

      // Auto-select first document if available
      if (docs.length > 0 && !selectedDoc) {
        setSelectedDoc(docs[0]);
      }
    } catch (err) {
      console.error('Failed to load summaries:', err);
      setError('Failed to load document summaries. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, selectedDoc]);

  useEffect(() => {
    loadSummaries();
  }, [loadSummaries]);

  const handleViewPdf = async (doc) => {
    setShowPdf(true);
    setPdfUrl(null);

    try {
      const token = await auth.currentUser.getIdToken();
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const url = `${API_URL}/documents/${doc.id}/view?token=${token}`;
      setPdfUrl(url);
    } catch (error) {
      console.error('Failed to generate PDF URL:', error);
      alert('Failed to load document. Please try again.');
      setShowPdf(false);
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="flex h-screen flex-col bg-gradient-to-br from-purple-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <div className="border-b border-purple-100 bg-white/80 backdrop-blur-sm px-8 py-6 shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-slate-600 hover:text-purple-600 transition"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </button>
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-teal-600 bg-clip-text text-transparent mb-2">
            Document Summaries
          </h1>
          <p className="text-sm text-slate-600">
            AI-generated summaries of your medical documents
          </p>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="m-6">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-center gap-2 text-sm text-red-600">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && documents.length === 0 && (
        <div className="flex h-full items-center justify-center p-6">
          <div className="text-center">
            <FileText className="mx-auto h-16 w-16 text-slate-400" />
            <h3 className="mt-4 text-lg font-semibold text-slate-900">No documents yet</h3>
            <p className="mt-2 text-sm text-slate-600">
              Upload a medical document to see AI-generated summaries
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="mt-6 rounded-lg bg-gradient-to-r from-purple-400 via-indigo-400 to-teal-400 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:from-purple-500 hover:via-indigo-500 hover:to-teal-500"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Catalog Layout: List on Left, Summary on Right */}
      {!isLoading && !error && documents.length > 0 && (
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar - Document List */}
          <div className="w-80 flex-shrink-0 overflow-y-auto border-r border-purple-100 bg-white/50 p-4">
            <h2 className="mb-3 text-sm font-semibold text-slate-700 uppercase tracking-wide">Documents</h2>
            <div className="space-y-2">
              {documents.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => {
                    setSelectedDoc(doc);
                    setShowPdf(false);
                  }}
                  className={`w-full text-left rounded-lg p-3 transition ${
                    selectedDoc?.id === doc.id
                      ? 'bg-gradient-to-r from-purple-100 via-indigo-100 to-teal-100 border border-purple-200 shadow-sm'
                      : 'bg-white border border-slate-200 hover:border-purple-300 hover:bg-purple-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <FileText size={14} className="flex-shrink-0 text-purple-600" />
                        <p className="truncate text-sm font-medium text-slate-900" title={doc.filename}>
                          {doc.filename || 'Untitled Document'}
                        </p>
                      </div>
                      {doc.upload_date && (
                        <p className="mt-1 text-xs text-slate-500">
                          {new Date(doc.upload_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <ChevronRight size={16} className="flex-shrink-0 text-slate-400" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right Panel - Summary Display */}
          <div className="flex-1 overflow-y-auto">
            {selectedDoc ? (
              <div className="p-6">
                {/* Document Header */}
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-slate-900">
                      {selectedDoc.filename || 'Untitled Document'}
                    </h2>
                    {selectedDoc.upload_date && (
                      <p className="mt-1 text-sm text-slate-500">
                        Uploaded: {new Date(selectedDoc.upload_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleViewPdf(selectedDoc)}
                    className="flex items-center gap-2 rounded-lg border border-purple-200 bg-purple-50 px-4 py-2 text-sm font-medium text-purple-700 hover:bg-purple-100 transition"
                  >
                    <Eye size={16} />
                    <span>View Document</span>
                  </button>
                </div>

                {/* Summary Content */}
                {selectedDoc.summary ? (
                  <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="prose prose-sm max-w-none prose-headings:text-slate-900 prose-p:text-slate-700 prose-strong:text-slate-900 prose-li:text-slate-700">
                      <ReactMarkdown>{selectedDoc.summary}</ReactMarkdown>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                    <AlertCircle className="mx-auto h-8 w-8 text-slate-400" />
                    <p className="mt-3 text-sm font-medium text-slate-600">
                      {selectedDoc.processing_status === 'pending'
                        ? 'Summary is being generated...'
                        : 'No summary available for this document'}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-slate-500">Select a document to view its summary</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PDF Viewer Modal */}
      {showPdf && selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="relative flex h-full max-h-[90vh] w-full max-w-7xl gap-4">
            {/* PDF Viewer */}
            <div className="flex-1 rounded-2xl bg-white shadow-xl flex flex-col overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-200 p-4">
                <h3 className="text-sm font-semibold text-slate-900">{selectedDoc.filename}</h3>
                <button
                  onClick={() => setShowPdf(false)}
                  className="rounded-lg p-2 hover:bg-slate-100 transition"
                >
                  <X size={18} className="text-slate-600" />
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                {pdfUrl ? (
                  <iframe
                    src={pdfUrl}
                    className="h-full w-full"
                    title={selectedDoc.filename}
                    style={{ border: 'none' }}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Loader2 size={48} className="animate-spin text-purple-500" />
                  </div>
                )}
              </div>
            </div>

            {/* Summary Sidebar */}
            <div className="w-96 flex-shrink-0 rounded-2xl bg-white shadow-xl flex flex-col overflow-hidden">
              <div className="border-b border-slate-200 p-4">
                <h3 className="text-sm font-semibold text-slate-900">Summary</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {selectedDoc.summary ? (
                  <div className="prose prose-sm max-w-none prose-headings:text-slate-900 prose-p:text-slate-700 prose-strong:text-slate-900 prose-li:text-slate-700">
                    <ReactMarkdown>{selectedDoc.summary}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="mx-auto h-8 w-8 text-slate-400" />
                    <p className="mt-3 text-sm text-slate-600">No summary available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
