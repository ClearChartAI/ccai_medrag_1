import React, { useState } from 'react';
import './AboutTimeline.css';
import useScrollAnimation from '../../hooks/useScrollAnimation';

const AboutTimeline = () => {
  const [activeYear, setActiveYear] = useState(2025);
  const headerRef = useScrollAnimation({ threshold: 0.2 });
  const textRef = useScrollAnimation({ threshold: 0.2 });

  const years = [2025, 2026, 2027, 2028, 2029];

  const timelineData = {
    2025: {
      title: 'Founding the vision of patient-centered health technology',
      description: 'Born from clinical insights, we assembled a team driven to solve medical record complexity. Our first prototype emerged from real healthcare challenges.',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop'
    },
    2026: {
      title: 'Expanding AI capabilities and user base',
      description: 'Scaling our platform with advanced machine learning models to serve thousands of patients nationwide.',
      image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&h=600&fit=crop'
    },
    2027: {
      title: 'Integration with major healthcare systems',
      description: 'Partnering with leading hospitals and clinics to streamline medical record access across the nation.',
      image: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&h=600&fit=crop'
    },
    2028: {
      title: 'Global expansion and innovation',
      description: 'Taking our patient-centered technology worldwide while introducing groundbreaking health insights features.',
      image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=600&fit=crop'
    },
    2029: {
      title: 'Revolutionizing healthcare accessibility',
      description: 'Empowering millions of patients globally with instant, understandable access to their complete health journey.',
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop'
    }
  };

  const currentData = timelineData[activeYear];

  return (
    <section className="about-timeline" id="about-section">
      <div className="timeline-header fade-in-up" ref={headerRef}>
        <div className="timeline-years-horizontal">
          {years.map((year) => (
            <div
              key={year}
              className={`timeline-year-item ${activeYear === year ? 'active' : ''}`}
              onClick={() => setActiveYear(year)}
            >
              <span className="year-label">{year}</span>
              <div className="year-marker"></div>
            </div>
          ))}
        </div>
        <div className="timeline-line-horizontal">
          <div
            className="timeline-progress-horizontal"
            style={{
              width: `${((activeYear - 2025) / 4) * 100 + 22}%`
            }}
          >
            <div className="progress-indicator">
              <div className="indicator-line"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="timeline-content">
        <div className="timeline-text slide-in-left" ref={textRef}>
          <h2 className="timeline-title">{activeYear}</h2>
          <h3 className="timeline-subtitle">{currentData.title}</h3>
          <p className="timeline-description">{currentData.description}</p>
          <div className="timeline-actions">
            <button className="btn-timeline">Read</button>
            <a href="#" className="link-timeline">
              More <span>→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutTimeline;
