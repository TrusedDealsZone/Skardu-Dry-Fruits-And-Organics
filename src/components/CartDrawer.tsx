import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Truck } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    closeModal,
    updateCartQty,
    removeFromCart,
    cartSubtotal,
    deliveryFee,
    cartTotal,
    settings,
    openModal
  } = useStore();

  const freeDeliveryRemaining = Math.max(0, settings.freeDeliveryAbove - cartSubtotal);
  const freeDeliveryProgress = Math.min(100, Math.round((cartSubtotal / settings.freeDeliveryAbove) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          {/* DRAWER HEADER */}
          <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-brand-600" />
              <h2 className="font-serif text-lg font-bold text-stone-900">Your Shopping Cart</h2>
              <span className="text-xs bg-brand-100 text-brand-800 font-bold px-2 py-0.5 rounded-full">
                {cart.length} items
              </span>
            </div>
            <button
              onClick={closeModal}
              className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* FREE DELIVERY PROGRESS BAR */}
          <div className="bg-amber-50/70 p-3.5 border-b border-amber-100 text-xs text-amber-900">
            <div className="flex items-center justify-between font-semibold mb-1.5">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-amber-600" />
                {freeDeliveryRemaining === 0
                  ? '🎉 You unlocked FREE Nationwide Delivery!'
                  : `Add Rs. ${freeDeliveryRemaining.toLocaleString()} more for FREE Delivery!`}
              </span>
              <span>{freeDeliveryProgress}%</span>
            </div>
            <div className="w-full bg-amber-200/80 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-amber-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${freeDeliveryProgress}%` }}
              />
            </div>
          </div>

          {/* CART ITEMS LIST */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 divide-y divide-stone-100">
            {cart.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-3xl mb-3">
                  🛒
                </div>
                <h3 className="font-semibold text-stone-800 text-base mb-1">Your cart is empty</h3>
                <p className="text-stone-400 text-xs max-w-xs mx-auto mb-6">
                  Explore our premium nuts, fresh dry fruits, and pure organic honey range.
                </p>
                <button
                  onClick={closeModal}
                  className="px-6 py-2.5 bg-stone-900 text-white rounded-full text-xs font-semibold hover:bg-brand-600 transition-colors"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cart.map((item, idx) => (
                <div key={`${item.product.id}-${item.selectedWeight}-${idx}`} className="pt-4 first:pt-0 flex gap-3.5 items-start">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded-xl border border-stone-200 bg-stone-50 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-stone-900 truncate">{item.product.name}</h4>
                    <p className="text-[11px] text-stone-500 font-medium">Pack: {item.selectedWeight}</p>
                    <div className="flex items-center justify-between mt-2">
                      {/* QTY CONTROLS */}
                      <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden bg-stone-50">
                        <button
                          onClick={() => updateCartQty(item.product.id, item.selectedWeight, -1)}
                          className="px-2 py-0.5 text-stone-500 hover:bg-stone-200 text-xs"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 py-0.5 text-xs font-bold text-stone-800 font-mono">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQty(item.product.id, item.selectedWeight, 1)}
                          className="px-2 py-0.5 text-stone-500 hover:bg-stone-200 text-xs"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-xs font-bold text-stone-900 font-mono">
                        Rs. {(item.unitPrice * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.product.id, item.selectedWeight)}
                    className="p-1 text-stone-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* DRAWER FOOTER & CHECKOUT */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-stone-200 bg-stone-50 space-y-3">
              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-mono font-semibold text-stone-900">
                    Rs. {cartSubtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1">
                    Delivery Fee:
                    {deliveryFee === 0 && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                        FREE
                      </span>
                    )}
                  </span>
                  <span className="font-mono font-semibold text-stone-900">
                    {deliveryFee === 0 ? 'Rs. 0' : `Rs. ${deliveryFee.toLocaleString()}`}
                  </span>
                </div>
                <div className="pt-2 border-t border-stone-200 flex justify-between text-sm font-bold text-stone-900">
                  <span>Grand Total:</span>
                  <span className="font-mono text-base text-brand-700">
                    Rs. {cartTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* PAYMENT MODE NOTICE */}
              <div className="bg-white border border-stone-200 rounded-xl p-2.5 text-center text-[11px] text-stone-600 flex items-center justify-center gap-1.5 font-medium">
                <span>💵</span> Payment Method: <strong className="text-stone-900">Cash on Delivery (COD)</strong>
              </div>

              {/* CHECKOUT BUTTON */}
              <button
                onClick={() => {
                  closeModal();
                  openModal('checkout');
                }}
                className="w-full py-3.5 bg-stone-900 hover:bg-brand-600 text-white font-semibold text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
