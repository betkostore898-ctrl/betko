import React, { useState, useEffect, useRef } from 'react';
import { getImages } from '../supabase';

export default function ImageGallery() {
  const [images, setImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    getImages().then(setImages).catch(() => {});
  }, []);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [images.length]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = sectionRef.current?.querySelectorAll('.animate-on-scroll');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  if (images.length === 0) return null;

  return (
    <section ref={sectionRef} className="py-16 md:py-20 bg-white">
      <div className="w-full max-w-[1280px] mx-auto px-4 md:px-16">
        <div className="text-center mb-10 animate-on-scroll opacity-0 translate-y-6 transition-all duration-700">
          <h2 className="text-[28px] md:text-[32px] font-bold text-[#001256] mb-3">
            معرض الصور 📸
          </h2>
          <p className="text-[#454650] text-lg">شوف المنتج من كل الزوايا</p>
        </div>

        {/* Carousel */}
        <div className="animate-on-scroll opacity-0 translate-y-6 transition-all duration-700 delay-200 relative overflow-hidden rounded-3xl shadow-2xl shadow-[#001256]/15 max-w-[800px] mx-auto">
          <div className="relative w-full h-[350px] md:h-[500px]">
            {images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`صورة المنتج ${i + 1}`}
                className="absolute inset-0 w-full h-full object-cover transition-all duration-700"
                style={{
                  opacity: i === currentIndex ? 1 : 0,
                  transform: i === currentIndex ? 'scale(1)' : 'scale(1.05)',
                }}
              />
            ))}
          </div>

          {/* Dots */}
          {images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`w-3 h-3 rounded-full border-none cursor-pointer transition-all duration-300 ${
                    i === currentIndex
                      ? 'bg-[#FFC641] w-8 shadow-lg shadow-[#FFC641]/50'
                      : 'bg-white/60 hover:bg-white'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
