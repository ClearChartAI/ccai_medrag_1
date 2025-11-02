import React from 'react';
import './AboutProcess.css';
import useScrollAnimation from '../../hooks/useScrollAnimation';

const AboutProcess = () => {
  const headerRef = useScrollAnimation({ threshold: 0.2 });
  const card1Ref = useScrollAnimation({ threshold: 0.2 });
  const card2Ref = useScrollAnimation({ threshold: 0.2 });

  return (
    <section className="about-process">
      <div className="process-header fade-in-up" ref={headerRef}>
        <h2 className="process-title">How your medical records become clear</h2>
        <p className="process-subtitle">Transforming complex health data into simple, actionable insights</p>
      </div>

      <div className="process-cards">
        <div className="process-card process-card-teal slide-in-left" ref={card1Ref}>
          <div className="process-card-background">
            <div className="card-orb card-orb-1"></div>
            <div className="card-orb card-orb-2"></div>
          </div>
          <div className="process-card-content">
            <h3 className="process-card-title">Pull records with precision</h3>
            <p className="process-card-description">
              Securely connect medical information from multiple healthcare sources in one place
            </p>
            <div className="process-card-actions">
              <button className="btn-card-action">Connect</button>
              <a href="#" className="link-card-action">
                Watch <span>→</span>
              </a>
            </div>
          </div>
        </div>

        <div className="process-card process-card-gray slide-in-right" ref={card2Ref}>
          <div className="process-card-background">
            <div className="card-orb card-orb-3"></div>
            <div className="card-orb card-orb-4"></div>
          </div>
          <div className="process-card-content">
            <h3 className="process-card-title">Translate with intelligence</h3>
            <p className="process-card-description">
              Advanced AI breaks down medical language into straightforward, patient-friendly explanations
            </p>
            <div className="process-card-actions">
              <button className="btn-card-action">Understand</button>
              <a href="#" className="link-card-action">
                Explore <span>→</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutProcess;
