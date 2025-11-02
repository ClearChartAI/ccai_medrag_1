import React from 'react';
import { Link } from 'react-router-dom';
import './Impact.css';

const Impact = () => {
  return (
    <section className="impact-section">
      <div className="impact-container">
        <div className="impact-left">
          <h2 className="impact-title">Transforming patient understanding one record at a time</h2>
        </div>

        <div className="impact-right">
          <p className="impact-description">
            Our clinical pilot reveals the power of clear medical communication. Patients gain confidence. Doctors save time. Healthcare becomes more human.
          </p>
          <div className="impact-actions">
            <Link to="/blog" className="btn-explore">Explore</Link>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3 className="stat-number">90%</h3>
          <p className="stat-label">Patient clarity improved</p>
        </div>
        <div className="stat-card">
          <h3 className="stat-number">85%</h3>
          <p className="stat-label">Communication barriers reduced</p>
        </div>
        <div className="stat-card">
          <h3 className="stat-number">50+</h3>
          <p className="stat-label">Pilot patients empowered</p>
        </div>
      </div>
    </section>
  );
};

export default Impact;
