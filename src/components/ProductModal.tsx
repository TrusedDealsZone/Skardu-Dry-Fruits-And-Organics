import React, { useState, useEffect } from 'react';
import { X, Star, Heart, ShoppingBag, Truck, ShieldCheck, Check, MessageCircle, MessageSquare, Send } from 'lucide-react';
import { Product, Review } from '../types';
import { useStore } from '../context/StoreContext';

interface ProductModalProps {
  product: Product;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product }) => {
  const { closeModal, addToCart, isWishlisted, toggleWishlist, openModal, settings, refreshProducts } = useStore();

  const weightOptions = product.weights && product.weights.length > 0
    ? product.weights
    : [{ label: product.weight || '1 kg', price: product.price }];

  const [selectedWeight, setSelectedWeight] = useState(weightOptions[weightOptions.length - 1].label);
  const [currentPrice, setCurrentPrice] = useState(weightOptions[weightOptions.length - 1].price);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [newAuthor, setNewAuthor] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMsg, setReviewMsg] = useState<{ text: string; error?: boolean } | null>(null);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/products/${product.id}/reviews`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [product.id]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthor.trim() || !newComment.trim()) {
      setReviewMsg({ text: 'Please fill out your name and review comment.', error: true });
      return;
    }
    setSubmittingReview(true);
    setReviewMsg(null);
    try {
      const res = await fetch(`/api/products/${product.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: newAuthor.trim(),
          rating: newRating,
          comment: newComment.trim()
        })
      });
      const data = await res.json();
      if (res.ok) {
        setReviewMsg({ text: 'Thank you! Your review has been submitted.' });
        setNewAuthor('');
        setNewComment('');
        setNewRating(5);
        fetchReviews();
        refreshProducts();
      } else {
        setReviewMsg({ text: data.error || 'Failed to submit review', error: true });
      }
    } catch (err) {
      setReviewMsg({ text: 'Network error. Please try again.', error: true });
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleWeightSelect = (label: string, price: number) => {
    setSelectedWeight(label);
    setCurrentPrice(price);
  };

  const handleAddToCart = () => {
    addToCart(product, selectedWeight, currentPrice, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedWeight, currentPrice, quantity);
    closeModal();
    openModal('checkout');
  };

  const handleWhatsAppOrder = () => {
    const text = encodeURIComponent(
      `Assalam-o-Alaikum! I want to order from ${settings.storeName}:\n` +
      `Product: ${product.name}\n` +
      `Pack Size: ${selectedWeight}\n` +
      `Quantity: ${quantity}\n` +
      `Price: Rs. ${(currentPrice * quantity).toLocaleString()}\n` +
      `Payment: Cash on Delivery (COD)`
    );
    window.open(`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}?text=${text}`, '_blank');
  };

  const wishlisted = isWishlisted(product.id);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-stone-200 relative animate-in zoom-in-95 duration-200">
        {/* CLOSE BUTTON */}
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* IMAGE SECTION */}
          <div className="relative bg-stone-100 p-6 flex items-center justify-center min-h-[320px]">
            <img
              src={product.image}
              alt={product.name}
              className="max-h-[360px] w-full object-cover rounded-2xl shadow-sm"
            />
            {product.badge && (
              <span className="absolute top-6 left-6 bg-stone-900 text-amber-300 text-xs font-bold px-3 py-1 rounded-full shadow-md">
                {product.badge}
              </span>
            )}
            <button
              onClick={() => toggleWishlist(product.id)}
              className="absolute bottom-6 right-6 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-stone-700 hover:text-red-500 transition-transform hover:scale-110 cursor-pointer"
            >
              <Heart className={`w-5 h-5 ${wishlisted ? 'fill-red-500 text-red-500' : ''}`} />
            </button>
          </div>

          {/* DETAILS SECTION */}
          <div className="p-6 sm:p-8 flex flex-col justify-between max-h-[85vh] overflow-y-auto">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                  product.category === 'Organic Products' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {product.category}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('reviews')}
                  className="flex items-center gap-1 text-amber-500 font-bold text-xs hover:underline cursor-pointer"
                >
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {product.reviewsCount > 0 ? (
                    <>
                      <span>{product.rating.toFixed(1)}</span>
                      <span className="text-stone-400 font-normal">({product.reviewsCount} {product.reviewsCount === 1 ? 'review' : 'reviews'})</span>
                    </>
                  ) : (
                    <span className="text-stone-400 font-normal italic">No reviews yet (Add Review)</span>
                  )}
                </button>
              </div>

              <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 mb-3">
                {product.name}
              </h2>

              {/* TABS: DETAILS vs REVIEWS */}
              <div className="flex items-center gap-4 border-b border-stone-200 mb-4 pb-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('details')}
                  className={`text-xs font-bold pb-2 transition-all cursor-pointer border-b-2 ${
                    activeTab === 'details'
                      ? 'border-stone-900 text-stone-900'
                      : 'border-transparent text-stone-400 hover:text-stone-700'
                  }`}
                >
                  Product Details
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('reviews')}
                  className={`text-xs font-bold pb-2 transition-all cursor-pointer border-b-2 flex items-center gap-1.5 ${
                    activeTab === 'reviews'
                      ? 'border-stone-900 text-stone-900'
                      : 'border-transparent text-stone-400 hover:text-stone-700'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Reviews ({reviews.length})</span>
                </button>
              </div>

              {activeTab === 'details' ? (
                <>
                  {/* PRICING */}
                  <div className="flex items-baseline gap-3 mb-4">
                    <span className="text-2xl sm:text-3xl font-bold text-stone-900 font-mono">
                      Rs. {currentPrice.toLocaleString()}
                    </span>
                    {product.originalPrice && (
                      <span className="text-base text-stone-400 line-through font-mono">
                        Rs. {Math.round(product.originalPrice * (currentPrice / product.price)).toLocaleString()}
                      </span>
                    )}
                    <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      Cash on Delivery (COD)
                    </span>
                  </div>

                  {/* DESCRIPTION */}
                  <p className="text-stone-600 text-xs sm:text-sm leading-relaxed mb-6">
                    {product.description}
                  </p>

                  {/* WEIGHT SELECTION */}
                  {weightOptions.length > 1 && (
                    <div className="mb-6">
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                        Select Package Size:
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {weightOptions.map((opt) => (
                          <button
                            key={opt.label}
                            onClick={() => handleWeightSelect(opt.label, opt.price)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                              selectedWeight === opt.label
                                ? 'bg-stone-900 text-white shadow-sm ring-2 ring-stone-900'
                                : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200'
                            }`}
                          >
                            {opt.label} — Rs. {opt.price.toLocaleString()}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* QUANTITY PICKER */}
                  <div className="flex items-center gap-4 mb-6">
                    <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">Quantity:</span>
                    <div className="flex items-center border border-stone-300 rounded-xl overflow-hidden bg-stone-50">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-3 py-1.5 text-stone-600 hover:bg-stone-200 text-sm font-bold"
                      >
                        -
                      </button>
                      <span className="px-4 py-1.5 text-xs font-bold text-stone-900 font-mono">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="px-3 py-1.5 text-stone-600 hover:bg-stone-200 text-sm font-bold"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-xs text-stone-500">
                      Total: <strong className="text-stone-900 font-mono">Rs. {(currentPrice * quantity).toLocaleString()}</strong>
                    </span>
                  </div>
                </>
              ) : (
                <div className="space-y-4 mb-6">
                  {/* WRITE A REVIEW FORM */}
                  <form onSubmit={handleSubmitReview} className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 space-y-2.5">
                    <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Write a Review</h4>
                    {reviewMsg && (
                      <div className={`text-xs p-2 rounded-lg font-medium ${reviewMsg.error ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                        {reviewMsg.text}
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Your Full Name *"
                        value={newAuthor}
                        onChange={(e) => setNewAuthor(e.target.value)}
                        required
                        className="text-xs px-3 py-2 bg-white border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900"
                      />
                      <div className="flex items-center gap-1 bg-white px-3 py-1.5 border border-stone-200 rounded-lg">
                        <span className="text-xs text-stone-500 mr-1">Rating:</span>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            type="button"
                            key={s}
                            onClick={() => setNewRating(s)}
                            className="text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                          >
                            <Star className={`w-4 h-4 ${s <= newRating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <textarea
                      rows={2}
                      placeholder="Share your experience with this product... *"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      required
                      className="w-full text-xs px-3 py-2 bg-white border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900 resize-none"
                    />
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-3 h-3" />
                      <span>{submittingReview ? 'Submitting...' : 'Post Review'}</span>
                    </button>
                  </form>

                  {/* REVIEWS LIST */}
                  <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
                    {reviewsLoading ? (
                      <p className="text-xs text-stone-400 py-4 text-center">Loading verified reviews...</p>
                    ) : reviews.length === 0 ? (
                      <div className="text-center py-6 bg-stone-50 rounded-xl border border-dashed border-stone-200">
                        <p className="text-xs font-medium text-stone-600">No reviews yet for this product.</p>
                        <p className="text-[11px] text-stone-400 mt-0.5">Be the first to share your honest feedback!</p>
                      </div>
                    ) : (
                      reviews.map((rev) => (
                        <div key={rev.id} className="p-3 bg-stone-50/70 rounded-xl border border-stone-200/80 text-left">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-xs font-bold text-stone-900">{rev.customerName}</span>
                            <span className="text-[10px] text-stone-400">{new Date(rev.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-0.5 mb-1.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-3 h-3 ${s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}`}
                              />
                            ))}
                          </div>
                          <p className="text-xs text-stone-600 leading-relaxed">{rev.comment}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ACTION BUTTONS */}
            <div className="space-y-2.5 pt-4 border-t border-stone-200">
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  className={`flex-1 py-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
                    isAdded ? 'bg-emerald-600 text-white' : 'bg-stone-900 hover:bg-brand-600 text-white'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added to Cart</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleBuyNow}
                  className="flex-1 py-3 bg-gradient-to-r from-amber-600 to-brand-600 hover:from-amber-700 hover:to-brand-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all cursor-pointer text-center"
                >
                  Buy Now (COD)
                </button>
              </div>

              {/* WHATSAPP ORDER BUTTON */}
              <button
                onClick={handleWhatsAppOrder}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Order via WhatsApp (Instant Booking)</span>
              </button>

              <div className="flex items-center justify-center gap-4 text-[11px] text-stone-500 pt-2">
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-brand-600" />
                  Nationwide Cash on Delivery
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  100% Pure Guarantee
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
