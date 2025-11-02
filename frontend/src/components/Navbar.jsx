import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';
import logo from '../assets/Purple Cush.png';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const scrollToTop = () => {
    closeMenu();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (sectionId) => {
    closeMenu();

    // If not on homepage, navigate to homepage first
    if (location.pathname !== '/') {
      window.location.href = `/#${sectionId}`;
    } else {
      // If on homepage, scroll to section
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="nav-left">
        <Link to="/" className="logo">
          <img className="logo-img" src={logo} alt="ClearChartAI Logo" />
        </Link>
      </div>
      <div className="nav-center">
        <div className="nav-links-container">
          <button onClick={scrollToTop} className="nav-button">Home</button>
          <button onClick={() => scrollToSection('about-section')} className="nav-button">About</button>
          <button onClick={() => scrollToSection('features-section')} className="nav-button">Features</button>
          <Link to="/blog">Blog</Link>
          <Link to="/contact">Contact</Link>
        </div>
      </div>
      <div className="nav-right">
        <Link to="/login" className="btn-primary">
          Try For Free
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
        <button className={`menu-btn ${isMenuOpen ? 'open' : ''}`} onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <div className={`mobile-menu ${isMenuOpen ? 'active' : ''}`}>
        <button onClick={scrollToTop} className="mobile-menu-item" style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%' }}>Home</button>
        <button onClick={() => scrollToSection('about-section')} className="mobile-menu-item" style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%' }}>About</button>
        <button onClick={() => scrollToSection('features-section')} className="mobile-menu-item" style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%' }}>Features</button>
        <Link to="/blog" className="mobile-menu-item" onClick={closeMenu}>Blog</Link>
        <Link to="/contact" className="mobile-menu-item" onClick={closeMenu}>Contact</Link>
      </div>

      {isMenuOpen && <div className="menu-overlay" onClick={closeMenu}></div>}
    </nav>
  );
};

export default Navbar;
