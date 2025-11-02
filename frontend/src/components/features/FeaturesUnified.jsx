import React from 'react';
import './FeaturesUnified.css';

const FeaturesUnified = () => {
  return (
    <section className="features-unified">
      <div className="unified-container">
        <div className="unified-text">
          <h2 className="unified-title">Your medical records, simplified and secure</h2>
          <p className="unified-description">
            We gather your scattered medical data with precision and care. Every record tells a story - we make sure you understand it.
          </p>
          <ul className="unified-list">
            <li>HIPAA compliant data integration</li>
            <li>Instant medical record consolidation</li>
            <li>Patient-controlled information access</li>
          </ul>
          <div className="unified-actions">
            <button className="btn-unified">Connect</button>
            <a href="#" className="link-unified">
              Details <span>→</span>
            </a>
          </div>
        </div>

        <div className="unified-visual">
          <img src="/src/assets/ChatGPT Image Oct 4, 2025, 08_23_22 PM.png" alt="Medical Records" width="600" height="640" />
        </div>
      </div>
    </section>
  );
};

export default FeaturesUnified;
