import React from 'react';
import './FeaturesJourney.css';

const FeaturesJourney = () => {
  return (
    <section className="features-journey">
      <div className="journey-header">
        <h2 className="journey-title">Your health journey simplified</h2>
        <p className="journey-subtitle">Unlock the power of your medical information</p>
      </div>

      <div className="journey-cards">
        <div className="journey-card journey-card-dark">
          <div className="journey-card-icon">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 5L5 12.5V20C5 28.75 11.25 36.875 20 38.75C28.75 36.875 35 28.75 35 20V12.5L20 5Z" stroke="white" strokeWidth="2" fill="none"/>
              <circle cx="20" cy="20" r="5" fill="white"/>
            </svg>
          </div>
          <div className="journey-card-content">
            <h3 className="journey-card-title">Connect your medical story</h3>
            <p className="journey-card-description">
              Authorize ClearChartAI to retrieve your health data from hospitals, labs, and clinics.
            </p>
            <a href="#" className="journey-card-link">
              Start <span>→</span>
            </a>
          </div>
        </div>

        <div className="journey-card journey-card-medium">
          <div className="journey-card-icon">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 5L5 12.5V20C5 28.75 11.25 36.875 20 38.75C28.75 36.875 35 28.75 35 20V12.5L20 5Z" stroke="white" strokeWidth="2" fill="none"/>
              <circle cx="20" cy="20" r="5" fill="white"/>
            </svg>
          </div>
          <div className="journey-card-content">
            <h3 className="journey-card-title">Decode your medical narrative</h3>
            <p className="journey-card-description">
              Our system organizes and explains your data, removing jargon and highlighting key findings.
            </p>
            <a href="#" className="journey-card-link">
              Translate <span>→</span>
            </a>
          </div>
        </div>

        <div className="journey-card journey-card-light">
          <div className="journey-card-icon">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 5L5 12.5V20C5 28.75 11.25 36.875 20 38.75C28.75 36.875 35 28.75 35 20V12.5L20 5Z" stroke="white" strokeWidth="2" fill="none"/>
              <circle cx="20" cy="20" r="5" fill="white"/>
            </svg>
          </div>
          <div className="journey-card-content">
            <h3 className="journey-card-title">Empower your health conversations</h3>
            <p className="journey-card-description">
              Ask direct questions. Receive precise, personalized answers
            </p>
            <a href="#" className="journey-card-link">
              Inquire <span>→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesJourney;
