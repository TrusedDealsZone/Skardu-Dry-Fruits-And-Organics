import React, { useState } from 'react';
import { Star, Heart, ShoppingBag, Eye, Check } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, toggleWishlist, isWishlisted, openModal } = useStore();

  const weightOptions = product.weights && product.weights.length > 0
    ? product.weights
    : [{ label: product.weight || '1 kg', price: product.price }];

  const [selectedWeight, setSelectedWeight] = useState(weightOptions[weightOptions.length - 1].label);
  const [currentPrice, setCurrentPrice] = useState(weightOptions[weightOptions.length - 1].price);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const handleWeightChange = (weightLabel: string, price: number) => {
    setSelectedWeight(weightLabel);
    setCurrentPrice(price);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, selectedWeight, currentPrice, 1);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1200);
  };

  const wishlisted = isWishlisted(product.id);

  return (
    <div
      onClick={() => openModal('product', product)}
      className="group bg-white rounded-2xl border border-stone-200/80 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col cursor-pointer hover:-translate-y-1 relative"
    >
      {/* IMAGE & BADGES CONTAINER */}
      <div className="relative aspect-square w-full bg-stone-100 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* TOP BADGE */}
        {product.badge && (
          <span className="absolute top-3 left-3 bg-stone-900/85 backdrop-blur-md text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wide shadow-md">
            {product.badge}
          </span>
        )}

        {/* WISHLIST BUTTON */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-stone-600 hover:text-red-500 shadow-md transition-all hover:scale-110 cursor-pointer"
          title="Save to wishlist"
        >
          <Heart className={`w-4 h-4 ${wishlisted ? 'fill-red-500 text-red-500' : ''}`} />
        </button>

        {/* QUICK VIEW OVERLAY BUTTON */}
        <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden sm:block">
          <button
            onClick={(e) => {
              e.stopPropagation();
              openModal('product', product);
            }}
            className="w-full py-2 bg-white/95 backdrop-blur-md hover:bg-white text-stone-800 text-xs font-semibold rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-stone-500" />
            Quick View
          </button>
        </div>
      </div>

      {/* CARD BODY */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* CATEGORY & RATING */}
          <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1.5">
            <span className={`font-semibold uppercase tracking-wider ${
              product.category === 'Organic Products' ? 'text-emerald-700' : 'text-amber-700'
            }`}>
              {product.category}
            </span>
            {product.reviewsCount > 0 ? (
              <div className="flex items-center gap-1 text-amber-500 font-bold">
                <Star className="w-3 h-3 fill-amber-400" />
                <span>{product.rating.toFixed(1)}</span>
                <span className="text-stone-400 text-[10px]">({product.reviewsCount})</span>
              </div>
            ) : (
              <span className="text-stone-400 text-[10px] italic">No reviews yet</span>
            )}
          </div>

          {/* PRODUCT NAME */}
          <h3 className="font-semibold text-stone-900 text-sm leading-snug line-clamp-2 group-hover:text-brand-700 transition-colors">
            {product.name}
          </h3>

          {/* WEIGHT SELECTOR PILLS */}
          {weightOptions.length > 1 && (
            <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
              {weightOptions.map((opt) => (
                <button
                  key={opt.label}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleWeightChange(opt.label, opt.price);
                  }}
                  className={`text-[10px] px-2 py-0.5 rounded-md font-medium transition-all ${
                    selectedWeight === opt.label
                      ? 'bg-stone-900 text-white font-bold'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* PRICING & ADD TO CART */}
        <div className="pt-4 mt-3 border-t border-stone-100 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-bold text-stone-900 font-mono">
                Rs. {currentPrice.toLocaleString()}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-stone-400 line-through font-mono">
                  Rs. {Math.round(product.originalPrice * (currentPrice / product.price)).toLocaleString()}
                </span>
              )}
            </div>
            <span className="text-[10px] text-stone-500 block">
              Pack: {selectedWeight}
            </span>
          </div>

          {/* ADD TO CART BUTTON */}
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer ${
              !product.inStock
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                : addedAnimation
                ? 'bg-emerald-600 text-white scale-95'
                : 'bg-stone-900 hover:bg-brand-600 text-white hover:shadow-md'
            }`}
          >
            {addedAnimation ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added</span>
              </>
            ) : !product.inStock ? (
              <span>Out of Stock</span>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
