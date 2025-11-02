import React from 'react';
import { Link } from 'react-router-dom';
import './CTA.css';
import useScrollAnimation from '../hooks/useScrollAnimation';

const CTA = () => {
  const contentRef = useScrollAnimation({ threshold: 0.2 });

  return (
    <section className="cta-section">
      <div className="cta-content fade-in-up" ref={contentRef}>
        <h2 className="cta-title">Ready to understand your health?</h2>
        <p className="cta-description">Join our early access program and start decoding your medical records today</p>
        <div className="cta-buttons">
          <Link to="/login" className="btn-try-free">Try for Free</Link>
          <Link to="/contact" className="btn-contact">Contact us</Link>
        </div>
      </div>
    </section>
  );
};

export default CTA;
