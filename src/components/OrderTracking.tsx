import React, { useState, useRef, useEffect } from 'react';
import { Search, Package, Truck, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { getOrderByCode, updateOrderStatus, Order } from '../firebase';
import { getStatusLabel } from '../utils/orderCode';

const statusSteps = [
  { key: 'new', label: 'تم استلام الطلب', icon: Clock, color: '#f59e0b' },
  { key: 'processing', label: 'قيد التجهيز', icon: Package, color: '#3b82f6' },
  { key: 'shipped', label: 'تم الشحن', icon: Truck, color: '#8b5cf6' },
  { key: 'delivered', label: 'تم التسليم', icon: CheckCircle, color: '#10b981' },
];

export default function OrderTracking() {
  const [code, setCode] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setError('');
    setOrder(null);
    setSearched(true);

    try {
      const result = await getOrderByCode(code.trim().toUpperCase());
      if (result) {
        setOrder(result);
      } else {
        setError('لم يتم العثور على طلب بهذا الكود. تأكد من كتابة الكود بشكل صحيح.');
      }
    } catch {
      setError('حدث خطأ أثناء البحث. حاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const getStepIndex = (status: string) => {
    return statusSteps.findIndex((s) => s.key === status);
  };

  return (
    <section ref={sectionRef} id="tracking" className="py-16 md:py-24 bg-white">
      <div className="w-full max-w-[700px] mx-auto px-4 md:px-16">
        <div className="text-center mb-10 animate-on-scroll opacity-0 translate-y-6 transition-all duration-700">
          <span className="inline-block bg-[#001256]/10 text-[#001256] font-bold text-[13px] px-4 py-2 rounded-full mb-4">
            تتبع طلبك 📦
          </span>
          <h2 className="text-[28px] md:text-[34px] font-bold text-[#001256] mb-3">
            تتبع حالة طلبك
          </h2>
          <p className="text-[#454650] text-lg">أدخل كود الطلب اللي استلمته بعد تأكيد الطلب</p>
        </div>

        {/* Search Form */}
        <form
          onSubmit={handleSearch}
          className="animate-on-scroll opacity-0 translate-y-6 transition-all duration-700 delay-200 flex gap-3 mb-8"
        >
          <div className="flex-1 relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#767681]" />
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="مثال: BK-A3F7X9"
              className="w-full bg-[#f8f7f6] border-2 border-[#001256]/10 rounded-xl pr-12 pl-4 py-4 focus:outline-none focus:border-[#001256] focus:ring-2 focus:ring-[#001256]/10 transition-all text-[16px] text-[#1b1c1c] placeholder:text-[#767681] font-semibold tracking-wider uppercase"
              style={{ direction: 'ltr', textAlign: 'center' }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-l from-[#001256] to-[#1b2a6b] text-white font-bold px-8 py-4 rounded-xl hover:shadow-lg hover:shadow-[#001256]/25 active:scale-95 transition-all border-none cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'بحث'}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="bg-[#ba1a1a]/10 border border-[#ba1a1a]/20 text-[#ba1a1a] rounded-xl p-4 mb-6 text-center font-semibold animate-fadeIn">
            {error}
          </div>
        )}

        {/* Order Result */}
        {order && (
          <div className="bg-[#f8f7f6] rounded-2xl p-6 md:p-8 border border-[#001256]/5 shadow-lg animate-fadeIn">
            {/* Order Info */}
            <div className="flex flex-wrap justify-between items-start mb-8 gap-4">
              <div>
                <p className="text-[#767681] text-sm mb-1">كود الطلب</p>
                <p className="text-[#001256] font-bold text-xl tracking-wider" style={{ direction: 'ltr' }}>
                  {order.orderCode}
                </p>
              </div>
              <div className="text-left">
                <p className="text-[#767681] text-sm mb-1">الحالة</p>
                <span
                  className="inline-block px-4 py-1.5 rounded-full text-white font-bold text-[13px]"
                  style={{ backgroundColor: order.status === 'cancelled' ? '#ba1a1a' : statusSteps[getStepIndex(order.status)]?.color || '#6b7280' }}
                >
                  {getStatusLabel(order.status)}
                </span>
              </div>
            </div>

            {/* Timeline */}
            {order.status === 'cancelled' ? (
              <div className="bg-[#ba1a1a]/10 border border-[#ba1a1a]/20 rounded-xl p-8 text-center my-6">
                <p className="text-[#ba1a1a] font-bold text-xl mb-2">تم إلغاء هذا الطلب</p>
                <p className="text-[#ba1a1a]/80 text-sm">إذا كنت ترغب في منتجاتنا، يمكنك عمل طلب جديد من الموقع.</p>
              </div>
            ) : (
              <div className="relative">
                <div className="flex justify-between items-start">
                  {statusSteps.map((step, i) => {
                    const Icon = step.icon;
                    const currentIndex = getStepIndex(order.status);
                    const isCompleted = i <= currentIndex;
                    const isCurrent = i === currentIndex;

                    return (
                      <div key={step.key} className="flex flex-col items-center flex-1 relative">
                        {/* Connecting line */}
                        {i < statusSteps.length - 1 && (
                          <div
                            className="absolute top-5 h-[3px] rounded-full transition-all duration-500"
                            style={{
                              right: '50%',
                              backgroundColor: i < currentIndex ? step.color : '#e5e7eb',
                              width: '100%',
                            }}
                          />
                        )}
                        {/* Icon */}
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center relative z-10 transition-all duration-500 ${
                            isCurrent ? 'ring-4 ring-opacity-30 scale-110' : ''
                          }`}
                          style={{
                            backgroundColor: isCompleted ? step.color : '#e5e7eb',
                            color: isCompleted ? 'white' : '#9ca3af',
                            ringColor: isCurrent ? step.color : 'transparent',
                          }}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <p
                          className={`text-[12px] md:text-[14px] leading-tight mt-3 text-center font-bold ${
                            isCompleted ? 'text-[#001256]' : 'text-[#9ca3af]'
                          }`}
                        >
                          {step.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Order Details */}
            <div className="mt-8 pt-6 border-t border-[#001256]/10 grid grid-cols-2 gap-4">
              <div>
                <p className="text-[#767681] text-sm">الاسم</p>
                <p className="text-[#001256] font-semibold">{order.fullName}</p>
              </div>
              <div>
                <p className="text-[#767681] text-sm">المحافظة</p>
                <p className="text-[#001256] font-semibold">{order.governorate}</p>
              </div>
              <div>
                <p className="text-[#767681] text-sm">الكمية</p>
                <p className="text-[#001256] font-semibold">{order.quantity}</p>
              </div>
              <div>
                <p className="text-[#767681] text-sm">المجموع</p>
                <p className="text-[#001256] font-bold text-lg">{order.totalPrice} ج.م</p>
              </div>
            </div>

            {/* Cancel Button */}
            {(order.status === 'new' || order.status === 'processing') && (
              <div className="mt-8 pt-6 border-t border-[#001256]/10 text-center">
                <button
                  onClick={async () => {
                    if (window.confirm('هل أنت متأكد أنك تريد إلغاء هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء.')) {
                      setLoading(true);
                      try {
                        await updateOrderStatus(order.id!, 'cancelled');
                        setOrder({ ...order, status: 'cancelled' });
                      } catch (err) {
                        setError('حدث خطأ أثناء محاولة إلغاء الطلب. يرجى المحاولة مرة أخرى.');
                      } finally {
                        setLoading(false);
                      }
                    }
                  }}
                  className="text-[#ba1a1a] hover:bg-[#ba1a1a]/10 px-6 py-3 rounded-xl font-bold transition-all border-none bg-transparent cursor-pointer inline-flex items-center gap-2"
                  disabled={loading}
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  إلغاء الطلب
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
