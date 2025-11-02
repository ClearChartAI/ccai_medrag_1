import React from 'react';
import FeaturesInteractive from '../components/features/FeaturesInteractive';
import FeaturesJourney from '../components/features/FeaturesJourney';
import FeaturesDetailed from '../components/features/FeaturesDetailed';
import FeaturesTestimonials from '../components/features/FeaturesTestimonials';
import CTA from '../components/CTA';

const Features = () => {
  return (
    <>
      <FeaturesInteractive />
      {/* <FeaturesJourney /> */}
      <FeaturesDetailed />
      <FeaturesTestimonials />
      <CTA />
    </>
  );
};

export default Features;
