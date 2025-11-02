import React from 'react';
import './FeaturesTestimonials.css';

const FeaturesTestimonials = () => {
  const testimonials = [
    {
      rating: 5,
      text: 'ClearChartAI helped me understand my complex medical history for the first time.',
      name: 'Sarah Martinez',
      role: 'Patient, New York',
      avatar: 'SM'
    },
    {
      rating: 5,
      text: 'The platform simplified medical jargon into clear, actionable insights.',
      name: 'Dr. James Chen',
      role: 'Primary care physician',
      avatar: 'JC'
    },
    {
      rating: 5,
      text: 'Finally, a tool that puts patients first and makes medical records truly understandable.',
      name: 'Michael Rodriguez',
      role: 'Healthcare advocate',
      avatar: 'MR'
    }
  ];

  return (
    <section className="features-testimonials">
      <div className="testimonials-container">
        <h2 className="testimonials-title">Patient stories</h2>
        <p className="testimonials-subtitle">
          Real experiences from people who transformed their healthcare understanding
        </p>

        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial-card">
              <div className="testimonial-rating">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="star">★</span>
                ))}
              </div>
              <p className="testimonial-text">{testimonial.text}</p>
              <div className="testimonial-author">
                <div className="author-avatar">{testimonial.avatar}</div>
                <div className="author-info">
                  <p className="author-name">{testimonial.name}</p>
                  <p className="author-role">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesTestimonials;
