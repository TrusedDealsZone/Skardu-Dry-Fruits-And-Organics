import React, { useState } from 'react';
import { X, Search, Truck, CheckCircle2, Clock, PackageCheck, AlertCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Order } from '../types';

export const OrderTrackingModal: React.FC = () => {
  const { closeModal } = useStore();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setOrders(null);

    try {
      const res = await fetch(`/api/orders/track/${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'No orders found matching this ID or Phone number.');
      }
      setOrders(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStep = (status: string) => {
    switch (status) {
      case 'Pending': return 1;
      case 'Confirmed': return 2;
      case 'Shipped': return 3;
      case 'Delivered': return 4;
      default: return 0;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-stone-200 relative animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* HEADER */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-brand-600" />
            <h2 className="font-serif text-lg font-bold text-stone-900">Track Your COD Order</h2>
          </div>
          <button
            onClick={closeModal}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SEARCH FORM */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <form onSubmit={handleTrack} className="space-y-3">
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
              Enter Order ID (e.g. COD-1001) or Mobile Number:
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="e.g. COD-1001 or 03001234567"
                  className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-stone-900 hover:bg-brand-600 text-white font-semibold text-xs rounded-xl shadow-md transition-colors cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Searching...' : 'Track'}
              </button>
            </div>
          </form>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {orders && orders.length > 0 && (
            <div className="space-y-6">
              {orders.map(order => {
                const step = getStatusStep(order.status);
                return (
                  <div key={order.id} className="border border-stone-200 rounded-2xl p-5 bg-stone-50/60 space-y-4">
                    <div className="flex justify-between items-start border-b border-stone-200 pb-3">
                      <div>
                        <span className="font-mono font-bold text-sm text-stone-900 block">{order.id}</span>
                        <span className="text-[11px] text-stone-500">
                          Placed on {new Date(order.createdAt).toLocaleDateString('en-PK', { dateStyle: 'medium' })}
                        </span>
                      </div>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        order.status === 'Delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.status === 'Cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>

                    {/* STATUS TIMELINE STEPPER */}
                    <div className="grid grid-cols-4 gap-1 text-center text-[10px] font-semibold py-2">
                      <div className={`flex flex-col items-center ${step >= 1 ? 'text-brand-600' : 'text-stone-300'}`}>
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center mb-1 ${
                          step >= 1 ? 'bg-brand-500 text-white' : 'bg-stone-200 text-stone-400'
                        }`}>
                          <Clock className="w-3.5 h-3.5" />
                        </div>
                        <span>Pending</span>
                      </div>

                      <div className={`flex flex-col items-center ${step >= 2 ? 'text-brand-600' : 'text-stone-300'}`}>
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center mb-1 ${
                          step >= 2 ? 'bg-brand-500 text-white' : 'bg-stone-200 text-stone-400'
                        }`}>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                        <span>Confirmed</span>
                      </div>

                      <div className={`flex flex-col items-center ${step >= 3 ? 'text-brand-600' : 'text-stone-300'}`}>
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center mb-1 ${
                          step >= 3 ? 'bg-brand-500 text-white' : 'bg-stone-200 text-stone-400'
                        }`}>
                          <Truck className="w-3.5 h-3.5" />
                        </div>
                        <span>Shipped</span>
                      </div>

                      <div className={`flex flex-col items-center ${step >= 4 ? 'text-emerald-600' : 'text-stone-300'}`}>
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center mb-1 ${
                          step >= 4 ? 'bg-emerald-600 text-white' : 'bg-stone-200 text-stone-400'
                        }`}>
                          <PackageCheck className="w-3.5 h-3.5" />
                        </div>
                        <span>Delivered</span>
                      </div>
                    </div>

                    {/* ORDER ITEMS & TOTAL */}
                    <div className="bg-white rounded-xl p-3 border border-stone-200 text-xs space-y-1.5">
                      <div className="font-semibold text-stone-800 mb-1">Items ({order.items.length}):</div>
                      {order.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between text-stone-600 text-[11px]">
                          <span>{it.name} ({it.weight}) × {it.quantity}</span>
                          <span className="font-mono font-semibold">Rs. {(it.price * it.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                      <div className="pt-2 border-t border-stone-100 flex justify-between font-bold text-stone-900 text-xs">
                        <span>Total (Cash on Delivery):</span>
                        <span className="font-mono text-brand-700">Rs. {order.total.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-stone-500">
                      <strong>Delivery to:</strong> {order.customer.name}, {order.customer.address}, {order.customer.city}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
