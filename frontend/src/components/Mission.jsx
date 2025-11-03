import React from 'react';
import './Mission.css';

const Mission = () => {
  const teamMembers = [
    {
      name: 'Nicholas Davis',
      role: ' “Every day, I see how patients struggle to make sense of their records. ClearChartAI bridges that gap, giving them understanding and helping patients own their future',
  
    },
    {
      name: 'Dr Alkhatib MD',
      role: '“Medicine moves fast, but clarity shouldn’t be left behind. When my patients understand their data, care becomes a partnership, not a mystery',
      image: 'https://via.placeholder.com/200?text=Dhruv+Suraj'
    },
    {
      name: 'Jacob Pfetsch FNP',
      role: 'Information means nothing without context. ClearChartAI translates medical language into plain, human terms, so patients can focus on what truly matters: getting better',
      image: 'https://via.placeholder.com/200?text=Vishnu+Koraganji'
    }
  ];

  return (
    <section className="mission-section">
      <div className="mission-container">
        <div className="mission-header">
          <h2 className="mission-title">Built by clinicians for patients</h2>
          <p className="mission-description">
            Founded by a healthcare professional who understands the complexity of medical records. Our goal is to empower patients with clear, actionable health information.
          </p>
          <div className="mission-links">
            <a href="#" className="link-about">About us</a>
            <a href="#" className="link-story">
              Our story <span>→</span>
            </a>
          </div>
        </div>

        <div className="mission-cards">
          {teamMembers.map((member, index) => (
            <div key={index} className={`mission-card ${member.highlight ? 'highlight' : ''}`}>
              <h3 className="mission-card-name">{member.name}</h3>
              <p className="mission-card-role">{member.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Mission;
