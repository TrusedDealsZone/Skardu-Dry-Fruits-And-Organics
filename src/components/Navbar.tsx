import React, { useState } from 'react';
import { ShoppingBag, Heart, Search, User, ShieldCheck, Truck, Phone, Menu, X, LogOut, Package } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const {
    settings,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    cartItemsCount,
    cartSubtotal,
    wishlist,
    openModal
  } = useStore();

  const { user, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-sm border-b border-stone-200">
      {/* TOP ANNOUNCEMENT BAR */}
      <div className="bg-gradient-to-r from-stone-900 via-brand-900 to-stone-900 text-brand-100 text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-1.5 text-center sm:text-left">
          <p className="font-medium tracking-wide flex items-center justify-center gap-1.5">
            <span>✨</span> {settings.announcement}
          </p>
          <div className="flex items-center gap-4 text-[11px] text-brand-200">
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3 text-brand-400" />
              WhatsApp: {settings.whatsapp}
            </span>
            <span className="hidden md:inline-block">|</span>
            <button
              onClick={() => openModal('tracking')}
              className="hover:text-white underline underline-offset-2 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Truck className="w-3 h-3 text-brand-400" />
              Track Your Order
            </button>
          </div>
        </div>
      </div>

      {/* MAIN NAVIGATION */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* LOGO & BRAND */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="flex items-center gap-2.5 text-left group cursor-pointer"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-500 to-amber-700 flex items-center justify-center text-white text-2xl shadow-md group-hover:scale-105 transition-transform">
                <h1>SDF</h1>
              </div>
              <div>
                <span className="font-serif text-2xl font-bold tracking-tight text-stone-900 block leading-tight">
                  {settings.storeName}
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-brand-600 block">
                  Pure Dryfruits & Organic
                </span>
              </div>
            </button>
          </div>

          {/* SEARCH BAR (DESKTOP) */}
          <div className="hidden lg:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search Almonds, Honey, Pistachios, Salajeet..."
                className="w-full pl-10 pr-4 py-2.5 bg-stone-100/80 border border-stone-200 rounded-full text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* RIGHT ACTION BUTTONS */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* CUSTOMER ACCOUNT */}
            <div className="relative">
              <button
                onClick={() => {
                  if (user) {
                    setUserMenuOpen(!userMenuOpen);
                  } else {
                    openModal('auth');
                  }
                }}
                className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-lg text-stone-700 hover:bg-stone-100 transition-colors text-xs font-medium cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-600">
                  <User className="w-4 h-4" />
                </div>
                <div className="hidden md:block text-left">
                  <span className="text-[10px] text-stone-400 block leading-tight">Welcome</span>
                  <span className="font-semibold text-stone-800 truncate max-w-[90px] block">
                    {user ? user.name.split(' ')[0] : 'Sign In'}
                  </span>
                </div>
              </button>

              {/* USER DROPDOWN */}
              {userMenuOpen && user && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-stone-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 border-b border-stone-100">
                    <p className="text-xs font-bold text-stone-900 truncate">{user.name}</p>
                    <p className="text-[11px] text-stone-500 truncate">{user.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 capitalize">
                      {user.role}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      openModal('tracking');
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2 cursor-pointer"
                  >
                    <Package className="w-4 h-4 text-stone-400" />
                    My COD Orders
                  </button>

                  <button
                    onClick={() => {
                      logout();
                      setUserMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer border-t border-stone-100"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>

            {/* WISHLIST */}
            <button
              onClick={() => {
                if (wishlist.length === 0) {
                  alert('Your wishlist is currently empty. Tap the heart on any product to save it!');
                } else {
                  setSelectedCategory('Wishlist');
                }
              }}
              className="relative p-2.5 rounded-full text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
              title="Saved items"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* CART DRAWER BUTTON */}
            <button
              onClick={() => openModal('cart')}
              className="flex items-center gap-2 bg-stone-900 hover:bg-brand-700 text-white px-3 sm:px-4 py-2 rounded-full text-xs font-semibold shadow-md transition-all group cursor-pointer"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-brand-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-stone-900">
                    {cartItemsCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline font-mono">
                Rs. {cartSubtotal.toLocaleString()}
              </span>
            </button>

            {/* MOBILE MENU TOGGLE */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-stone-700 hover:bg-stone-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* SEARCH BAR (MOBILE) */}
        <div className="lg:hidden pb-3">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search Dry Fruits, Pure Honey, Salajeet..."
              className="w-full pl-10 pr-4 py-2 bg-stone-100 border border-stone-200 rounded-full text-xs placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-200 bg-white px-4 py-3 space-y-2">
          <div className="flex gap-2">
            <button
              onClick={() => {
                setSelectedCategory('All');
                setMobileMenuOpen(false);
              }}
              className={`flex-1 py-2 text-center text-xs font-semibold rounded-lg ${
                selectedCategory === 'All' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700'
              }`}
            >
              All Items
            </button>
            <button
              onClick={() => {
                setSelectedCategory('Dry Fruits');
                setMobileMenuOpen(false);
              }}
              className={`flex-1 py-2 text-center text-xs font-semibold rounded-lg ${
                selectedCategory === 'Dry Fruits' ? 'bg-amber-700 text-white' : 'bg-stone-100 text-stone-700'
              }`}
            >
              🌰 Dry Fruits
            </button>
            <button
              onClick={() => {
                setSelectedCategory('Organic Products');
                setMobileMenuOpen(false);
              }}
              className={`flex-1 py-2 text-center text-xs font-semibold rounded-lg ${
                selectedCategory === 'Organic Products' ? 'bg-emerald-700 text-white' : 'bg-stone-100 text-stone-700'
              }`}
            >
              🌿 Organic
            </button>
          </div>

          <div className="pt-2 border-t border-stone-100 flex justify-center text-xs text-stone-600">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openModal('tracking');
              }}
              className="flex items-center gap-1 font-medium hover:text-stone-900"
            >
              <Truck className="w-4 h-4 text-brand-600" /> Track Your Order
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
