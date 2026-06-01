import React, { useState, useEffect } from 'react';
import { Truck, ShieldCheck, Minus, Plus, Loader2, CheckCircle, Copy, AlertCircle } from 'lucide-react';
import { addOrder, getShippingPrices, ShippingPrice, DEFAULT_SHIPPING_PRICES, getProductSettings, ProductSettings, DEFAULT_PRODUCT_SETTINGS } from '../firebase';
import { generateOrderCode } from '../utils/orderCode';
import { getMainImage } from '../supabase';



export default function OrderForm() {
  const [qty, setQty] = useState(1);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [altPhone, setAltPhone] = useState('');
  const [governorate, setGovernorate] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderCode, setOrderCode] = useState('');
  const [shippingPrices, setShippingPrices] = useState<ShippingPrice[]>(DEFAULT_SHIPPING_PRICES);
  const [productSettings, setProductSettings] = useState<ProductSettings>(DEFAULT_PRODUCT_SETTINGS);
  const [hasCopiedCode, setHasCopiedCode] = useState(false);
  const [mainImageUrl, setMainImageUrl] = useState<string>("https://lh3.googleusercontent.com/aida-public/AB6AXuC3HgMr0lnLtS9PTVR9fBUebHCblavz067fbyAL-V8LqfoNok3mHVJhLxExCrKTHcIJdLB2NMYLgO08N4mnuYnCuJn-6wZVx4S7q1Rjh2bt2ZTPqXSyFRiCrRu4hb1HO_iT0psrGVe7scFWgVqNw5SXOZAfR4VTgBXa9qpu8mymA_N-5poHb8sj-6ZYnoGV8URd_dNgk5UHlLyy4GG0b04A6kp82BJsL8Ko7xyzNl1YULYco-oW_1jdShjXq5EnIteiw7dh1o4wuA");

  useEffect(() => {
    getShippingPrices().then(setShippingPrices).catch(() => { });
    getProductSettings().then(setProductSettings).catch(() => { });

    getMainImage().then((url) => {
      if (url) setMainImageUrl(url);
    }).catch(console.error);

    // استرجاع الكود لو العميل عمل ريفريش في نفس اليوم
    const savedCode = localStorage.getItem('last_order_code');
    const savedTime = localStorage.getItem('last_order_time');
    if (savedCode && savedTime && (Date.now() - parseInt(savedTime)) < 86400000) {
      setOrderCode(savedCode);
    }
  }, []);

  const selectedShipping = shippingPrices.find((sp) => sp.governorate === governorate);
  const shippingCost = selectedShipping?.price || 0;
  const productTotal = productSettings.price * qty;
  const grandTotal = productTotal + shippingCost;

  const handleQtyChange = (delta: number) => {
    setQty((prev) => Math.max(1, prev + delta));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !governorate || !address) return;

    setLoading(true);
    const code = generateOrderCode();

    try {
      await addOrder({
        orderCode: code,
        fullName,
        phone,
        altPhone,
        governorate,
        city,
        address,
        quantity: qty,
        productPrice: productSettings.price,
        shippingPrice: shippingCost,
        totalPrice: grandTotal,
        status: 'new',
        createdAt: new Date(),
      });
      setOrderCode(code);
      localStorage.setItem('last_order_code', code);
      localStorage.setItem('last_order_time', Date.now().toString());
    } catch (error) {
      console.error('Failed to submit order:', error);
      alert('حدث خطأ في تسجيل الطلب. حاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  // Success Screen
  if (orderCode) {
    return (
      <section id="order-form" className="bg-[#f8f7f6] py-16 md:py-24 relative overflow-hidden">
        <div className="w-full max-w-[600px] mx-auto px-4 md:px-16 relative z-10">
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl text-center animate-fadeIn">
            <div className="w-20 h-20 rounded-full bg-[#10b981]/15 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-[#10b981]" />
            </div>
            <h2 className="text-[28px] font-bold text-[#001256] mb-3">تم تسجيل طلبك بنجاح! 🎉</h2>
            <p className="text-[#454650] text-lg mb-6">هنتواصل معاك قريب لتأكيد الطلب</p>

            {/* Warning Alert */}
            {!hasCopiedCode && (
              <div className="bg-[#ba1a1a]/10 border border-[#ba1a1a]/20 rounded-xl p-4 mb-6 flex items-start gap-3 text-right">
                <AlertCircle className="w-5 h-5 text-[#ba1a1a] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[#ba1a1a] font-bold text-[15px] mb-1">تنبيه هام جداً!</p>
                  <p className="text-[#ba1a1a]/80 text-[13px]">
                    يجب نسخ والاحتفاظ بكود الطلب لتتمكن من تتبع حالة طلبك أو إلغائه لاحقاً.
                  </p>
                </div>
              </div>
            )}

            <div className="bg-[#f8f7f6] rounded-2xl p-6 mb-6 border border-[#001256]/5">
              <p className="text-[#767681] text-sm mb-3">كود الطلب الخاص بيك</p>
              <div className="flex items-center justify-center gap-4 mb-3">
                <p className="text-[#001256] font-bold text-3xl tracking-[0.15em] m-0" style={{ direction: 'ltr' }}>
                  {orderCode}
                </p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(orderCode);
                    setHasCopiedCode(true);
                  }}
                  className={`p-3 rounded-xl transition-all border-none cursor-pointer flex items-center justify-center hover:scale-105 active:scale-95 ${hasCopiedCode ? 'bg-[#10b981]/15 text-[#10b981]' : 'bg-[#001256]/10 text-[#001256] hover:bg-[#001256]/20'
                    }`}
                  title="نسخ الكود"
                >
                  {hasCopiedCode ? <CheckCircle className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
                </button>
              </div>
              <p className={`text-sm font-bold transition-all ${hasCopiedCode ? 'text-[#10b981]' : 'text-[#ba1a1a]'}`}>
                {hasCopiedCode ? 'تم نسخ الكود بنجاح! ✅' : 'اضغط على زر النسخ لحفظ الكود'}
              </p>
            </div>

            <div className="bg-[#FFC641]/10 rounded-xl p-4 mb-6 border border-[#FFC641]/30">
              <p className="text-[#795900] font-semibold text-[15px]">
                المجموع الكلي: <span className="text-xl">{grandTotal} ج.م</span>
              </p>
              <p className="text-[#795900] text-sm mt-1">
                (المنتج: {productTotal} ج.م + الشحن: {shippingCost} ج.م)
              </p>
            </div>

            <button
              onClick={() => {
                if (!hasCopiedCode) {
                  alert('يجب نسخ كود الطلب أولاً بالضغط على زر النسخ لتتمكن من إنشاء طلب جديد!');
                  return;
                }
                setOrderCode('');
                setHasCopiedCode(false);
                localStorage.removeItem('last_order_code');
                localStorage.removeItem('last_order_time');
                setFullName('');
                setPhone('');
                setAltPhone('');
                setGovernorate('');
                setCity('');
                setAddress('');
                setQty(1);
              }}
              className={`font-bold px-8 py-3.5 rounded-xl transition-all border-none w-full text-[16px] ${hasCopiedCode
                  ? 'bg-gradient-to-l from-[#001256] to-[#1b2a6b] text-white hover:shadow-lg cursor-pointer'
                  : 'bg-[#e4e2e2] text-[#767681] cursor-not-allowed opacity-70'
                }`}
            >
              {hasCopiedCode ? 'طلب جديد' : 'انسخ الكود لتتمكن من عمل طلب جديد'}
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="order-form" className="bg-[#f8f7f6] py-16 md:py-24 relative overflow-hidden">
      {/* Subtle pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231b2a6b' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        }}
      />

      <div className="w-full max-w-[1280px] mx-auto px-4 md:px-16 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        {/* Product Preview */}
        <div className="lg:sticky lg:top-28">
          <div className="bg-white rounded-3xl p-6 shadow-lg border border-[#001256]/5">
            <img
              alt="صاعق الناموس الكهربائي الذكي"
              className="w-full h-auto rounded-2xl mb-6 transition-transform duration-500 hover:scale-[1.02]"
              src={mainImageUrl}
            />
            <h3 className="text-[22px] font-bold text-[#001256] mb-3">صاعق الناموس الكهربائي الذكي</h3>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[28px] font-bold text-[#ba1a1a]">{productSettings.price} ج.م</span>
              <span className="text-[#767681] line-through text-lg">{productSettings.discountPrice} ج.م</span>
            </div>
            <div className="flex items-center gap-2 text-[#4c5a9d] mb-4">
              <Truck className="w-5 h-5" />
              <span className="font-semibold text-[13px]">شحن سريع لجميع المحافظات</span>
            </div>
            <div className="bg-[#FFC641]/10 p-4 rounded-xl flex items-start gap-3 border border-[#FFC641]/20">
              <ShieldCheck className="w-5 h-5 text-[#795900] mt-0.5 shrink-0" />
              <p className="text-[14px] text-[#795900]">
                ضمان استرجاع لمدة 14 يوم في حالة وجود أي عيب صناعة.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-[#001256]/5">
          <div className="text-center mb-8">
            <h2 className="text-[24px] md:text-[30px] font-bold text-[#001256] mb-2">
              اطلب دلوقتي واستلم في باب بيتك 🚪
            </h2>
            <p className="text-[#454650] text-[16px]">املا البيانات دي وهنتواصل معاك لتأكيد الطلب</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block font-bold text-[14px] text-[#1b1c1c] mb-2">الاسم بالكامل *</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-[#f8f7f6] border-2 border-[#001256]/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#001256] focus:ring-2 focus:ring-[#001256]/10 transition-all text-[16px] text-[#1b1c1c] placeholder:text-[#767681]"
                placeholder="اكتب اسمك ثلاثي"
                type="text"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block font-bold text-[14px] text-[#1b1c1c] mb-2">رقم التليفون *</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#f8f7f6] border-2 border-[#001256]/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#001256] focus:ring-2 focus:ring-[#001256]/10 transition-all text-[16px] text-[#1b1c1c] placeholder:text-[#767681]"
                  placeholder="01X XXXX XXXX"
                  type="tel"
                  required
                  style={{ direction: 'ltr', textAlign: 'left' }}
                />
              </div>
              <div>
                <label className="block font-bold text-[14px] text-[#1b1c1c] mb-2">رقم بديل (اختياري)</label>
                <input
                  value={altPhone}
                  onChange={(e) => setAltPhone(e.target.value)}
                  className="w-full bg-[#f8f7f6] border-2 border-[#001256]/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#001256] focus:ring-2 focus:ring-[#001256]/10 transition-all text-[16px] text-[#1b1c1c] placeholder:text-[#767681]"
                  placeholder="01X XXXX XXXX"
                  type="tel"
                  style={{ direction: 'ltr', textAlign: 'left' }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block font-bold text-[14px] text-[#1b1c1c] mb-2">المحافظة *</label>
                <div className="relative">
                  <select
                    value={governorate}
                    onChange={(e) => setGovernorate(e.target.value)}
                    className="w-full bg-[#f8f7f6] border-2 border-[#001256]/10 rounded-xl pl-4 pr-4 py-3 focus:outline-none focus:border-[#001256] focus:ring-2 focus:ring-[#001256]/10 transition-all text-[16px] text-[#1b1c1c] appearance-none cursor-pointer"
                    required
                  >
                    <option value="">اختر المحافظة</option>
                    {shippingPrices.map((sp) => (
                      <option key={sp.governorate} value={sp.governorate}>
                        {sp.governorate} — شحن {sp.price} ج.م
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                    <svg className="h-4 w-4 text-[#767681]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              <div>
                <label className="block font-bold text-[14px] text-[#1b1c1c] mb-2">المدينة / المنطقة</label>
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-[#f8f7f6] border-2 border-[#001256]/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#001256] focus:ring-2 focus:ring-[#001256]/10 transition-all text-[16px] text-[#1b1c1c] placeholder:text-[#767681]"
                  placeholder="اسم المدينة أو المنطقة"
                  type="text"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-[14px] text-[#1b1c1c] mb-2">العنوان بالتفصيل *</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-[#f8f7f6] border-2 border-[#001256]/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#001256] focus:ring-2 focus:ring-[#001256]/10 transition-all text-[16px] text-[#1b1c1c] placeholder:text-[#767681] resize-none"
                placeholder="اسم الشارع، رقم العمارة، رقم الشقة، علامة مميزة"
                rows={3}
                required
              />
            </div>

            <div>
              <label className="block font-bold text-[14px] text-[#1b1c1c] mb-2">الكمية</label>
              <div className="flex items-center border-2 border-[#001256]/10 rounded-xl w-fit overflow-hidden bg-[#f8f7f6]">
                <button
                  className="px-4 py-3 text-[#001256] hover:bg-[#001256]/5 transition-colors bg-transparent border-none cursor-pointer"
                  onClick={() => handleQtyChange(1)}
                  type="button"
                >
                  <Plus className="w-5 h-5" />
                </button>
                <input
                  className="w-16 text-center border-none focus:ring-0 text-[20px] font-bold text-[#001256] bg-transparent"
                  readOnly
                  type="number"
                  value={qty}
                />
                <button
                  className="px-4 py-3 text-[#001256] hover:bg-[#001256]/5 transition-colors bg-transparent border-none cursor-pointer"
                  onClick={() => handleQtyChange(-1)}
                  type="button"
                >
                  <Minus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-gradient-to-br from-[#001256]/5 to-[#FFC641]/5 rounded-2xl p-5 border border-[#001256]/10">
              <h4 className="font-bold text-[#001256] mb-3 text-[16px]">ملخص الطلب</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[#454650]">سعر المنتج × {qty}</span>
                  <span className="font-bold text-[#001256]">{productTotal} ج.م</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#454650]">
                    سعر الشحن {governorate ? `(${governorate})` : ''}
                  </span>
                  <span className="font-bold text-[#001256]">
                    {governorate ? `${shippingCost} ج.م` : '— اختر المحافظة —'}
                  </span>
                </div>
                <div className="border-t border-[#001256]/10 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#001256] text-lg">المجموع الكلي</span>
                    <span className="font-bold text-[#ba1a1a] text-2xl">{governorate ? `${grandTotal} ج.م` : '—'}</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              className="w-full bg-gradient-to-l from-[#FFC641] to-[#f6be39] text-[#001256] font-bold text-lg py-4 rounded-xl flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-[#FFC641]/30 transition-all active:scale-[0.98] border-none cursor-pointer disabled:opacity-50"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                'سجل طلبك الآن ✅'
              )}
            </button>
            <p className="text-center font-semibold text-[12px] text-[#767681] mt-3">
              *الدفع عند الاستلام — توصيل من 2 إلى 5 أيام عمل
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
