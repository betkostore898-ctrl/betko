import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

const faqData = [
  {
    q: 'هل جودة الصاعق قوية وتتحمل الاستخدام المستمر؟',
    a: 'نعم، المنتج مستورد بجودة عالية تضمن لك قوة صعق فعالة وعمرًا افتراضيًا طويلاً مقارنة بالأنواع التقليدية.',
  },
  {
    q: 'هل الجهاز آمن للاستخدام في غرف الأطفال؟',
    a: 'يحتوي الصاعق على شبكة حماية خارجية تمنع وصول الأصابع للأسلاك الداخلية، مما يجعله آمنًا في وجود الأطفال والحيوانات الأليفة.',
  },
  {
    q: 'هل يصدر الجهاز صوتًا مزعجًا أثناء العمل؟',
    a: 'الجهاز مصمم ليعمل بصوت هادئ جدًا لا يسبب أي إزعاج، لتتمكن من استخدامه أثناء النوم دون قلق.',
  },
  {
    q: 'ما هي محتويات العلبة التي سأستلمها؟',
    a: 'العبوة تحتوي على جهاز صاعق الناموس الكهربائي ودليل تشغيل بسيط لمساعدتك في البدء فورًا.',
  },
  {
    q: 'كم تستغرق مدة الشحن وما هي تكلفتها؟',
    a: 'نوفر لك شحنًا سريعًا يغطي جميع محافظات مصر، وتستغرق مدة التوصيل عادة من يومين إلى 4 أيام عمل.',
  },
  {
    q: 'هل متاح الدفع عند الاستلام وما هي سياسة الاسترجاع؟',
    a: 'نعم، الدفع يكون عند الاستلام، ويمكنك فحص المنتج للتأكد من سلامته قبل الدفع للمندوب.',
  },
  {
    q: 'كيف أحصل على أفضل نتيجة من الجهاز؟',
    a: 'ببساطة قم بتوصيله بالكهرباء واضغط على زر التشغيل، ويفضل وضعه في مكان مرتفع بعيدًا عن الإضاءة القوية لنتائج أفضل.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.05 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="faq" className="py-16 md:py-24 bg-[#f8f7f6]">
      <div className="w-full max-w-[800px] mx-auto px-4 md:px-16">
        <div className={`text-center mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <span className="inline-block bg-[#001256]/10 text-[#001256] font-bold text-[13px] px-4 py-2 rounded-full mb-4">
            الأسئلة الشائعة ❓
          </span>
          <h2 className="text-[28px] md:text-[34px] font-bold text-[#001256] mb-3">
            صاعق الناموس الكهربائي الذكي
          </h2>
          <p className="text-[#454650] text-lg">كل اللي محتاج تعرفه عن المنتج</p>
        </div>

        <div className="space-y-4">
          {faqData.map((item, i) => (
            <div
              key={i}
              className={`bg-white rounded-2xl border overflow-hidden transition-all duration-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              } ${
                openIndex === i
                  ? 'border-[#FFC641] shadow-lg shadow-[#FFC641]/10'
                  : 'border-[#001256]/5 shadow-sm hover:shadow-md'
              }`}
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-right bg-transparent border-none cursor-pointer group"
              >
                <span
                  className={`font-bold text-[16px] leading-relaxed transition-colors ${
                    openIndex === i ? 'text-[#001256]' : 'text-[#454650] group-hover:text-[#001256]'
                  }`}
                >
                  {item.q}
                </span>
                <ChevronDown
                  className={`w-5 h-5 shrink-0 mr-3 transition-all duration-300 ${
                    openIndex === i ? 'rotate-180 text-[#FFC641]' : 'text-[#767681]'
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === i ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-5 pb-5 pt-0">
                  <div className="w-12 h-[3px] bg-[#FFC641] rounded-full mb-3" />
                  <p className="text-[#454650] text-[15px] leading-[1.9]">{item.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
