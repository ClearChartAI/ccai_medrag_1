import { useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { UploadCloud, Loader2, X, FileText, Zap, CheckCircle, AlertCircle } from 'lucide-react'

import api from '../utils/api'

const UploadModal = ({
  isOpen,
  onClose,
  onUploadStart = undefined,
  onUploadSuccess = undefined,
  onUploadError = undefined,
  bucket = '',
}) => {
  const fileInputRef = useRef(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStage, setProcessingStage] = useState('') // 'uploading', 'processing', 'complete'
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleFileSelect = async (file) => {
    if (!file) return

    // Validate file type
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF document.')
      return
    }

    // Validate file size (15MB = 15 * 1024 * 1024 bytes)
    const MAX_FILE_SIZE = 15 * 1024 * 1024 // 15MB in bytes
    if (file.size > MAX_FILE_SIZE) {
      setError(`File size exceeds 15MB limit. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB.`)
      return
    }

    setError('')
    setIsProcessing(true)
    setProcessingStage('uploading')
    onUploadStart?.(file)

    try {
      // Create form data
      const formData = new FormData()
      formData.append('file', file)

      if (!import.meta.env.VITE_API_URL) {
        throw new Error('Query API URL is not configured.')
      }

      const { data } = await api.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      console.log('Upload response:', data)

      console.log('✓ File uploaded successfully:', data)

      // Show processing stage
      setProcessingStage('processing')

      // Wait a bit to show the processing message
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Show complete stage
      setProcessingStage('complete')

      // Notify parent component
      onUploadSuccess?.(data)

      // Close modal after showing success
      setTimeout(() => {
        onClose()
        setIsProcessing(false)
        setProcessingStage('')
      }, 2000)
    } catch (err) {
      console.error('Upload error:', err)
      setError(err.response?.data?.detail || 'Upload failed. Please try again.')
      setIsProcessing(false)
      setProcessingStage('')
      onUploadError?.(err)
    }
  }

  const handleDrop = (event) => {
    event.preventDefault()
    const file = event.dataTransfer.files?.[0]
    handleFileSelect(file)
  }

  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    handleFileSelect(file)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
      <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl border border-teal-100">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">Upload Medical Document</h2>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-teal-50 transition">
            <X size={18} />
          </button>
        </div>

        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-teal-300 bg-gradient-to-br from-teal-50 to-cyan-50 px-6 py-12 text-center transition hover:border-teal-400"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-teal-200 to-cyan-200 mb-2">
            <UploadCloud className="text-teal-600" size={32} />
          </div>
          <p className="text-sm font-semibold text-slate-700">Drop PDF here or click to browse</p>
          <p className="text-xs text-slate-500">Only .pdf files are supported</p>
          <button
            type="button"
            onClick={handleBrowseClick}
            className="mt-2 rounded-full bg-gradient-to-r from-teal-400 to-cyan-400 px-6 py-2.5 text-sm font-semibold text-white hover:from-teal-500 hover:to-cyan-500 shadow-sm transition"
          >
            Browse Files
          </button>
        </div>

        {/* Upload Limits Info */}
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700">
          <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Upload Requirements:</p>
            <p className="mt-0.5 opacity-90">Maximum file size: 15MB • Maximum pages: 10</p>
          </div>
        </div>

        {error && (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {isProcessing && (
          <div className="mt-4 space-y-3">
            {/* Stage 1: Uploading */}
            <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm transition ${
              processingStage === 'uploading'
                ? 'border-teal-200 bg-teal-50 text-teal-700'
                : processingStage === 'processing' || processingStage === 'complete'
                ? 'border-green-200 bg-green-50 text-green-700'
                : 'border-gray-200 bg-gray-50 text-gray-500'
            }`}>
              {processingStage === 'uploading' ? (
                <Loader2 className="animate-spin flex-shrink-0" size={18} />
              ) : (
                <CheckCircle className="flex-shrink-0" size={18} />
              )}
              <div>
                <div className="font-medium">Uploading document</div>
                <div className="text-xs opacity-75">Securely transferring to cloud storage...</div>
              </div>
            </div>

            {/* Stage 2: Processing */}
            {(processingStage === 'processing' || processingStage === 'complete') && (
              <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm transition ${
                processingStage === 'processing'
                  ? 'border-teal-200 bg-teal-50 text-teal-700'
                  : 'border-green-200 bg-green-50 text-green-700'
              }`}>
                {processingStage === 'processing' ? (
                  <Loader2 className="animate-spin flex-shrink-0" size={18} />
                ) : (
                  <CheckCircle className="flex-shrink-0" size={18} />
                )}
                <div>
                  <div className="font-medium">Processing with AI</div>
                  <div className="text-xs opacity-75">Extracting text, analyzing content... (20-30 seconds)</div>
                </div>
              </div>
            )}

            {/* Stage 3: Complete */}
            {processingStage === 'complete' && (
              <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                <CheckCircle className="flex-shrink-0" size={18} />
                <div>
                  <div className="font-medium">Document ready!</div>
                  <div className="text-xs opacity-75">You can now ask questions about this document</div>
                </div>
              </div>
            )}

            {processingStage === 'processing' && (
              <div className="text-xs text-center text-slate-500 pt-2">
                ⚡ AI is analyzing your document. This may take 20-30 seconds.
              </div>
            )}
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          accept="application/pdf"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  )
}

export default UploadModal

UploadModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onUploadStart: PropTypes.func,
  onUploadSuccess: PropTypes.func,
  onUploadError: PropTypes.func,
  bucket: PropTypes.string,
}
