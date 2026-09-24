import React, { useState, useEffect } from 'react';
import {
  X, ShieldCheck, Package, ShoppingBag, Settings, LogOut,
  Plus, Edit2, Trash2, Upload, Check, AlertCircle, Phone, MapPin, RefreshCw,
  Tag, Image as ImageIcon
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { Product, Order, StoreSettings, Category } from '../../types';

export const AdminPanel: React.FC = () => {
  const {
    closeModal, products, refreshProducts,
    settings, refreshSettings,
    categoriesList, refreshCategories
  } = useStore();
  const { user, isAdmin, login, logout, token } = useAuth();

  // Admin Login State
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'categories' | 'settings'>('dashboard');

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Product Edit / Add Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddMode, setIsAddMode] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'Dry Fruits',
    price: 0,
    originalPrice: 0,
    weight: '1 kg',
    image: '',
    badge: '',
    inStock: true,
    stockCount: 50,
    description: '',
    weights: [
      { label: '250g', price: 0 },
      { label: '500g', price: 0 },
      { label: '1 kg', price: 0 }
    ],
    // Gemstone Option C fields
    origin: '',
    sellingType: 'per_piece' as 'per_piece' | 'per_carat' | 'both',
    carat: 0,
    pricePerCarat: 0,
    clarity: '',
    cut: '',
    color: '',
    treatment: 'None / Natural',
    certification: '',
    isCertified: false
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Settings Form State
  const [settingsForm, setSettingsForm] = useState<StoreSettings>(settings);
  const [savingSettings, setSavingSettings] = useState(false);
  const [uploadingSlideImage, setUploadingSlideImage] = useState<string | null>(null);

  // Category Management State
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [catForm, setCatForm] = useState({ name: '', icon: '🌰', description: '' });
  const [catSaving, setCatSaving] = useState(false);
  const [catError, setCatError] = useState<string | null>(null);
  const [catSuccess, setCatSuccess] = useState<string | null>(null);

  // Fetch orders when tab is opened
  const fetchOrders = async () => {
    if (!token) return;
    setLoadingOrders(true);
    try {
      const res = await fetch('/api/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error('Failed to fetch admin orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (isAdmin && token) {
      fetchOrders();
    }
  }, [isAdmin, token]);

  useEffect(() => {
    setSettingsForm(settings);
  }, [settings]);

  // Handle Admin Login
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoggingIn(true);
    try {
      const res = await login(adminEmail, adminPassword);
      if (!res.success) {
        setLoginError(res.message || 'Invalid credentials');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Login failed');
    } finally {
      setLoggingIn(false);
    }
  };

  // Open Edit Product
  const openEditProduct = (prod: Product) => {
    setIsAddMode(false);
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      category: prod.category,
      price: prod.price,
      originalPrice: prod.originalPrice || 0,
      weight: typeof prod.weight === 'string' ? prod.weight : String(prod.weight || '1 kg'),
      image: prod.image,
      badge: prod.badge || '',
      inStock: prod.inStock,
      stockCount: prod.stockCount || 50,
      description: prod.description || '',
      weights: prod.weights && prod.weights.length > 0 ? prod.weights : [
        { label: '500g', price: Math.round(prod.price * 0.55) },
        { label: '1 kg', price: prod.price }
      ],
      origin: prod.origin || '',
      sellingType: (prod.sellingType || 'per_piece') as 'per_piece' | 'per_carat' | 'both',
      carat: prod.carat || 0,
      pricePerCarat: prod.pricePerCarat || 0,
      clarity: prod.clarity || '',
      cut: prod.cut || '',
      color: prod.color || '',
      treatment: prod.treatment || 'None / Natural',
      certification: prod.certification || '',
      isCertified: Boolean(prod.isCertified)
    });
    setSaveSuccess(null);
    setSaveError(null);
  };

  // Open Add Product
  const openAddProduct = () => {
    const defaultCategory = categoriesList.length > 0 ? categoriesList[0].name : 'Dry Fruits';
    setIsAddMode(true);
    setEditingProduct({} as Product);
    setProductForm({
      name: '',
      category: defaultCategory,
      price: 2000,
      originalPrice: 2400,
      weight: '1 kg',
      image: '',
      badge: '',
      inStock: true,
      stockCount: 50,
      description: '',
      weights: [
        { label: '250g', price: 550 },
        { label: '500g', price: 1050 },
        { label: '1 kg', price: 2000 }
      ],
      origin: 'Skardu, Pakistan',
      sellingType: 'per_piece' as 'per_piece' | 'per_carat' | 'both',
      carat: 0,
      pricePerCarat: 0,
      clarity: 'Eye Clean',
      cut: 'Brilliant Cut',
      color: 'Natural',
      treatment: 'None / 100% Natural',
      certification: '',
      isCertified: false
    });
    setSaveSuccess(null);
    setSaveError(null);
  };

  // Handle Image Upload from Local PC (product)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    setUploadingImage(true);
    setSaveError(null);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload image');
      setProductForm(prev => ({ ...prev, image: data.url }));
      setSaveSuccess('Image uploaded successfully from your computer!');
    } catch (err: any) {
      setSaveError(err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  // Upload hero slide image
  const handleSlideImageUpload = async (slideId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    setUploadingSlideImage(slideId);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload');
      setSettingsForm(prev => ({
        ...prev,
        heroSlides: (prev.heroSlides || []).map(s =>
          s.id === slideId ? { ...s, image: data.url } : s
        )
      }));
    } catch (err: any) {
      alert('Slide image upload failed: ' + err.message);
    } finally {
      setUploadingSlideImage(null);
    }
  };

  // Add new hero slide
  const addHeroSlide = () => {
    const newSlide = {
      id: 'slide-' + Date.now(),
      image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=1600&auto=format&fit=crop',
      badge: 'New Arrival',
      title: 'New Hero Slide',
      subtitle: 'Edit this slide in admin settings.',
      ctaText: 'Shop Now',
      category: categoriesList.length > 0 ? categoriesList[0].name : 'Dry Fruits'
    };
    setSettingsForm(prev => ({
      ...prev,
      heroSlides: [...(prev.heroSlides || []), newSlide]
    }));
  };

  // Remove hero slide
  const removeHeroSlide = (slideId: string) => {
    if (!window.confirm('Remove this hero slide?')) return;
    setSettingsForm(prev => ({
      ...prev,
      heroSlides: (prev.heroSlides || []).filter(s => s.id !== slideId)
    }));
  };

  // Save Product (Add or Edit)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setSaveError(null);
    setSaveSuccess(null);

    try {
      const url = isAddMode ? '/api/products' : `/api/products/${editingProduct?.id}`;
      const method = isAddMode ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(productForm)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save product');
      }

      await refreshProducts();
      setSaveSuccess(isAddMode ? 'Product added successfully!' : 'Product updated successfully!');
      setTimeout(() => {
        setEditingProduct(null);
      }, 1000);
    } catch (err: any) {
      setSaveError(err.message);
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    if (!token) return;

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete product');
      await refreshProducts();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Update Order Status
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus as any } : o));
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // Save Store Settings & Banner
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setSavingSettings(true);
    setSaveError(null);
    setSaveSuccess(null);

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(settingsForm)
      });
      if (!res.ok) throw new Error('Failed to update settings');
      await refreshSettings();
      setSaveSuccess('Website settings and hero banner saved successfully!');
    } catch (err: any) {
      setSaveError(err.message);
    } finally {
      setSavingSettings(false);
    }
  };

  // ──── CATEGORY MANAGEMENT ────

  const openAddCategory = () => {
    setEditingCategory(null);
    setCatForm({ name: '', icon: '🌰', description: '' });
    setCatError(null);
    setCatSuccess(null);
    setCatModalOpen(true);
  };

  const openEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setCatForm({ name: cat.name, icon: cat.icon || '🌰', description: cat.description || '' });
    setCatError(null);
    setCatSuccess(null);
    setCatModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setCatSaving(true);
    setCatError(null);
    setCatSuccess(null);
    try {
      const url = editingCategory ? `/api/categories/${editingCategory.id}` : '/api/categories';
      const method = editingCategory ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(catForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save category');
      await refreshCategories();
      setCatSuccess(editingCategory ? 'Category updated!' : 'Category created!');
      setTimeout(() => setCatModalOpen(false), 800);
    } catch (err: any) {
      setCatError(err.message);
    } finally {
      setCatSaving(false);
    }
  };

  const handleDeleteCategory = async (cat: Category) => {
    if (!window.confirm(`Delete category "${cat.name}"? Products in this category must be reassigned first.`)) return;
    if (!token) return;
    try {
      const res = await fetch(`/api/categories/${cat.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete');
      await refreshCategories();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Total Calculations
  const totalRevenue = orders
    .filter(o => o.status === 'Delivered')
    .reduce((acc, o) => acc + o.total, 0);

  const pendingOrdersCount = orders.filter(o => o.status === 'Pending').length;

  // Dynamic category options for product form
  const categoryOptions = categoriesList.length > 0
    ? categoriesList
    : [
        { id: 'dry-fruits', name: 'Dry Fruits', icon: '🌰', description: '' },
        { id: 'organic-products', name: 'Organic Products', icon: '🌿', description: '' }
      ];

  const THEME_OPTIONS = [
    { value: 'amber-gold', label: '🌟 Amber Gold (Default)' },
    { value: 'emerald-green', label: '🌿 Emerald Green' },
    { value: 'royal-burgundy', label: '🍷 Royal Burgundy' },
    { value: 'midnight-gold', label: '🌙 Midnight Navy' },
    { value: 'earth-brown', label: '🪵 Earth Brown' }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-5xl w-full overflow-hidden shadow-2xl border border-stone-300 relative animate-in zoom-in-95 duration-200 min-h-[550px] max-h-[92vh] flex flex-col">
        {/* TOP BAR */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-400/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-base sm:text-lg font-bold">Admin Management Suite</h2>
              <p className="text-[11px] text-stone-400">
                Full dynamic website editing (Products, Categories, Images, COD Orders & Banners)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <button
                onClick={logout}
                className="text-xs text-stone-300 hover:text-red-400 flex items-center gap-1 bg-white/10 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}
            <button
              onClick={closeModal}
              className="p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* AUTH CHECK: IF NOT ADMIN, SHOW LOGIN FORM */}
        {!isAdmin ? (
          <div className="p-8 max-w-md mx-auto w-full flex-1 flex flex-col justify-center">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-3 text-2xl shadow-inner">
                🔒
              </div>
              <h3 className="font-serif text-2xl font-bold text-stone-900">Admin Authentication</h3>
              <p className="text-xs text-stone-500 mt-1">
                Only authenticated administrators can modify products, prices, images, and orders.
              </p>
            </div>

            {loginError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2 mb-4">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Admin Email / Username
                </label>
                <input
                  type="text"
                  required
                  value={adminEmail}
                  onChange={e => setAdminEmail(e.target.value)}
                  placeholder="admin"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Admin Password
                </label>
                <input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={e => setAdminPassword(e.target.value)}
                  placeholder="password"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loggingIn}
                className="w-full py-3 bg-stone-900 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {loggingIn ? 'Authenticating...' : 'Unlock Admin Dashboard'}
              </button>
            </form>
          </div>
        ) : (
          /* LOGGED IN ADMIN SUITE */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* TABS NAVIGATION */}
            <div className="flex border-b border-stone-200 bg-stone-100/70 px-4 sm:px-6 overflow-x-auto gap-2 py-2">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'dashboard'
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'text-stone-600 hover:bg-stone-200'
                }`}
              >
                <span>📊 Dashboard</span>
              </button>

              <button
                onClick={() => setActiveTab('products')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'products'
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'text-stone-600 hover:bg-stone-200'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>Products ({products.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('categories')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'categories'
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'text-stone-600 hover:bg-stone-200'
                }`}
              >
                <Tag className="w-4 h-4" />
                <span>Categories ({categoriesList.length})</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('orders');
                  fetchOrders();
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'orders'
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'text-stone-600 hover:bg-stone-200'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>COD Orders ({orders.length})</span>
                {pendingOrdersCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                )}
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'settings'
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'text-stone-600 hover:bg-stone-200'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Store & Banner</span>
              </button>
            </div>

            {/* TAB CONTENT */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#faf9f6]">

              {/* TAB 1: DASHBOARD */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
                      <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                        Delivered Sales
                      </span>
                      <span className="font-mono text-xl sm:text-2xl font-bold text-stone-900 mt-1 block">
                        Rs. {totalRevenue.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">
                        ✓ Collected via Cash on Delivery
                      </span>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
                      <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                        Total Orders
                      </span>
                      <span className="font-mono text-xl sm:text-2xl font-bold text-stone-900 mt-1 block">
                        {orders.length}
                      </span>
                      <span className="text-[10px] text-amber-600 font-semibold mt-1 block">
                        {pendingOrdersCount} Pending Dispatch
                      </span>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
                      <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                        Live Products
                      </span>
                      <span className="font-mono text-xl sm:text-2xl font-bold text-stone-900 mt-1 block">
                        {products.length}
                      </span>
                      <span className="text-[10px] text-stone-500 mt-1 block">
                        In active catalog
                      </span>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
                      <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                        Categories
                      </span>
                      <span className="font-mono text-xl sm:text-2xl font-bold text-stone-900 mt-1 block">
                        {categoriesList.length}
                      </span>
                      <span
                        className="text-[10px] text-brand-600 font-semibold mt-1 block cursor-pointer hover:underline"
                        onClick={() => setActiveTab('categories')}
                      >
                        Manage Categories →
                      </span>
                    </div>
                  </div>

                  {/* RECENT ORDERS */}
                  <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif text-base font-bold text-stone-900">
                        Recent COD Orders
                      </h3>
                      <button
                        onClick={() => setActiveTab('orders')}
                        className="text-xs font-semibold text-brand-700 hover:underline cursor-pointer"
                      >
                        View All Orders →
                      </button>
                    </div>

                    {orders.length === 0 ? (
                      <p className="text-xs text-stone-400 py-6 text-center">
                        No customer orders yet. Place a test order to see it here.
                      </p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-stone-200 text-stone-500 font-bold uppercase text-[10px]">
                              <th className="pb-2">Order ID</th>
                              <th className="pb-2">Customer</th>
                              <th className="pb-2">City</th>
                              <th className="pb-2">Total</th>
                              <th className="pb-2">Status</th>
                              <th className="pb-2 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-100">
                            {orders.slice(0, 5).map(o => (
                              <tr key={o.id} className="py-2.5">
                                <td className="py-2.5 font-mono font-bold">{o.id}</td>
                                <td>{o.customer.name}</td>
                                <td>{o.customer.city}</td>
                                <td className="font-mono font-bold text-brand-700">Rs. {o.total.toLocaleString()}</td>
                                <td>
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    o.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
                                    o.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                                  }`}>
                                    {o.status}
                                  </span>
                                </td>
                                <td className="text-right">
                                  <select
                                    value={o.status}
                                    onChange={e => handleUpdateOrderStatus(o.id, e.target.value)}
                                    className="bg-stone-50 border border-stone-200 rounded-lg p-1 text-[11px] outline-none"
                                  >
                                    <option value="Pending">Pending</option>
                                    <option value="Confirmed">Confirmed</option>
                                    <option value="Shipped">Shipped</option>
                                    <option value="Delivered">Delivered</option>
                                    <option value="Cancelled">Cancelled</option>
                                  </select>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: PRODUCTS MANAGER */}
              {activeTab === 'products' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-stone-900">
                        Products & Prices Catalog
                      </h3>
                      <p className="text-xs text-stone-500">
                        Change any product name, PKR price, pack weights, categories, or image.
                      </p>
                    </div>

                    <button
                      onClick={openAddProduct}
                      className="px-4 py-2.5 bg-stone-900 hover:bg-brand-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Product</span>
                    </button>
                  </div>

                  {/* PRODUCTS TABLE */}
                  <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase text-[10px]">
                          <tr>
                            <th className="p-3">Product</th>
                            <th className="p-3">Category</th>
                            <th className="p-3">Price (PKR)</th>
                            <th className="p-3">Original Price</th>
                            <th className="p-3">Pack Weight</th>
                            <th className="p-3">Status</th>
                            <th className="p-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                          {products.map(p => (
                            <tr key={p.id} className="hover:bg-stone-50/60 transition-colors">
                              <td className="p-3">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={p.image}
                                    alt={p.name}
                                    className="w-10 h-10 object-cover rounded-lg border border-stone-200 flex-shrink-0"
                                  />
                                  <div>
                                    <span className="font-bold text-stone-900 block">{p.name}</span>
                                    {p.badge && (
                                      <span className="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded">
                                        {p.badge}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>

                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  p.category === 'Organic Products'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {p.category}
                                </span>
                              </td>

                              <td className="p-3 font-mono font-bold text-stone-900">
                                Rs. {p.price.toLocaleString()}
                              </td>

                              <td className="p-3 font-mono text-stone-400 line-through">
                                {p.originalPrice ? `Rs. ${p.originalPrice.toLocaleString()}` : '-'}
                              </td>

                              <td className="p-3 text-stone-600 font-medium">
                                {p.weight}
                              </td>

                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  p.inStock ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {p.inStock ? 'In Stock' : 'Out of Stock'}
                                </span>
                              </td>

                              <td className="p-3 text-right space-x-1">
                                <button
                                  onClick={() => openEditProduct(p)}
                                  className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
                                  title="Edit Product"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(p.id, p.name)}
                                  className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
                                  title="Delete Product"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: CATEGORIES MANAGER */}
              {activeTab === 'categories' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-stone-900">
                        Category Management
                      </h3>
                      <p className="text-xs text-stone-500">
                        Add, edit or delete product categories. Categories appear live on the store immediately.
                      </p>
                    </div>
                    <button
                      onClick={openAddCategory}
                      className="px-4 py-2.5 bg-stone-900 hover:bg-brand-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ New Category</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {categoriesList.map(cat => {
                      const assignedCount = products.filter(
                        p => p.category.toLowerCase() === cat.name.toLowerCase()
                      ).length;
                      return (
                        <div key={cat.id} className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{cat.icon || '🌰'}</span>
                            <div>
                              <div className="font-bold text-stone-900 text-sm">{cat.name}</div>
                              {cat.description && (
                                <div className="text-[11px] text-stone-500 mt-0.5 line-clamp-1">{cat.description}</div>
                              )}
                              <div className="text-[10px] text-amber-700 font-semibold mt-0.5">
                                {assignedCount} product{assignedCount !== 1 ? 's' : ''}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <button
                              onClick={() => openEditCategory(cat)}
                              className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(cat)}
                              className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    {categoriesList.length === 0 && (
                      <div className="col-span-2 bg-white rounded-2xl p-10 text-center border border-dashed border-stone-300">
                        <p className="text-stone-400 text-xs">No categories found. Click "+ New Category" to add one.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: ORDERS MANAGER */}
              {activeTab === 'orders' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-stone-900">
                        Customer Cash on Delivery (COD) Orders
                      </h3>
                      <p className="text-xs text-stone-500">
                        Manage statuses, check customer addresses & confirm dispatch via WhatsApp.
                      </p>
                    </div>

                    <button
                      onClick={fetchOrders}
                      className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Refresh</span>
                    </button>
                  </div>

                  {orders.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-stone-200">
                      <p className="text-stone-400 text-xs">No orders recorded yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {orders.map(order => (
                        <div key={order.id} className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-sm space-y-3">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-stone-100 pb-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-stone-900 text-sm">{order.id}</span>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
                                  order.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {order.status}
                                </span>
                              </div>
                              <span className="text-[11px] text-stone-400">
                                Booked: {new Date(order.createdAt).toLocaleString('en-PK')}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <select
                                value={order.status}
                                onChange={e => handleUpdateOrderStatus(order.id, e.target.value)}
                                className="px-2.5 py-1.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold outline-none"
                              >
                                <option value="Pending">Pending</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>

                              <a
                                href={`https://wa.me/${order.customer.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Assalam-o-Alaikum ${order.customer.name}! Regarding your order ${order.id} on ${settings.storeName}...`)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1"
                              >
                                <Phone className="w-3.5 h-3.5" />
                                <span>WhatsApp</span>
                              </a>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div className="space-y-1 text-stone-600 bg-stone-50 p-3 rounded-xl">
                              <div className="font-bold text-stone-900">{order.customer.name}</div>
                              <div className="flex items-center gap-1 font-mono">
                                <Phone className="w-3 h-3 text-stone-400" />
                                {order.customer.phone}
                              </div>
                              <div className="flex items-start gap-1">
                                <MapPin className="w-3 h-3 text-stone-400 mt-0.5 flex-shrink-0" />
                                <span>{order.customer.address}, {order.customer.city}</span>
                              </div>
                              {order.customer.notes && (
                                <div className="text-[11px] text-amber-800 italic pt-1">
                                  Notes: "{order.customer.notes}"
                                </div>
                              )}
                            </div>

                            <div className="space-y-1.5 bg-stone-50 p-3 rounded-xl">
                              <span className="font-bold text-stone-900 block mb-1">Items Ordered:</span>
                              {order.items.map((it, idx) => (
                                <div key={idx} className="flex justify-between text-[11px] text-stone-700">
                                  <span>{it.name} ({it.weight}) × {it.quantity}</span>
                                  <span className="font-mono font-semibold">Rs. {(it.price * it.quantity).toLocaleString()}</span>
                                </div>
                              ))}
                              <div className="pt-1.5 border-t border-stone-200 flex justify-between font-bold text-stone-900">
                                <span>Total Payable (COD):</span>
                                <span className="font-mono text-brand-700">Rs. {order.total.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: STORE SETTINGS & HERO BANNER */}
              {activeTab === 'settings' && (
                <form onSubmit={handleSaveSettings} className="space-y-6 max-w-3xl">
                  {saveSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      <span>{saveSuccess}</span>
                    </div>
                  )}
                  {saveError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      <span>{saveError}</span>
                    </div>
                  )}

                  {/* GENERAL SETTINGS */}
                  <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-4">
                    <h3 className="font-serif text-base font-bold text-stone-900 border-b border-stone-100 pb-2">
                      General Store Information
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">Store Brand Name</label>
                        <input
                          type="text"
                          value={settingsForm.storeName}
                          onChange={e => setSettingsForm({ ...settingsForm, storeName: e.target.value })}
                          className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">Tagline / Slogan</label>
                        <input
                          type="text"
                          value={settingsForm.tagline}
                          onChange={e => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                          className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">WhatsApp Number</label>
                        <input
                          type="text"
                          value={settingsForm.whatsapp}
                          onChange={e => setSettingsForm({ ...settingsForm, whatsapp: e.target.value })}
                          className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">Phone Number</label>
                        <input
                          type="text"
                          value={settingsForm.phone}
                          onChange={e => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                          className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">Business Email</label>
                        <input
                          type="email"
                          value={settingsForm.email}
                          onChange={e => setSettingsForm({ ...settingsForm, email: e.target.value })}
                          className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">Business Address</label>
                        <input
                          type="text"
                          value={settingsForm.address}
                          onChange={e => setSettingsForm({ ...settingsForm, address: e.target.value })}
                          className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">Business Description (Footer / About)</label>
                      <textarea
                        rows={2}
                        value={settingsForm.description || ''}
                        onChange={e => setSettingsForm({ ...settingsForm, description: e.target.value })}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">Delivery Fee (PKR)</label>
                        <input
                          type="number"
                          value={settingsForm.deliveryFee}
                          onChange={e => setSettingsForm({ ...settingsForm, deliveryFee: Number(e.target.value) })}
                          className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">Free Delivery Threshold (PKR)</label>
                        <input
                          type="number"
                          value={settingsForm.freeDeliveryAbove}
                          onChange={e => setSettingsForm({ ...settingsForm, freeDeliveryAbove: Number(e.target.value) })}
                          className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">Top Announcement Bar</label>
                      <input
                        type="text"
                        value={settingsForm.announcement}
                        onChange={e => setSettingsForm({ ...settingsForm, announcement: e.target.value })}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none"
                      />
                    </div>
                  </div>

                  {/* SOCIAL MEDIA & BRANDING */}
                  <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-4">
                    <h3 className="font-serif text-base font-bold text-stone-900 border-b border-stone-100 pb-2">
                      Social Media & Branding
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">Facebook URL</label>
                        <input
                          type="url"
                          placeholder="https://facebook.com/yourpage"
                          value={settingsForm.facebook || ''}
                          onChange={e => setSettingsForm({ ...settingsForm, facebook: e.target.value })}
                          className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">Instagram URL</label>
                        <input
                          type="url"
                          placeholder="https://instagram.com/yourhandle"
                          value={settingsForm.instagram || ''}
                          onChange={e => setSettingsForm({ ...settingsForm, instagram: e.target.value })}
                          className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">TikTok URL</label>
                        <input
                          type="url"
                          placeholder="https://tiktok.com/@yourhandle"
                          value={settingsForm.tiktok || ''}
                          onChange={e => setSettingsForm({ ...settingsForm, tiktok: e.target.value })}
                          className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">YouTube URL</label>
                        <input
                          type="url"
                          placeholder="https://youtube.com/yourchannel"
                          value={settingsForm.youtube || ''}
                          onChange={e => setSettingsForm({ ...settingsForm, youtube: e.target.value })}
                          className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">Logo Image URL</label>
                        <input
                          type="url"
                          placeholder="https://... or /uploads/logo.png"
                          value={settingsForm.logo || ''}
                          onChange={e => setSettingsForm({ ...settingsForm, logo: e.target.value })}
                          className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">Favicon URL</label>
                        <input
                          type="url"
                          placeholder="https://... or /uploads/favicon.png"
                          value={settingsForm.favicon || ''}
                          onChange={e => setSettingsForm({ ...settingsForm, favicon: e.target.value })}
                          className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none"
                        />
                      </div>
                    </div>
                    <p className="text-[10px] text-stone-400">Save settings to persist all branding and social links. Social icons will appear in the website footer.</p>
                  </div>

                  {/* THEME SELECTOR */}
                  <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-3">
                    <h3 className="font-serif text-base font-bold text-stone-900 border-b border-stone-100 pb-2">
                      Website Theme Color
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {THEME_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setSettingsForm({ ...settingsForm, theme: opt.value })}
                          className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                            settingsForm.theme === opt.value
                              ? 'bg-stone-900 text-white border-stone-900'
                              : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-stone-400">Save settings to apply the selected theme across the website.</p>
                  </div>

                  {/* HERO SLIDES MANAGER */}
                  <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                      <h3 className="font-serif text-base font-bold text-stone-900">
                        Hero Slideshow Manager
                      </h3>
                      <button
                        type="button"
                        onClick={addHeroSlide}
                        className="px-3 py-1.5 bg-stone-900 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Slide</span>
                      </button>
                    </div>

                    <p className="text-[11px] text-stone-500">
                      Upload images from your computer or paste external URLs. Each slide rotates left to right automatically.
                    </p>

                    <div className="space-y-4">
                      {(settingsForm.heroSlides || []).map((slide, idx) => (
                        <div key={slide.id} className="border border-stone-200 rounded-2xl p-4 bg-stone-50 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                              Slide {idx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeHeroSlide(slide.id)}
                              className="p-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* SLIDE IMAGE */}
                          <div className="flex items-center gap-3">
                            <img
                              src={slide.image}
                              alt={`Slide ${idx + 1}`}
                              className="w-20 h-12 object-cover rounded-lg border border-stone-300 flex-shrink-0"
                              onError={e => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x120'; }}
                            />
                            <div className="flex-1 space-y-1.5">
                              <label className="px-3 py-1.5 bg-white border border-stone-300 hover:bg-stone-100 rounded-lg text-xs font-semibold text-stone-700 flex items-center gap-1.5 cursor-pointer w-fit shadow-sm">
                                <ImageIcon className="w-3.5 h-3.5" />
                                <span>{uploadingSlideImage === slide.id ? 'Uploading...' : 'Upload from Computer'}</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handleSlideImageUpload(slide.id, e)}
                                  disabled={uploadingSlideImage === slide.id}
                                />
                              </label>
                              <input
                                type="text"
                                value={slide.image}
                                onChange={e => setSettingsForm(prev => ({
                                  ...prev,
                                  heroSlides: (prev.heroSlides || []).map(s =>
                                    s.id === slide.id ? { ...s, image: e.target.value } : s
                                  )
                                }))}
                                placeholder="Or paste image URL"
                                className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-xs focus:outline-none"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={slide.badge || ''}
                              onChange={e => setSettingsForm(prev => ({
                                ...prev,
                                heroSlides: (prev.heroSlides || []).map(s =>
                                  s.id === slide.id ? { ...s, badge: e.target.value } : s
                                )
                              }))}
                              placeholder="Badge (e.g. Fresh Harvest 2026)"
                              className="px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-xs focus:outline-none"
                            />
                            <input
                              type="text"
                              value={slide.ctaText || ''}
                              onChange={e => setSettingsForm(prev => ({
                                ...prev,
                                heroSlides: (prev.heroSlides || []).map(s =>
                                  s.id === slide.id ? { ...s, ctaText: e.target.value } : s
                                )
                              }))}
                              placeholder="Button Text (e.g. Shop Now)"
                              className="px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-xs focus:outline-none"
                            />
                          </div>

                          <input
                            type="text"
                            value={slide.title}
                            onChange={e => setSettingsForm(prev => ({
                              ...prev,
                              heroSlides: (prev.heroSlides || []).map(s =>
                                s.id === slide.id ? { ...s, title: e.target.value } : s
                              )
                            }))}
                            placeholder="Slide Headline"
                            className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-xs focus:outline-none font-semibold"
                          />
                          <textarea
                            rows={2}
                            value={slide.subtitle}
                            onChange={e => setSettingsForm(prev => ({
                              ...prev,
                              heroSlides: (prev.heroSlides || []).map(s =>
                                s.id === slide.id ? { ...s, subtitle: e.target.value } : s
                              )
                            }))}
                            placeholder="Slide Description"
                            className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-xs focus:outline-none resize-none"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="px-6 py-3 bg-stone-900 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    {savingSettings ? 'Saving Settings...' : '💾 Save All Website Settings'}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* MODAL: EDIT OR ADD PRODUCT */}
        {editingProduct && (
          <div className="fixed inset-0 z-[60] bg-stone-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-stone-200 max-h-[90vh] flex flex-col animate-in zoom-in-95">
              <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
                <h3 className="font-serif text-base font-bold text-stone-900">
                  {isAddMode ? 'Add New Product' : `Edit: ${editingProduct.name}`}
                </h3>
                <button
                  onClick={() => setEditingProduct(null)}
                  className="p-1 rounded-full text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="p-6 overflow-y-auto space-y-4 flex-1">
                {saveSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>{saveSuccess}</span>
                  </div>
                )}
                {saveError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>{saveError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={productForm.name}
                      onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Category *
                    </label>
                    <select
                      value={productForm.category}
                      onChange={e => setProductForm({ ...productForm, category: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 outline-none"
                    >
                      {categoryOptions.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.icon || ''} {cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Base Price (PKR) *
                    </label>
                    <input
                      type="number"
                      required
                      value={productForm.price}
                      onChange={e => setProductForm({ ...productForm, price: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Original / Strike Price (PKR)
                    </label>
                    <input
                      type="number"
                      value={productForm.originalPrice}
                      onChange={e => setProductForm({ ...productForm, originalPrice: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Default Pack Weight
                    </label>
                    <input
                      type="text"
                      value={productForm.weight}
                      onChange={e => setProductForm({ ...productForm, weight: e.target.value })}
                      placeholder="e.g. 1 kg"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 outline-none"
                    />
                  </div>
                </div>

                {/* IMAGE UPLOAD */}
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Product Image (Upload from PC or Paste URL)
                  </label>

                  <div className="flex items-center gap-4">
                    <img
                      src={productForm.image || 'https://via.placeholder.com/150'}
                      alt="Preview"
                      className="w-16 h-16 object-cover rounded-xl border border-stone-300 bg-white"
                      onError={e => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150'; }}
                    />

                    <div className="flex-1 space-y-2">
                      <label className="px-3.5 py-1.5 bg-white border border-stone-300 hover:bg-stone-100 rounded-xl text-xs font-semibold text-stone-700 flex items-center gap-1.5 cursor-pointer shadow-sm w-fit">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{uploadingImage ? 'Uploading...' : 'Upload Image from Computer'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={uploadingImage}
                        />
                      </label>

                      <input
                        type="text"
                        value={productForm.image}
                        onChange={e => setProductForm({ ...productForm, image: e.target.value })}
                        placeholder="Or paste external image URL (e.g. https://...)"
                        className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Badge Text (e.g. Best Seller, Pure)
                    </label>
                    <input
                      type="text"
                      value={productForm.badge}
                      onChange={e => setProductForm({ ...productForm, badge: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-4 pt-6">
                    <label className="flex items-center gap-2 text-xs font-bold text-stone-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={productForm.inStock}
                        onChange={e => setProductForm({ ...productForm, inStock: e.target.checked })}
                        className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
                      />
                      <span>Item In Stock</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Description & Health Benefits
                  </label>
                  <textarea
                    rows={3}
                    value={productForm.description}
                    onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>

                {/* WEIGHT TIERS */}
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                      Weight & Price Tiers
                    </label>
                    <button
                      type="button"
                      onClick={() => setProductForm(prev => ({
                        ...prev,
                        weights: [...prev.weights, { label: '', price: 0 }]
                      }))}
                      className="text-xs text-stone-700 bg-white border border-stone-200 px-2 py-1 rounded-lg flex items-center gap-1 cursor-pointer hover:bg-stone-100"
                    >
                      <Plus className="w-3 h-3" /> Add Tier
                    </button>
                  </div>
                  <div className="space-y-2">
                    {productForm.weights.map((w, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Label (e.g. 500g)"
                          value={w.label}
                          onChange={e => {
                            const updated = [...productForm.weights];
                            updated[i] = { ...updated[i], label: e.target.value };
                            setProductForm({ ...productForm, weights: updated });
                          }}
                          className="flex-1 px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-xs focus:outline-none"
                        />
                        <input
                          type="number"
                          placeholder="Price (PKR)"
                          value={w.price}
                          onChange={e => {
                            const updated = [...productForm.weights];
                            updated[i] = { ...updated[i], price: Number(e.target.value) };
                            setProductForm({ ...productForm, weights: updated });
                          }}
                          className="flex-1 px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-xs focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setProductForm(prev => ({
                            ...prev,
                            weights: prev.weights.filter((_, j) => j !== i)
                          }))}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* GEMSTONE SPECIFICATIONS (OPTION C - PER PIECE / PER CARAT MIX) */}
                {productForm.category.toLowerCase().includes('gem') && (
                  <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80 space-y-3">
                    <div className="flex items-center gap-2 border-b border-amber-200/60 pb-2">
                      <span className="text-base">💎</span>
                      <div>
                        <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                          Gemstone Details (Option C: Per Piece / Per Carat)
                        </h4>
                        <p className="text-[10px] text-amber-700">
                          Configure carat weight, pricing model, cut, clarity, and certification.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                          Selling Type
                        </label>
                        <select
                          value={productForm.sellingType}
                          onChange={e => {
                            const newType = e.target.value as 'per_piece' | 'per_carat' | 'both';
                            let newPrice = productForm.price;
                            if (newType === 'per_carat' && productForm.carat && productForm.pricePerCarat) {
                              newPrice = Math.round(productForm.carat * productForm.pricePerCarat);
                            }
                            setProductForm({ ...productForm, sellingType: newType, price: newPrice });
                          }}
                          className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-xs font-semibold focus:outline-none"
                        >
                          <option value="per_piece">Per Piece (Fixed Price)</option>
                          <option value="per_carat">Per Carat (Carat × Rate)</option>
                          <option value="both">Both (Piece & Carat Info)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                          Weight / Carats (ct)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="e.g. 3.50"
                          value={productForm.carat || ''}
                          onChange={e => {
                            const ct = Number(e.target.value);
                            let newPrice = productForm.price;
                            if (productForm.sellingType === 'per_carat' && ct && productForm.pricePerCarat) {
                              newPrice = Math.round(ct * productForm.pricePerCarat);
                            }
                            setProductForm({ ...productForm, carat: ct, price: newPrice, weight: `${ct} ct` });
                          }}
                          className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-xs focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                          Price Per Carat (PKR)
                        </label>
                        <input
                          type="number"
                          placeholder="e.g. 5000"
                          value={productForm.pricePerCarat || ''}
                          onChange={e => {
                            const ppc = Number(e.target.value);
                            let newPrice = productForm.price;
                            if (productForm.sellingType === 'per_carat' && productForm.carat && ppc) {
                              newPrice = Math.round(productForm.carat * ppc);
                            }
                            setProductForm({ ...productForm, pricePerCarat: ppc, price: newPrice });
                          }}
                          className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-xs focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                          Origin / Source
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Skardu, Shigar Valley"
                          value={productForm.origin}
                          onChange={e => setProductForm({ ...productForm, origin: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-xs focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                          Color & Cut
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Color (e.g. Royal Blue)"
                            value={productForm.color}
                            onChange={e => setProductForm({ ...productForm, color: e.target.value })}
                            className="w-1/2 px-2 py-1.5 bg-white border border-stone-200 rounded-lg text-xs focus:outline-none"
                          />
                          <input
                            type="text"
                            placeholder="Cut (e.g. Oval)"
                            value={productForm.cut}
                            onChange={e => setProductForm({ ...productForm, cut: e.target.value })}
                            className="w-1/2 px-2 py-1.5 bg-white border border-stone-200 rounded-lg text-xs focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                          Clarity & Treatment
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Clarity (e.g. Eye Clean)"
                            value={productForm.clarity}
                            onChange={e => setProductForm({ ...productForm, clarity: e.target.value })}
                            className="w-1/2 px-2 py-1.5 bg-white border border-stone-200 rounded-lg text-xs focus:outline-none"
                          />
                          <input
                            type="text"
                            placeholder="Treatment"
                            value={productForm.treatment}
                            onChange={e => setProductForm({ ...productForm, treatment: e.target.value })}
                            className="w-1/2 px-2 py-1.5 bg-white border border-stone-200 rounded-lg text-xs focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                          Certification Lab / Authority
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. GIA / Gemological Institute of Pakistan"
                          value={productForm.certification}
                          onChange={e => setProductForm({ ...productForm, certification: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-xs focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center gap-3 pt-5">
                        <label className="flex items-center gap-2 text-xs font-bold text-stone-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={productForm.isCertified}
                            onChange={e => setProductForm({ ...productForm, isCertified: e.target.checked })}
                            className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                          />
                          <span>Certified Natural Gemstone</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-stone-200 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-stone-900 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
                  >
                    {isAddMode ? 'Add Product' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: ADD/EDIT CATEGORY */}
        {catModalOpen && (
          <div className="fixed inset-0 z-[60] bg-stone-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-stone-200 animate-in zoom-in-95">
              <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
                <h3 className="font-serif text-base font-bold text-stone-900">
                  {editingCategory ? `Edit: ${editingCategory.name}` : 'New Category'}
                </h3>
                <button onClick={() => setCatModalOpen(false)} className="p-1 rounded-full text-stone-400 hover:text-stone-700 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveCategory} className="p-5 space-y-4">
                {catError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>{catError}</span>
                  </div>
                )}
                {catSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>{catSuccess}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={catForm.name}
                    onChange={e => setCatForm({ ...catForm, name: e.target.value })}
                    placeholder="e.g. Dry Fruits"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Emoji Icon
                  </label>
                  <input
                    type="text"
                    value={catForm.icon}
                    onChange={e => setCatForm({ ...catForm, icon: e.target.value })}
                    placeholder="e.g. 🌰"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Description (optional)
                  </label>
                  <input
                    type="text"
                    value={catForm.description}
                    onChange={e => setCatForm({ ...catForm, description: e.target.value })}
                    placeholder="Brief description of this category"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setCatModalOpen(false)}
                    className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={catSaving}
                    className="px-5 py-2 bg-stone-900 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {catSaving ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
