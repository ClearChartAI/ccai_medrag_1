import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

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
  const location = useLocation();

  const [messages, setMessages] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [currentChatId, setCurrentChatId] = useState(() => {
    // Load chat ID from localStorage on mount
    return localStorage.getItem('currentChatId') || null;
  });
  const [currentChatName, setCurrentChatName] = useState(() => {
    // Load chat name from localStorage on mount
    return localStorage.getItem('currentChatName') || 'New Chat';
  });
  const [hasProcessingDocs, setHasProcessingDocs] = useState(false);
  const [viewingDoc, setViewingDoc] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [viewingSummary, setViewingSummary] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      setMessages([]);
      setDocuments([]);
      setCurrentChatId(null);
      setCurrentChatName('New Chat');
      // Clear localStorage on logout
      localStorage.removeItem('currentChatId');
      localStorage.removeItem('currentChatName');
    }
  }, [currentUser]);

  // Load chat from Chat History if navigated with state
  useEffect(() => {
    const loadChat = async () => {
      if (location.state?.loadChatId) {
        const chatId = location.state.loadChatId;
        const chatName = location.state.loadChatName || 'Chat';

        console.log('📥 Loading chat from history:', chatId);

        try {
          // Fetch chat messages
          const response = await api.get(`/chats/${chatId}/messages`);
          const chatMessages = response.data || [];

          // Transform messages to the format expected by ChatBox
          const formattedMessages = chatMessages.map(msg => ({
            id: msg.message_id,
            role: msg.role,
            content: msg.content,
            sources: msg.sources || [],
            timestamp: msg.timestamp
          }));

          setMessages(formattedMessages);
          setCurrentChatId(chatId);
          setCurrentChatName(chatName);

          // Persist to localStorage
          localStorage.setItem('currentChatId', chatId);
          localStorage.setItem('currentChatName', chatName);

          console.log(`✓ Loaded ${formattedMessages.length} messages from chat history`);
        } catch (error) {
          console.error('Failed to load chat messages:', error);
        }

        // Clear the navigation state
        navigate(location.pathname, { replace: true, state: {} });
      }
    };

    if (currentUser && location.state?.loadChatId) {
      loadChat();
    }
  }, [location.state, currentUser, navigate, location.pathname]);

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

  const loadDocuments = useCallback(async (force = false) => {
    // Skip if already loaded and not forced (prevents unnecessary reloads)
    if (!force && documents.length > 0 && !documentsLoading) {
      console.log('📄 Documents already loaded, skipping reload');
      return;
    }

    setDocumentsLoading(true);
    try {
      const response = await api.get('/documents/list');
      // Backend returns array directly
      const docs = Array.isArray(response.data) ? response.data : [];

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
      setHasProcessingDocs(false);
    } finally {
      setDocumentsLoading(false);
    }
  }, [documents.length, documentsLoading]);

  useEffect(() => {
    if (!currentUser) return;
    // Only load on mount, not on every render
    loadDocuments(true);
  }, [currentUser]); // Removed loadDocuments from deps to prevent re-renders

  // Auto-refresh documents while processing
  useEffect(() => {
    if (!hasProcessingDocs) return;

    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing documents (processing detected)');
      loadDocuments(true); // Force reload when processing
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
        const sources = response?.data?.sources || [];
        const chatIdFromResponse = response?.data?.chat_id;
        const chatNameFromResponse = response?.data?.chat_name;

        if (chatIdFromResponse) {
          console.log('✓ Response chat ID:', chatIdFromResponse);
          setCurrentChatId(chatIdFromResponse);
          localStorage.setItem('currentChatId', chatIdFromResponse);
          console.log('✓ Updated state to:', chatIdFromResponse);
        }

        if (chatNameFromResponse) {
          setCurrentChatName(chatNameFromResponse);
          localStorage.setItem('currentChatName', chatNameFromResponse);
        }

        appendMessage({ role: 'ai', content: answer, sources, timestamp: new Date().toISOString() });
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
    setCurrentChatName('New Chat');
    // Clear localStorage
    localStorage.removeItem('currentChatId');
    localStorage.removeItem('currentChatName');
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
        await loadDocuments(true); // Force reload after upload
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

  const handleSummaries = useCallback(() => {
    navigate('/summaries');
  }, [navigate]);

  const handleNotes = useCallback(() => {
    navigate('/notes');
  }, [navigate]);

  const handleChatHistory = useCallback(() => {
    navigate('/chat-history');
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

  const handleViewSummary = useCallback((doc) => {
    setViewingSummary(doc);
    // Close PDF viewer if open
    setViewingDoc(null);
    setPdfUrl(null);
  }, []);

  const handleCloseSummary = useCallback(() => {
    setViewingSummary(null);
  }, []);


  if (!currentUser) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-teal-50 via-cyan-50 to-teal-50 text-slate-700 md:flex-row relative">
      {/* Sidebar */}
      <Sidebar onNewChat={handleNewChat} onLogout={handleLogout} onRecords={handleRecords} onSummaries={handleSummaries} onNotes={handleNotes} onChatHistory={handleChatHistory} user={sidebarUser} />

      <ChatBox
        messages={messages}
        onSend={handleSendMessage}
        isLoading={isLoading}
        suggestions={suggestionPrompts}
        user={sidebarUser}
        isProcessing={hasProcessingDocs}
        currentChatId={currentChatId}
        currentChatName={currentChatName}
      />

      {/* PDF Viewer */}
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

      {/* Summary Viewer */}
      {viewingSummary && (
        <div className="flex h-screen w-full max-w-2xl flex-col border-l border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <h3 className="text-sm font-semibold text-slate-900">{viewingSummary.name} - Summary</h3>
            <button
              onClick={handleCloseSummary}
              className="rounded-lg px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 transition"
            >
              Close
            </button>
          </div>
          <div className="flex-1 overflow-auto p-6">
            <div className="prose prose-slate max-w-none">
              <h2 className="text-lg font-semibold mb-4">Document Summary</h2>
              <p className="text-sm text-slate-600 mb-4">
                Summary for: <span className="font-medium">{viewingSummary.filename}</span>
              </p>
              <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-700">
                Summary content will appear here. This feature fetches AI-generated summaries from the backend.
              </div>
            </div>
          </div>
        </div>
      )}

      <RecordsList
        documents={documents}
        isUploading={isUploading || documentsLoading}
        onUpload={() => setIsUploadOpen(true)}
        onViewDocument={handleViewDocument}
        onViewSummary={handleViewSummary}
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
