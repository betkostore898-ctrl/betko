import React, { useEffect, useRef } from 'react';
import {
  Zap, BedDouble, Lightbulb, Shield,
  Pointer, Briefcase, MoonStar
} from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'قوة فورية',
    desc: 'صاعق كهربائي قوي يقضي على الناموس في ثواني.',
  },
  {
    icon: BedDouble,
    title: 'نوم عميق',
    desc: 'هادي جداً ومش بيعمل أي صوت يزعجك وإنت نايم.',
  },
  {
    icon: Lightbulb,
    title: 'جذب ذكي',
    desc: 'إضاءة مدمجة بتجذب الحشرات تلقائياً بدون أي مجهود منك.',
  },
  {
    icon: Shield,
    title: 'حماية أكيدة',
    desc: 'آمن تماماً للاستخدام جوه البيت ومزود بشبكة حماية.',
  },
  {
    icon: Pointer,
    title: 'بساطة وسهولة',
    desc: 'تشغيل بضغطة زرار واحدة بس.',
  },
  {
    icon: Briefcase,
    title: 'عملي ومرن',
    desc: 'حجمه صغير وخفيف، تقدر تنقله من مكان لمكان بسهولة.',
  },
  {
    icon: MoonStar,
    title: 'راحة ليلية',
    desc: 'مثالي جداً لغرف النوم عشان تستمتع بليلة هادية ومريحة.',
  },
];

export default function Features() {
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
      { threshold: 0.05 }
    );

    const elements = sectionRef.current?.querySelectorAll('.animate-on-scroll');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="bg-[#f8f7f6] py-16 md:py-24">
      <div className="w-full max-w-[1280px] mx-auto px-4 md:px-16">
        <div className="text-center mb-14 animate-on-scroll opacity-0 translate-y-6 transition-all duration-700">
          <h2 className="text-[28px] md:text-[32px] font-bold text-[#001256] mb-4">
            ليه تختار صاعق الناموس بتاعنا؟
          </h2>
          <p className="text-[#454650] text-lg max-w-2xl mx-auto">
            مميزات تضمن لك الراحة والأمان في بيتك
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div
                key={i}
                className={`animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 bg-white rounded-2xl p-6 border border-[#001256]/5 shadow-sm hover:shadow-lg hover:shadow-[#001256]/8 hover:-translate-y-1 transition-all flex flex-col items-center text-center gap-4 cursor-default`}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#001256]/10 to-[#FFC641]/15 flex items-center justify-center text-[#001256]">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-[18px] font-bold text-[#001256]">{feat.title}</h3>
                <p className="text-[14px] text-[#454650] leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}

          {/* Box content card */}
          <div className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 bg-gradient-to-br from-[#001256] to-[#1b2a6b] text-white rounded-2xl p-6 border border-[#001256] shadow-lg flex flex-col items-center justify-center text-center gap-4 sm:col-span-2 xl:col-span-1"
            style={{ transitionDelay: `${7 * 80}ms` }}
          >
            <span className="text-5xl">📦</span>
            <h3 className="text-[18px] font-bold">محتويات العلبة</h3>
            <p className="text-[14px] text-blue-200 leading-relaxed">
              جهاز صاعق ناموس كهربائي + دليل استخدام بسيط
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
