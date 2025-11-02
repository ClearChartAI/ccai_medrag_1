import React from 'react';
import './Benefits.css';
import useScrollAnimation from '../hooks/useScrollAnimation';
import benefitsImage from '../assets/ChatGPT Image Oct 4, 2025, 04_21_19 PM.png';

const Benefits = () => {
  const leftRef = useScrollAnimation({ threshold: 0.2 });
  const rightRef = useScrollAnimation({ threshold: 0.2 });

  return (
    <section className="benefits-section">
      <div className="benefits-container">
        <div className="benefits-left slide-in-left" ref={leftRef}>
          <div className="benefit-item">
            <div className="benefit-text">
              <h3 className="benefit-title">Better communication</h3>
              <p className="benefit-description">Understand your medical records with clarity and confidence</p>
            </div>
          </div>

          <div className="benefit-item">
            <div className="benefit-text">
              <h3 className="benefit-title">Stronger engagement</h3>
              <p className="benefit-description">Take an active role in managing your personal health journey</p>
            </div>
          </div>

          <div className="benefit-item">
            <div className="benefit-text">
              <h3 className="benefit-title">Improved outcomes</h3>
              <p className="benefit-description">Make informed decisions with comprehensive and understandable medical information</p>
            </div>
          </div>

          <div className="benefits-actions">
            <button className="btn-get-started">Get started</button>
          </div>
        </div>

        <div className="benefits-right slide-in-right" ref={rightRef}>
          <img
            src={benefitsImage}
            alt="Grandmother with grandchildren"
          />
        </div>
      </div>
    </section>
  );
};

export default Benefits;
