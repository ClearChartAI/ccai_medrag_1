import React from 'react';
import './FeaturesClari.css';

const FeaturesClari = () => {
  return (
    <section className="features-clari">
      <div className="clari-container">
        <div className="clari-text">
          <h2 className="clari-title">Your health insights at the speed of thought</h2>
          <p className="clari-description">
            Medical complexity melts away with instant, precise answers. Knowledge becomes your most powerful health tool.
          </p>
          <ul className="clari-features">
            <li>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 2 C8 2, 6 3, 6 5 C6 8, 10 11, 10 11 C10 11, 14 8, 14 5 C14 3, 12 2, 10 2 Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <path d="M6 11 L6 16 M10 11 L10 18 M14 11 L14 16" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
              <span>Heart health decoded</span>
            </li>
            <li>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="3" y="6" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <path d="M6 9 L8 9 M6 12 L11 12 M6 15 L9 15" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
              <span>Lab results explained</span>
            </li>
            <li>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <path d="M10 6 L10 10 L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span>Medication insights revealed</span>
            </li>
          </ul>
        </div>

        <div className="clari-visual">
          <img src="/src/assets/ChatGPT Image Oct 4, 2025, 08_38_44 PM.png" alt="Health Insights" width="600" height="640" />
        </div>
      </div>
    </section>
  );
};

export default FeaturesClari;
