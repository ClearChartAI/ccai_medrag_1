import React from 'react';
import './FeaturesDecode.css';

const FeaturesDecode = () => {
  return (
    <section className="features-decode">
      <div className="decode-container">
        <div className="decode-visual">
          <div className="decode-animation">
            <svg width="400" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <radialGradient id="glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#7DD3D3" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#5FA8A8" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Glowing center */}
              <circle cx="200" cy="200" r="100" fill="url(#glow)" />
              <circle cx="200" cy="200" r="40" fill="#7DD3D3" opacity="0.6">
                <animate attributeName="r" values="30;45;30" dur="3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.4;0.8;0.4" dur="3s" repeatCount="indefinite" />
              </circle>

              {/* Orbiting particles */}
              <circle cx="260" cy="140" r="4" fill="#5FC4C4" opacity="0.7">
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 200 200"
                  to="360 200 200"
                  dur="8s"
                  repeatCount="indefinite"
                />
              </circle>

              <circle cx="140" cy="260" r="4" fill="#5FC4C4" opacity="0.7">
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="180 200 200"
                  to="540 200 200"
                  dur="8s"
                  repeatCount="indefinite"
                />
              </circle>

              {/* Medical symbols */}
              <g opacity="0.6">
                <text x="100" y="120" fontSize="20" fill="#5FC4C4" fontFamily="monospace">DNA</text>
                <text x="280" y="140" fontSize="18" fill="#5FC4C4" fontFamily="monospace">EKG</text>
                <text x="120" y="290" fontSize="16" fill="#5FC4C4" fontFamily="monospace">MRI</text>
                <text x="270" y="270" fontSize="18" fill="#5FC4C4" fontFamily="monospace">LAB</text>
              </g>

              {/* Data streams */}
              <path d="M50 100 Q100 120, 150 110" stroke="#5FC4C4" strokeWidth="1" opacity="0.3" strokeDasharray="5,5">
                <animate attributeName="stroke-dashoffset" from="0" to="100" dur="4s" repeatCount="indefinite" />
              </path>
              <path d="M350 300 Q300 280, 250 290" stroke="#5FC4C4" strokeWidth="1" opacity="0.3" strokeDasharray="5,5">
                <animate attributeName="stroke-dashoffset" from="0" to="100" dur="4s" repeatCount="indefinite" />
              </path>
            </svg>
          </div>
        </div>

        <div className="decode-text">
          <h2 className="decode-title">Transform medical complexity into clear understanding</h2>
          <p className="decode-description">
            Our Synapse Engine cuts through medical noise with precision. We turn complex data into meaningful insights that speak directly to your health journey.
          </p>
        </div>
      </div>
    </section>
  );
};

export default FeaturesDecode;
