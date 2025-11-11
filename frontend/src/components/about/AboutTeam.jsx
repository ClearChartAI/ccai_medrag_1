import React from 'react';
import './AboutTeam.css';
import useScrollAnimation from '../../hooks/useScrollAnimation';
import nicholasDavisImage from '../../assets/ChatGPT Image Oct 6, 2025, 04_42_46 PM.png';
import dhruvSurajImage from '../../assets/ChatGPT Image Oct 4, 2025, 07_01_07 PM copy.png';
import vishnuKoraganjiImage from '../../assets/vishnu-koraganji.png';
import dralkhatibImage from '../../assets/Dr-Alkhatib.jpg';
const AboutTeam = () => {
  const headerRef = useScrollAnimation({ threshold: 0.2 });

  const team = [
    {
      name: 'Nicholas Davis',
      role: 'Founder and CEO',
      description: 'A nurse practitioner with 8+ years in critical care, with deep insights into patient care challenges and technological solutions',
      image: nicholasDavisImage,
      imagePosition: 'center 20%',
      linkedin: '#'
    },
    {
      name: 'Dhruv Suraj',
      role: 'Lead AI engineer',
      description: 'Technical architect building intelligent systems that bridge medical complexity and patient comprehension',
      image: dhruvSurajImage,
      imagePosition: 'center 18%',
      imageScale: 1.5,
      linkedin: '#'
    },
    {
      name: 'Vishnu Koraganji',
      role: 'Senior AI engineer',
      description: 'Machine learning expert creating advanced algorithms to translate medical language into patient-friendly insights',
      image: vishnuKoraganjiImage,
      linkedin: '#'
    },
    {
      name: 'Dr. Basil Alkhatib',
      role: 'MD, FACC, FSCAI',
      description: 'Clinical De-Risking Leader, Safety Oversight, GTM Network Accelerator Director-Designated',
      image: dralkhatibImage,
      imagePosition: 'center 10%',
      linkedin: '#'
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
                    style={{
                      objectPosition: member.imagePosition || 'center center',
                      transform: member.imageScale ? `scale(${member.imageScale})` : undefined
                    }}
                  />
                  <div className="team-image-overlay"></div>
                </div>
              </div>
              <div className="team-info">
                <h3 className="team-name">{member.name}</h3>
                <p className="team-role">{member.role}</p>
                <p className="team-description">{member.description}</p>
                {member.name !== 'Dr. Basil Alkhatib' && (
                  <div className="team-social">
                    <a href={member.linkedin} className="team-social-link" aria-label="LinkedIn">
                      <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M18.667 0H1.333C.597 0 0 .597 0 1.333v17.334C0 19.403.597 20 1.333 20h17.334c.736 0 1.333-.597 1.333-1.333V1.333C20 .597 19.403 0 18.667 0zM6 17H3V7.5h3V17zM4.5 6.25c-.966 0-1.75-.784-1.75-1.75S3.534 2.75 4.5 2.75s1.75.784 1.75 1.75-.784 1.75-1.75 1.75zM17 17h-3v-4.75c0-1.133-.022-2.589-1.578-2.589-1.579 0-1.822 1.234-1.822 2.508V17H8V7.5h2.88v1.323h.041c.401-.761 1.382-1.562 2.844-1.562 3.041 0 3.604 2.003 3.604 4.608V17z"/>
                      </svg>
                    </a>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default AboutTeam;
