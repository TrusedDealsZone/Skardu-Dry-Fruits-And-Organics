import React from 'react';
import { useStore } from '../context/StoreContext';

export const CategoryFilter: React.FC = () => {
  const { categories, categoriesList, selectedCategory, setSelectedCategory, products, searchQuery, setSearchQuery } = useStore();

  const getCount = (cat: string) => {
    if (cat === 'All') return products.length;
    return products.filter(p => p.category.toLowerCase() === cat.toLowerCase()).length;
  };

  const getCategoryDisplay = (cat: string) => {
    if (cat === 'All') return 'All Items';
    const found = categoriesList.find(c => c.name.toLowerCase() === cat.toLowerCase());
    if (found && found.icon) {
      return `${found.icon} ${found.name}`;
    }
    if (cat.toLowerCase() === 'dry fruits') return '🌰 Dry Fruits';
    if (cat.toLowerCase() === 'organic products') return '🌿 Organic Products';
    return cat;
  };

  return (
    <div id="products-section" className="mb-8 scroll-mt-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
            {searchQuery
              ? `Search results for "${searchQuery}"`
              : selectedCategory === 'All'
              ? 'Our Complete Collection'
              : getCategoryDisplay(selectedCategory)}
          </h2>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Carefully curated for nutrition, unmatched taste, and natural health.
          </p>
        </div>

        {/* CATEGORY PILLS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {categories.map(cat => {
            const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setSearchQuery('');
                }}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-stone-900 text-white shadow-md'
                    : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                <span>{getCategoryDisplay(cat)}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isSelected ? 'bg-stone-700 text-stone-200' : 'bg-stone-100 text-stone-500'
                  }`}
                >
                  {getCount(cat)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {searchQuery && (
        <div className="mt-3 flex items-center justify-between text-xs text-stone-500 bg-amber-50 border border-amber-200 p-2.5 rounded-lg">
          <span>
            Filtering by keyword: <strong className="text-stone-800">"{searchQuery}"</strong>
          </span>
          <button
            onClick={() => setSearchQuery('')}
            className="text-amber-800 font-semibold hover:underline"
          >
            Clear Filter
          </button>
        </div>
      )}
    </div>
  );
};
