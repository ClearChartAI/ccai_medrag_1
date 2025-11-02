import React from 'react';
import './AboutPartners.css';
import useScrollAnimation from '../../hooks/useScrollAnimation';

const AboutPartners = () => {
  const textRef = useScrollAnimation({ threshold: 0.2 });
  const logosRef = useScrollAnimation({ threshold: 0.2 });

  return (
    <section className="about-partners">
      <div className="partners-container">
        <div className="partners-text slide-in-left" ref={textRef}>
          <h2 className="partners-title">Our trusted healthcare technology partners</h2>
          <p className="partners-description">
            Strategic collaborations driving innovation in medical data understanding and patient empowerment
          </p>
        </div>

        <div className="partners-logos slide-in-right" ref={logosRef}>
          <div className="partner-logo">
            <div className="logo-card">
              <svg width="120" height="40" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="8" fill="#E63946"/>
                <circle cx="28" cy="20" r="8" fill="#E63946"/>
                <path d="M15 28 Q24 35, 33 28" stroke="#E63946" strokeWidth="3" fill="none"/>
                <text x="45" y="25" fontFamily="Arial" fontSize="14" fontWeight="600" fill="#E63946">New Beats</text>
                <text x="45" y="35" fontFamily="Arial" fontSize="10" fill="#666">Cardiology</text>
              </svg>
            </div>
          </div>


        </div>
      </div>
    </section>
  );
};

export default AboutPartners;
