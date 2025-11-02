import React from 'react';
import './AboutTeam.css';
import useScrollAnimation from '../../hooks/useScrollAnimation';
import nicholasDavisImage from '../../assets/ChatGPT Image Oct 6, 2025, 04_42_46 PM.png';
import dhruvSurajImage from '../../assets/ChatGPT Image Oct 4, 2025, 07_01_07 PM copy.png';
import vishnuKoraganjiImage from '../../assets/vishnu-koraganji.png';

const AboutTeam = () => {
  const headerRef = useScrollAnimation({ threshold: 0.2 });

  const team = [
    {
      name: 'Nicholas Davis',
      role: 'Founder and CEO',
      description: 'A nurse practitioner with 8+ years in critical care, with deep insights into patient care challenges and technological solutions',
      image: nicholasDavisImage,
      imagePosition: 'center 20%',
      linkedin: '#',
      twitter: '#',
      website: '#'
    },
    {
      name: 'Dhruv Suraj',
      role: 'Lead AI engineer',
      description: 'Technical architect building intelligent systems that bridge medical complexity and patient comprehension',
      image: dhruvSurajImage,
      imagePosition: 'center center',
      linkedin: '#',
      twitter: '#',
      website: '#'
    },
    {
      name: 'Vishnu Koraganji',
      role: 'Senior AI engineer',
      description: 'Machine learning expert creating advanced algorithms to translate medical language into patient-friendly insights',
      image: vishnuKoraganjiImage,
      linkedin: '#',
      twitter: '#',
      website: '#'
    }
  ];

  return (
    <section className="about-team">
      <div className="team-header fade-in-up" ref={headerRef}>
        <h2 className="team-title">Our team</h2>
        <p className="team-subtitle">Healthcare innovators transforming patient understanding</p>
      </div>

      <div className="team-grid">
        {team.map((member, index) => {
          const cardRef = useScrollAnimation({ threshold: 0.2 });
          const [tilt, setTilt] = React.useState({ x: 0, y: 0 });
          const cardRefElement = React.useRef(null);

          const handleMouseMove = (e) => {
            if (!cardRefElement.current) return;
            const rect = cardRefElement.current.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            setTilt({
              x: (y - 0.5) * -15,
              y: (x - 0.5) * 15
            });
          };

          const handleMouseLeave = () => {
            setTilt({ x: 0, y: 0 });
          };

          return (
            <div
              key={index}
              className="team-card scale-in"
              ref={(el) => {
                if (cardRef.current !== el) {
                  cardRef.current = el;
                }
                cardRefElement.current = el;
              }}
              style={{
                transitionDelay: `${index * 0.1}s`,
                transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${tilt.x || tilt.y ? 1.02 : 1})`
              }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <div className="team-image-wrapper">
                <div className="team-image">
                  <img
                    src={member.image}
                    alt={member.name}
                    style={member.imagePosition ? { objectPosition: member.imagePosition } : undefined}
                  />
                  <div className="team-image-overlay"></div>
                </div>
              </div>
              <div className="team-info">
                <h3 className="team-name">{member.name}</h3>
                <p className="team-role">{member.role}</p>
                <p className="team-description">{member.description}</p>
                <div className="team-social">
                  <a href={member.linkedin} className="team-social-link" aria-label="LinkedIn">
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M18.667 0H1.333C.597 0 0 .597 0 1.333v17.334C0 19.403.597 20 1.333 20h17.334c.736 0 1.333-.597 1.333-1.333V1.333C20 .597 19.403 0 18.667 0zM6 17H3V7.5h3V17zM4.5 6.25c-.966 0-1.75-.784-1.75-1.75S3.534 2.75 4.5 2.75s1.75.784 1.75 1.75-.784 1.75-1.75 1.75zM17 17h-3v-4.75c0-1.133-.022-2.589-1.578-2.589-1.579 0-1.822 1.234-1.822 2.508V17H8V7.5h2.88v1.323h.041c.401-.761 1.382-1.562 2.844-1.562 3.041 0 3.604 2.003 3.604 4.608V17z"/>
                    </svg>
                  </a>
                  <a href={member.twitter} className="team-social-link" aria-label="Twitter/X">
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M15.751 2h2.874l-6.28 7.18L19.5 18h-5.783l-4.527-5.92L4.015 18H1.14l6.716-7.677L1.25 2h5.932l4.093 5.414L15.751 2zm-1.008 14.387h1.592L6.389 3.621H4.686l10.057 12.766z"/>
                    </svg>
                  </a>
                  <a href={member.website} className="team-social-link" aria-label="Website">
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0zm7.75 6h-3.108c-.293-1.211-.728-2.347-1.287-3.38A8.003 8.003 0 0117.75 6zM10 2c.896 1.225 1.607 2.654 2.03 4.25h-4.06C8.393 4.654 9.104 3.225 10 2zM2.332 12c-.11-.65-.332-1.312-.332-2s.222-1.35.332-2h3.556c-.05.657-.138 1.319-.138 2s.088 1.343.138 2H2.332zm.918 2h3.108c.293 1.211.728 2.347 1.287 3.38A8.003 8.003 0 013.25 14zm3.108-8H3.25a8.003 8.003 0 014.395-3.38C7.086 3.653 6.651 4.789 6.358 6zM10 18c-.896-1.225-1.607-2.654-2.03-4.25h4.06C11.607 15.346 10.896 16.775 10 18zm2.452-6.25H7.548c-.062-.656-.198-1.319-.198-2s.136-1.344.198-2h4.904c.062.656.198 1.319.198 2s-.136 1.344-.198 2zm.193 5.63c.559-1.033.994-2.169 1.287-3.38h3.108a8.003 8.003 0 01-4.395 3.38zM14.112 12c.05-.657.138-1.319.138-2s-.088-1.343-.138-2h3.556c.11.65.332 1.312.332 2s-.222 1.35-.332 2h-3.556z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default AboutTeam;
