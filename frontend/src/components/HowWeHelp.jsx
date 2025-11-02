import React, { useEffect, useRef, useState } from 'react';
import './HowWeHelp.css';
import useScrollAnimation from '../hooks/useScrollAnimation';
import secureImage from '../assets/ChatGPT Image Oct 4, 2025, 02_46_18 PM.png';
import smartImage from '../assets/ChatGPT Image Oct 4, 2025, 03_02_33 PM.png';
import intuitiveImage from '../assets/ChatGPT Image Oct 4, 2025, 03_17_22 PM.png';

const HowWeHelp = () => {
  const headerRef = useScrollAnimation({ threshold: 0.2 });
  const cardsContainerRef = useRef(null);
  const [cardsAnimated, setCardsAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !cardsAnimated) {
          setCardsAnimated(true);
        }
      },
      {
        threshold: 0.2,
        rootMargin: '0px 0px -100px 0px' // Trigger slightly before fully in view
      }
    );

    if (cardsContainerRef.current) {
      observer.observe(cardsContainerRef.current);
    }

    return () => observer.disconnect();
  }, [cardsAnimated]);

  return (
    <section className="how-we-help-section">
      <div className="how-we-help-header fade-in-up" ref={headerRef}>
        <h2 className="section-title">How we help you</h2>
        <p className="section-subtitle">Powerful tools to make your medical information accessible</p>
      </div>

      <div className={`features-grid ${cardsAnimated ? 'animated' : ''}`} ref={cardsContainerRef}>
        <div className="feature-card card-outer">
          <div className="feature-image">
            <img src={secureImage} alt="Woman reading on tablet" />
          </div>
          <div className="feature-content">
            <h3 className="feature-title">Unified medical records</h3>
            <p className="feature-description">Seamlessly pull data from hospitals and clinics</p>

          </div>
        </div>

        <div className="feature-card card-middle">
          <div className="feature-image">
            <img src={smartImage} alt="Doctor presenting tablet" />
          </div>
          <div className="feature-content">
            <h3 className="feature-title">AI-powered explanations</h3>
            <p className="feature-description">Translate complex medical terminology into clear language</p>

          </div>
        </div>

        <div className="feature-card card-outer">
          <div className="feature-image">
            <img src={intuitiveImage} alt="Woman with laptop" />
          </div>
          <div className="feature-content">
            <h3 className="feature-title">Answers you can understand</h3>
            <p className="feature-description">Ask direct questions about your health and get precise answers that you can understand</p>

          </div>
        </div>
      </div>
    </section>
  );
};

export default HowWeHelp;
