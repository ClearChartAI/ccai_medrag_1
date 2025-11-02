import React from 'react';
import './FeaturesDetailed.css';
import privacyProtectionImage from '../../assets/privacy-protection.png';

const FeaturesDetailed = () => {
  const features = [
    {
      number: '03',
      category: 'Privacy protection',
      title: 'Your medical data remains completely confidential',
      description: 'Built with HIPAA-ready infrastructure and advanced de-identification tools to protect your personal health information.',
      image: (
        <img src={privacyProtectionImage} alt="Privacy protection" className="detail-image" />
      ),
      buttons: ['Learn more', 'Explore']
    }
  ];

  return (
    <section className="features-detailed">
      {features.map((feature, index) => (
        <div key={index} className={`detail-section ${index % 2 === 0 ? 'detail-normal' : 'detail-reverse'}`}>
          <div className="detail-container">
            <div className="detail-text">
              <div className="detail-meta">
                <span className="detail-category">{feature.category}</span>
              </div>
              <h2 className="detail-title">{feature.title}</h2>
              <p className="detail-description">{feature.description}</p>
            </div>

            <div className="detail-visual">
              <div className="detail-image-container">
                {feature.image}
              </div>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
};

export default FeaturesDetailed;
