import React, { useState, useEffect } from 'react';
import { Sparkles, ShieldCheck, Truck, RefreshCw, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const HeroBanner: React.FC = () => {
  const { settings, setSelectedCategory } = useStore();
  const banner = settings.heroBanner;
  const slides = settings.heroSlides && settings.heroSlides.length > 0
    ? settings.heroSlides
    : [{
        id: 'default',
        image: banner.bgImage,
        badge: banner.badge || '100% Pure & Organic',
        title: banner.title,
        subtitle: banner.subtitle,
        ctaText: banner.ctaText || 'Explore Products',
        category: 'Dry Fruits'
      }];

  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-advance slides every 5 seconds
  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const nextSlide = () => setCurrentSlide(prev => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);

  const active = slides[currentSlide] || slides[0];

  return (
    <div className="relative overflow-hidden bg-stone-900 text-white mb-10 group">
      {/* BACKGROUND IMAGE SLIDER */}
      <div className="absolute inset-0 z-0">
        {slides.map((s, idx) => (
          <div
            key={s.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <img
              src={s.image}
              alt={s.title}
              className="w-full h-full object-cover object-center opacity-40 scale-105 transition-transform duration-7000 ease-out"
              onError={e => { (e.target as HTMLImageElement).src = banner.bgImage; }}
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/85 to-transparent z-1" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-transparent to-transparent z-1" />
      </div>

      {/* PREV / NEXT ARROWS */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-stone-900/50 hover:bg-stone-900/80 text-white backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer border border-white/10 hover:scale-105"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-stone-900/50 hover:bg-stone-900/80 text-white backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer border border-white/10 hover:scale-105"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* HERO CONTENT */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-28">
        <div className="max-w-2xl">
          {/* BADGE */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/20 border border-brand-400/40 text-brand-300 text-xs font-semibold tracking-wider uppercase mb-6 backdrop-blur-sm shadow-inner animate-in fade-in">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>{active.badge || '100% Pure & Organic'}</span>
          </div>

          {/* HEADLINE */}
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight mb-6 transition-all duration-500">
            {active.title}
          </h1>

          {/* SUBTITLE */}
          <p className="text-stone-300 text-sm sm:text-base lg:text-lg leading-relaxed mb-8 max-w-xl font-light transition-all duration-500">
            {active.subtitle}
          </p>

          {/* BUTTON ACTIONS */}
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => {
                setSelectedCategory(active.category || 'Dry Fruits');
                document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-3.5 rounded-full bg-gradient-to-r from-brand-500 to-amber-600 hover:from-brand-600 hover:to-amber-700 text-white font-semibold text-sm shadow-lg shadow-brand-500/25 flex items-center gap-2 group transition-all cursor-pointer"
            >
              <span>{active.ctaText || 'Explore Collection'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => {
                setSelectedCategory('All');
                document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md text-white font-semibold text-sm flex items-center gap-2 transition-all cursor-pointer"
            >
              <span>All Products</span>
            </button>
          </div>

          {/* SLIDE INDICATOR DOTS */}
          {slides.length > 1 && (
            <div className="flex items-center gap-2 pt-8">
              {slides.map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  onClick={() => setCurrentSlide(dotIdx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    dotIdx === currentSlide ? 'w-8 bg-amber-400' : 'w-2 bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`Go to slide ${dotIdx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* TRUST FEATURES ROW */}
      <div className="relative z-10 border-t border-white/10 bg-stone-950/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-stone-300">
            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <div className="w-8 h-8 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-white">Cash on Delivery (COD)</p>
                <p className="text-[11px] text-stone-400">Pay safely when you receive your order</p>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-white">100% Pure & Lab Tested</p>
                <p className="text-[11px] text-stone-400">Authentic Gilgit nuts & pure unadulterated honey</p>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <RefreshCw className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-white">Fresh Harvest Guarantee</p>
                <p className="text-[11px] text-stone-400">7-Day Hassle-Free Exchange or Return</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
