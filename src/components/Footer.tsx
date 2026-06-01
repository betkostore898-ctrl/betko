import React from 'react';
import { MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#001256] text-white">
      <div className="w-full max-w-[1280px] mx-auto px-4 md:px-16 py-12 grid grid-cols-1 md:grid-cols-3 gap-12">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img
              alt="بيتكو"
              className="h-10 w-auto rounded-lg"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3HgMr0lnLtS9PTVR9fBUebHCblavz067fbyAL-V8LqfoNok3mHVJhLxExCrKTHcIJdLB2NMYLgO08N4mnuYnCuJn-6wZVx4S7q1Rjh2bt2ZTPqXSyFRiCrRu4hb1HO_iT0psrGVe7scFWgVqNw5SXOZAfR4VTgBXa9qpu8mymA_N-5poHb8sj-6ZYnoGV8URd_dNgk5UHlLyy4GG0b04A6kp82BJsL8Ko7xyzNl1YULYco-oW_1jdShjXq5EnIteiw7dh1o4wuA"
            />
            <span className="text-xl font-bold">بيتكو</span>
          </div>
          <p className="text-[#a0abdc] text-sm mt-4">
            نوفر لك أفضل المنتجات المنزلية الذكية بأعلى جودة وأفضل سعر، لنجعل حياتك أسهل وأكثر راحة.
          </p>
        </div>

        <div>
          <h4 className="font-bold text-white mb-4">روابط سريعة</h4>
          <ul className="space-y-2">
            <li><a href="#hero" className="text-[#a0abdc] hover:text-white transition-colors">الرئيسية</a></li>
            <li><a href="#about" className="text-[#a0abdc] hover:text-white transition-colors">من نحن</a></li>
            <li><a href="#tracking" className="text-[#a0abdc] hover:text-white transition-colors">تتبع الطلب</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-white mb-4">تواصل معنا</h4>
          <div className="space-y-3">
            <a href="https://wa.me/201015696545" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[#a0abdc] hover:text-white transition-colors">
              <MessageCircle className="w-5 h-5 text-[#25D366]" />
              <span style={{ direction: 'ltr' }}>+20 101 569 6545</span>
            </a>
          </div>
        </div>
      </div>
      
      <div className="border-t border-white/10 py-6 text-center text-[#a0abdc] text-sm">
        <p>© {new Date().getFullYear()} بيتكو. جميع الحقوق محفوظة</p>
      </div>
    </footer>
  );
}
