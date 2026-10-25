import React from 'react';
import { Navbar } from '../components/Navbar/Navbar';
import { Hero } from '../components/Hero/Hero';
import { Workflow } from '../components/Workflow/Workflow';
import { Footer } from '../components/Footer/Footer';

export const Home = () => {
  return (
    <div className="relative overflow-hidden min-h-screen w-full flex flex-col">
      {/* Top right decorative circle crossing navbar */}
      <div className="absolute top-0 right-0 w-[300px] h-[300px] md:w-[500px] md:h-[500px] lg:w-[600px] lg:h-[600px] bg-emerald-500/[0.08] rounded-full translate-x-[30%] -translate-y-[30%] pointer-events-none"></div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-20 py-4 md:py-5 relative z-10 flex-grow w-full">
        <Navbar />

        <main>
          <Hero />
          <Workflow />
        </main>
      </div>

      <Footer />
    </div>
  );
};
