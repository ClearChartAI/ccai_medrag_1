import React, { useState, useEffect, useRef } from 'react';
import './AboutHero.css';
import useScrollAnimation from '../../hooks/useScrollAnimation';

const AboutHero = () => {
  console.log('AboutHero rendering');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [titleWords, setTitleWords] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const heroRef = useRef(null);
  const contentRef = useScrollAnimation({ threshold: 0.2 });

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

  useEffect(() => {
    // Observer to detect when content becomes visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (contentRef.current) {
      observer.observe(contentRef.current);
    }

    return () => {
      if (contentRef.current) {
        observer.unobserve(contentRef.current);
      }
    };
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    const words = 'Decode your'.split(' ');
    const animateWords = async () => {
      for (let i = 0; i < words.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setTitleWords(prev => [...prev, words[i]]);
      }
    };
    animateWords();
  }, [isVisible]);

  return (
    <section className={`about-hero ${isVisible ? 'hero-visible' : ''}`} ref={heroRef}>
      <div className="about-hero-background">
        {/* Medical grid pattern */}
        <div className="medical-grid"></div>

        {/* EKG/Heartbeat Animation Lines */}
        <svg className="ekg-line ekg-line-1" viewBox="0 0 1200 100" preserveAspectRatio="none">
          <path
            d="M0,50 L200,50 L220,30 L240,70 L260,20 L280,80 L300,50 L1200,50"
            fill="none"
            stroke="url(#ekgGradient1)"
            strokeWidth="2.5"
          />
          <defs>
            <linearGradient id="ekgGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#667eea" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#667eea" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#667eea" stopOpacity="0.3" />
            </linearGradient>
          </defs>
        </svg>

        <svg className="ekg-line ekg-line-2" viewBox="0 0 1200 100" preserveAspectRatio="none">
          <path
            d="M0,50 L180,50 L200,25 L220,75 L240,15 L260,85 L280,50 L1200,50"
            fill="none"
            stroke="url(#ekgGradient2)"
            strokeWidth="2"
          />
          <defs>
            <linearGradient id="ekgGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#764ba2" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#764ba2" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#764ba2" stopOpacity="0.2" />
            </linearGradient>
          </defs>
        </svg>

        <svg className="ekg-line ekg-line-3" viewBox="0 0 1200 100" preserveAspectRatio="none">
          <path
            d="M0,50 L210,50 L230,35 L250,65 L270,25 L290,75 L310,50 L1200,50"
            fill="none"
            stroke="url(#ekgGradient3)"
            strokeWidth="2"
          />
          <defs>
            <linearGradient id="ekgGradient3" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f093fb" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#f093fb" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#f093fb" stopOpacity="0.2" />
            </linearGradient>
          </defs>
        </svg>

        {/* Subtle gradient orbs with parallax */}
        <div className="about-gradient-orb about-orb-1" style={{
          transform: `translate(${mousePosition.x * 20}px, ${mousePosition.y * 20}px)`
        }}></div>
        <div className="about-gradient-orb about-orb-2" style={{
          transform: `translate(${mousePosition.x * -15}px, ${mousePosition.y * -15}px)`
        }}></div>

        {/* Heartbeat pulse indicator */}
        <div className="heartbeat-indicator">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              fill="currentColor"
              className="heartbeat-icon"
            />
          </svg>
          <span className="heartbeat-bpm">72 BPM</span>
        </div>
      </div>

      <div className="about-hero-container" ref={contentRef}>
        <div className="about-hero-badge scroll-animate">
          <span className="about-badge-dot"></span>
          <span>Our Mission</span>
        </div>
        <h1 className="about-hero-title scroll-animate">
          {titleWords.map((word, index) => (
            <span
              key={index}
              className="about-gradient-text kinetic-word"
              style={{
                animationDelay: `${index * 0.1}s`,
                background: 'linear-gradient(135deg, #8d87ba 0%, #6d67a0 50%, #b3aed6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              {word}{' '}
            </span>
          ))}
          <span className="kinetic-word" style={{ animationDelay: '0.2s', color: '#000 !important', WebkitTextFillColor: '#000' }}>
            health
          </span>
        </h1>
        <p className="about-hero-subtitle subtitle-animate scroll-animate">
          Transforming complex medical records into clear, actionable insights for patients
        </p>

        <div className="scroll-indicator scroll-animate">
          <div className="scroll-mouse">
            <div className="scroll-wheel"></div>
          </div>
          <span>Scroll to explore</span>
        </div>

      </div>
    </section>
  );
};

export default AboutHero;
