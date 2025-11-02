import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './ScrollGatherHero.css';
import personIcon from '../../assets/File Icons /person.png';
import textIcon from '../../assets/File Icons /text.png';
import brainIcon from '../../assets/File Icons /brian.png';
import imageIcon from '../../assets/File Icons /image.png';
import ekgIcon from '../../assets/File Icons /ekg.png';
import pillIcon from '../../assets/File Icons /pill.png';

gsap.registerPlugin(ScrollTrigger);

const ScrollGatherHero = () => {
  const containerRef = useRef(null);
  const heroContentRef = useRef(null);
  const nextSectionRef = useRef(null);
  const logoRef = useRef(null);

  // Healthcare-related floating items
  const floatingItems = [
    { text: 'Patient Care', position: { x: -30, y: -25 }, icon: personIcon },
    { text: 'Medical Records', position: { x: 30, y: -25 }, icon: textIcon },
    { text: 'Health Insights', position: { x: -35, y: 0 }, icon: brainIcon },
    { text: 'Diagnostics', position: { x: 35, y: 0 }, icon: imageIcon },
    { text: 'Analytics', position: { x: -30, y: 25 }, icon: ekgIcon },
    { text: 'Reports', position: { x: 30, y: 25 }, icon: pillIcon },
  ];

  useEffect(() => {
    const container = containerRef.current;
    const heroContent = heroContentRef.current;
    const nextSection = nextSectionRef.current;
    const logo = logoRef.current;

    if (!container || !heroContent || !nextSection || !logo) {
      console.error('Required refs not found');
      return;
    }

    const items = Array.from(container.querySelectorAll('.floating-item'));

    if (items.length === 0) {
      console.error('No floating items found');
      return;
    }


    // Small delay to ensure layout is complete
    const timer = setTimeout(() => {
      // Get container center
      const containerRect = container.getBoundingClientRect();
      const centerX = containerRect.width / 2;
      const centerY = containerRect.height / 2;

      // Create main timeline with extended duration for smoother scroll
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: '+=250%',
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        },
      });

      // Move all items to center simultaneously
      tl.to(items, {
        left: '50%',
        top: '50%',
        scale: 0.3,
        opacity: 0.7,
        ease: 'power2.inOut',
        duration: 1,
      }, 0);

      // Stage 2: Icons gather at center, shrink further (starts after stage 1 completes)
      tl.to(items, {
        scale: 0.1,
        opacity: 0.4,
        rotation: 0,
        ease: 'power2.in',
      }, '+=0'); // Start right after previous animations

      // Stage 3: Final convergence - disappear into title
      tl.to(items, {
        scale: 0,
        opacity: 0,
        ease: 'power4.in',
        stagger: {
          amount: 0.05,
          from: 'edges'
        },
      }, '+=0');

      // Pulse the logo as items arrive and merge
      tl.to(logo, {
        scale: 1.2,
        filter: 'brightness(1.1)',
        duration: 0.15,
        ease: 'power2.out',
      }, 0.5);

      tl.to(logo, {
        scale: 1.05,
        duration: 0.1,
        ease: 'power1.inOut',
      }, 0.65);

      tl.to(logo, {
        scale: 1,
        filter: 'brightness(1)',
        duration: 0.1,
        ease: 'elastic.out(1, 0.3)',
      }, 0.75);

      // Brief pause to let convergence settle
      tl.to({}, { duration: 0.05 }, 0.8);

      // Part 2: Start radial wipe transition
      tl.to(nextSection, {
        clipPath: 'circle(150% at 50% 50%)',
        duration: 0.15,
        ease: 'power2.inOut',
      }, 0.85);

      // Fade out hero content during wipe
      tl.to(heroContent, {
        opacity: 0,
        scale: 0.95,
        duration: 0.1,
        ease: 'power2.inOut',
      }, 0.85);
    }, 100);

    return () => {
      clearTimeout(timer);
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <div ref={containerRef} className="scroll-gather-container">
      {/* Hero section with floating items */}
      <div ref={heroContentRef} className="scroll-gather-hero">
        {/* Central Logo/Text */}
        <div ref={logoRef} className="central-logo">
          {/* <div className="mission-badge">
            <span className="badge-dot"></span>
            <span>Our Mission</span>
          </div> */}
          <h1 className="main-title">
            <span className="gradient-text">Decode your</span> health
          </h1>
          <p className="main-subtitle">
            Transforming complex medical records into clear, actionable insights
          </p>
        </div>

        {/* Floating items that will gather to center */}
        {floatingItems.map((item, index) => (
          <div
            key={index}
            className="floating-item"
            style={{
              left: `calc(50% + ${item.position.x}vw)`,
              top: `calc(50% + ${item.position.y}vh)`,
            }}
          >
            <div className="floating-item-inner">
              <div className="item-icon">
                <img src={item.icon} alt={item.text} />
              </div>
              <span className="item-text">{item.text}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Next section revealed by radial wipe */}
      <div ref={nextSectionRef} className="radial-wipe-section">
        <div className="wipe-content">
          <h2 className="wipe-title">Transforming healthcare for everyone</h2>
          <p className="wipe-subtitle">
            Empowering health decisions through clear, actionable insights
          </p>
        </div>
      </div>
    </div>
  );
};

export default ScrollGatherHero;
