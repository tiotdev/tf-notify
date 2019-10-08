const mongoose = require('mongoose');

const { Schema } = mongoose;

const preferencesSchema = new Schema({
  user: { type: String, required: true },
  defaultVoteWeight: { type: Number, default: 5 },
  defaultCommentsVoteWeight: { type: Number, default: 1 },
  showNSFW: { type: Boolean, default: false },
  useDarkMode: { type: Boolean, default: false },
  useTfBlacklist: { type: Boolean, default: true },
  trackFollows: { type: Boolean, default: true },
  trackMentions: { type: Boolean, default: true },
  trackReplies: { type: Boolean, default: true },
  trackCuration: { type: Boolean, default: true },
  trackUpdates: { type: Boolean, default: true },
});

const pushSubscriptionsSchema = new Schema({
  user: { type: String, unique: true },
  pushSubscription: { type: String, unique: true },
});

const notificationsSchema = new Schema({
  user: { type: String },
  type: { type: String },
  author: { type: String },
  permlink: { type: String },
  date: { type: Date, default: Date.now() },
});

const Preferences = mongoose.model('preferences', preferencesSchema);
const PushSubscriptions = mongoose.model(
  'pushSubscriptions',
  pushSubscriptionsSchema,
);
const Notifications = mongoose.model('notifications', notificationsSchema);

module.exports = {
  Preferences,
  PushSubscriptions,
  Notifications,
};
