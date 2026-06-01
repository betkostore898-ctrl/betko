import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  onNavigate: (section: string) => void;
}

export default function Navbar({ onNavigate }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'الرئيسية', href: '#hero' },
    { label: 'من نحن', href: '#about' },
    { label: 'تتبع الطلب', href: '#tracking' },
    { label: 'الأسئلة الشائعة', href: '#faq' },
  ];

  const handleClick = (href: string) => {
    setMobileOpen(false);
    const id = href.replace('#', '');
    onNavigate(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-[#001256]/10'
          : 'bg-white shadow-sm'
      }`}
    >
      <div className="flex justify-between items-center px-4 md:px-16 w-full max-w-[1280px] mx-auto h-20">
        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleClick('#hero')}>
          <img
            alt="بيتكو"
            className="h-11 w-auto rounded-lg transition-transform duration-300 hover:scale-105"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3HgMr0lnLtS9PTVR9fBUebHCblavz067fbyAL-V8LqfoNok3mHVJhLxExCrKTHcIJdLB2NMYLgO08N4mnuYnCuJn-6wZVx4S7q1Rjh2bt2ZTPqXSyFRiCrRu4hb1HO_iT0psrGVe7scFWgVqNw5SXOZAfR4VTgBXa9qpu8mymA_N-5poHb8sj-6ZYnoGV8URd_dNgk5UHlLyy4GG0b04A6kp82BJsL8Ko7xyzNl1YULYco-oW_1jdShjXq5EnIteiw7dh1o4wuA"
          />
          <span className="text-2xl font-bold text-[#001256]">بيتكو</span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex gap-8 items-center">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleClick(link.href)}
              className="relative text-[#454650] hover:text-[#001256] font-semibold text-[15px] transition-colors duration-300 group bg-transparent border-none cursor-pointer"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#FFC641] transition-all duration-300 group-hover:w-full rounded-full" />
            </button>
          ))}
        </div>

        {/* CTA Button */}
        <button
          onClick={() => handleClick('#order-form')}
          className="hidden md:inline-flex bg-gradient-to-l from-[#001256] to-[#1b2a6b] text-white font-bold text-[15px] px-7 py-3 rounded-xl hover:shadow-lg hover:shadow-[#001256]/25 active:scale-95 transition-all duration-300 items-center justify-center cursor-pointer border-none"
        >
          اطلب الآن 🛒
        </button>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-[#001256] bg-transparent border-none cursor-pointer p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-500 bg-white border-t border-[#001256]/10 ${
          mobileOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="flex flex-col items-center py-4 gap-3">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleClick(link.href)}
              className="text-[#454650] hover:text-[#001256] font-semibold text-lg py-2 transition-colors bg-transparent border-none cursor-pointer"
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={() => handleClick('#order-form')}
            className="bg-gradient-to-l from-[#001256] to-[#1b2a6b] text-white font-bold px-8 py-3 rounded-xl mt-2 border-none cursor-pointer"
          >
            اطلب الآن 🛒
          </button>
        </div>
      </div>
    </nav>
  );
}
