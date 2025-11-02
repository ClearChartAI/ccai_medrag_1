import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './BlogPosts.css';

const BlogPosts = () => {
  const [observedPosts, setObservedPosts] = useState(new Set());
  const [activeGallerySlide, setActiveGallerySlide] = useState({});
  const observerRef = useRef(null);

  const allPosts = [
    {
      category: 'Technology',
      readTime: '5 min read',
      date: 'Dec 14, 2025',
      author: { name: 'Dr. Emily Carter' },
      title: 'Breaking down medical jargon',
      description: 'Simple strategies to understand complex medical terminology and reports',
      slug: 'breaking-down-medical-jargon',
      images: [
        '/src/assets/ChatGPT Image Oct 4, 2025, 09_28_34 PM.png',
        '/src/assets/ChatGPT Image Oct 4, 2025, 09_31_12 PM.png',
        '/src/assets/ChatGPT Image Oct 4, 2025, 09_33_06 PM.png'
      ]
    },
    {
      category: 'Privacy',
      readTime: '5 min read',
      date: 'Dec 13, 2025',
      author: { name: 'John Smith' },
      title: 'Patient data security explained',
      description: 'Essential tips for protecting your personal health information online',
      slug: 'patient-data-security-explained',
      images: [
        '/src/assets/ChatGPT Image Oct 4, 2025, 09_31_12 PM.png',
        '/src/assets/ChatGPT Image Oct 4, 2025, 09_33_06 PM.png',
        '/src/assets/ChatGPT Image Oct 4, 2025, 09_28_34 PM.png'
      ]
    },
    {
      category: 'AI',
      readTime: '5 min read',
      date: 'Dec 12, 2025',
      author: { name: 'Dr. Sarah Chen' },
      title: 'AI in healthcare innovations',
      description: 'How artificial intelligence is revolutionizing patient communication and care',
      slug: 'ai-in-healthcare-innovations',
      images: [
        '/src/assets/ChatGPT Image Oct 4, 2025, 09_33_06 PM.png',
        '/src/assets/ChatGPT Image Oct 4, 2025, 09_28_34 PM.png',
        '/src/assets/ChatGPT Image Oct 4, 2025, 09_31_12 PM.png'
      ]
    },
    {
      category: 'Patient Education',
      readTime: '7 min read',
      date: 'Dec 11, 2025',
      author: { name: 'Dr. Michael Lee' },
      title: 'Reading your lab results with confidence',
      description: 'A comprehensive guide to interpreting common laboratory tests',
      slug: 'reading-lab-results',
      images: [
        '/src/assets/ChatGPT Image Oct 4, 2025, 09_28_34 PM.png',
        '/src/assets/ChatGPT Image Oct 4, 2025, 09_31_12 PM.png',
        '/src/assets/ChatGPT Image Oct 4, 2025, 09_33_06 PM.png'
      ]
    },
    {
      category: 'Wellness',
      readTime: '6 min read',
      date: 'Dec 10, 2025',
      author: { name: 'Lisa Johnson' },
      title: 'Taking control of your health journey',
      description: 'Practical steps to become an active participant in your healthcare',
      slug: 'control-health-journey',
      images: [
        '/src/assets/ChatGPT Image Oct 4, 2025, 09_31_12 PM.png',
        '/src/assets/ChatGPT Image Oct 4, 2025, 09_33_06 PM.png',
        '/src/assets/ChatGPT Image Oct 4, 2025, 09_28_34 PM.png'
      ]
    },
    {
      category: 'Technology',
      readTime: '4 min read',
      date: 'Dec 9, 2025',
      author: { name: 'Alex Rodriguez' },
      title: 'Digital health records explained',
      description: 'Understanding electronic health records and how to access yours',
      slug: 'digital-health-records',
      images: [
        '/src/assets/ChatGPT Image Oct 4, 2025, 09_33_06 PM.png',
        '/src/assets/ChatGPT Image Oct 4, 2025, 09_28_34 PM.png',
        '/src/assets/ChatGPT Image Oct 4, 2025, 09_31_12 PM.png'
      ]
    }
  ];

  const handleGalleryNext = (postIndex, e) => {
    e.preventDefault();
    e.stopPropagation();
    const currentSlide = activeGallerySlide[postIndex] || 0;
    const nextSlide = (currentSlide + 1) % allPosts[postIndex].images.length;
    setActiveGallerySlide(prev => ({ ...prev, [postIndex]: nextSlide }));
  };

  const handleGalleryPrev = (postIndex, e) => {
    e.preventDefault();
    e.stopPropagation();
    const currentSlide = activeGallerySlide[postIndex] || 0;
    const prevSlide = (currentSlide - 1 + allPosts[postIndex].images.length) % allPosts[postIndex].images.length;
    setActiveGallerySlide(prev => ({ ...prev, [postIndex]: prevSlide }));
  };

  const goToGallerySlide = (postIndex, slideIndex, e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveGallerySlide(prev => ({ ...prev, [postIndex]: slideIndex }));
  };

  useEffect(() => {
    // Set up intersection observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = entry.target.getAttribute('data-index');
            setObservedPosts((prev) => new Set([...prev, parseInt(index)]));
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    // Observe all post elements
    const postElements = document.querySelectorAll('.post-item');
    postElements.forEach((el) => observerRef.current?.observe(el));

    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <section className="blog-posts-minimal">
      <div className="posts-container">
        {allPosts.map((post, index) => {
          const currentGallerySlide = activeGallerySlide[index] || 0;

          return (
            <article
              key={index}
              data-index={index}
              className={`post-item ${index % 2 === 0 ? 'slide-left' : 'slide-right'} ${observedPosts.has(index) ? 'visible' : ''}`}
            >
              <Link to={`/blog/${post.slug}`} className="post-link">
                {/* Image Gallery Section */}
                <div className="post-image-container">
                  <div className="post-gallery">
                    <div className="gallery-slides">
                      {post.images.map((image, imgIndex) => (
                        <div
                          key={imgIndex}
                          className={`gallery-slide ${imgIndex === currentGallerySlide ? 'active' : ''}`}
                        >
                          <img src={image} alt={`${post.title} - ${imgIndex + 1}`} className="post-image" />
                        </div>
                      ))}
                    </div>

                    <div className="post-overlay"></div>

                    {/* Gallery Controls */}
                    {post.images.length > 1 && (
                      <>
                        <button
                          className="gallery-arrow gallery-prev"
                          onClick={(e) => handleGalleryPrev(index, e)}
                          aria-label="Previous image"
                        >
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M12 16L6 10L12 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        <button
                          className="gallery-arrow gallery-next"
                          onClick={(e) => handleGalleryNext(index, e)}
                          aria-label="Next image"
                        >
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M8 16L14 10L8 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>

                        {/* Gallery Dots */}
                        <div className="gallery-dots">
                          {post.images.map((_, imgIndex) => (
                            <button
                              key={imgIndex}
                              className={`gallery-dot ${imgIndex === currentGallerySlide ? 'active' : ''}`}
                              onClick={(e) => goToGallerySlide(index, imgIndex, e)}
                              aria-label={`Go to image ${imgIndex + 1}`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Content Section */}
                <div className="post-content">
                  <div className="post-meta">
                    <span className="post-category">{post.category}</span>
                    <span className="meta-dot">·</span>
                    <span className="post-date">{post.date}</span>
                  </div>

                  <h2 className="post-title">{post.title}</h2>
                  <p className="post-description">{post.description}</p>

                  <div className="post-footer">
                    <span className="post-author">{post.author.name}</span>
                    <span className="post-read-time">{post.readTime}</span>
                  </div>
                </div>
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default BlogPosts;
