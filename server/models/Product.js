import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      index: true
    },
    name: {
      type: String,
      trim: true
    },
    title: {
      type: String,
      trim: true
    },
    category: {
      type: String,
      trim: true
    },
    price: {
      type: Number,
      min: 0
    },
    originalPrice: {
      type: Number,
      default: 0
    },
    image: {
      type: String,
      default: ''
    },
    images: {
      type: [String],
      default: []
    },
    stock: {
      type: Number,
      default: 50
    },
    stockCount: {
      type: Number,
      default: 50
    },
    description: {
      type: String,
      default: ''
    },
    rating: {
      type: Number,
      default: 0
    },
    reviewsCount: {
      type: Number,
      default: 0
    },
    badge: {
      type: String,
      default: ''
    },
    inStock: {
      type: Boolean,
      default: true
    },
    weights: [
      {
        label: { type: String },
        price: { type: Number }
      }
    ],

    // ─── GEMSTONE OPTION C FIELDS (Per Piece + Per Carat Mix) ───
    origin: {
      type: String,
      default: ''
    },
    sellingType: {
      type: String,
      enum: ['per_piece', 'per_carat', 'both'],
      default: 'per_piece'
    },
    weight: {
      type: mongoose.Schema.Types.Mixed,
      default: '1 kg'
    },
    carat: {
      type: Number,
      default: 0
    },
    pricePerCarat: {
      type: Number,
      default: 0
    },
    clarity: {
      type: String,
      default: ''
    },
    cut: {
      type: String,
      default: ''
    },
    color: {
      type: String,
      default: ''
    },
    treatment: {
      type: String,
      default: 'None / Natural'
    },
    certification: {
      type: String,
      default: ''
    },
    isCertified: {
      type: Boolean,
      default: false
    }
  },
  {
    strict: false,
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret.id || ret._id.toString();
        ret.title = ret.title || ret.name;
        ret.name = ret.name || ret.title;
        ret.stock = ret.stock !== undefined ? ret.stock : ret.stockCount;
        ret.stockCount = ret.stockCount !== undefined ? ret.stockCount : ret.stock;
        delete ret.__v;
        return ret;
      }
    },
    toObject: {
      transform: function (doc, ret) {
        ret.id = ret.id || ret._id.toString();
        ret.title = ret.title || ret.name;
        ret.name = ret.name || ret.title;
        ret.stock = ret.stock !== undefined ? ret.stock : ret.stockCount;
        ret.stockCount = ret.stockCount !== undefined ? ret.stockCount : ret.stock;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Pre-save to sync name/title and stock/stockCount
productSchema.pre('save', function () {
  if (!this.id) {
    this.id = 'prod-' + Date.now();
  }
  if (!this.name && this.title) {
    this.name = this.title;
  }
  if (!this.title && this.name) {
    this.title = this.name;
  }
  if (this.stock !== undefined && this.stockCount === undefined) {
    this.stockCount = this.stock;
  }
  if (this.stockCount !== undefined && this.stock === undefined) {
    this.stock = this.stockCount;
  }

  // Gemstone price calculation logic if per_carat
  if (this.sellingType === 'per_carat' && this.carat && this.pricePerCarat) {
    this.price = Math.round(this.carat * this.pricePerCarat);
  }
});

export const Product = mongoose.model('Product', productSchema);
export default Product;
