import React, { useState, useEffect } from 'react';
import './ContactHero.css';

const ContactHero = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  return (
    <section className="contact-hero">
      <div className="contact-hero-background">
        <div className="contact-orb contact-orb-1"></div>
        <div className="contact-orb contact-orb-2"></div>
        <div className="ripple-container">
          <div className="ripple ripple-1"></div>
          <div className="ripple ripple-2"></div>
          <div className="ripple ripple-3"></div>
        </div>
      </div>

      <div className="contact-hero-container">
        {/* <div className={`contact-badge ${visible ? 'visible' : ''}`}>
          <span>Let's Talk</span>
        </div> */}
        <h1 className={`contact-hero-title gradient-accent ${visible ? 'visible' : ''}`}>
          Connect with us
        </h1>
        <p className={`contact-hero-subtitle ${visible ? 'visible' : ''}`}>
          We're here to help you understand your health records and answer your questions.
        </p>
      </div>
    </section>
  );
};

export default ContactHero;
