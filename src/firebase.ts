import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
  setDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase configuration - Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCYumGWZsfCKti3-b-goaHR5jsDmjMynBk",
  authDomain: "betko-ecb91.firebaseapp.com",
  databaseURL: "https://betko-ecb91-default-rtdb.firebaseio.com",
  projectId: "betko-ecb91",
  storageBucket: "betko-ecb91.firebasestorage.app",
  messagingSenderId: "88784041337",
  appId: "1:88784041337:web:c30c1b2a637696b72b2ba8",
  measurementId: "G-4JXXVJY7BW"
};

let app;
let db;
let auth;

let isMock = false;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
  if (firebaseConfig.projectId === 'placeholder-project') {
    isMock = true;
  }
} catch (e) {
  console.warn("Firebase init failed, using mock DB for UI preview", e);
  db = {} as any; // Mock DB
  auth = {} as any; // Mock Auth
  isMock = true;
}

// ===== Order Types =====
export interface Order {
  id?: string;
  orderCode: string;
  fullName: string;
  phone: string;
  altPhone: string;
  governorate: string;
  city: string;
  address: string;
  quantity: number;
  productPrice: number;
  shippingPrice: number;
  totalPrice: number;
  status: 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Timestamp | Date;
}

// ===== Order Functions =====
export async function addOrder(order: Omit<Order, 'id'>): Promise<string> {
  if (isMock) {
    const orders = JSON.parse(localStorage.getItem('mock_orders') || '[]');
    const id = Math.random().toString(36).substring(2);
    const newOrder = { ...order, id, createdAt: new Date().toISOString() };
    orders.unshift(newOrder);
    localStorage.setItem('mock_orders', JSON.stringify(orders));
    return id;
  }
  try {
    const docRef = await addDoc(collection(db, 'orders'), {
      ...order,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding order:', error);
    throw error;
  }
}

export async function getOrderByCode(orderCode: string): Promise<Order | null> {
  if (isMock) {
    const orders = JSON.parse(localStorage.getItem('mock_orders') || '[]');
    const order = orders.find((o: any) => o.orderCode === orderCode);
    return order ? order : null;
  }
  try {
    const q = query(
      collection(db, 'orders'),
      where('orderCode', '==', orderCode)
    );
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;
    const docSnap = querySnapshot.docs[0];
    return { id: docSnap.id, ...docSnap.data() } as Order;
  } catch (error) {
    console.error('Error getting order:', error);
    throw error;
  }
}

export async function getAllOrders(): Promise<Order[]> {
  if (isMock) {
    return JSON.parse(localStorage.getItem('mock_orders') || '[]');
  }
  try {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as Order[];
  } catch (error) {
    console.error('Error getting orders:', error);
    throw error;
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: Order['status']
): Promise<void> {
  if (isMock) {
    const orders = JSON.parse(localStorage.getItem('mock_orders') || '[]');
    const index = orders.findIndex((o: any) => o.id === orderId);
    if (index !== -1) {
      orders[index].status = status;
      localStorage.setItem('mock_orders', JSON.stringify(orders));
    }
    return;
  }
  try {
    await updateDoc(doc(db, 'orders', orderId), { status });
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
}

export async function deleteOrder(orderId: string): Promise<void> {
  if (isMock) {
    let orders = JSON.parse(localStorage.getItem('mock_orders') || '[]');
    orders = orders.filter((o: any) => o.id !== orderId);
    localStorage.setItem('mock_orders', JSON.stringify(orders));
    return;
  }
  try {
    await deleteDoc(doc(db, 'orders', orderId));
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
}

// ===== Shipping Prices =====
export interface ShippingPrice {
  governorate: string;
  price: number;
}

export const DEFAULT_SHIPPING_PRICES: ShippingPrice[] = [
  { governorate: 'القاهرة', price: 45 },
  { governorate: 'الجيزة', price: 45 },
  { governorate: 'الإسكندرية', price: 55 },
  { governorate: 'القليوبية', price: 50 },
  { governorate: 'الشرقية', price: 55 },
  { governorate: 'الدقهلية', price: 55 },
  { governorate: 'الغربية', price: 55 },
  { governorate: 'المنوفية', price: 55 },
  { governorate: 'البحيرة', price: 55 },
  { governorate: 'كفر الشيخ', price: 60 },
  { governorate: 'دمياط', price: 60 },
  { governorate: 'بورسعيد', price: 60 },
  { governorate: 'الإسماعيلية', price: 55 },
  { governorate: 'السويس', price: 55 },
  { governorate: 'الفيوم', price: 55 },
  { governorate: 'بني سويف', price: 60 },
  { governorate: 'المنيا', price: 60 },
  { governorate: 'أسيوط', price: 65 },
  { governorate: 'سوهاج', price: 65 },
  { governorate: 'قنا', price: 70 },
  { governorate: 'الأقصر', price: 70 },
  { governorate: 'أسوان', price: 75 },
  { governorate: 'البحر الأحمر', price: 75 },
  { governorate: 'مطروح', price: 70 },
  { governorate: 'الوادي الجديد', price: 80 },
  { governorate: 'شمال سيناء', price: 75 },
  { governorate: 'جنوب سيناء', price: 80 },
];

export async function getShippingPrices(): Promise<ShippingPrice[]> {
  if (isMock) {
    const prices = localStorage.getItem('mock_shipping');
    if (prices) return JSON.parse(prices);
    localStorage.setItem('mock_shipping', JSON.stringify(DEFAULT_SHIPPING_PRICES));
    return DEFAULT_SHIPPING_PRICES;
  }
  try {
    const querySnapshot = await getDocs(collection(db, 'shipping_prices'));
    if (querySnapshot.empty) {
      // Initialize with defaults
      for (const sp of DEFAULT_SHIPPING_PRICES) {
        await setDoc(doc(db, 'shipping_prices', sp.governorate), sp);
      }
      return DEFAULT_SHIPPING_PRICES;
    }
    return querySnapshot.docs.map((d) => d.data()) as ShippingPrice[];
  } catch (error) {
    console.error('Error getting shipping prices:', error);
    return DEFAULT_SHIPPING_PRICES;
  }
}

export async function updateShippingPrice(
  governorate: string,
  price: number
): Promise<void> {
  if (isMock) {
    const prices = JSON.parse(localStorage.getItem('mock_shipping') || JSON.stringify(DEFAULT_SHIPPING_PRICES));
    const index = prices.findIndex((p: any) => p.governorate === governorate);
    if (index !== -1) {
      prices[index].price = price;
    } else {
      prices.push({ governorate, price });
    }
    localStorage.setItem('mock_shipping', JSON.stringify(prices));
    return;
  }
  try {
    await setDoc(doc(db, 'shipping_prices', governorate), {
      governorate,
      price,
    });
  } catch (error) {
    console.error('Error updating shipping price:', error);
    throw error;
  }
}

// ===== Product Settings =====
export interface ProductSettings {
  price: number;
  discountPrice: number;
}

export const DEFAULT_PRODUCT_SETTINGS: ProductSettings = {
  price: 250,
  discountPrice: 550,
};

export async function getProductSettings(): Promise<ProductSettings> {
  if (isMock) {
    const settings = localStorage.getItem('mock_product_settings');
    if (settings) return JSON.parse(settings);
    localStorage.setItem('mock_product_settings', JSON.stringify(DEFAULT_PRODUCT_SETTINGS));
    return DEFAULT_PRODUCT_SETTINGS;
  }
  try {
    const docSnap = await getDoc(doc(db, 'settings', 'product'));
    if (!docSnap.exists()) {
      await setDoc(doc(db, 'settings', 'product'), DEFAULT_PRODUCT_SETTINGS);
      return DEFAULT_PRODUCT_SETTINGS;
    }
    return docSnap.data() as ProductSettings;
  } catch (error) {
    console.error('Error getting product settings:', error);
    return DEFAULT_PRODUCT_SETTINGS;
  }
}

export async function updateProductSettings(settings: ProductSettings): Promise<void> {
  if (isMock) {
    localStorage.setItem('mock_product_settings', JSON.stringify(settings));
    return;
  }
  try {
    await setDoc(doc(db, 'settings', 'product'), settings);
  } catch (error) {
    console.error('Error updating product settings:', error);
    throw error;
  }
}

export { db, auth };
