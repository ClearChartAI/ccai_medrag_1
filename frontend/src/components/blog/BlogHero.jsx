import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './BlogHero.css';

const BlogHero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const autoPlayRef = useRef(null);

  const slides = [
    {
      id: 1,
      category: 'Featured',
      title: 'Understanding Your Medical Records',
      description: 'A complete guide to decode medical jargon and take control of your health journey',
      image: '/src/assets/ChatGPT Image Oct 4, 2025, 09_28_34 PM.png',
      slug: 'understanding-medical-records-guide',
      date: 'Dec 15, 2025',
      readTime: '8 min read'
    },
    {
      id: 2,
      category: 'Technology',
      title: 'AI in Healthcare Innovations',
      description: 'How artificial intelligence is revolutionizing patient communication and care',
      image: '/src/assets/ChatGPT Image Oct 4, 2025, 09_33_06 PM.png',
      slug: 'ai-in-healthcare-innovations',
      date: 'Dec 12, 2025',
      readTime: '5 min read'
    },
    {
      id: 3,
      category: 'Privacy',
      title: 'Patient Data Security Explained',
      description: 'Essential tips for protecting your personal health information online',
      image: '/src/assets/ChatGPT Image Oct 4, 2025, 09_31_12 PM.png',
      slug: 'patient-data-security-explained',
      date: 'Dec 13, 2025',
      readTime: '6 min read'
    }
  ];

  const nextSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setTimeout(() => setIsTransitioning(false), 700);
  };

  const prevSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setTimeout(() => setIsTransitioning(false), 700);
  };

  const goToSlide = (index) => {
    if (isTransitioning || index === currentSlide) return;
    setIsTransitioning(true);
    setCurrentSlide(index);
    setTimeout(() => setIsTransitioning(false), 700);
  };

  // Auto-play functionality
  useEffect(() => {
    autoPlayRef.current = setInterval(() => {
      setIsTransitioning(true);
      setCurrentSlide((prev) => (prev + 1) % slides.length);
      setTimeout(() => setIsTransitioning(false), 700);
    }, 5000);

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [slides.length]);

  // Pause on hover
  const handleMouseEnter = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
  };

  const handleMouseLeave = () => {
    autoPlayRef.current = setInterval(() => {
      setIsTransitioning(true);
      setCurrentSlide((prev) => (prev + 1) % slides.length);
      setTimeout(() => setIsTransitioning(false), 700);
    }, 5000);
  };

  return (
    <section className="hero-slider" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <div className="slider-container">
        {/* Slides */}
        <div className="slides-wrapper">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`slide ${index === currentSlide ? 'active' : ''} ${
                index < currentSlide ? 'prev' : ''
              } ${index > currentSlide ? 'next' : ''}`}
            >
              {/* Background Image */}
              <div className="slide-image">
                <img src={slide.image} alt={slide.title} />
                <div className="slide-overlay"></div>
              </div>

              {/* Content */}
              <div className="slide-content">
                <div className="slide-content-inner">
                  <span className="slide-category">{slide.category}</span>
                  <h1 className="slide-title">{slide.title}</h1>
                  <p className="slide-description">{slide.description}</p>
                  <div className="slide-meta">
                    <span>{slide.date}</span>
                    <span className="meta-separator">•</span>
                    <span>{slide.readTime}</span>
                  </div>
                  <Link to={`/blog/${slide.slug}`} className="slide-cta">
                    Read Article
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button className="slider-arrow prev-arrow" onClick={prevSlide} aria-label="Previous slide">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button className="slider-arrow next-arrow" onClick={nextSlide} aria-label="Next slide">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Dots Navigation */}
        <div className="slider-dots">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Progress Bar */}
        <div className="slider-progress">
          <div
            className="progress-bar"
            style={{
              width: `${((currentSlide + 1) / slides.length) * 100}%`,
              transition: isTransitioning ? 'width 0.7s ease' : 'none'
            }}
          />
        </div>
      </div>
    </section>
  );
};

export default BlogHero;
