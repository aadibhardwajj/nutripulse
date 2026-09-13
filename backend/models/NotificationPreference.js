const mongoose = require('mongoose');

const notificationPreferenceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    mealReminders: {
      enabled: { type: Boolean, default: true },
      breakfastTime: { type: String, default: '08:00' },
      lunchTime: { type: String, default: '13:00' },
      dinnerTime: { type: String, default: '19:00' },
    },
    waterReminders: {
      enabled: { type: Boolean, default: true },
      intervalHours: { type: Number, default: 2 },
    },
    workoutReminders: {
      enabled: { type: Boolean, default: true },
      preferredDays: [{ type: String }],
      preferredTime: { type: String, default: '17:30' },
    },
    weeklyProgressDigest: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('NotificationPreference', notificationPreferenceSchema);
