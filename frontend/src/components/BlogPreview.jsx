import React from 'react';
import { Link } from 'react-router-dom';
import './BlogPreview.css';

const BlogPreview = () => {
  const posts = [
    {
      category: 'Technology',
      readTime: '5 min read',
      title: 'Breaking down medical jargon',
      description: 'Simple strategies to understand complex medical terminology and reports',
      image: (
        <svg width="100%" height="180" viewBox="0 0 300 180" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="medJargon" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F5E6D3" />
              <stop offset="100%" stopColor="#E8D4C0" />
            </linearGradient>
          </defs>
          <rect width="300" height="180" fill="url(#medJargon)" />

          {/* Medical document */}
          <rect x="40" y="40" width="100" height="120" rx="8" fill="rgba(255,255,255,0.5)" />
          <line x1="55" y1="60" x2="125" y2="60" stroke="#C8B8A8" strokeWidth="2" />
          <line x1="55" y1="75" x2="115" y2="75" stroke="#C8B8A8" strokeWidth="2" />
          <line x1="55" y1="90" x2="125" y2="90" stroke="#C8B8A8" strokeWidth="2" />
          <line x1="55" y1="105" x2="105" y2="105" stroke="#C8B8A8" strokeWidth="2" />

          {/* Chart */}
          <rect x="50" y="120" width="15" height="30" fill="#D8C8B8" opacity="0.7" />
          <rect x="70" y="110" width="15" height="40" fill="#D8C8B8" opacity="0.7" />
          <rect x="90" y="100" width="15" height="50" fill="#D8C8B8" opacity="0.7" />
          <rect x="110" y="115" width="15" height="35" fill="#D8C8B8" opacity="0.7" />

          {/* Medical symbols */}
          <text x="160" y="80" fontSize="24" fill="rgba(200,180,160,0.4)" fontWeight="bold">H₂O</text>
          <path d="M200 60 L200 100 M180 80 L220 80" stroke="rgba(200,180,160,0.4)" strokeWidth="3" />
          <circle cx="250" cy="80" r="20" stroke="rgba(200,180,160,0.4)" strokeWidth="2" fill="none" />
          <path d="M240 75 L245 80 L255 70" stroke="rgba(200,180,160,0.4)" strokeWidth="2" fill="none" />
        </svg>
      )
    },
    {
      category: 'Privacy',
      readTime: '5 min read',
      title: 'Patient data security explained',
      description: 'Essential tips for protecting your personal health information online',
      image: (
        <svg width="100%" height="180" viewBox="0 0 300 180" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="secGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2A4858" />
              <stop offset="100%" stopColor="#3A5868" />
            </linearGradient>
          </defs>
          <rect width="300" height="180" fill="url(#secGrad)" />

          {/* Shield */}
          <path d="M150 40 L190 55 L190 95 Q190 120, 150 140 Q110 120, 110 95 L110 55 Z"
                fill="rgba(95, 196, 196, 0.3)" stroke="#5FC4C4" strokeWidth="2" />

          {/* Lock */}
          <rect x="135" y="85" width="30" height="35" rx="4" fill="#5FC4C4" opacity="0.8" />
          <path d="M140 85 L140 75 Q140 65, 150 65 Q160 65, 160 75 L160 85"
                stroke="#5FC4C4" strokeWidth="2" fill="none" />
          <circle cx="150" cy="102" r="4" fill="#2A4858" />

          {/* Data bits */}
          <circle cx="80" cy="70" r="4" fill="#5FC4C4" opacity="0.5" />
          <circle cx="220" cy="70" r="4" fill="#5FC4C4" opacity="0.5" />
          <circle cx="80" cy="110" r="4" fill="#5FC4C4" opacity="0.5" />
          <circle cx="220" cy="110" r="4" fill="#5FC4C4" opacity="0.5" />

          <line x1="84" y1="70" x2="110" y2="70" stroke="#5FC4C4" strokeWidth="1" opacity="0.3" strokeDasharray="2,2" />
          <line x1="190" y1="70" x2="216" y2="70" stroke="#5FC4C4" strokeWidth="1" opacity="0.3" strokeDasharray="2,2" />
        </svg>
      )
    },
    {
      category: 'AI',
      readTime: '5 min read',
      title: 'AI in healthcare innovations',
      description: 'How artificial intelligence is revolutionizing patient communication and care',
      image: (
        <svg width="100%" height="180" viewBox="0 0 300 180" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="aiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E8A87C" />
              <stop offset="100%" stopColor="#D89A6E" />
            </linearGradient>
          </defs>
          <rect width="300" height="180" fill="url(#aiGrad)" />

          {/* Neural network nodes */}
          <circle cx="80" cy="60" r="5" fill="rgba(255,220,180,0.8)" />
          <circle cx="120" cy="50" r="5" fill="rgba(255,220,180,0.8)" />
          <circle cx="160" cy="55" r="5" fill="rgba(255,220,180,0.8)" />
          <circle cx="200" cy="60" r="5" fill="rgba(255,220,180,0.8)" />
          <circle cx="100" cy="90" r="5" fill="rgba(255,220,180,0.8)" />
          <circle cx="140" cy="90" r="5" fill="rgba(255,220,180,0.8)" />
          <circle cx="180" cy="90" r="5" fill="rgba(255,220,180,0.8)" />
          <circle cx="120" cy="120" r="5" fill="rgba(255,220,180,0.8)" />
          <circle cx="160" cy="120" r="5" fill="rgba(255,220,180,0.8)" />

          {/* Connections */}
          <line x1="80" y1="60" x2="100" y2="90" stroke="rgba(255,220,180,0.4)" strokeWidth="1.5" />
          <line x1="120" y1="50" x2="140" y2="90" stroke="rgba(255,220,180,0.4)" strokeWidth="1.5" />
          <line x1="160" y1="55" x2="180" y2="90" stroke="rgba(255,220,180,0.4)" strokeWidth="1.5" />
          <line x1="100" y1="90" x2="120" y2="120" stroke="rgba(255,220,180,0.4)" strokeWidth="1.5" />
          <line x1="140" y1="90" x2="160" y2="120" stroke="rgba(255,220,180,0.4)" strokeWidth="1.5" />

          {/* Medical cross */}
          <path d="M240 80 L240 120 M220 100 L260 100" stroke="rgba(255,220,180,0.6)" strokeWidth="6" strokeLinecap="round" />
          <circle cx="240" cy="100" r="30" stroke="rgba(255,220,180,0.4)" strokeWidth="1.5" fill="none" />
        </svg>
      )
    }
  ];

  return (
    <section className="blog-preview">
      <div className="blog-preview-container">
        <div className="blog-preview-header">
          <p className="blog-preview-label">Blog</p>
          <h2 className="blog-preview-title">Latest health insights</h2>
          <p className="blog-preview-subtitle">Stay informed about your health and medical technology</p>
        </div>

        <div className="blog-preview-grid">
          {posts.map((post, index) => (
            <article key={index} className="preview-card">
              <div className="preview-image">
                {post.image}
              </div>
              <div className="preview-content">
                <div className="preview-meta">
                  <span className="preview-category">{post.category}</span>
                  <span className="preview-read-time">{post.readTime}</span>
                </div>
                <h3 className="preview-title">{post.title}</h3>
                <p className="preview-description">{post.description}</p>
                <a href="#" className="preview-link">
                  Read more <span>→</span>
                </a>
              </div>
            </article>
          ))}
        </div>

        <div className="blog-preview-footer">
          <Link to="/blog" className="btn-view-all">View all</Link>
        </div>
      </div>
    </section>
  );
};

export default BlogPreview;
