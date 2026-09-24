import React, { useState } from 'react';
import { X, User, Lock, Mail, Phone, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';

export const AuthModal: React.FC = () => {
  const { closeModal, openModal, settings } = useStore();
  const { login, signup } = useAuth();

  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (tab === 'signin') {
        const res = await login(email, password);
        if (!res.success) {
          setError(res.message || 'Invalid email or password');
        } else {
          closeModal();
        }
      } else {
        if (!name.trim()) {
          setError('Name is required');
          setLoading(false);
          return;
        }
        const res = await signup(name, email, phone, password);
        if (!res.success) {
          setError(res.message || 'Failed to create account');
        } else {
          closeModal();
        }
      }
    } catch (err: any) {
      setError(err.message || 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-stone-200 relative animate-in zoom-in-95 duration-200">
        {/* CLOSE BUTTON */}
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* TABS */}
        <div className="flex border-b border-stone-200 bg-stone-50 pt-3 px-6 gap-6">
          <button
            onClick={() => {
              setTab('signin');
              setError(null);
            }}
            className={`pb-3 text-xs font-bold tracking-wide uppercase transition-colors relative ${
              tab === 'signin' ? 'text-stone-900' : 'text-stone-400 hover:text-stone-600'
            }`}
          >
            Sign In
            {tab === 'signin' && (
              <span className="absolute bottom-0 inset-x-0 h-0.5 bg-stone-900 rounded-full" />
            )}
          </button>

          <button
            onClick={() => {
              setTab('signup');
              setError(null);
            }}
            className={`pb-3 text-xs font-bold tracking-wide uppercase transition-colors relative ${
              tab === 'signup' ? 'text-stone-900' : 'text-stone-400 hover:text-stone-600'
            }`}
          >
            Create Account
            {tab === 'signup' && (
              <span className="absolute bottom-0 inset-x-0 h-0.5 bg-stone-900 rounded-full" />
            )}
          </button>
        </div>

        {/* FORM BODY */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="text-center pb-2">
            <h3 className="font-serif text-xl font-bold text-stone-900">
              {tab === 'signin' ? 'Welcome Back!' : `Join ${settings.storeName}`}
            </h3>
            <p className="text-stone-500 text-xs mt-0.5">
              {tab === 'signin'
                ? 'Sign in to track your COD orders & access account.'
                : 'Register to save your delivery address & order history.'}
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {tab === 'signup' && (
            <>
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Muhammad Ali"
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  WhatsApp / Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="0300-1234567"
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-stone-900 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            {loading
              ? 'Please wait...'
              : tab === 'signin'
              ? 'Sign In to Account'
              : 'Create My Account'}
          </button>


        </form>
      </div>
    </div>
  );
};
