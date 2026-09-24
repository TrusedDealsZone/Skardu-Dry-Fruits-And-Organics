import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, StoreSettings, Category } from '../types';

interface StoreContextType {
  products: Product[];
  settings: StoreSettings;
  categories: string[];
  categoriesList: Category[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  cart: CartItem[];
  wishlist: string[];
  activeModal: { type: 'product' | 'cart' | 'checkout' | 'auth' | 'tracking' | 'admin'; data?: any } | null;
  openModal: (type: 'product' | 'cart' | 'checkout' | 'auth' | 'tracking' | 'admin', data?: any) => void;
  closeModal: () => void;
  addToCart: (product: Product, weight?: string, price?: number, qty?: number) => void;
  updateCartQty: (productId: string, weight: string, delta: number) => void;
  removeFromCart: (productId: string, weight: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  refreshProducts: () => Promise<void>;
  refreshSettings: () => Promise<void>;
  refreshCategories: () => Promise<void>;
  cartSubtotal: number;
  deliveryFee: number;
  cartTotal: number;
  cartItemsCount: number;
  loading: boolean;
}

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'Skardu Dry Fruits And Organics',
  tagline: 'Premium Dry Fruits & 100% Organic Products',
  phone: '+923202822332',
  whatsapp: '+923202822332',
  email: 'info@skardudryfruits.com',
  address: 'Skardu, Gilgit-Baltistan, Pakistan',
  description: 'Your premier destination for natural, premium-grade Dry Fruits, mountain nuts, and 100% pure organic wild honey and salajeet across Pakistan.',
  currency: 'PKR',
  currencySymbol: 'Rs.',
  deliveryFee: 250,
  freeDeliveryAbove: 3000,
  announcement: '🎉 Free Nationwide Delivery on orders above Rs. 3,000! Cash on Delivery (COD) available across Pakistan.',
  logo: '',
  favicon: '',
  facebook: '',
  instagram: '',
  tiktok: '',
  youtube: '',
  heroBanner: {
    badge: '100% Natural Harvest',
    title: 'Pure & Premium Dry Fruits & Organic Essentials',
    subtitle: 'Handpicked from the peaks of Gilgit-Baltistan and organic farms across Pakistan. Fresh, pure, and delivered with Cash on Delivery.',
    ctaText: 'Explore Products',
    bgImage: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=1600&auto=format&fit=crop'
  },
  theme: 'amber-gold',
  heroSlides: [
    {
      id: 'slide-1',
      image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=1600&auto=format&fit=crop',
      badge: 'Fresh Harvest 2026',
      title: 'Pure & Premium Dry Fruits & Organic Delights',
      subtitle: 'Handpicked, naturally sun-dried nuts and 100% pure organic honeys & mountain salajeet delivered fresh to your doorstep.',
      ctaText: 'Explore Dry Fruits',
      category: 'Dry Fruits'
    },
    {
      id: 'slide-2',
      image: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?q=80&w=1600&auto=format&fit=crop',
      badge: '100% Pure Nuts',
      title: 'Finest American Badam & Gilgit Akhrot Giri',
      subtitle: 'Rich in Omega-3 fatty acids, plant protein, and essential vitality for daily memory and heart health.',
      ctaText: 'Shop Nuts Collection',
      category: 'Dry Fruits'
    },
    {
      id: 'slide-3',
      image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=1600&auto=format&fit=crop',
      badge: 'Certified Organic',
      title: 'Pure Mountain Sidr Honey & Gold Shilajit',
      subtitle: '100% raw, unadulterated Sidr (Beri) Honey and purified Skardu Salajeet for natural immunity & stamina.',
      ctaText: 'Explore Organic Range',
      category: 'Organic Products'
    },
    {
      id: 'slide-4',
      image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?q=80&w=1600&auto=format&fit=crop',
      badge: 'Royal Selection',
      title: 'Crispy Roasted Irani Pistachios & Jumbo Kaju',
      subtitle: 'Gently roasted and salted to perfection. A healthy luxury snack packed with high antioxidants and minerals.',
      ctaText: 'Shop Dry Fruits',
      category: 'Dry Fruits'
    }
  ]
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('dryfruit_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('dryfruit_wishlist');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeModal, setActiveModal] = useState<{ type: 'product' | 'cart' | 'checkout' | 'auth' | 'tracking' | 'admin'; data?: any } | null>(null);
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    }
  };

