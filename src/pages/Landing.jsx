import React from 'react';
import Navbar from '../components/layout/Navbar';
import HeroSection from '../components/landing/HeroSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import CTASection from '../components/landing/CTASection';

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <CTASection />
      <footer className="py-8 text-center text-sm text-slate-400 border-t border-slate-100">
        <p>© 2026 AdForge · AI-Powered Ad Generation</p>
      </footer>
    </div>
  );
}