import React from 'react';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { CategoryFilter } from './components/CategoryFilter';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { AuthModal } from './components/AuthModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { AdminPanel } from './components/admin/AdminPanel';
import { Footer } from './components/Footer';
import { useStore } from './context/StoreContext';
import { MessageCircle, ShoppingBag, ShieldCheck } from 'lucide-react';

export const App: React.FC = () => {
  const {
    products,
    selectedCategory,
    searchQuery,
    wishlist,
    activeModal,
    openModal,
    settings,
    loading
  } = useStore();

  // Filter products based on Category, Search Query, or Wishlist
  const filteredProducts = products.filter(product => {
    // Wishlist filter
    if (selectedCategory === 'Wishlist') {
      return wishlist.includes(product.id);
    }

    // Category filter
    if (selectedCategory !== 'All' && product.category.toLowerCase() !== selectedCategory.toLowerCase()) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        product.name.toLowerCase().includes(q) ||
        product.description.toLowerCase().includes(q) ||
        product.category.toLowerCase().includes(q)
      );
    }

    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5]">
      {/* NAVBAR */}
      <Navbar />

      {/* HERO SECTION */}
      {selectedCategory !== 'Wishlist' && !searchQuery && <HeroBanner />}

      {/* MAIN STORE CONTENT */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CategoryFilter />

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-xs text-stone-500 font-medium">Loading pure harvest items...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-stone-200/80 p-8">
            <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-3xl mb-4">
              🔍
            </div>
            <h3 className="font-serif text-xl font-bold text-stone-900 mb-2">
              No products found
            </h3>
            <p className="text-stone-500 text-xs max-w-sm mx-auto mb-6">
              {selectedCategory === 'Wishlist'
                ? 'You have not added any products to your wishlist yet.'
                : 'Try clearing your search or browsing another category.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      {/* FLOATING WHATSAPP BUTTON */}
      <div className="fixed bottom-6 right-6 z-40">
        {/* DIRECT WHATSAPP BUTTON */}
        <a
          href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Assalam-o-Alaikum! I have an inquiry about ${settings.storeName}...`)}`}
          target="_blank"
          rel="noreferrer"
          className="w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl flex items-center justify-center transition-transform hover:scale-105 cursor-pointer"
          title="Direct WhatsApp Inquiry"
        >
          <MessageCircle className="w-7 h-7" />
        </a>
      </div>

      {/* MODALS RENDERER */}
      {activeModal?.type === 'product' && <ProductModal product={activeModal.data} />}
      {activeModal?.type === 'cart' && <CartDrawer />}
      {activeModal?.type === 'checkout' && <CheckoutModal />}
      {activeModal?.type === 'auth' && <AuthModal />}
      {activeModal?.type === 'tracking' && <OrderTrackingModal />}
      {activeModal?.type === 'admin' && <AdminPanel />}

      {/* FOOTER */}
      <Footer />
    </div>
  );
};

export default App;
