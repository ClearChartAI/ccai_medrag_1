import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './AboutImpact.css';

gsap.registerPlugin(ScrollTrigger);

const AboutImpact = () => {
  const timelineRef = useRef(null);
  const progressLineRef = useRef(null);

  const impactCards = [
    {
      category: 'Patients',
      title: 'Unlock your health story with confidence',
      description: 'ClearChartAI empowers individuals to navigate their health journey with clarity and confidence. By simplifying medical jargon and connecting fragmented records, patients finally gain a complete, understandable view of their care.',
      link: 'Explore',
      gradient: 'linear-gradient(135deg, #5FA8A8 0%, #7DD3D3 100%)',
      icon: (
        <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="80" r="30" fill="rgba(255,255,255,0.3)" />
          <path d="M100 110 C70 110, 50 130, 50 160 L150 160 C150 130, 130 110, 100 110 Z" fill="rgba(255,255,255,0.3)" />
          <rect x="30" y="40" width="30" height="25" rx="5" fill="rgba(255,255,255,0.2)" />
          <rect x="140" y="40" width="30" height="25" rx="5" fill="rgba(255,255,255,0.2)" />
          <path d="M35 50 L55 50 M35 55 L50 55" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
          <path d="M145 50 L165 50 M145 55 L160 55" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
          <path d="M20 120 L40 140 M40 120 L20 140" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
          <circle cx="170" cy="130" r="15" fill="rgba(255,255,255,0.2)" />
          <path d="M30 90 L50 90 L55 80 L60 100 L65 90 L85 90" stroke="rgba(255,255,255,0.3)" strokeWidth="2" fill="none" />
        </svg>
      )
    },
    {
      category: 'Providers',
      title: 'Elevate patient communication and engagement',
      description: 'ClearChartAI streamlines communication and reduces the time clinicians spend re-explaining results or searching through records. With AI-powered summaries, providers can focus on meaningful interactions and better-informed decision-making.',
      link: 'Discover',
      gradient: 'linear-gradient(135deg, #5FA8A8 0%, #6BC2C2 100%)',
      icon: (
        <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="70" cy="80" r="25" fill="rgba(255,255,255,0.3)" />
          <circle cx="130" cy="80" r="25" fill="rgba(255,255,255,0.3)" />
          <path d="M70 105 C50 105, 35 120, 35 145 L105 145 C105 120, 90 105, 70 105 Z" fill="rgba(255,255,255,0.3)" />
          <path d="M130 105 C110 105, 95 120, 95 145 L165 145 C165 120, 150 105, 130 105 Z" fill="rgba(255,255,255,0.3)" />
          <path d="M80 50 Q100 30, 120 50" stroke="rgba(255,255,255,0.4)" strokeWidth="3" fill="none" />
          <circle cx="100" cy="60" r="8" fill="rgba(255,255,255,0.3)" />
          <path d="M95 55 L98 58 L105 50" stroke="rgba(255,255,255,0.6)" strokeWidth="2" fill="none" />
        </svg>
      )
    },
    {
      category: 'Insurers',
      title: 'Minimize healthcare costs through proactive literacy',
      description: 'ClearChartAI helps payers identify unnecessary procedures and reduce administrative burden through transparent, data-driven literacy. By empowering members with clear information, insurers promote healthier outcomes and stronger trust.',
      link: 'Learn',
      gradient: 'linear-gradient(135deg, #7DD3D3 0%, #A0E8E8 100%)',
      icon: (
        <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M100 40 L140 80 L140 140 L60 140 L60 80 Z" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.4)" strokeWidth="3" />
          <path d="M70 100 L90 100 L90 130 L70 130 Z M110 80 L130 80 L130 130 L110 130 Z" fill="rgba(255,255,255,0.3)" />
          <circle cx="100" cy="100" r="35" stroke="rgba(255,255,255,0.3)" strokeWidth="2" fill="none" />
          <circle cx="100" cy="100" r="45" stroke="rgba(255,255,255,0.2)" strokeWidth="2" fill="none" strokeDasharray="5,5" />
          <path d="M85 95 L95 105 L115 85" stroke="rgba(255,255,255,0.5)" strokeWidth="3" fill="none" />
        </svg>
      )
    }
  ];

  useEffect(() => {
    const timeline = timelineRef.current;
    const items = timeline.querySelectorAll('.timeline-item');

    // Set all items to fully visible without animations
    items.forEach((item) => {
      const year = item.querySelector('.timeline-year');
      const card = item.querySelector('.timeline-card');
      if (year) gsap.set(year, { opacity: 1, x: 0 });
      if (card) gsap.set(card, { opacity: 1, x: 0 });
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <section className="about-impact">
      <div className="impact-timeline" ref={timelineRef}>
        {/* Timeline line */}
        <div className="timeline-line">
          <div className="timeline-progress" ref={progressLineRef}></div>
        </div>

        {/* Timeline items */}
        {impactCards.map((card, index) => (
          <div key={index} className="timeline-item">
            {/* Title on the left */}
            <div className="timeline-year">{card.category}</div>

            {/* Card on the right */}
            <div className="timeline-card" style={{ background: card.gradient }}>
              <div className="impact-card-background">
                <div className="impact-orb impact-orb-1"></div>
                <div className="impact-orb impact-orb-2"></div>
              </div>
              <div className="impact-card-content">
                <p className="impact-card-description">{card.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AboutImpact;
