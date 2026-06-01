import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import AboutUs from '../components/AboutUs';
import OrderForm from '../components/OrderForm';
import OrderTracking from '../components/OrderTracking';
import FAQ from '../components/FAQ';
import Guarantees from '../components/Guarantees';
import Footer from '../components/Footer';

export default function HomePage() {
  const handleNavigate = (_section: string) => {
    // Smooth scroll is handled in Navbar
  };

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Cairo', sans-serif" }}>
      <Navbar onNavigate={handleNavigate} />
      <main className="w-full">
        <Hero />
        <Features />
        <AboutUs />
        <OrderForm />
        <OrderTracking />
        <FAQ />
        <Guarantees />
      </main>
      <Footer />
    </div>
  );
}
