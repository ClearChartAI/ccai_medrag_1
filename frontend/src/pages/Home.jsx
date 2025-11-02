import React from 'react';
import Hero from '../components/Hero';
import Features from '../components/Features';
import HowWeHelp from '../components/HowWeHelp';
import Mission from '../components/Mission';
import CTA from '../components/CTA';
import AboutTeam from '../components/about/AboutTeam';
import AboutTimeline from '../components/about/AboutTimeline';
import AboutPartners from '../components/about/AboutPartners';
import AboutImpact from '../components/about/AboutImpact';
import AboutFAQ from '../components/about/AboutFAQ';
import FeaturesInteractive from '../components/features/FeaturesInteractive';
import FeaturesDetailed from '../components/features/FeaturesDetailed';
import FeaturesTestimonials from '../components/features/FeaturesTestimonials';

const Home = () => {
  return (
    <>
      <Hero />
      <Features />
      <HowWeHelp />
      <Mission />
      <AboutTimeline />
      <AboutTeam />
      <AboutPartners />
      <AboutImpact />
      <FeaturesInteractive />
      <FeaturesDetailed />
      <FeaturesTestimonials />
      <AboutFAQ />
      <CTA />
    </>
  );
};

export default Home;
