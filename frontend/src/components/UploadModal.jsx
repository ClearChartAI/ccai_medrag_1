import { useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { UploadCloud, Loader2, X } from 'lucide-react'

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
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleFileSelect = async (file) => {
    if (!file) return
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF document.')
      return
    }

    setError('')
    setIsProcessing(true)
    onUploadStart?.(file)

    try {
      // Create form data
      const formData = new FormData()
      formData.append('file', file)

      if (!import.meta.env.VITE_API_URL) {
        throw new Error('Query API URL is not configured.')
      }

      const { data } = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      console.log('✓ File uploaded successfully:', data)

      // Notify parent component
      onUploadSuccess?.(data.document)

      // Close modal after brief delay
      setTimeout(() => {
        onClose()
        setIsProcessing(false)
      }, 1000)
    } catch (err) {
      console.error('Upload error:', err)
      setError(err.response?.data?.detail || 'Upload failed. Please try again.')
      setIsProcessing(false)
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

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {isProcessing && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-700">
            <Loader2 className="animate-spin" size={18} />
            <span>Processing document...</span>
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
