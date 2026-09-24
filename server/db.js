import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, 'data.json');

const INITIAL_PRODUCTS = [
  // DRY FRUITS
  {
    id: 'df-1',
    name: 'Premium American Almonds (Badam Giri)',
    category: 'Dry Fruits',
    price: 2200,
    originalPrice: 2600,
    weight: '1 kg',
    rating: 4.9,
    reviewsCount: 148,
    image: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?q=80&w=800&auto=format&fit=crop',
    badge: 'Best Seller',
    inStock: true,
    stockCount: 85,
    description: 'Crunchy, sweet, and nutrient-dense premium American Almonds. Packed with healthy fats, fiber, protein, magnesium, and vitamin E. Perfect for daily brain boost and heart health.',
    weights: [
      { label: '250g', price: 600 },
      { label: '500g', price: 1150 },
      { label: '1 kg', price: 2200 }
    ]
  },
  {
    id: 'df-2',
    name: 'Gilgit Akhrot Giri (Walnut Kernels)',
    category: 'Dry Fruits',
    price: 2500,
    originalPrice: 2900,
    weight: '1 kg',
    rating: 4.8,
    reviewsCount: 92,
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=800&auto=format&fit=crop',
    badge: '100% Pure',
    inStock: true,
    stockCount: 60,
    description: 'Fresh, extra-light walnut kernels freshly harvested from the valleys of Gilgit. Rich in Omega-3 fatty acids, antioxidants, and essential minerals for brain memory and heart vitality.',
    weights: [
      { label: '250g', price: 680 },
      { label: '500g', price: 1300 },
      { label: '1 kg', price: 2500 }
    ]
  },
  {
    id: 'df-3',
    name: 'Roasted Salted Pistachios (Irani Pista)',
    category: 'Dry Fruits',
    price: 3200,
    originalPrice: 3600,
    weight: '1 kg',
    rating: 4.9,
    reviewsCount: 110,
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?q=80&w=800&auto=format&fit=crop',
    badge: 'Crispy & Fresh',
    inStock: true,
    stockCount: 45,
    description: 'Lightly roasted and gently salted Irani pistachios with naturally opened shells. A delightful luxury snack loaded with potassium, vitamin B6, and eye-protecting lutein.',
    weights: [
      { label: '250g', price: 850 },
      { label: '500g', price: 1650 },
      { label: '1 kg', price: 3200 }
    ]
  },
  {
    id: 'df-4',
    name: 'Jumbo W320 Cashews (Kaju)',
    category: 'Dry Fruits',
    price: 2800,
    originalPrice: 3200,
    weight: '1 kg',
    rating: 4.9,
    reviewsCount: 134,
    image: 'https://images.unsplash.com/photo-1509912760195-555e54d3d578?q=80&w=800&auto=format&fit=crop',
    badge: 'Top Grade',
    inStock: true,
    stockCount: 50,
    description: 'Jumbo whole grade W320 cashews, exceptionally creamy, crisp, and fresh. Excellent source of iron, copper, and plant-based protein.',
    weights: [
      { label: '250g', price: 750 },
      { label: '500g', price: 1450 },
      { label: '1 kg', price: 2800 }
    ]
  },
  {
    id: 'df-5',
    name: 'Original Madinah Ajwa Dates (Khajoor)',
    category: 'Dry Fruits',
    price: 2900,
    originalPrice: 3400,
    weight: '1 kg',
    rating: 5.0,
    reviewsCount: 220,
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=800&auto=format&fit=crop',
    badge: 'Special Blessing',
    inStock: true,
    stockCount: 75,
    description: 'Authentic Ajwa dates directly sourced from the blessed farms of Madinah Munawwarah. Soft, dark, subtly sweet, and revered for holistic health benefits.',
    weights: [
      { label: '500g', price: 1500 },
      { label: '1 kg', price: 2900 }
    ]
  },
  {
    id: 'df-6',
    name: 'Golden Afghani Kishmish (Raisins)',
    category: 'Dry Fruits',
    price: 1400,
    originalPrice: 1700,
    weight: '1 kg',
    rating: 4.7,
    reviewsCount: 78,
    image: 'https://images.unsplash.com/photo-1589135233689-d56d10c0e5a8?q=80&w=800&auto=format&fit=crop',
    badge: 'Natural Sweetness',
    inStock: true,
    stockCount: 90,
    description: 'Long green/golden Kishmish naturally dried without harmful preservatives. Improves hemoglobin levels, helps digestive health, and boosts stamina.',
    weights: [
      { label: '250g', price: 380 },
      { label: '500g', price: 730 },
      { label: '1 kg', price: 1400 }
    ]
  },
  {
    id: 'df-7',
    name: 'Natural Dried Turkish Figs (Injeer)',
    category: 'Dry Fruits',
    price: 2700,
    originalPrice: 3100,
    weight: '1 kg',
    rating: 4.8,
    reviewsCount: 88,
    image: 'https://images.unsplash.com/photo-1543883072-a1694f7236f1?q=80&w=800&auto=format&fit=crop',
    badge: 'High Fiber',
    inStock: true,
    stockCount: 40,
    description: 'Plump, soft, and moist organic dried figs strung on natural cotton cords. Outstanding natural remedy for digestion, bones, and blood pressure control.',
    weights: [
      { label: '250g', price: 720 },
      { label: '500g', price: 1400 },
      { label: '1 kg', price: 2700 }
    ]
  },
  {
    id: 'df-8',
    name: 'Pure Chilgoza Giri (Pine Nuts)',
    category: 'Dry Fruits',
    price: 8900,
    originalPrice: 9800,
    weight: '1 kg',
    rating: 5.0,
    reviewsCount: 65,
    image: 'https://images.unsplash.com/photo-1509912760195-555e54d3d578?q=80&w=800&auto=format&fit=crop',
    badge: 'Luxury Harvest',
    inStock: true,
    stockCount: 25,
    description: 'The King of Dry Fruits! Freshly deshelled Chilgoza kernels from the high pine forests of Waziristan and Sulaiman mountains. Rich in pinolenic acid for appetite control and immense energy.',
    weights: [
      { label: '100g', price: 950 },
      { label: '250g', price: 2300 },
      { label: '500g', price: 4500 },
      { label: '1 kg', price: 8900 }
    ]
  },

  // ORGANIC PRODUCTS
  {
    id: 'op-1',
    name: '100% Raw Sidr (Beri) Honey',
    category: 'Organic Products',
    price: 2400,
    originalPrice: 2800,
    weight: '1 kg',
    rating: 5.0,
    reviewsCount: 215,
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=800&auto=format&fit=crop',
    badge: 'Lab Tested Pure',
    inStock: true,
    stockCount: 70,
    description: 'Pure, unpasteurized, unprocessed Sidr honey harvested from the wild jujube (Beri) trees of Karak and Potohar. World famous for boosting immunity, respiratory health, and physical vigor.',
    weights: [
      { label: '500g', price: 1250 },
      { label: '1 kg', price: 2400 }
    ]
  },
  {
    id: 'op-2',
    name: 'Pure Organic Desi Ghee (Grass-Fed Butter)',
    category: 'Organic Products',
    price: 3200,
    originalPrice: 3700,
    weight: '1 kg',
    rating: 4.9,
    reviewsCount: 160,
    image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?q=80&w=800&auto=format&fit=crop',
    badge: 'Traditional Bilona',
    inStock: true,
    stockCount: 40,
    description: 'Made using the traditional Vedic churned curd (Bilona) method from free-grazing cow and buffalo milk. Heavenly aroma, golden texture, rich in fat-soluble vitamins A, D, E, and K.',
    weights: [
      { label: '500g', price: 1650 },
      { label: '1 kg', price: 3200 }
    ]
  },
  {
    id: 'op-3',
    name: 'Original Himalayan Salajeet (Gold Grade Shilajit Resin)',
    category: 'Organic Products',
    price: 1950,
    originalPrice: 2500,
    weight: '20g',
    rating: 5.0,
    reviewsCount: 310,
    image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=800&auto=format&fit=crop',
    badge: 'Certified Organic',
    inStock: true,
    stockCount: 110,
    description: 'Extracted from heights above 16,000 feet in Skardu, purified through the traditional sun-drying method. Contains 84+ trace minerals and 70%+ fulvic acid for stamina, anti-aging, and energy.',
    weights: [
      { label: '20g', price: 1950 },
      { label: '50g', price: 4200 }
    ]
  },
  {
    id: 'op-4',
    name: 'Organic Superfood Chia Seeds',
    category: 'Organic Products',
    price: 850,
    originalPrice: 1100,
    weight: '500g',
    rating: 4.8,
    reviewsCount: 84,
    image: 'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?q=80&w=800&auto=format&fit=crop',
    badge: 'Weight Loss & Energy',
    inStock: true,
    stockCount: 95,
    description: '100% organic raw whole chia seeds. Dense with soluble dietary fiber, plant Omega-3, and antioxidants. Helps maintain healthy digestion, weight control, and sustained hydration.',
    weights: [
      { label: '250g', price: 450 },
      { label: '500g', price: 850 },
      { label: '1 kg', price: 1600 }
    ]
  },
  {
    id: 'op-5',
    name: 'Pure Organic Kashmiri Zafran (Saffron Mogra)',
    category: 'Organic Products',
    price: 2600,
    originalPrice: 3200,
    weight: '2g',
    rating: 5.0,
    reviewsCount: 95,
    image: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?q=80&w=800&auto=format&fit=crop',
    badge: 'Grade A1 Royal',
    inStock: true,
    stockCount: 35,
    description: 'All-red, thick stigmas of Kashmiri saffron. Unsurpassed floral aroma, vivid crimson tint, and natural mood-enhancing and skin-rejuvenating properties.',
    weights: [
      { label: '1g', price: 1350 },
      { label: '2g', price: 2600 },
      { label: '5g', price: 6200 }
    ]
  },
  {
    id: 'op-6',
    name: 'Pure Wild Acacia Flower Honey',
    category: 'Organic Products',
    price: 1850,
    originalPrice: 2200,
    weight: '1 kg',
    rating: 4.8,
    reviewsCount: 67,
    image: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?q=80&w=800&auto=format&fit=crop',
    badge: 'Light & Floral',
    inStock: true,
    stockCount: 50,
    description: 'Delicate, water-clear wild blossom honey with low glycemic index. Naturally remains liquid longer, ideal sweetener for diabetics and kids.',
    weights: [
      { label: '500g', price: 980 },
      { label: '1 kg', price: 1850 }
    ]
  }
];

