import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import ChatBox from '../components/ChatBox.jsx';
import RecordsList from '../components/RecordsList.jsx';
import Sidebar from '../components/Sidebar.jsx';
import UploadModal from '../components/UploadModal.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import api from '../utils/api.js';
import { auth } from '../config/firebase';

const getUiStatus = (processingStatus) => {
  const normalized = (processingStatus || '').toLowerCase();
  if (['processed', 'completed', 'ready', 'synced'].includes(normalized)) {
    return 'synced';
  }
  if (['pending', 'processing', 'in_progress', 'queued'].includes(normalized)) {
    return 'pending';
  }
  return 'pending';
};

const suggestionPrompts = [
  'Summarize my latest labs',
  'Explain my diagnosis',
  'Create a follow-up plan',
  'What questions should I ask my doctor?',
];

export default function DashboardPage() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [hasProcessingDocs, setHasProcessingDocs] = useState(false);
  const [viewingDoc, setViewingDoc] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      setMessages([]);
      setDocuments([]);
      setCurrentChatId(null);
    }
  }, [currentUser]);

  const sidebarUser = useMemo(() => {
    if (!currentUser) return null;
    return {
      name: currentUser.displayName || currentUser.email || 'Signed in',
      email: currentUser.email || '',
      picture: currentUser.photoURL || '',
    };
  }, [currentUser]);

  const appendMessage = useCallback((message) => {
    setMessages((prev) => [
      ...prev,
      {
        id: message.id ?? crypto.randomUUID(),
        timestamp: message.timestamp ?? new Date().toISOString(),
        ...message,
      },
    ]);
  }, []);

  const loadDocuments = useCallback(async () => {
    setDocumentsLoading(true);
    try {
      const response = await api.get('/documents/list');
      // Backend returns array directly, not wrapped in {documents: [...]}
      const docs = Array.isArray(response.data) ? response.data : (response.data?.documents ?? []);
      const formatted = docs.map((doc) => ({
        id: doc.document_id,
        document_id: doc.document_id,
        name: doc.title || doc.filename,
        filename: doc.filename,
        date: doc.upload_date ? new Date(doc.upload_date).toLocaleDateString() : 'Unknown',
        upload_date: doc.upload_date,
        status: getUiStatus(doc.processing_status),
        raw_status: doc.processing_status,
        file_size: doc.file_size,
        page_count: doc.page_count,
        gcs_path: doc.gcs_path,
      }));
      setDocuments(formatted);

      // Check if any documents are still processing
      const processing = formatted.some((doc) => doc.status === 'pending');
      setHasProcessingDocs(processing);

      console.log(`✓ Loaded ${formatted.length} documents, ${processing ? 'some still processing' : 'all ready'}`);
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setDocumentsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    loadDocuments();
  }, [currentUser, loadDocuments]);

  // Auto-refresh documents while processing
  useEffect(() => {
    if (!hasProcessingDocs) return;

    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing documents (processing detected)');
      loadDocuments();
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [hasProcessingDocs, loadDocuments]);

  const handleSendMessage = useCallback(
    async (text) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      appendMessage({ role: 'user', content: trimmed, timestamp: new Date().toISOString() });
      setIsLoading(true);

      try {
        console.log('🔍 Current chat ID (before request):', currentChatId);
        const url = currentChatId ? `/query?chat_id=${currentChatId}` : '/query';
        const response = await api.post(url, {
          question: trimmed,
          top_k: 5,
        });

        const answer = response?.data?.answer ?? 'I reviewed your records and generated a response.';
        const chatIdFromResponse = response?.data?.chat_id;

        if (chatIdFromResponse) {
          console.log('✓ Response chat ID:', chatIdFromResponse);
          setCurrentChatId(chatIdFromResponse);
          console.log('✓ Updated state to:', chatIdFromResponse);
        }

        appendMessage({ role: 'ai', content: answer, timestamp: new Date().toISOString() });
      } catch (error) {
        const fallback =
          error?.response?.data?.detail ||
          error?.message ||
          'Sorry, something went wrong retrieving your medical insights.';

        appendMessage({ role: 'ai', content: fallback, timestamp: new Date().toISOString() });
        console.error('Query error:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [appendMessage, currentChatId],
  );

  const handleNewChat = useCallback(() => {
    console.log('🆕 Starting new chat - resetting state');
    setMessages([]);
    setCurrentChatId(null);
  }, []);

  const handleUploadStart = useCallback(() => {
    setIsUploading(true);
  }, []);

  const handleUploadSuccess = useCallback(
    async (document) => {
      const status = getUiStatus(document?.processing_status ?? 'processed');
      const newDoc = {
        id: document.document_id,
        document_id: document.document_id,
        name: document.title || document.filename,
        filename: document.filename,
        date: document.upload_date ? new Date(document.upload_date).toLocaleDateString() : 'Today',
        upload_date: document.upload_date,
        status,
        raw_status: document.processing_status ?? 'processed',
        file_size: document.file_size,
        page_count: document.page_count,
        gcs_path: document.gcs_path,
      };

      setDocuments((prev) => [newDoc, ...prev]);
      setIsUploading(false);

      try {
        await loadDocuments();
      } catch (error) {
        console.error('Failed to refresh documents after upload:', error);
      }
    },
    [loadDocuments],
  );

  const handleUploadError = useCallback(() => {
    setIsUploading(false);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  }, [logout, navigate]);

  const handleRecords = useCallback(() => {
    navigate('/records');
  }, [navigate]);

  const handleViewDocument = useCallback(async (doc) => {
    setViewingDoc(doc);
    setPdfUrl(null);

    try {
      const token = await auth.currentUser.getIdToken();
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const url = `${API_URL}/documents/${doc.document_id}/view?token=${token}`;
      setPdfUrl(url);
    } catch (error) {
      console.error('Failed to generate PDF URL:', error);
      setViewingDoc(null);
    }
  }, []);

  const handleCloseViewer = useCallback(() => {
    setViewingDoc(null);
    setPdfUrl(null);
  }, []);

  if (!currentUser) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-teal-50 via-cyan-50 to-teal-50 text-slate-700 md:flex-row">
      <Sidebar onNewChat={handleNewChat} onLogout={handleLogout} onRecords={handleRecords} user={sidebarUser} />

      <ChatBox
        messages={messages}
        onSend={handleSendMessage}
        isLoading={isLoading}
        suggestions={suggestionPrompts}
        user={sidebarUser}
        isProcessing={hasProcessingDocs}
      />

      {viewingDoc && (
        <div className="flex h-screen w-full max-w-2xl flex-col border-l border-teal-100 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <h3 className="text-sm font-semibold text-slate-900">{viewingDoc.name}</h3>
            <button
              onClick={handleCloseViewer}
              className="rounded-lg px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 transition"
            >
              Close
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            {pdfUrl ? (
              <iframe
                src={pdfUrl}
                className="h-full w-full"
                title={viewingDoc.name}
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="text-sm text-slate-500">Loading document...</div>
              </div>
            )}
          </div>
        </div>
      )}

      <RecordsList
        documents={documents}
        isUploading={isUploading || documentsLoading}
        onUpload={() => setIsUploadOpen(true)}
        onViewDocument={handleViewDocument}
      />

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadStart={handleUploadStart}
        onUploadSuccess={handleUploadSuccess}
        onUploadError={handleUploadError}
        bucket={import.meta.env.VITE_GCS_BUCKET}
      />
    </div>
  );
}
