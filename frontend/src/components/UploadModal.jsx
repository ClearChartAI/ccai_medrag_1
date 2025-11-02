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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Upload Medical Document</h2>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center"
        >
          <UploadCloud className="text-brand-blue" size={36} />
          <p className="text-sm font-semibold text-slate-700">Drop PDF here or click to browse</p>
          <p className="text-xs text-slate-400">Only .pdf files are supported</p>
          <button
            type="button"
            onClick={handleBrowseClick}
            className="rounded-full border border-brand-blue px-5 py-2 text-sm font-semibold text-brand-blue hover:bg-brand-blue hover:text-white"
          >
            Browse Files
          </button>
        </div>

        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

        {isProcessing && (
          <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
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
