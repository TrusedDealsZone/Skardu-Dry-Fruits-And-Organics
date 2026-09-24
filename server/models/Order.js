import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    id: { type: String },
    productId: { type: String },
    name: { type: String, required: true },
    weight: { type: String, default: '1 kg' },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String, default: '' }
  },
  { _id: false }
);

const timelineSchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    description: { type: String, required: true }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      index: true
    },
    userId: {
      type: String,
      default: null,
      ref: 'User'
    },
    customer: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, default: '' },
      address: { type: String, required: true },
      city: { type: String, required: true },
      notes: { type: String, default: '' }
    },
    address: {
      type: String
    },
    items: [orderItemSchema],
    subtotal: {
      type: Number,
      default: 0
    },
    deliveryFee: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      required: true
    },
    paymentMethod: {
      type: String,
      default: 'Cash on Delivery (COD)'
    },
    paymentStatus: {
      type: String,
      default: 'Pay on Delivery'
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending'
    },
    timeline: [timelineSchema]
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret.id || ret._id.toString();
        ret.address = ret.address || ret.customer?.address;
        delete ret.__v;
        return ret;
      }
    },
    toObject: {
      transform: function (doc, ret) {
        ret.id = ret.id || ret._id.toString();
        ret.address = ret.address || ret.customer?.address;
        delete ret.__v;
        return ret;
      }
    }
  }
);

orderSchema.pre('save', function () {
  if (!this.id) {
    this.id = 'COD-' + (1000 + Math.floor(Math.random() * 9000));
  }
  if (this.customer && this.customer.address) {
    this.address = this.customer.address;
  }
});

export const Order = mongoose.model('Order', orderSchema);
export default Order;
