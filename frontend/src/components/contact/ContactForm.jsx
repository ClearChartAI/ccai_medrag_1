import React, { useState } from 'react';
import './ContactForm.css';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    topic: '',
    userType: '',
    message: '',
    acceptTerms: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Handle form submission
  };

  return (
    <section className="contact-form-section">
      <div className="form-container">
        <div className="form-header">
          <h2 className="form-title">Contact us</h2>
          <p className="form-subtitle">We want to hear from you. Fill out the form below.</p>

          <div className="contact-details">
            <div className="contact-detail-item">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <path d="M2 6L10 11L18 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span>team@clearchartai.io</span>
            </div>
            <div className="contact-detail-item">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <path d="M6 4C6 2.89543 6.89543 2 8 2H12C13.1046 2 14 2.89543 14 4V16C14 17.1046 13.1046 18 12 18H8C6.89543 18 6 17.1046 6 16V4Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <circle cx="10" cy="15" r="0.5" fill="currentColor"/>
              </svg>
              <span>+1 (415) 555-0123</span>
            </div>
            <div className="contact-detail-item">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <path d="M10 9C11.1046 9 12 8.10457 12 7C12 5.89543 11.1046 5 10 5C8.89543 5 8 5.89543 8 7C8 8.10457 8.89543 9 10 9Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <path d="M10 18C10 18 15 13 15 9C15 6.23858 12.7614 4 10 4C7.23858 4 5 6.23858 5 9C5 13 10 18 10 18Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              </svg>
              <span>123 Sample St, Sydney NSW 2000 AU</span>
            </div>
          </div>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="topic">Choose a topic</label>
            <select
              id="topic"
              name="topic"
              value={formData.topic}
              onChange={handleChange}
              required
            >
              <option value="">Select one...</option>
              <option value="general">General inquiry</option>
              <option value="support">Support</option>
              <option value="partnership">Partnership</option>
              <option value="media">Media</option>
            </select>
          </div>

          <div className="form-group">
            <label>Which best describes you?</label>
            <div className="radio-grid">
              <label className="radio-label">
                <input
                  type="radio"
                  name="userType"
                  value="patient"
                  checked={formData.userType === 'patient'}
                  onChange={handleChange}
                />
                <span>Patient</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="userType"
                  value="healthcare-provider"
                  checked={formData.userType === 'healthcare-provider'}
                  onChange={handleChange}
                />
                <span>Healthcare provider</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="userType"
                  value="researcher"
                  checked={formData.userType === 'researcher'}
                  onChange={handleChange}
                />
                <span>Researcher</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="userType"
                  value="investor"
                  checked={formData.userType === 'investor'}
                  onChange={handleChange}
                />
                <span>Investor</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="userType"
                  value="media"
                  checked={formData.userType === 'media'}
                  onChange={handleChange}
                />
                <span>Media</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="userType"
                  value="other"
                  checked={formData.userType === 'other'}
                  onChange={handleChange}
                />
                <span>Other</span>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              rows="6"
              placeholder="Tell us what you need"
              value={formData.message}
              onChange={handleChange}
              required
            ></textarea>
          </div>

          <div className="form-checkbox">
            <input
              type="checkbox"
              id="acceptTerms"
              name="acceptTerms"
              checked={formData.acceptTerms}
              onChange={handleChange}
              required
            />
            <label htmlFor="acceptTerms">I accept the terms of service</label>
          </div>

          <button type="submit" className="btn-submit">Send</button>
        </form>
      </div>
    </section>
  );
};

export default ContactForm;
