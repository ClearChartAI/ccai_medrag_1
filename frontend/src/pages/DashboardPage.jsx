import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import ChatBox from '../components/ChatBox.jsx';
import RecordsList from '../components/RecordsList.jsx';
import Sidebar from '../components/Sidebar.jsx';
import UploadModal from '../components/UploadModal.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import api from '../utils/api.js';

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
      const response = await api.get('/documents');
      const docs = response.data?.documents ?? [];
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
      console.log(`✓ Loaded ${formatted.length} documents`);
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

  const handleSendMessage = useCallback(
    async (text) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      appendMessage({ role: 'user', content: trimmed, timestamp: new Date().toISOString() });
      setIsLoading(true);

      try {
        console.log('🔍 Current chat ID (before request):', currentChatId);
        const response = await api.post('/query', {
          question: trimmed,
          top_k: 5,
          chat_id: currentChatId,
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

  if (!currentUser) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-teal-50 via-cyan-50 to-teal-50 text-slate-700 md:flex-row">
      <Sidebar onNewChat={handleNewChat} onLogout={handleLogout} user={sidebarUser} />

      <ChatBox
        messages={messages}
        onSend={handleSendMessage}
        isLoading={isLoading}
        suggestions={suggestionPrompts}
        user={sidebarUser}
      />

      <RecordsList
        documents={documents}
        isUploading={isUploading || documentsLoading}
        onUpload={() => setIsUploadOpen(true)}
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
