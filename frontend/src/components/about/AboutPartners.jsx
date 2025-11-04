import React from 'react';
import './AboutPartners.css';
import useScrollAnimation from '../../hooks/useScrollAnimation';
import newBeatsLogo from '../../assets/New Beats Cardiology.png';

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
              <img src={newBeatsLogo} alt="New Beats Cardiology" className="partner-logo-img" />
            </div>
          </div>


        </div>
      </div>
    </section>
  );
};

export default AboutPartners;