  const refreshSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  };

  const refreshCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategoriesList(data);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  // Dynamic SEO title, description & favicon
  useEffect(() => {
    if (settings.storeName) {
      document.title = `${settings.storeName} | ${settings.tagline || 'Premium Dry Fruits & Organics'}`;
    }
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && settings.tagline) {
      metaDesc.setAttribute('content', `${settings.storeName} - ${settings.tagline}`);
    }
    // Update favicon dynamically if admin has set one
    if (settings.favicon) {
      let link = document.querySelector<HTMLLinkElement>('link[rel~="icon"]');
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = settings.favicon;
    }
  }, [settings.storeName, settings.tagline, settings.favicon]);

  // Categories list derived: Always includes 'All' + database categories
  const categories = ['All', ...(categoriesList.length > 0 ? categoriesList.map(c => c.name) : ['Dry Fruits', 'Organic Products'])];

  // Check URL for secret admin route: /admin or /#admin or /secret-admin
  useEffect(() => {
    const checkAdminRoute = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path === '/admin' || path === '/secret-admin' || hash === '#admin' || hash === '#secret-admin') {
        setActiveModal({ type: 'admin' });
      }
    };
    checkAdminRoute();
    window.addEventListener('popstate', checkAdminRoute);
    window.addEventListener('hashchange', checkAdminRoute);
    return () => {
      window.removeEventListener('popstate', checkAdminRoute);
      window.removeEventListener('hashchange', checkAdminRoute);
    };
  }, []);

  // Dynamic Theme Application
  useEffect(() => {
    const theme = settings.theme || 'amber-gold';
    document.documentElement.setAttribute('data-theme', theme);
    const root = document.documentElement;
    if (theme === 'emerald-green') {
      root.style.setProperty('--theme-color', '#2a8547');
      root.style.setProperty('--theme-hover', '#23693a');
      root.style.setProperty('--theme-light', '#e0f6e6');
      root.style.setProperty('--theme-border', '#95dbaa');
    } else if (theme === 'royal-burgundy') {
      root.style.setProperty('--theme-color', '#991b1b');
      root.style.setProperty('--theme-hover', '#7f1d1d');
      root.style.setProperty('--theme-light', '#fee2e2');
      root.style.setProperty('--theme-border', '#fca5a5');
    } else if (theme === 'midnight-gold') {
      root.style.setProperty('--theme-color', '#0f172a');
      root.style.setProperty('--theme-hover', '#1e293b');
      root.style.setProperty('--theme-light', '#f1f5f9');
      root.style.setProperty('--theme-border', '#cbd5e1');
    } else if (theme === 'earth-brown') {
      root.style.setProperty('--theme-color', '#78350f');
      root.style.setProperty('--theme-hover', '#5a2507');
      root.style.setProperty('--theme-light', '#fef3c7');
      root.style.setProperty('--theme-border', '#fde68a');
    } else {
      // Default amber-gold
      root.style.setProperty('--theme-color', '#c27c32');
      root.style.setProperty('--theme-hover', '#a76127');
      root.style.setProperty('--theme-light', '#f5edd9');
      root.style.setProperty('--theme-border', '#deb980');
    }
  }, [settings.theme]);

  useEffect(() => {
    Promise.all([refreshProducts(), refreshSettings(), refreshCategories()]).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    localStorage.setItem('dryfruit_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('dryfruit_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const openModal = (type: 'product' | 'cart' | 'checkout' | 'auth' | 'tracking' | 'admin', data?: any) => {
    setActiveModal({ type, data });
  };

  const closeModal = () => {
    if (activeModal?.type === 'admin') {
      if (window.location.hash.includes('admin')) {
        window.history.replaceState(null, '', window.location.pathname);
      }
      if (window.location.pathname.includes('/admin')) {
        window.history.replaceState(null, '', '/');
      }
    }
    setActiveModal(null);
  };

  const addToCart = (product: Product, weight?: string, price?: number, qty: number = 1) => {
    const chosenWeight = weight || product.weight;
    const chosenPrice = price !== undefined ? price : product.price;

    setCart(prev => {
      const index = prev.findIndex(item => item.product.id === product.id && item.selectedWeight === chosenWeight);
      if (index > -1) {
        const updated = [...prev];
        updated[index].quantity += qty;
        return updated;
      }
      return [...prev, { product, selectedWeight: chosenWeight, unitPrice: chosenPrice, quantity: qty }];
    });
  };

  const updateCartQty = (productId: string, weight: string, delta: number) => {
    setCart(prev => {
      return prev
        .map(item => {
          if (item.product.id === productId && item.selectedWeight === weight) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (productId: string, weight: string) => {
    setCart(prev => prev.filter(item => !(item.product.id === productId && item.selectedWeight === weight)));
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleWishlist = (productId: string) => {
    setWishlist(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const isWishlisted = (productId: string) => wishlist.includes(productId);

  const cartSubtotal = cart.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  const deliveryFee = cartSubtotal >= settings.freeDeliveryAbove || cartSubtotal === 0 ? 0 : settings.deliveryFee;
  const cartTotal = cartSubtotal + deliveryFee;
  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <StoreContext.Provider
      value={{
        products,
        settings,
        categories,
        categoriesList,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        cart,
        wishlist,
        activeModal,
        openModal,
        closeModal,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        toggleWishlist,
        isWishlisted,
        refreshProducts,
        refreshSettings,
        refreshCategories,
        cartSubtotal,
        deliveryFee,
        cartTotal,
        cartItemsCount,
        loading
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within a StoreProvider');
  return context;
};
