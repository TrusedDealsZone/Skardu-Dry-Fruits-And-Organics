import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    icon: {
      type: String,
      default: '🌰'
    },
    description: {
      type: String,
      default: ''
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

categorySchema.pre('save', function () {
  if (!this.id) {
    this.id = 'cat-' + Date.now();
  }
});

export const Category = mongoose.model('Category', categorySchema);
export default Category;
