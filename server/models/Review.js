import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      index: true
    },
    productId: {
      type: String,
      required: true,
      index: true
    },
    customerName: {
      type: String,
      required: true,
      trim: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret.id || ret._id.toString();
        delete ret.__v;
        return ret;
      }
    },
    toObject: {
      transform: function (doc, ret) {
        ret.id = ret.id || ret._id.toString();
        delete ret.__v;
        return ret;
      }
    }
  }
);

reviewSchema.pre('save', function () {
  if (!this.id) {
    this.id = 'rev-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
  }
});

export const Review = mongoose.model('Review', reviewSchema);
export default Review;
