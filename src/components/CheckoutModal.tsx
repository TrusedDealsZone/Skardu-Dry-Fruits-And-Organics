import React, { useState } from 'react';
import { X, CheckCircle, Truck, ShoppingBag, Phone, MapPin, AlertCircle, MessageCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { Order } from '../types';

export const CheckoutModal: React.FC = () => {
  const { cart, cartSubtotal, deliveryFee, cartTotal, closeModal, clearCart, settings, openModal } = useStore();
  const { user } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [city, setCity] = useState('Karachi');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  const PAKISTANI_CITIES = [
    'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad',
    'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala',
    'Hyderabad', 'Abbottabad', 'Gilgit', 'Skardu', 'Other City'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !phone.trim() || !address.trim()) {
      setError('Please provide your Full Name, Phone Number, and Complete Address.');
      return;
    }

    if (cart.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        customerName: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        city,
        notes: notes.trim(),
        items: cart.map(item => ({
          id: item.product.id,
          name: item.product.name,
          weight: item.selectedWeight,
          price: item.unitPrice,
          quantity: item.quantity,
          image: item.product.image
        })),
        subtotal: cartSubtotal,
        deliveryFee,
        total: cartTotal,
        userId: user?.id || null
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to place order.');
      }

      setPlacedOrder(data.order);
      clearCart();
    } catch (err: any) {
      setError(err.message || 'Something went wrong while placing your order.');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppConfirm = () => {
    if (!placedOrder) return;
    const text = encodeURIComponent(
      `Assalam-o-Alaikum! I have placed an order on ${settings.storeName}.\n` +
      `Order ID: ${placedOrder.id}\n` +
      `Customer: ${placedOrder.customer.name}\n` +
      `Phone: ${placedOrder.customer.phone}\n` +
      `Address: ${placedOrder.customer.address}, ${placedOrder.customer.city}\n` +
      `Total Amount: Rs. ${placedOrder.total.toLocaleString()} (Cash on Delivery)\n` +
      `Please confirm my dispatch!`
    );
    window.open(`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-stone-200 relative animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* HEADER */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-brand-600" />
            <h2 className="font-serif text-lg font-bold text-stone-900">
              {placedOrder ? 'Order Confirmed!' : 'Cash on Delivery (COD) Checkout'}
            </h2>
          </div>
          <button
            onClick={closeModal}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 overflow-y-auto flex-1">
          {placedOrder ? (
            /* ORDER SUCCESS SCREEN */
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle className="w-10 h-10" />
              </div>

              <h3 className="font-serif text-2xl font-bold text-stone-900">
                Shukriya! Your Order is Booked
              </h3>

              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 max-w-md mx-auto text-left space-y-2 text-xs text-stone-700">
                <div className="flex justify-between border-b border-stone-200 pb-2">
                  <span className="font-medium text-stone-500">Order ID:</span>
                  <span className="font-mono font-bold text-stone-900 text-sm">{placedOrder.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-stone-500">Recipient:</span>
                  <span className="font-semibold">{placedOrder.customer.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-stone-500">Phone:</span>
                  <span className="font-mono">{placedOrder.customer.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-stone-500">Address:</span>
                  <span className="text-right max-w-[200px] truncate">{placedOrder.customer.address}, {placedOrder.customer.city}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-stone-500">Payment:</span>
                  <span className="font-semibold text-emerald-700">Cash on Delivery</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-stone-200 text-sm font-bold text-stone-900">
                  <span>Payable at Doorstep:</span>
                  <span className="font-mono text-brand-700">Rs. {placedOrder.total.toLocaleString()}</span>
                </div>
              </div>

              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Our rider will deliver your parcel in 2 to 4 working days. You can pay with cash upon receiving your items.
              </p>

              {/* ACTION BUTTONS */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-3">
                <button
                  onClick={handleWhatsAppConfirm}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Send Confirmation on WhatsApp</span>
                </button>

                <button
                  onClick={() => {
                    closeModal();
                    openModal('tracking');
                  }}
                  className="px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Track Order Status
                </button>
              </div>
            </div>
          ) : (
            /* CHECKOUT FORM */
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* PAYMENT METHOD BADGE */}
              <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-700 flex items-center justify-center text-lg flex-shrink-0">
                  💵
                </div>
                <div className="text-xs">
                  <span className="font-bold text-stone-900 block">
                    Exclusive Payment: Cash on Delivery (COD)
                  </span>
                  <span className="text-stone-600 text-[11px]">
                    No online advance needed. Inspect your package and pay cash directly to the courier rider.
                  </span>
                </div>
              </div>

              {/* CUSTOMER DETAILS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Muhammad Ali"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    WhatsApp / Mobile Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="0300-1234567"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    City *
                  </label>
                  <select
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none"
                  >
                    {PAKISTANI_CITIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Complete Delivery Address *
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
                  <textarea
                    required
                    rows={2}
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="House / Apartment #, Street #, Sector or Area, Nearest Landmark"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Delivery Notes / Special Instructions
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="e.g. Call before delivery, deliver after 2 PM"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none"
                />
              </div>

              {/* ORDER SUMMARY */}
              <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-2">
                <span className="text-xs font-bold text-stone-900 uppercase tracking-wider block mb-1">
                  Order Summary ({cart.length} items)
                </span>
                <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1 divide-y divide-stone-100 text-xs text-stone-600">
                  {cart.map((it, idx) => (
                    <div key={idx} className="pt-1.5 first:pt-0 flex justify-between">
                      <span className="truncate max-w-[280px]">
                        {it.product.name} ({it.selectedWeight}) × {it.quantity}
                      </span>
                      <span className="font-mono font-semibold text-stone-900">
                        Rs. {(it.unitPrice * it.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-stone-200 space-y-1 text-xs">
                  <div className="flex justify-between text-stone-500">
                    <span>Subtotal:</span>
                    <span className="font-mono">Rs. {cartSubtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-stone-500">
                    <span>Delivery Charges:</span>
                    <span className="font-mono">
                      {deliveryFee === 0 ? 'FREE' : `Rs. ${deliveryFee.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-stone-900 pt-1 border-t border-stone-200">
                    <span>Payable on Delivery:</span>
                    <span className="font-mono text-brand-700">Rs. {cartTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-stone-900 hover:bg-brand-600 text-white font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <span>Processing Order...</span>
                ) : (
                  <>
                    <span>Confirm Order (Cash on Delivery)</span>
                    <span className="font-mono text-xs bg-stone-700 px-2 py-0.5 rounded-md">
                      Rs. {cartTotal.toLocaleString()}
                    </span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
