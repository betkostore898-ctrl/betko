import React, { useState, useEffect, useRef } from 'react';
import {
  Package, Truck, CheckCircle, Clock, Search, Edit3,
  Image as ImageIcon, Upload, Trash2, ArrowRight, Loader2,
  DollarSign, RefreshCw, X, LayoutDashboard, LogOut, Eye, EyeOff, Tag
} from 'lucide-react';
import { getAllOrders, updateOrderStatus, deleteOrder, Order, getShippingPrices, updateShippingPrice, ShippingPrice, DEFAULT_SHIPPING_PRICES, auth, getProductSettings, updateProductSettings, ProductSettings, DEFAULT_PRODUCT_SETTINGS } from '../firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { uploadImage, getImages, deleteImage, uploadMainImage, getMainImage, deleteMainImage } from '../supabase';
import { getStatusLabel, getStatusColor } from '../utils/orderCode';

type Tab = 'orders' | 'product' | 'shipping' | 'images';

const STATUS_OPTIONS: Order['status'][] = ['new', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function DashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [tab, setTab] = useState<Tab>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchCode, setSearchCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [shippingPrices, setShippingPrices] = useState<ShippingPrice[]>(DEFAULT_SHIPPING_PRICES);
  const [productSettings, setProductSettings] = useState<ProductSettings>(DEFAULT_PRODUCT_SETTINGS);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [editingShipping, setEditingShipping] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editingProductSettings, setEditingProductSettings] = useState(false);
  const [editProductPrice, setEditProductPrice] = useState('');
  const [editDiscountPrice, setEditDiscountPrice] = useState('');
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [uploadingMain, setUploadingMain] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mainFileInputRef = useRef<HTMLInputElement>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    try {
      if (email === 'admin@youssef.com' && password === '123456') {
        setIsAuthenticated(true);
        localStorage.setItem('mock_auth', 'true');
        return;
      }
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error('Login error:', error);
      setLoginError('حصل مشكلة في تسجيل الدخول: ' + error.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsAuthenticated(false);
      localStorage.removeItem('mock_auth');
      if (auth && typeof signOut === 'function') {
        await signOut(auth);
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    if (localStorage.getItem('mock_auth') === 'true') {
      setIsAuthenticated(true);
      return;
    }
    try {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn("Auth state check failed, likely due to mock config:", e);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    loadData();
  }, [isAuthenticated, tab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (tab === 'orders') {
        const data = await getAllOrders();
        setOrders(data);
      } else if (tab === 'shipping') {
        const data = await getShippingPrices();
        setShippingPrices(data);
      } else if (tab === 'product') {
        const data = await getProductSettings();
        setProductSettings(data);
      } else if (tab === 'images') {
        const data = await getImages();
        setImages(data);
        const mainImgUrl = await getMainImage();
        setMainImage(mainImgUrl);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (error: any) {
      console.error('Error updating status:', error);
      alert('حصل مشكلة في تحديث الحالة: ' + error.message);
    }
  };

  const handleShippingUpdate = async (governorate: string) => {
    const price = parseInt(editPrice);
    if (isNaN(price) || price < 0) return;

    try {
      await updateShippingPrice(governorate, price);
      setShippingPrices((prev) =>
        prev.map((sp) => (sp.governorate === governorate ? { ...sp, price } : sp))
      );
      setEditingShipping(null);
      setEditPrice('');
    } catch (error: any) {
      console.error('Error updating shipping price:', error);
      alert('حصل مشكلة في حفظ السعر: ' + error.message);
    }
  };

  const handleProductSettingsUpdate = async () => {
    const price = parseInt(editProductPrice);
    const discountPrice = parseInt(editDiscountPrice);
    if (isNaN(price) || price < 0 || isNaN(discountPrice) || discountPrice < 0) return;

    try {
      const newSettings = { price, discountPrice };
      await updateProductSettings(newSettings);
      setProductSettings(newSettings);
      setEditingProductSettings(false);
    } catch (error: any) {
      console.error('Error updating product settings:', error);
      alert('حصل مشكلة في حفظ السعر: ' + error.message);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const url = await uploadImage(files[i]);
        if (url) {
          setImages((prev) => [url, ...prev]);
        }
      }
    } catch (error) {
      console.error('Error uploading:', error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteImage = async (imageUrl: string) => {
    if (!confirm('هل أنت متأكد من حذف الصورة؟')) return;
    const success = await deleteImage(imageUrl);
    if (success) {
      setImages((prev) => prev.filter((img) => img !== imageUrl));
    }
  };

  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingMain(true);
    try {
      const url = await uploadMainImage(files[0]);
      if (url) {
        setMainImage(url);
      }
    } catch (error) {
      console.error('Error uploading main image:', error);
    } finally {
      setUploadingMain(false);
      if (mainFileInputRef.current) mainFileInputRef.current.value = '';
    }
  };

  const handleDeleteMainImage = async () => {
    if (!mainImage || !confirm('هل أنت متأكد من حذف الصورة الرئيسية؟')) return;
    const success = await deleteMainImage(mainImage);
    if (success) {
      setMainImage(null);
    }
  };

  const filteredOrders = searchCode
    ? orders.filter((o) => o.orderCode.toLowerCase().includes(searchCode.toLowerCase()))
    : orders;

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#001256] to-[#1b2a6b] px-4"
        style={{ fontFamily: "'Cairo', sans-serif" }}
      >
        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-2xl w-full max-w-[420px] text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#001256] to-[#1b2a6b] flex items-center justify-center mx-auto mb-6">
            <LayoutDashboard className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-[26px] font-bold text-[#001256] mb-2">لوحة التحكم</h1>
          <p className="text-[#767681] mb-8">سجل الدخول باستخدام حسابك</p>
          
          {loginError && (
            <div className="bg-[#ba1a1a]/10 text-[#ba1a1a] text-sm font-bold p-3 rounded-lg mb-4">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="البريد الإلكتروني"
              className="w-full bg-[#f8f7f6] border-2 border-[#001256]/10 rounded-xl px-4 py-3 mb-4 focus:outline-none focus:border-[#001256] focus:ring-2 focus:ring-[#001256]/10 transition-all text-[16px] text-center"
              required
              dir="ltr"
            />
            <div className="relative mb-4">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="كلمة السر"
                className="w-full bg-[#f8f7f6] border-2 border-[#001256]/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#001256] focus:ring-2 focus:ring-[#001256]/10 transition-all text-[16px] text-center"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#767681] hover:text-[#001256] transition-colors border-none bg-transparent cursor-pointer"
                title={showPassword ? "إخفاء كلمة السر" : "إظهار كلمة السر"}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full flex justify-center items-center gap-2 bg-gradient-to-l from-[#001256] to-[#1b2a6b] text-white font-bold py-3 rounded-xl hover:shadow-lg transition-all border-none cursor-pointer disabled:opacity-50"
            >
              {isLoggingIn ? <Loader2 className="w-5 h-5 animate-spin" /> : 'تسجيل الدخول'}
            </button>
          </form>
          <a href="/" className="inline-block mt-4 text-[#767681] hover:text-[#001256] transition-colors text-sm no-underline">
            ← العودة للموقع
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f3f2]" style={{ fontFamily: "'Cairo', sans-serif" }}>
      {/* Top bar */}
      <div className="bg-white border-b border-[#001256]/10 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#001256] to-[#1b2a6b] flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-[#001256]">لوحة تحكم بيتكو</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              className="p-2 rounded-lg hover:bg-[#001256]/5 transition-colors bg-transparent border-none cursor-pointer text-[#001256]"
              title="تحديث"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <a
              href="/"
              className="flex items-center gap-2 text-[#767681] hover:text-[#001256] transition-colors text-sm no-underline bg-[#f8f7f6] px-4 py-2 rounded-lg"
            >
              <ArrowRight className="w-4 h-4" />
              الموقع
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-[#ba1a1a] hover:bg-[#ba1a1a]/10 transition-colors text-sm bg-[#f8f7f6] px-4 py-2 rounded-lg border-none cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              خروج
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white p-2 rounded-xl shadow-sm border border-[#001256]/5 w-fit">
          {[
            { key: 'orders' as Tab, label: 'الطلبات', icon: Package, count: orders.length },
            { key: 'product' as Tab, label: 'المنتج', icon: Tag },
            { key: 'shipping' as Tab, label: 'أسعار الشحن', icon: DollarSign },
            { key: 'images' as Tab, label: 'الصور', icon: ImageIcon },
          ].map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-[14px] transition-all border-none cursor-pointer ${
                  tab === t.key
                    ? 'bg-gradient-to-l from-[#001256] to-[#1b2a6b] text-white shadow-md'
                    : 'text-[#767681] hover:bg-[#f8f7f6] bg-transparent'
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
                {t.count !== undefined && tab === t.key && (
                  <span className="bg-white/20 text-white px-2 py-0.5 rounded-full text-[12px]">
                    {t.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#001256]" />
          </div>
        )}

        {/* ========== ORDERS TAB ========== */}
        {!loading && tab === 'orders' && (
          <div>
            {/* Search */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#767681]" />
                <input
                  type="text"
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  placeholder="ابحث بكود الطلب..."
                  className="w-full bg-white border-2 border-[#001256]/10 rounded-xl pr-12 pl-4 py-3 focus:outline-none focus:border-[#001256] focus:ring-2 focus:ring-[#001256]/10 transition-all text-[15px] placeholder:text-[#767681]"
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {STATUS_OPTIONS.map((status) => {
                const count = orders.filter((o) => o.status === status).length;
                return (
                  <div
                    key={status}
                    className="bg-white rounded-xl p-4 border border-[#001256]/5 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: getStatusColor(status) + '20' }}
                      >
                        <span
                          className="text-lg font-bold"
                          style={{ color: getStatusColor(status) }}
                        >
                          {count}
                        </span>
                      </div>
                      <span className="text-[#454650] font-semibold text-[14px]">
                        {getStatusLabel(status)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-[#001256]/5">
                <Package className="w-12 h-12 text-[#767681] mx-auto mb-4" />
                <p className="text-[#767681] text-lg">لا توجد طلبات{searchCode ? ' بهذا الكود' : ' حالياً'}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl p-5 border border-[#001256]/5 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                      <div>
                        <p className="text-[#767681] text-[12px] mb-0.5">كود الطلب</p>
                        <p className="text-[#001256] font-bold text-lg tracking-wider" style={{ direction: 'ltr' }}>
                          {order.orderCode}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id!, e.target.value as Order['status'])}
                          className="bg-[#f8f7f6] border-2 rounded-lg px-3 py-2 font-bold text-[13px] cursor-pointer focus:outline-none transition-all"
                          style={{
                            borderColor: getStatusColor(order.status) + '40',
                            color: getStatusColor(order.status),
                          }}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {getStatusLabel(s)}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={async () => {
                            if (window.confirm('هل أنت متأكد من حذف هذا الطلب نهائياً؟')) {
                              try {
                                await deleteOrder(order.id!);
                                setOrders((prev) => prev.filter((o) => o.id !== order.id));
                              } catch (err) {
                                alert('حدث خطأ أثناء حذف الطلب');
                              }
                            }
                          }}
                          className="p-2 rounded-lg text-[#ba1a1a] hover:bg-[#ba1a1a]/10 transition-colors border-none bg-transparent cursor-pointer"
                          title="حذف الطلب"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <p className="text-[#767681] text-[12px]">الاسم</p>
                        <p className="text-[#001256] font-semibold text-[14px]">{order.fullName}</p>
                      </div>
                      <div>
                        <p className="text-[#767681] text-[12px]">التليفون</p>
                        <p className="text-[#001256] font-semibold text-[14px]" style={{ direction: 'ltr' }}>
                          {order.phone}
                        </p>
                      </div>
                      <div>
                        <p className="text-[#767681] text-[12px]">المحافظة</p>
                        <p className="text-[#001256] font-semibold text-[14px]">{order.governorate}</p>
                      </div>
                      <div>
                        <p className="text-[#767681] text-[12px]">المجموع</p>
                        <p className="text-[#ba1a1a] font-bold text-[16px]">{order.totalPrice} ج.م</p>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-[#001256]/5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <p className="text-[#767681] text-[12px]">العنوان</p>
                          <p className="text-[#454650] text-[13px]">{order.address}</p>
                        </div>
                        <div>
                          <p className="text-[#767681] text-[12px]">الكمية</p>
                          <p className="text-[#454650] text-[13px]">{order.quantity}</p>
                        </div>
                        <div>
                          <p className="text-[#767681] text-[12px]">سعر الشحن</p>
                          <p className="text-[#454650] text-[13px]">{order.shippingPrice} ج.م</p>
                        </div>
                        {order.altPhone && (
                          <div>
                            <p className="text-[#767681] text-[12px]">رقم بديل</p>
                            <p className="text-[#454650] text-[13px]" style={{ direction: 'ltr' }}>
                              {order.altPhone}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========== SHIPPING TAB ========== */}
        {!loading && tab === 'shipping' && (
          <div className="bg-white rounded-2xl border border-[#001256]/5 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-[#001256]/5">
              <h3 className="text-lg font-bold text-[#001256]">أسعار الشحن لكل المحافظات</h3>
              <p className="text-[#767681] text-sm">اضغط على أيقونة التعديل لتغيير سعر الشحن</p>
            </div>
            <div className="divide-y divide-[#001256]/5">
              {shippingPrices.map((sp) => (
                <div key={sp.governorate} className="flex items-center justify-between px-5 py-3 hover:bg-[#f8f7f6] transition-colors">
                  <span className="font-semibold text-[#001256] text-[15px]">{sp.governorate}</span>
                  <div className="flex items-center gap-3">
                    {editingShipping === sp.governorate ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          className="w-20 bg-[#f8f7f6] border-2 border-[#001256]/20 rounded-lg px-3 py-1.5 text-center focus:outline-none focus:border-[#001256] text-[14px]"
                          autoFocus
                        />
                        <button
                          onClick={() => handleShippingUpdate(sp.governorate)}
                          className="bg-[#10b981] text-white px-3 py-1.5 rounded-lg text-[13px] font-bold border-none cursor-pointer hover:bg-[#059669] transition-colors"
                        >
                          حفظ
                        </button>
                        <button
                          onClick={() => { setEditingShipping(null); setEditPrice(''); }}
                          className="p-1.5 rounded-lg hover:bg-[#f8f7f6] bg-transparent border-none cursor-pointer text-[#767681]"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="font-bold text-[#001256] text-[16px] min-w-[60px] text-center">
                          {sp.price} ج.م
                        </span>
                        <button
                          onClick={() => { setEditingShipping(sp.governorate); setEditPrice(String(sp.price)); }}
                          className="p-2 rounded-lg hover:bg-[#001256]/5 bg-transparent border-none cursor-pointer text-[#767681] hover:text-[#001256] transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========== PRODUCT TAB ========== */}
        {!loading && tab === 'product' && (
          <div className="bg-white rounded-2xl border border-[#001256]/5 shadow-sm overflow-hidden p-6 max-w-2xl">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-[#001256]">إعدادات المنتج</h3>
              <p className="text-[#767681] text-sm mt-1">تعديل سعر المنتج وسعر الخصم اللي هيظهر للعميل.</p>
            </div>

            <div className="space-y-6">
              {editingProductSettings ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[#001256] font-bold text-sm mb-2">السعر الحالي (ج.م)</label>
                      <input
                        type="number"
                        value={editProductPrice}
                        onChange={(e) => setEditProductPrice(e.target.value)}
                        className="w-full bg-[#f8f7f6] border-2 border-[#001256]/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#001256] focus:ring-2 focus:ring-[#001256]/10 transition-all text-[16px]"
                      />
                    </div>
                    <div>
                      <label className="block text-[#001256] font-bold text-sm mb-2">سعر الخصم - مشطوب (ج.م)</label>
                      <input
                        type="number"
                        value={editDiscountPrice}
                        onChange={(e) => setEditDiscountPrice(e.target.value)}
                        className="w-full bg-[#f8f7f6] border-2 border-[#001256]/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#001256] focus:ring-2 focus:ring-[#001256]/10 transition-all text-[16px]"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-4">
                    <button
                      onClick={handleProductSettingsUpdate}
                      className="bg-gradient-to-l from-[#10b981] to-[#059669] text-white px-6 py-2.5 rounded-lg text-[14px] font-bold border-none cursor-pointer hover:shadow-lg transition-all"
                    >
                      حفظ التعديلات
                    </button>
                    <button
                      onClick={() => setEditingProductSettings(false)}
                      className="bg-[#f8f7f6] text-[#767681] px-6 py-2.5 rounded-lg text-[14px] font-bold border-none cursor-pointer hover:bg-[#eaeaec] transition-all"
                    >
                      إلغاء
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#f8f7f6] p-4 rounded-xl border border-[#001256]/5">
                      <p className="text-[#767681] text-sm mb-1">السعر الحالي</p>
                      <p className="text-[#001256] font-bold text-2xl">{productSettings.price} ج.م</p>
                    </div>
                    <div className="bg-[#f8f7f6] p-4 rounded-xl border border-[#001256]/5">
                      <p className="text-[#767681] text-sm mb-1">سعر الخصم (مشطوب)</p>
                      <p className="text-[#767681] line-through font-bold text-2xl">{productSettings.discountPrice} ج.م</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setEditingProductSettings(true);
                      setEditProductPrice(String(productSettings.price));
                      setEditDiscountPrice(String(productSettings.discountPrice));
                    }}
                    className="flex items-center gap-2 bg-gradient-to-l from-[#001256] to-[#1b2a6b] text-white px-6 py-2.5 rounded-lg text-[14px] font-bold border-none cursor-pointer hover:shadow-lg transition-all mt-4"
                  >
                    <Edit3 className="w-4 h-4" />
                    تعديل الأسعار
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* ========== IMAGES TAB ========== */}
        {!loading && tab === 'images' && (
          <div className="space-y-8">
            {/* Main Image Section */}
            <div className="bg-white rounded-2xl p-6 border border-[#001256]/5 shadow-sm">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-[#001256]">صورة المنتج الرئيسية</h3>
                <p className="text-[#767681] text-sm mt-1">الصورة التي ستظهر كصورة وحيدة في أقسام معينة مثل سكشن الطلب.</p>
              </div>
              
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div>
                  <input
                    ref={mainFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleMainImageUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => mainFileInputRef.current?.click()}
                    disabled={uploadingMain}
                    className="bg-gradient-to-l from-[#001256] to-[#1b2a6b] text-white font-bold px-6 py-3 rounded-xl hover:shadow-lg transition-all border-none cursor-pointer flex items-center gap-2 disabled:opacity-50"
                  >
                    {uploadingMain ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Upload className="w-5 h-5" />
                    )}
                    {uploadingMain ? 'جاري الرفع...' : 'رفع صورة واحدة فقط'}
                  </button>
                </div>
                
                {mainImage ? (
                  <div className="relative group w-48 h-48 bg-white rounded-xl overflow-hidden border border-[#001256]/5 shadow-sm">
                    <img
                      src={mainImage}
                      alt="الصورة الرئيسية"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={handleDeleteMainImage}
                      className="absolute top-2 left-2 bg-[#ba1a1a] text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-[#93000a] border-none cursor-pointer shadow-md"
                      title="حذف الصورة الرئيسية"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="w-48 h-48 rounded-xl border-2 border-dashed border-[#001256]/20 flex items-center justify-center text-[#767681]">
                    لا توجد صورة رئيسية
                  </div>
                )}
              </div>
            </div>

            {/* Gallery Section */}
            <div className="bg-white rounded-2xl p-6 border border-[#001256]/5 shadow-sm">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-[#001256]">معرض صور المنتج</h3>
                <p className="text-[#767681] text-sm mt-1">الصور دي هتظهر وتتقلب في معرض الصور في الموقع.</p>
              </div>

              <div className="mb-6">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="bg-gradient-to-l from-[#10b981] to-[#059669] text-white font-bold px-6 py-3 rounded-xl hover:shadow-lg transition-all border-none cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {uploading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Upload className="w-5 h-5" />
                  )}
                  {uploading ? 'جاري الرفع...' : 'رفع ملفات الصور'}
                </button>
              </div>

              {/* Images Grid */}
              {images.length === 0 ? (
                <div className="bg-[#f8f7f6] rounded-2xl p-12 text-center border border-[#001256]/5">
                  <ImageIcon className="w-12 h-12 text-[#767681] mx-auto mb-4" />
                  <p className="text-[#767681] text-lg">لا توجد صور في المعرض حالياً</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {images.map((img, i) => (
                    <div
                      key={i}
                      className="relative group bg-white rounded-2xl overflow-hidden border border-[#001256]/5 shadow-sm hover:shadow-md transition-all"
                    >
                      <img
                        src={img}
                        alt={`صورة ${i + 1}`}
                        className="w-full h-48 object-cover"
                      />
                      <button
                        onClick={() => handleDeleteImage(img)}
                        className="absolute top-3 left-3 bg-[#ba1a1a] text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-[#93000a] border-none cursor-pointer shadow-md"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