function getInitialData() {
  const salt = bcrypt.genSaltSync(10);
  const adminPasswordHash = bcrypt.hashSync('admin123', salt);

  return {
    settings: {
      storeName: 'Skardu Dry Fruits And Organics',
      tagline: 'Premium Dry Fruits & 100% Organic Products',
      phone: '+923202822332',
      whatsapp: '+923202822332',
      email: 'info@skardudryfruits.com',
      address: 'Skardu, Gilgit-Baltistan, Pakistan',
      description: 'Your premier destination for natural, premium-grade Dry Fruits, mountain nuts, and 100% pure organic wild honey and salajeet across Pakistan.',
      currency: 'PKR',
      currencySymbol: 'Rs.',
      deliveryFee: 250,
      freeDeliveryAbove: 3000,
      announcement: '🎉 Free Nationwide Delivery on orders above Rs. 3,000! Cash on Delivery (COD) available all over Pakistan.',
      logo: '',
      favicon: '',
      facebook: '',
      instagram: '',
      tiktok: '',
      youtube: '',
      heroBanner: {
        badge: '100% Natural Harvest',
        title: 'Premium Dry Fruits & Pure Organic Essentials',
        subtitle: 'Handpicked from the peaks of Gilgit-Baltistan and organic farms across Pakistan. Fresh, pure, and delivered to your doorstep with Cash on Delivery.',
        ctaText: 'Explore Products',
        bgImage: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=1600&auto=format&fit=crop'
      },
      theme: 'amber-gold',
      heroSlides: [
        {
          id: 'slide-1',
          image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=1600&auto=format&fit=crop',
          badge: 'Fresh Harvest 2026',
          title: 'Pure & Premium Dry Fruits & Organic Delights',
          subtitle: 'Handpicked, naturally sun-dried nuts and 100% pure organic honeys & mountain salajeet delivered fresh to your doorstep.',
          ctaText: 'Explore Dry Fruits',
          category: 'Dry Fruits'
        },
        {
          id: 'slide-2',
          image: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?q=80&w=1600&auto=format&fit=crop',
          badge: '100% Pure Nuts',
          title: 'Finest American Badam & Gilgit Akhrot Giri',
          subtitle: 'Rich in Omega-3 fatty acids, plant protein, and essential vitality for daily memory and heart health.',
          ctaText: 'Shop Nuts Collection',
          category: 'Dry Fruits'
        },
        {
          id: 'slide-3',
          image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=1600&auto=format&fit=crop',
          badge: 'Certified Organic',
          title: 'Pure Mountain Sidr Honey & Gold Shilajit',
          subtitle: '100% raw, unadulterated Sidr (Beri) Honey and purified Skardu Salajeet for natural immunity & stamina.',
          ctaText: 'Explore Organic Range',
          category: 'Organic Products'
        },
        {
          id: 'slide-4',
          image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?q=80&w=1600&auto=format&fit=crop',
          badge: 'Royal Selection',
          title: 'Crispy Roasted Irani Pistachios & Jumbo Kaju',
          subtitle: 'Gently roasted and salted to perfection. A healthy luxury snack packed with high antioxidants and minerals.',
          ctaText: 'Shop Dry Fruits',
          category: 'Dry Fruits'
        }
      ]
    },
    categories: [
      {
        id: 'dry-fruits',
        name: 'Dry Fruits',
        icon: '🌰',
        description: 'Almonds, Walnuts, Pistachios, Cashews, Dates, Figs & more'
      },
      {
        id: 'organic-products',
        name: 'Organic Products',
        icon: '🌿',
        description: '100% Pure Honey, Desi Ghee, Himalayan Salajeet, Saffron & Seeds'
      }
    ],
    products: INITIAL_PRODUCTS,
    users: [
      {
        id: 'u-admin-1',
        name: 'Store Administrator',
        email: 'admin@dryfruits.com',
        phone: '+92 300 1234567',
        password: adminPasswordHash,
        role: 'admin',
        createdAt: new Date().toISOString()
      }
    ],
    orders: [],
    reviews: []
  };
}

