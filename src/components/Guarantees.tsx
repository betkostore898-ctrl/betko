import React from 'react';
import { Wallet, RotateCcw, Headphones, Award } from 'lucide-react';

export default function Guarantees() {
  const features = [
    {
      icon: Wallet,
      title: 'الدفع عند الاستلام',
      desc: 'تدفع لما تستلم منتجك',
      color: 'text-[#10b981]'
    },
    {
      icon: RotateCcw,
      title: 'استرجاع خلال 14 يوم',
      desc: 'استرجاع لو فيه أي عيب',
      color: 'text-[#001256]'
    },
    {
      icon: Headphones,
      title: 'خدمة عملاء 24 ساعة',
      desc: 'جاهزين نرد عليك في أي وقت',
      color: 'text-[#001256]'
    },
    {
      icon: Award,
      title: 'جودة منتج مضمونة',
      desc: 'جودة عالية وتعيش معاك',
      color: 'text-[#FFC641]'
    }
  ];

  return (
    <section className="bg-white py-6">
      <div className="w-full max-w-[1280px] mx-auto px-4 md:px-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div key={idx} className="flex flex-col items-center text-center p-2">
                <div className="mb-3">
                  <Icon className={`w-12 h-12 ${feature.color}`} />
                </div>
                <h4 className="text-[#001256] font-bold text-base mb-1">{feature.title}</h4>
                <p className="text-[#767681] text-xs">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
