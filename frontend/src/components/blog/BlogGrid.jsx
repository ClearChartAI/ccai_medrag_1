import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './BlogGrid.css';

// Import images properly for Vite bundling
import blogImg1 from '../../assets/blog-image-1.png';
import blogImg2 from '../../assets/blog-image-2.png';
import blogImg3 from '../../assets/blog-image-3.png';

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
      image: blogImg1,
      slug: 'breaking-down-medical-jargon',
      readTime: '5 min read'
    },
    {
      id: 2,
      title: 'River Watch',
      subtitle: 'Patient monitoring systems',
      category: 'Innovation',
      description: 'Explore the latest innovations in patient monitoring systems that provide real-time health tracking and predictive analytics.',
      image: blogImg2,
      slug: 'patient-data-security-explained',
      readTime: '6 min read'
    },
    {
      id: 3,
      title: 'Flow State',
      subtitle: 'Mental health & wellness',
      category: 'Wellness',
      description: 'Learn practical strategies for achieving optimal mental health and wellness through mindfulness and evidence-based practices.',
      image: blogImg3,
      slug: 'control-health-journey',
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
