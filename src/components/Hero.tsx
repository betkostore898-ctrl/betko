import React, { useEffect, useRef, useState } from 'react';
import { Star } from 'lucide-react';
import { getMainImage, getImages } from '../supabase';
import { getProductSettings, ProductSettings, DEFAULT_PRODUCT_SETTINGS } from '../firebase';

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);

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

    const elements = heroRef.current?.querySelectorAll('.animate-on-scroll');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const [heroImages, setHeroImages] = useState<string[]>([
    "https://lh3.googleusercontent.com/aida-public/AB6AXuC3HgMr0lnLtS9PTVR9fBUebHCblavz067fbyAL-V8LqfoNok3mHVJhLxExCrKTHcIJdLB2NMYLgO08N4mnuYnCuJn-6wZVx4S7q1Rjh2bt2ZTPqXSyFRiCrRu4hb1HO_iT0psrGVe7scFWgVqNw5SXOZAfR4VTgBXa9qpu8mymA_N-5poHb8sj-6ZYnoGV8URd_dNgk5UHlLyy4GG0b04A6kp82BJsL8Ko7xyzNl1YULYco-oW_1jdShjXq5EnIteiw7dh1o4wuA"
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [productSettings, setProductSettings] = useState<ProductSettings>(DEFAULT_PRODUCT_SETTINGS);

  useEffect(() => {
    async function fetchImages() {
      try {
        const [mainImg, galleryImgs] = await Promise.all([
          getMainImage(),
          getImages()
        ]);
        const allImages = [];
        if (mainImg) allImages.push(mainImg);
        if (galleryImgs && galleryImgs.length > 0) {
          allImages.push(...galleryImgs);
        }
        if (allImages.length > 0) {
          setHeroImages(allImages);
        }
        
        getProductSettings().then(setProductSettings).catch(console.error);
      } catch (err) {
        console.error(err);
      }
    }
    fetchImages();
  }, []);

  useEffect(() => {
    if (heroImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroImages.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  const discountPercent = productSettings.discountPrice > 0 
    ? Math.round(((productSettings.discountPrice - productSettings.price) / productSettings.discountPrice) * 100)
    : 0;

  return (
    <section
      ref={heroRef}
      id="hero"
      className="w-full max-w-[1280px] mx-auto px-4 md:px-16 pt-28 pb-12 md:pt-32 md:pb-20 grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
    >
      <div className="flex flex-col gap-6 text-right">
        <div className="animate-on-scroll opacity-0 translate-y-6 transition-all duration-700 delay-100">
          <div className="inline-flex items-center gap-2 bg-[#FFC641]/15 text-[#795900] px-4 py-2 rounded-full w-fit border border-[#FFC641]/30">
            <Star className="w-4 h-4 fill-[#FFC641] text-[#FFC641]" />
            <span className="font-semibold text-[13px]">الأكثر مبيعاً في مصر</span>
          </div>
        </div>

        <div className="animate-on-scroll opacity-0 translate-y-6 transition-all duration-700 delay-200">
          <p className="text-[#FFC641] font-bold text-lg mb-2">صاعق الناموس الكهربائي الذكي</p>
          <h1 className="text-[28px] md:text-[38px] font-bold text-[#001256] leading-[1.3]">
            نوم هادي بدون 'زن' ولا إزعاج..{' '}
            <span className="text-[#FFC641]">الحل النهائي</span> لمشكلة الناموس!
          </h1>
        </div>

        <p className="animate-on-scroll opacity-0 translate-y-6 transition-all duration-700 delay-300 text-lg text-[#454650] leading-relaxed">
          نسيت طعم النوم المريح بسبب الناموس؟ دلوقتي تقدر ترجّع هدوء بيتك وتنام مرتاح إنت
          وعيلتك مع صاعق الناموس الكهربائي الذكي. حماية قوية وآمنة هتخلصك من الحشرات في ثواني
          وبدون أي صوت!
        </p>

        <div className="animate-on-scroll opacity-0 translate-y-6 transition-all duration-700 delay-[400ms] flex items-center gap-4 py-2">
          <span className="text-[36px] font-bold text-[#ba1a1a]">{productSettings.price} ج.م</span>
          <span className="text-lg text-[#767681] line-through">{productSettings.discountPrice} ج.م</span>
          {discountPercent > 0 && (
            <span className="bg-[#ba1a1a]/10 text-[#ba1a1a] font-bold text-[13px] px-3 py-1.5 rounded-lg">
              -{discountPercent}% خصم
            </span>
          )}
        </div>

      </div>

      <div className="animate-on-scroll opacity-0 translate-x-6 transition-all duration-1000 delay-300 relative w-full aspect-[4/3] md:aspect-auto md:h-[500px] rounded-2xl overflow-hidden shadow-2xl shadow-[#001256]/15 group bg-white">
        {heroImages.map((img, i) => (
          <img
            key={i}
            alt={`صاعق الناموس الكهربائي الذكي - صورة ${i + 1}`}
            className="absolute inset-0 w-full h-full object-contain md:object-cover transition-all duration-1000 ease-in-out group-hover:scale-105"
            style={{
              opacity: i === currentIndex ? 1 : 0,
              zIndex: i === currentIndex ? 1 : 0
            }}
            src={img}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-[#001256]/40 to-transparent z-10 pointer-events-none" />
        
        {/* Navigation Dots */}
        {heroImages.length > 1 && (
          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-20">
            {heroImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  i === currentIndex ? 'bg-[#FFC641] w-6' : 'bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}

        {/* Floating badge */}
        <div className="absolute top-6 right-6 z-20 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-3 shadow-lg flex items-center gap-3 animate-float">
          <div className="w-10 h-10 rounded-full bg-[#FFC641]/20 flex items-center justify-center">
            <span className="text-xl">⚡</span>
          </div>
          <div>
            <p className="text-[#001256] font-bold text-sm">يقضي على الناموس</p>
            <p className="text-[#767681] text-xs">في ثواني معدودة</p>
          </div>
        </div>
      </div>

      <div className="col-span-1 md:col-span-2 flex justify-center mt-2 md:mt-6">
        <a
          href="#order-form"
          className="animate-on-scroll opacity-0 translate-y-6 transition-all duration-700 delay-500 inline-block bg-gradient-to-l from-[#001256] to-[#1b2a6b] text-white font-bold text-lg px-8 py-4 rounded-xl text-center hover:shadow-xl hover:shadow-[#001256]/30 active:scale-95 transition-all w-full md:w-auto min-w-[300px] no-underline"
        >
          اطلب الآن واستلم في باب بيتك 🚪
        </a>
      </div>
    </section>
  );
}
