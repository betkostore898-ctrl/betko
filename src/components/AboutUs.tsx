import React, { useEffect, useRef } from 'react';
import { Home, Heart, Award, Truck } from 'lucide-react';

const highlights = [
  {
    icon: Home,
    title: 'منتجات منزلية',
    desc: 'نوفر لك أفضل المنتجات المنزلية المستوردة بجودة عالية.',
  },
  {
    icon: Heart,
    title: 'راحة عيلتك',
    desc: 'كل منتجاتنا مختارة بعناية لراحة وسلامة أسرتك.',
  },
  {
    icon: Award,
    title: 'جودة مضمونة',
    desc: 'نختبر كل منتج قبل عرضه لضمان أعلى مستوى من الجودة.',
  },
  {
    icon: Truck,
    title: 'شحن لكل مصر',
    desc: 'نوصّل لحد باب بيتك في كل محافظات مصر.',
  },
];

export default function AboutUs() {
  const sectionRef = useRef<HTMLElement>(null);

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

  return (
    <section ref={sectionRef} id="about" className="py-16 md:py-24 bg-white">
      <div className="w-full max-w-[1280px] mx-auto px-4 md:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="text-right">
            <div className="animate-on-scroll opacity-0 translate-y-6 transition-all duration-700">
              <span className="inline-block bg-[#FFC641]/15 text-[#795900] font-bold text-[13px] px-4 py-2 rounded-full mb-4 border border-[#FFC641]/30">
                من نحن ✨
              </span>
              <h2 className="text-[28px] md:text-[34px] font-bold text-[#001256] mb-6 leading-tight">
                بيتكو — شريكك في{' '}
                <span className="text-[#FFC641]">راحة بيتك</span>
              </h2>
              <p className="text-lg text-[#454650] leading-[1.9] mb-4">
                بيتكو هي شركة مصرية متخصصة في توفير أفضل المنتجات المنزلية المستوردة بجودة عالية وأسعار مناسبة. هدفنا إن كل بيت في مصر يلاقي فيه اللي يريّحه ويسهّل حياته اليومية.
              </p>
              <p className="text-lg text-[#454650] leading-[1.9] mb-6">
                بنختار منتجاتنا بعناية شديدة من أفضل المصادر العالمية، وبنضمن لك إن كل منتج بيوصلك مطابق لأعلى معايير الجودة والأمان. ولأننا مؤمنين إن الراحة حق لكل بيت مصري، بنوفر شحن سريع لكل المحافظات مع إمكانية الدفع عند الاستلام.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {highlights.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div
                    key={i}
                    className="animate-on-scroll opacity-0 translate-y-6 transition-all duration-700 flex flex-col items-center text-center p-4 rounded-xl bg-[#f8f7f6] border border-[#001256]/5 hover:shadow-md transition-all"
                    style={{ transitionDelay: `${(i + 1) * 120}ms` }}
                  >
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#001256]/10 to-[#FFC641]/15 flex items-center justify-center text-[#001256] mb-3">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-[#001256] text-[15px] mb-1">{item.title}</h4>
                    <p className="text-[#767681] text-[13px] leading-relaxed">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Visual */}
          <div className="animate-on-scroll opacity-0 translate-x-8 transition-all duration-1000 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-[#001256]/15">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3HgMr0lnLtS9PTVR9fBUebHCblavz067fbyAL-V8LqfoNok3mHVJhLxExCrKTHcIJdLB2NMYLgO08N4mnuYnCuJn-6wZVx4S7q1Rjh2bt2ZTPqXSyFRiCrRu4hb1HO_iT0psrGVe7scFWgVqNw5SXOZAfR4VTgBXa9qpu8mymA_N-5poHb8sj-6ZYnoGV8URd_dNgk5UHlLyy4GG0b04A6kp82BJsL8Ko7xyzNl1YULYco-oW_1jdShjXq5EnIteiw7dh1o4wuA"
                alt="بيتكو - منتجات منزلية"
                className="w-full h-[400px] md:h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#001256]/50 to-transparent" />
              <div className="absolute bottom-6 right-6 left-6">
                <div className="bg-white/90 backdrop-blur-sm rounded-xl px-5 py-4 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[#001256] font-bold text-lg">+10,000</p>
                      <p className="text-[#767681] text-sm">عميل سعيد في كل مصر</p>
                    </div>
                    <div className="flex -space-x-2 space-x-reverse">
                      {['😊', '🥰', '😍', '🤩'].map((emoji, i) => (
                        <span
                          key={i}
                          className="w-9 h-9 rounded-full bg-[#FFC641]/20 flex items-center justify-center text-lg border-2 border-white"
                        >
                          {emoji}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-4 -left-4 w-20 h-20 bg-[#FFC641]/20 rounded-full blur-xl animate-pulse" />
            <div className="absolute -bottom-6 -right-6 w-28 h-28 bg-[#001256]/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
        </div>
      </div>
    </section>
  );
}
