export interface WeightOption {
  label: string;
  price: number;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  description?: string;
}

export interface Review {
  id: string;
  productId: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number | null;
  weight: string;
  rating: number;
  reviewsCount: number;
  reviews?: Review[];
  image: string;
  badge?: string;
  inStock: boolean;
  stockCount: number;
  description: string;
  weights?: WeightOption[];
  // Gemstone Option C fields
  origin?: string;
  sellingType?: 'per_piece' | 'per_carat' | 'both';
  carat?: number;
  pricePerCarat?: number;
  clarity?: string;
  cut?: string;
  color?: string;
  treatment?: string;
  certification?: string;
  isCertified?: boolean;
  images?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  product: Product;
  selectedWeight: string;
  unitPrice: number;
  quantity: number;
}

export interface HeroBanner {
  badge: string;
  title: string;
  subtitle: string;
  ctaText: string;
  bgImage: string;
}

export interface HeroSlide {
  id: string;
  image: string;
  badge?: string;
  title: string;
  subtitle: string;
  ctaText?: string;
  category?: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  description?: string;
  currency: string;
  currencySymbol: string;
  deliveryFee: number;
  freeDeliveryAbove: number;
  announcement: string;
  logo?: string;
  favicon?: string;
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  heroBanner: HeroBanner;
  heroSlides?: HeroSlide[];
  theme?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin';
}

export interface OrderCustomer {
  name: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  notes?: string;
}

export interface OrderTimeline {
  status: string;
  timestamp: string;
  description: string;
}

export interface Order {
  id: string;
  userId?: string | null;
  customer: OrderCustomer;
  items: {
    id: string;
    name: string;
    weight: string;
    price: number;
    quantity: number;
    image: string;
  }[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  status: 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';
  createdAt: string;
  timeline: OrderTimeline[];
}
