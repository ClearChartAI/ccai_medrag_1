import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';
import logo from '../assets/Purple Cush.png';

const Footer = () => {
  useEffect(() => {
    // Check if script already exists to prevent duplicates
    if (!document.querySelector('script[src="https://www.hipaatraining.com/badge-script"]')) {
      const script = document.createElement('script');
      script.src = 'https://www.hipaatraining.com/badge-script';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-main">
          <div className="footer-brand">
            <div className="footer-logo">
              <img src={logo} alt="ClearChartAI" width="32" height="32" />
            </div>
            <div className="footer-contact">
              <p className="contact-label">Contact</p>
              <a href="mailto:team@clearchartai.io" className="contact-email">team@clearchartai.io</a>
            </div>
            <div className="footer-social">
              <a href="#" className="social-link" aria-label="Facebook">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M20 10c0-5.523-4.477-10-10-10S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z"/>
                </svg>
              </a>
              <a href="#" className="social-link" aria-label="Instagram">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 0C7.284 0 6.944.012 5.877.06 4.813.11 4.086.278 3.45.525a4.902 4.902 0 00-1.772 1.153A4.902 4.902 0 00.525 3.45C.278 4.086.109 4.813.06 5.877.012 6.944 0 7.284 0 10s.012 3.056.06 4.123c.05 1.064.218 1.791.465 2.427a4.902 4.902 0 001.153 1.772 4.902 4.902 0 001.772 1.153c.636.247 1.363.416 2.427.465 1.067.048 1.407.06 4.123.06s3.056-.012 4.123-.06c1.064-.05 1.791-.218 2.427-.465a4.902 4.902 0 001.772-1.153 4.902 4.902 0 001.153-1.772c.247-.636.416-1.363.465-2.427.048-1.067.06-1.407.06-4.123s-.012-3.056-.06-4.123c-.05-1.064-.218-1.791-.465-2.427a4.902 4.902 0 00-1.153-1.772A4.902 4.902 0 0016.55.525C15.914.278 15.187.109 14.123.06 13.056.012 12.716 0 10 0zm0 1.802c2.67 0 2.986.01 4.04.058.975.045 1.504.207 1.857.344.467.181.8.398 1.15.748.35.35.567.683.748 1.15.137.353.3.882.344 1.857.048 1.054.058 1.37.058 4.04 0 2.67-.01 2.986-.058 4.04-.045.975-.207 1.504-.344 1.857-.181.467-.398.8-.748 1.15-.35.35-.683.567-1.15.748-.353.137-.882.3-1.857.344-1.054.048-1.37.058-4.04.058-2.67 0-2.986-.01-4.04-.058-.975-.045-1.504-.207-1.857-.344a3.097 3.097 0 01-1.15-.748 3.097 3.097 0 01-.748-1.15c-.137-.353-.3-.882-.344-1.857-.048-1.054-.058-1.37-.058-4.04 0-2.67.01-2.986.058-4.04.045-.975.207-1.504.344-1.857.181-.467.398-.8.748-1.15.35-.35.683-.567 1.15-.748.353-.137.882-.3 1.857-.344 1.054-.048 1.37-.058 4.04-.058z"/>
                  <path d="M10 13.333A3.333 3.333 0 1010 6.667a3.333 3.333 0 000 6.666zm0-8.468a5.135 5.135 0 100 10.27 5.135 5.135 0 000-10.27zm6.538-.203a1.2 1.2 0 11-2.4 0 1.2 1.2 0 012.4 0z"/>
                </svg>
              </a>
              <a href="#" className="social-link" aria-label="X/Twitter">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M15.751 2h2.874l-6.28 7.18L19.5 18h-5.783l-4.527-5.92L4.015 18H1.14l6.716-7.677L1.25 2h5.932l4.093 5.414L15.751 2zm-1.008 14.387h1.592L6.389 3.621H4.686l10.057 12.766z"/>
                </svg>
              </a>
              <a href="#" className="social-link" aria-label="LinkedIn">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M18.667 0H1.333C.597 0 0 .597 0 1.333v17.334C0 19.403.597 20 1.333 20h17.334c.736 0 1.333-.597 1.333-1.333V1.333C20 .597 19.403 0 18.667 0zM6 17H3V7.5h3V17zM4.5 6.25c-.966 0-1.75-.784-1.75-1.75S3.534 2.75 4.5 2.75s1.75.784 1.75 1.75-.784 1.75-1.75 1.75zM17 17h-3v-4.75c0-1.133-.022-2.589-1.578-2.589-1.579 0-1.822 1.234-1.822 2.508V17H8V7.5h2.88v1.323h.041c.401-.761 1.382-1.562 2.844-1.562 3.041 0 3.604 2.003 3.604 4.608V17z"/>
                </svg>
              </a>
              <a href="#" className="social-link" aria-label="YouTube">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M19.582 4.616c-.23-.863-.907-1.54-1.77-1.77C16.254 2.5 10 2.5 10 2.5s-6.254 0-7.812.346c-.863.23-1.54.907-1.77 1.77C0 6.174 0 10 0 10s0 3.826.418 5.384c.23.863.907 1.54 1.77 1.77C3.746 17.5 10 17.5 10 17.5s6.254 0 7.812-.346c.863-.23 1.54-.907 1.77-1.77C20 13.826 20 10 20 10s0-3.826-.418-5.384zM8 13V7l5.197 3L8 13z"/>
                </svg>
              </a>
              <a href="https://www.hipaatraining.com/badge" className="social-link hipaa-link" aria-label="HIPAA Compliant" target="_blank" rel="noopener noreferrer">
                <div
                  className="hipaa-badge"
                  data-href="https://www.hipaatraining.com/badge"
                  data-color="orig"
                  data-type="24"
                  data-width="36px"
                  data-height="36px"
                ></div>
              </a>
            </div>
          </div>

          <div className="footer-links">
            <div className="footer-column">
              <Link to="/about" className="footer-link">About us</Link>
              <a href="#" className="footer-link">Team</a>
            </div>

            <div className="footer-column">
              <a href="#" className="footer-link">Blog</a>
              <a href="#" className="footer-link">Careers</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">© 2025 ClearChartAI,inc.</p>
          <div className="footer-legal">
            <a href="#" className="legal-link">Privacy policy</a>
            <a href="#" className="legal-link">Terms of service</a>
            <a href="#" className="legal-link">Cookie preferences</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
