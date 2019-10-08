require('./connect');
const { Preferences, PushSubscriptions, Notifications } = require('./models');
const { asyncForEach } = require('../helpers/utils');

const getTrackedUsers = async () => {
  const trackFollows = [];
  const trackMentions = [];
  const trackReplies = [];
  const trackCuration = [];
  return PushSubscriptions.find({})
    .then(async res => {
      await asyncForEach(res, async ({ user }) => {
        await Preferences.findOne({ user })
          .then(async res => {
            // Check which channels are followed
            if (!res || res.trackFollows !== false) trackFollows.push(user);
            if (!res || res.trackMentions !== false) trackMentions.push(user);
            if (!res || res.trackReplies !== false) trackReplies.push(user);
            if (!res || res.trackCuration !== false) trackCuration.push(user);
          })
          .catch(err => {
            console.log(err);
          });
      });
      const channels = {
        trackFollows,
        trackMentions,
        trackReplies,
        trackCuration,
      };
      return channels;
    })
    .catch(err => {
      console.log(err);
    });
};

const getUserToken = user => {
  return PushSubscriptions.findOne({ user })
    .then(res => {
      return res.pushSubscription;
    })
    .catch(err => {
      console.log(err);
    });
};

const saveNotification = (user, notification) => {
  return Notifications.find({ user })
    .countDocuments()
    .then(res => {
      // Store up to 20 notifications per user
      if (res > 20)
        return Notifications.findOneAndUpdate(
          { user },
          { notification, date: new Date() },
          { sort: { date: 1 } },
        )
          .then(res => console.log(res))
          .catch(err => console.error(err));
      return Notifications.create({
        user,
        notification,
        date: new Date(),
      })
        .then(res => console.log(res))
        .catch(err => console.error(err));
    })
    .catch(err => {
      console.log(err);
    });
};

module.exports = {
  getTrackedUsers,
  getUserToken,
  saveNotification,
};
