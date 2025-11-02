import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './BlogGrid.css';

const BlogGrid = () => {
  const [observedCards, setObservedCards] = useState(new Set());
  const observerRef = useRef(null);

  const featuredPosts = [
    {
      id: 1,
      title: 'Sculpting Light',
      subtitle: 'Medical imaging breakthrough',
      category: 'Technology',
      description: 'Discover how advanced medical imaging techniques are revolutionizing diagnostic procedures and patient care with cutting-edge technology.',
      image: '/src/assets/ChatGPT Image Oct 4, 2025, 09_28_34 PM.png',
      slug: 'breaking-down-medical-jargon',
      readTime: '5 min read'
    },
    {
      id: 2,
      title: 'River Watch',
      subtitle: 'Patient monitoring systems',
      category: 'Innovation',
      description: 'Explore the latest innovations in patient monitoring systems that provide real-time health tracking and predictive analytics.',
      image: '/src/assets/ChatGPT Image Oct 4, 2025, 09_31_12 PM.png',
      slug: 'patient-data-security-explained',
      readTime: '6 min read'
    },
    {
      id: 3,
      title: 'Flow State',
      subtitle: 'Mental health & wellness',
      category: 'Wellness',
      description: 'Learn practical strategies for achieving optimal mental health and wellness through mindfulness and evidence-based practices.',
      image: '/src/assets/ChatGPT Image Oct 4, 2025, 09_33_06 PM.png',
      slug: 'control-health-journey',
      readTime: '7 min read'
    },
    {
      id: 4,
      title: 'Dive Reflex',
      subtitle: 'Deep health analytics',
      category: 'Analytics',
      description: 'Dive into the world of health analytics and discover how data-driven insights are transforming healthcare decisions.',
      image: '/src/assets/ChatGPT Image Oct 4, 2025, 09_28_34 PM.png',
      slug: 'ai-in-healthcare-innovations',
      readTime: '8 min read'
    },
    {
      id: 5,
      title: 'The Places',
      subtitle: 'Healthcare accessibility',
      category: 'Access',
      description: 'Understanding the importance of healthcare accessibility and how technology is breaking down barriers to quality care.',
      image: '/src/assets/ChatGPT Image Oct 4, 2025, 09_31_12 PM.png',
      slug: 'reading-lab-results',
      readTime: '5 min read'
    },
    {
      id: 6,
      title: 'Heist Mount Tam',
      subtitle: 'Data security protocols',
      category: 'Security',
      description: 'Comprehensive guide to healthcare data security protocols and best practices for protecting sensitive patient information.',
      image: '/src/assets/ChatGPT Image Oct 4, 2025, 09_33_06 PM.png',
      slug: 'hipaa-compliance',
      readTime: '6 min read'
    },
    {
      id: 7,
      title: 'On The Run',
      subtitle: 'Mobile health solutions',
      category: 'Mobile',
      description: 'Stay connected to your health on the go with innovative mobile health solutions designed for modern lifestyles.',
      image: '/src/assets/ChatGPT Image Oct 4, 2025, 09_28_34 PM.png',
      slug: 'digital-health-records',
      readTime: '4 min read'
    },
    {
      id: 8,
      title: 'Turning Tides',
      subtitle: 'Healthcare transformation',
      category: 'Future',
      description: 'Explore how emerging technologies and new paradigms are reshaping the future of healthcare delivery and patient outcomes.',
      image: '/src/assets/ChatGPT Image Oct 4, 2025, 09_31_12 PM.png',
      slug: 'prescription-labels',
      readTime: '7 min read'
    }
  ];

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = entry.target.getAttribute('data-index');
            setObservedCards((prev) => new Set([...prev, parseInt(index)]));
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    const cardElements = document.querySelectorAll('.grid-card');
    cardElements.forEach((el) => observerRef.current?.observe(el));

    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <section className="blog-grid-section">
      <div className="grid-container">
        <div className="grid-header">
          <h2 className="grid-title">Featured Blogs</h2>
          <p className="grid-subtitle">Explore our latest insights and discoveries</p>
        </div>

        <div className="blog-grid">
          {featuredPosts.map((post, index) => (
            <article
              key={post.id}
              data-index={index}
              className={`grid-card ${observedCards.has(index) ? 'visible' : ''}`}
            >
              <Link to={`/blog/${post.slug}`} className="card-link">
                <div className="card-flip-container">
                  {/* Front Side */}
                  <div className="card-face card-front">
                    <div className="card-image-wrapper">
                      <img src={post.image} alt={post.title} className="card-image" />
                      <div className="card-overlay"></div>
                      <div className="card-content">
                        <span className="card-category">{post.category}</span>
                        <h3 className="card-title">{post.title}</h3>
                        <p className="card-subtitle">{post.subtitle}</p>
                      </div>
                    </div>
                  </div>

                  {/* Back Side */}
                  <div className="card-face card-back">
                    <div className="card-back-content">
                      <span className="card-back-category">{post.category}</span>
                      <h3 className="card-back-title">{post.title}</h3>
                      <p className="card-back-description">{post.description}</p>
                      <div className="card-back-footer">
                        <span className="card-back-read-time">{post.readTime}</span>
                        <span className="card-back-arrow">
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogGrid;
