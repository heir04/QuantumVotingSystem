'use client';

import Header from '@/components/Header.jsx';
import HeroSection from '@/components/HeroSection.jsx';
import CTASection from '@/components/CTASection.jsx';
import Footer from '@/components/Footer.jsx';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <CTASection />
      <Footer />
    </div>
  );
}
