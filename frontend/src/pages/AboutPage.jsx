import React from 'react';
import { Header1 } from '@/components/ui/header';
import AboutUsSection from '@/components/ui/about-us-section';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative">
      <Header1 />
      <div className="pt-16">
        <AboutUsSection />
      </div>
    </div>
  );
};

export default AboutPage;
