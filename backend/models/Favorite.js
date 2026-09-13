const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    foodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Food',
      required: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate favorites for the same user and food
favoriteSchema.index({ userId: 1, foodId: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
