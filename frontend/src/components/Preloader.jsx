import React from 'react';
import './Preloader.css';
import preloaderGif from '../assets/gif preloader.gif';

const Preloader = () => {
  return (
    <div className="preloader">
      <div className="preloader-content">
        <img src={preloaderGif} alt="Loading..." className="preloader-gif" />
      </div>
    </div>
  );
};

export default Preloader;
