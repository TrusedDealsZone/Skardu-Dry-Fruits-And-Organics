import mongoose from 'mongoose';

const heroSlideSchema = new mongoose.Schema(
  {
    id: { type: String },
    image: { type: String, default: '' },
    badge: { type: String, default: '' },
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    ctaText: { type: String, default: 'Shop Now' },
    category: { type: String, default: 'Dry Fruits' }
  },
  { _id: false }
);

const heroBannerSchema = new mongoose.Schema(
  {
    badge: { type: String, default: '100% Natural Harvest' },
    title: { type: String, default: 'Skardu Dry Fruits And Organics' },
    subtitle: { type: String, default: 'Handpicked from the peaks of Gilgit-Baltistan and organic farms across Pakistan.' },
    ctaText: { type: String, default: 'Explore Products' },
    bgImage: { type: String, default: '' }
  },
  { _id: false }
);

const settingsSchema = new mongoose.Schema(
  {
    storeName: {
      type: String,
      default: 'Skardu Dry Fruits And Organics'
    },
    tagline: {
      type: String,
      default: 'Premium Dry Fruits & 100% Organic Products'
    },
    phone: {
      type: String,
      default: '+923202822332'
    },
    whatsapp: {
      type: String,
      default: '+923202822332'
    },
    email: {
      type: String,
      default: 'info@skardudryfruits.com'
    },
    address: {
      type: String,
      default: 'Skardu, Gilgit-Baltistan, Pakistan'
    },
    description: {
      type: String,
      default: 'Your premier destination for natural, premium-grade Dry Fruits, mountain nuts, and 100% pure organic wild honey and salajeet across Pakistan.'
    },
    currency: {
      type: String,
      default: 'PKR'
    },
    currencySymbol: {
      type: String,
      default: 'Rs.'
    },
    deliveryFee: {
      type: Number,
      default: 250
    },
    freeDeliveryAbove: {
      type: Number,
      default: 3000
    },
    announcement: {
      type: String,
      default: '🎉 Free Nationwide Delivery on orders above Rs. 3,000! Cash on Delivery (COD) available all over Pakistan.'
    },
    logo: {
      type: String,
      default: ''
    },
    favicon: {
      type: String,
      default: ''
    },
    facebook: {
      type: String,
      default: ''
    },
    instagram: {
      type: String,
      default: ''
    },
    tiktok: {
      type: String,
      default: ''
    },
    youtube: {
      type: String,
      default: ''
    },
    heroBanner: heroBannerSchema,
    heroSlides: [heroSlideSchema],
    theme: {
      type: String,
      default: 'amber-gold'
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    },
    toObject: {
      transform: function (doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

export const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;
