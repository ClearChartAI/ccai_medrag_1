import { useState } from 'react'
import PropTypes from 'prop-types'
import { X, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import './HIPAARequestForm.css'
import '../UploadModal.css'

const HIPAARequestForm = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    // Patient Information
    fullName: '',
    dateOfBirth: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    email: '',
    medicalRecordNumber: '',

    // Healthcare Provider Information
    providerName: '',
    providerAddress: '',
    providerCity: '',
    providerState: '',
    providerZipCode: '',
    providerPhone: '',
    providerFax: '',

    // Records Requested
    recordTypes: [],
    dateFrom: '',
    dateTo: '',
    specificInfo: '',

    // Delivery Method
    deliveryMethod: 'email',

    // Purpose
    purpose: '',

    // Authorization
    signature: '',
    signatureDate: '',
    relationship: 'self'
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const recordTypeOptions = [
    'Medical History',
    'Lab Results',
    'Imaging Reports (X-rays, MRI, CT scans)',
    'Prescription Records',
    'Immunization Records',
    'Surgery/Procedure Notes',
    'Progress Notes',
    'Discharge Summaries',
    'All Records'
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleRecordTypeToggle = (recordType) => {
    setFormData(prev => ({
      ...prev,
      recordTypes: prev.recordTypes.includes(recordType)
        ? prev.recordTypes.filter(type => type !== recordType)
        : [...prev.recordTypes, recordType]
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Basic validation
    if (!formData.fullName || !formData.dateOfBirth || !formData.providerName) {
      setError('Please fill in all required fields marked with *')
      return
    }

    if (formData.recordTypes.length === 0) {
      setError('Please select at least one type of record to request')
      return
    }

    if (!formData.signature) {
      setError('Please provide your signature to authorize this request')
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitSuccess(true)

      // Close after 2 seconds
      setTimeout(() => {
        onClose()
        setSubmitSuccess(false)
        setFormData({
          fullName: '', dateOfBirth: '', address: '', city: '', state: '',
          zipCode: '', phone: '', email: '', medicalRecordNumber: '',
          providerName: '', providerAddress: '', providerCity: '', providerState: '',
          providerZipCode: '', providerPhone: '', providerFax: '',
          recordTypes: [], dateFrom: '', dateTo: '', specificInfo: '',
          deliveryMethod: 'email', purpose: '', signature: '', signatureDate: '',
          relationship: 'self'
        })
      }, 2000)
    }, 1500)
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-4xl rounded-3xl bg-white p-8 shadow-2xl border border-purple-100 my-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100">
              <FileText className="text-purple-600" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-teal-600 bg-clip-text text-transparent">
                HIPAA Request for Access
              </h2>
              <p className="text-sm text-slate-500">Request your protected health information</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-purple-50 transition">
            <X size={20} />
          </button>
        </div>

        {submitSuccess ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100">
              <CheckCircle className="text-green-600" size={40} />
            </div>
            <h3 className="text-2xl font-bold text-slate-800">Request Submitted Successfully!</h3>
            <p className="text-slate-600 text-center max-w-md">
              Your HIPAA request has been submitted. The healthcare provider will process your request within 30 days as required by law.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Patient Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2">
                Patient Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Street Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">ZIP Code</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Medical Record Number (if known)
                </label>
                <input
                  type="text"
                  name="medicalRecordNumber"
                  value={formData.medicalRecordNumber}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Healthcare Provider Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2">
                Healthcare Provider Information
              </h3>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Provider/Facility Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="providerName"
                  value={formData.providerName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Provider Address</label>
                <input
                  type="text"
                  name="providerAddress"
                  value={formData.providerAddress}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    name="providerCity"
                    value={formData.providerCity}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    name="providerState"
                    value={formData.providerState}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">ZIP Code</label>
                  <input
                    type="text"
                    name="providerZipCode"
                    value={formData.providerZipCode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Provider Phone</label>
                  <input
                    type="tel"
                    name="providerPhone"
                    value={formData.providerPhone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Provider Fax</label>
                  <input
                    type="tel"
                    name="providerFax"
                    value={formData.providerFax}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Records Requested */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2">
                Records Requested
              </h3>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Type of Records <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {recordTypeOptions.map((option) => (
                    <label key={option} className="flex items-center gap-2 p-3 border border-slate-300 rounded-lg hover:bg-purple-50 cursor-pointer transition">
                      <input
                        type="checkbox"
                        checked={formData.recordTypes.includes(option)}
                        onChange={() => handleRecordTypeToggle(option)}
                        className="w-4 h-4 text-purple-600 border-slate-300 rounded focus:ring-purple-500"
                      />
                      <span className="text-sm text-slate-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Date From</label>
                  <input
                    type="date"
                    name="dateFrom"
                    value={formData.dateFrom}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Date To</label>
                  <input
                    type="date"
                    name="dateTo"
                    value={formData.dateTo}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Specific Information Requested (optional)
                </label>
                <textarea
                  name="specificInfo"
                  value={formData.specificInfo}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Describe any specific records or information you need..."
                />
              </div>
            </div>

            {/* Delivery Method */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2">
                Delivery Method
              </h3>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  How would you like to receive your records?
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'email', label: 'Email (Electronic Copy)' },
                    { value: 'mail', label: 'Mail (Paper Copy)' },
                    { value: 'pickup', label: 'In-Person Pickup' },
                    { value: 'fax', label: 'Fax' }
                  ].map((option) => (
                    <label key={option.value} className="flex items-center gap-2 p-3 border border-slate-300 rounded-lg hover:bg-purple-50 cursor-pointer transition">
                      <input
                        type="radio"
                        name="deliveryMethod"
                        value={option.value}
                        checked={formData.deliveryMethod === option.value}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-purple-600 border-slate-300 focus:ring-purple-500"
                      />
                      <span className="text-sm text-slate-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Purpose */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2">
                Purpose (Optional)
              </h3>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Reason for Request
                </label>
                <input
                  type="text"
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Personal records, Second opinion, Transfer of care"
                />
              </div>
            </div>

            {/* Authorization */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2">
                Authorization
              </h3>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                <p className="mb-2">
                  <strong>Authorization Statement:</strong> I authorize the release of my protected health information as specified above.
                  I understand that I have the right to revoke this authorization in writing at any time, except to the extent that action
                  has already been taken in reliance on this authorization.
                </p>
                <p>
                  I understand that the healthcare provider has up to 30 days to respond to this request as required by HIPAA regulations.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Relationship to Patient <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="relationship"
                    value={formData.relationship}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    <option value="self">Self</option>
                    <option value="parent">Parent/Guardian</option>
                    <option value="representative">Personal Representative</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    name="signatureDate"
                    value={formData.signatureDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Signature (Type your full name) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="signature"
                  value={formData.signature}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-signature"
                  placeholder="Type your full name here"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">
                  By typing your name above, you are providing an electronic signature that has the same legal effect as a handwritten signature.
                </p>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-animated px-8 py-2.5"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        )}
        </div>
      </div>
    </div>
  )
}

HIPAARequestForm.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
}

export default HIPAARequestForm
