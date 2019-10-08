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

// Check if notification exists to avoid double notifications caused
// e.g. by mention and reply in the same post or by editing a reply/mention
const isExistingNotification = (user, type, author, permlink) => {
  const args = { user, author };
  if (type !== 'reply' && type !== 'mention') args.type = type;
  if (permlink) args.permlink = permlink;
  return Notifications.findOne(args)
    .then(res => {
      if (res) return true;
      return false;
    })
    .catch(err => {
      console.log(err);
      return false;
    });
};

const saveNotification = (user, type, author, permlink) => {
  return Notifications.find({ user })
    .countDocuments()
    .then(res => {
      // Store up to 20 notifications per user
      if (res > 20)
        return Notifications.findOneAndUpdate(
          { user },
          { type, author, permlink, date: new Date() },
          { sort: { date: 1 } },
        )
          .then(res => {
            console.log(res);
            return;
          })
          .catch(err => {
            console.error(err);
            return;
          });
      return Notifications.create({
        user,
        type,
        author,
        permlink,
        date: new Date(),
      })
        .then(res => {
          console.log(res);
          return;
        })
        .catch(err => {
          console.error(err);
          return;
        });
    })
    .catch(err => {
      console.log(err);
    });
};

module.exports = {
  getTrackedUsers,
  getUserToken,
  isExistingNotification,
  saveNotification,
};
