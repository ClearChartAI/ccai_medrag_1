import React, { useState } from 'react';
import './AboutFAQ.css';
import useScrollAnimation from '../../hooks/useScrollAnimation';

const AboutFAQ = () => {
  const [openIndex, setOpenIndex] = useState(-1);
  const headerRef = useScrollAnimation({ threshold: 0.2 });
  const listRef = useScrollAnimation({ threshold: 0.2 });
  const footerRef = useScrollAnimation({ threshold: 0.2 });

  const faqs = [
    {
      question: 'Is ClearChartAI secure?',
      answer: 'Absolutely. We use bank-level encryption and HIPAA-compliant systems. Your medical information remains completely confidential and secure.'
    },
    {
      question: 'Can it access all my records?',
      answer: 'Yes, we integrate with most healthcare providers across the United States. Hospitals, clinics, and labs can all connect through our secure platform.'
    },
    {
      question: 'Does this replace my doctor?',
      answer: 'No. ClearChartAI explains your records so you can understand and take control of your health.'
    },
    {
      question: 'Can I trust the information?',
      answer: 'ClearChartAI pulls directly from your medical records and uses gold-standard research to answer your question. We provide accurate insights drawn from your actual health documents, not generic internet searches.'
    },
    {
      question: 'Is this medical advice?',
      answer: 'No. We provide clarity and understanding, but always recommend consulting your healthcare provider for medical guidance and interpretation.'
    }
  ];

  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <section className="about-faq">
      <div className="faq-header fade-in-up" ref={headerRef}>
        <h2 className="faq-title">FAQs</h2>
        <p className="faq-subtitle">
          Answers to help you understand how ClearChartAI transforms your medical record experience
        </p>
      </div>

      <div className="faq-list scale-in" ref={listRef}>
        {faqs.map((faq, index) => (
          <div
            key={index}
            className={`faq-item ${openIndex === index ? 'active' : ''}`}
          >
            <button
              className="faq-question"
              onClick={() => handleToggle(index)}
            >
              <span>{faq.question}</span>
              <span className="faq-icon">{openIndex === index ? '−' : '+'}</span>
            </button>
            <div className={`faq-answer ${openIndex === index ? 'open' : ''}`}>
              <p>{faq.answer}</p>
            </div>
          </div>
        ))}
      </div>

      
    </section>
  );
};

export default AboutFAQ;
