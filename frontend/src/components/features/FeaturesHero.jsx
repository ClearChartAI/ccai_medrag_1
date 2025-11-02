import React, { useState, useEffect } from 'react';
import './FeaturesHero.css';

const FeaturesHero = () => {
  const [particles, setParticles] = useState([]);
  const [titleVisible, setTitleVisible] = useState(false);

  useEffect(() => {
    setTitleVisible(true);
    // Generate particles
    const newParticles = [];
    for (let i = 0; i < 50; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.2
      });
    }
    setParticles(newParticles);
  }, []);

  return (
    <section className="features-hero">
      <div className="features-hero-background">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="particle"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              opacity: particle.opacity,
              animationDuration: `${20 + Math.random() * 10}s`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
        <div className="gradient-mesh"></div>
      </div>

      <div className="features-hero-container">
        <h1 className={`features-hero-title ${titleVisible ? 'visible' : ''}`}>
          <span className="highlight-text">Medical records</span> decoded
        </h1>
        <p className={`features-hero-subtitle ${titleVisible ? 'visible' : ''}`}>
          Cut through complexity and gain clarity about your health with intelligent, personalized medical insights
        </p>
        <div className={`features-cta ${titleVisible ? 'visible' : ''}`}>
          <button className="btn-features-primary">
            Start Free Trial
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="btn-features-secondary">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2"/>
              <path d="M8 7L13 10L8 13V7Z" fill="currentColor"/>
            </svg>
            Watch Demo
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturesHero;
