import React, { useState, useEffect, useRef } from 'react';
import './FeaturesInteractive.css';
import useScrollAnimation from '../../hooks/useScrollAnimation';

const FeaturesInteractive = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [sliderPosition, setSliderPosition] = useState(0);
  const sectionRef = useScrollAnimation({ threshold: 0.2 });
  const statsRef = useRef(null);
  const comparisonRef = useRef(null);
  const [statsAnimated, setStatsAnimated] = useState(false);
  const [comparisonAnimated, setComparisonAnimated] = useState(false);

  const tabs = [
    { id: 0, name: 'Connect', },
    { id: 1, name: 'Decode' },
    { id: 2, name: 'Empower' },
  ];

  const features = [
    {
      tab: 0,
      description: 'Bring your story together effortlessly',
      details: ['ClearChartAI securely retrieves your medical records, no forms, no chasing, no stress. Your information flows directly from hospitals, clinics, and labs into one clear, verified timeline.']
    },
    {
      tab: 0,
      description: 'Secure Access · Fast Retrieval · Zero Hassle',
      details: ['Every record is automatically organized and verified at the source, updating in real time so you can view your complete health story anytime, with clarity, confidence, and peace of mind.']
    },
    {
      tab: 1,
      description: 'Decode your health with clarity',
      details: ['Clari transforms complex medical language into simple, easy-to-read summaries that highlight what truly matters. See your key findings, diagnoses, and trends, all in one clear, visual view']
    },
    {
      tab: 1,
      description: 'Plain Language · Accurate Translation · Easy Clarity',
      details: ['Track your health over time through intuitive visuals and trend mapping that turn data into understanding, so you can see the bigger picture behind every visit, lab, and result.']
    },
    {
      tab: 2,
      description: 'Empower your next step',
      details: ['Understand, ask, and act with confidence. Clari helps you use your health insights to prepare smarter questions, track progress, and stay proactive about your care.']
    },
    {
      tab: 2,
      description: 'Confidence · Preparation · Connection',
      details: ['Receive new insights automatically as fresh records arrive, keeping you engaged, informed, and in control of your health journey through continuous updates and personalized guidance.']
    },
  ];

  const stats = [
    { number: 50000, suffix: '+', label: 'Active Users', duration: 2000 },
    { number: 98, suffix: '%', label: 'Accuracy Rate', duration: 1500 },
    { number: 2, suffix: 'M+', label: 'Reports Analyzed', duration: 2500 },
    { number: 24, suffix: '/7', label: 'Support Available', duration: 1000 }
  ];

  const [animatedStats, setAnimatedStats] = useState(stats.map(() => 0));

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !statsAnimated) {
          setStatsAnimated(true);
          stats.forEach((stat, index) => {
            let start = 0;
            const end = stat.number;
            const duration = stat.duration;
            const increment = end / (duration / 16);

            const timer = setInterval(() => {
              start += increment;
              if (start >= end) {
                setAnimatedStats(prev => {
                  const newStats = [...prev];
                  newStats[index] = end;
                  return newStats;
                });
                clearInterval(timer);
              } else {
                setAnimatedStats(prev => {
                  const newStats = [...prev];
                  newStats[index] = Math.floor(start);
                  return newStats;
                });
              }
            }, 16);
          });
        }
      },
      { threshold: 0.5 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, [statsAnimated]);

  const [animationComplete, setAnimationComplete] = useState(false);

  const handleSliderDrag = (e) => {
    if (!animationComplete) return;
    const slider = comparisonRef.current;
    if (!slider) return;

    const rect = slider.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleMouseDown = () => {
    if (animationComplete) {
      setComparisonAnimated(true);
    }
  };

  const handleMouseUp = () => {
    setComparisonAnimated(false);
  };

  useEffect(() => {
    if (comparisonAnimated) {
      window.addEventListener('mousemove', handleSliderDrag);
      window.addEventListener('mouseup', handleMouseUp);

      return () => {
        window.removeEventListener('mousemove', handleSliderDrag);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [comparisonAnimated, animationComplete]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Scrolling down - animate to 100
          setSliderPosition(100);
          setAnimationComplete(true);
        } else {
          // Scrolling up/away - reset to 0
          setSliderPosition(0);
          setAnimationComplete(false);
        }
      },
      { threshold: 0.7 } // Trigger when 70% of the section is visible
    );

    if (comparisonRef.current) {
      observer.observe(comparisonRef.current);
    }

    return () => {
      observer.disconnect();
      document.body.style.overflow = ''; // Cleanup
    };
  }, [animationComplete]);

  const currentFeatures = features.filter(f => f.tab === activeTab);

  return (
    <section className="features-interactive" ref={sectionRef} id="features-section">
      {/* Animated Background Elements */}
      <div className="interactive-background">
        <div className="floating-orb orb-1"></div>
        <div className="floating-orb orb-2"></div>
        <div className="floating-orb orb-3"></div>
      </div>

      {/* Header Section */}
      <div className="interactive-header">
        <h2 className="interactive-title">
          Everything you need to
          <span className="gradient-text-animated"> Connect, Decode, and Empower</span>
        </h2>
        <p className="interactive-subtitle">
          Discover the tools and technologies that make ClearChartAI the most comprehensive health data platform
        </p>
      </div>

      {/* Tabbed Navigation */}
      <div className="feature-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`feature-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-name">{tab.name}</span>
          </button>
        ))}
        <div
          className="tab-indicator"
          style={{ transform: `translateX(calc(${activeTab * 100}% + ${activeTab * 0.5}rem))` }}
        />
      </div>

      {/* Interactive Feature Cards */}
      <div className="feature-cards-grid">
        {currentFeatures.map((feature, index) => (
          <div
            key={index}
            className={`feature-card ${hoveredCard === index ? 'hovered' : ''}`}
            onMouseEnter={() => setHoveredCard(index)}
            onMouseLeave={() => setHoveredCard(null)}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="card-glow"></div>
            <h3 className="card-title">{feature.title}</h3>
            <p className="card-description">{feature.description}</p>
            <ul className="card-details">
              {feature.details.map((detail, idx) => (
                <li key={idx}>
                  {detail}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>


    </section>
  );
};

export default FeaturesInteractive;