export function calculateProductRating(productId, reviews = []) {
  const prodReviews = reviews.filter(r => r.productId === productId);
  const count = prodReviews.length;
  const avg = count > 0
    ? Number((prodReviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / count).toFixed(1))
    : 0;
  return { rating: avg, reviewsCount: count };
}

export function enrichProduct(product, reviews = []) {
  const { rating, reviewsCount } = calculateProductRating(product.id, reviews);
  return {
    ...product,
    rating,
    reviewsCount
  };
}

export function readDb() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      const init = getInitialData();
      fs.writeFileSync(DATA_FILE, JSON.stringify(init, null, 2), 'utf8');
      return init;
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const data = JSON.parse(raw);
    let updated = false;

    if (!Array.isArray(data.reviews)) {
      data.reviews = [];
      updated = true;
    }
    if (!Array.isArray(data.categories)) {
      data.categories = getInitialData().categories;
      updated = true;
    }
    if (!data.settings) {
      data.settings = getInitialData().settings;
      updated = true;
    }
    if (!data.settings.heroSlides || !data.settings.heroSlides.length) {
      data.settings.heroSlides = getInitialData().settings.heroSlides;
      updated = true;
    }
    if (!data.settings.theme) {
      data.settings.theme = 'amber-gold';
      updated = true;
    }
    // Migrate: replace old branding if still present
    if (data.settings.storeName === 'Trusted Deals Luxe') {
      data.settings.storeName = 'Skardu Dry Fruits And Organics';
      updated = true;
    }
    if (data.settings.email === 'info@trusteddealsluxe.com') {
      data.settings.email = 'info@skardudryfruits.com';
      updated = true;
    }
    // Migrate: inject new optional fields if missing
    const newFieldDefaults = { description: '', logo: '', favicon: '', facebook: '', instagram: '', tiktok: '', youtube: '' };
    for (const [key, val] of Object.entries(newFieldDefaults)) {
      if (data.settings[key] === undefined) {
        data.settings[key] = val;
        updated = true;
      }
    }

    if (updated) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    }
    return data;
  } catch (err) {
    console.error('Error reading db:', err);
    return getInitialData();
  }
}

export function writeDb(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing db:', err);
    return false;
  }
}
