import React from 'react';
import './Mission.css';

const Mission = () => {
  const teamMembers = [
    {
      name: 'Nicholas Davis',
      role: 'Founder & CEO, AGACNP, BSN',
      image: 'https://via.placeholder.com/200?text=Nicholas+Davis'
    },
    {
      name: 'Dhruv Suraj',
      role: 'Responsible for the entire tech stack, ensuring the platform is powerful, intuitive, and reliable for all users.',
      image: 'https://via.placeholder.com/200?text=Dhruv+Suraj'
    },
    {
      name: 'Vishnu Koraganji',
      role: 'Sr Full-Stack AI Engineer',
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
              <div className="mission-card-image">
                <img src={member.image} alt={member.name} />
              </div>
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
