import React, { useState, useEffect, useRef } from 'react';
import './AnimatedStats.css';

const stats = [
  { id: 'patients', end: 50000, label: 'Patients Helped', suffix: '+', duration: 2000 },
  { id: 'accuracy', end: 99.8, label: 'AI Accuracy', suffix: '%', duration: 2000, decimals: 1 },
  { id: 'speed', end: 3, label: 'Avg Response Time', suffix: 's', duration: 1500 },
  { id: 'satisfaction', end: 4.9, label: 'User Rating', suffix: '/5', duration: 1800, decimals: 1 }
];

const AnimatedStats = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [counts, setCounts] = useState({ patients: 0, accuracy: 0, speed: 0, satisfaction: 0 });
  const sectionRef = useRef(null);
  const timersRef = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    const currentRef = sectionRef.current;

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    // Clear any existing timers
    timersRef.current.forEach(timer => clearInterval(timer));
    timersRef.current = [];

    stats.forEach(stat => {
      const increment = stat.end / (stat.duration / 16);
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= stat.end) {
          current = stat.end;
          clearInterval(timer);
        }

        setCounts(prev => ({
          ...prev,
          [stat.id]: stat.decimals ? current.toFixed(stat.decimals) : Math.floor(current)
        }));
      }, 16);

      timersRef.current.push(timer);
    });

    return () => {
      timersRef.current.forEach(timer => clearInterval(timer));
    };
  }, [isVisible]);

  return (
    <section className="animated-stats" ref={sectionRef}>
      <div className="stats-container">
        <div className="stats-header">
          <h2 className="stats-title">Transforming Healthcare by the Numbers</h2>
          <p className="stats-subtitle">Real impact, real results</p>
        </div>

        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div
              key={stat.id}
              className={`stat-card ${isVisible ? 'visible' : ''}`}
              style={{ transitionDelay: `${index * 0.1}s` }}
            >
              <div className="stat-icon">
                {stat.id === 'patients' && (
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                    <path d="M20 22C25.5228 22 30 17.5228 30 12C30 6.47715 25.5228 2 20 2C14.4772 2 10 6.47715 10 12C10 17.5228 14.4772 22 20 22Z" stroke="currentColor" strokeWidth="2"/>
                    <path d="M4 38C4 30.268 10.268 24 18 24H22C29.732 24 36 30.268 36 38" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                )}
                {stat.id === 'accuracy' && (
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                    <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 20L17 25L28 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
                {stat.id === 'speed' && (
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                    <path d="M20 4V12M8 20H4M36 20H32M31.314 8.686L25.657 14.343M8.686 31.314L14.343 25.657M31.314 31.314L25.657 25.657" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <circle cx="20" cy="20" r="6" fill="currentColor"/>
                  </svg>
                )}
                {stat.id === 'satisfaction' && (
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                    <path d="M20 2L24.854 11.854L36 13.608L28 21.382L29.708 32.5L20 27.354L10.292 32.5L12 21.382L4 13.608L15.146 11.854L20 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <div className="stat-number">
                {counts[stat.id]}{stat.suffix}
              </div>
              <div className="stat-label">{stat.label}</div>
              <div className="stat-glow"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AnimatedStats;
