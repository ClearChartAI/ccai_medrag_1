import React, { useState, useEffect, useRef } from 'react';
import './Hero.css';

const Hero = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
        const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
        setMousePosition({ x, y });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const parallaxStyle = {
    transform: `translate(${mousePosition.x * 20}px, ${mousePosition.y * 20}px)`,
    transition: 'transform 0.3s ease-out'
  };

  return (
    <main className="hero-section" ref={heroRef}>
      <div className="hero-background">
        <div className="gradient-orb orb-1" style={{
          transform: `translate(${mousePosition.x * 30}px, ${mousePosition.y * 30}px)`
        }}></div>
        <div className="gradient-orb orb-2" style={{
          transform: `translate(${mousePosition.x * -20}px, ${mousePosition.y * -20}px)`
        }}></div>
        <div className="gradient-orb orb-3" style={{
          transform: `translate(${mousePosition.x * 40}px, ${mousePosition.y * -30}px)`
        }}></div>
      </div>

      <div className="content-wrapper">
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="gradient-text">Clarity</span> in Complexity
          </h1>
          <p className="hero-subtitle">
            Your records, unified and simplified. Clear explanations, real understanding, no medical degree needed.
          </p>
          <div className="hero-actions">
            <button className="btn-secondary">
              Try Now
              <svg className="btn-arrow" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className="btn-outline">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M8 7L13 10L8 13V7Z" fill="currentColor"/>
              </svg>
              Watch Demo
            </button>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-number">10K+</div>
              <div className="stat-label">Records Analyzed</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-number">98%</div>
              <div className="stat-label">Accuracy</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-number">5sec</div>
              <div className="stat-label">Avg Response</div>
            </div>
          </div>
        </div>
        <div className="hero-image" style={parallaxStyle}>
          <div className="video-container empty" aria-hidden="true"></div>
        </div>
      </div>
    </main>
  );
};

export default Hero;
