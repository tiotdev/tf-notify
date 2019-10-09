const Redis = require('ioredis');
const {
  getTrackedUsers,
  getUserToken,
  saveNotification,
  isExistingNotification,
} = require('./db/db');
const { sendWebPush } = require('./helpers/sendWebPush');
const {
  messageFromNotification,
} = require('./helpers/messageFromNotification');

// Redis requires separate instances for subscribing and retrieving messages
const stm = new Redis(
  6379,
  process.env.MEESEEKER_PORT_6379_TCP_ADDR || 'localhost',
);
const client = new Redis(
  6379,
  process.env.MEESEEKER_PORT_6379_TCP_ADDR || 'localhost',
);

let trackFollows = [];
let trackMentions = [];
let trackReplies = [];
let trackCuration = [];

const updateTrackedUsers = () => {
  getTrackedUsers().then(res => {
    trackFollows = res.trackFollows;
    trackMentions = res.trackMentions;
    trackReplies = res.trackReplies;
    trackCuration = res.trackCuration;
  });
};

// Get initial list of tracked users/actions
updateTrackedUsers();
// Obtain current list of tracked users/actions from db every minute
setInterval(updateTrackedUsers, 60000);

const sendNotification = (user, type, author, permlink) => {
  isExistingNotification(user, type, author, permlink).then(res => {
    if (res === true) return;
    return saveNotification(user, type, author, permlink).then(() => {
      return getUserToken(user).then(token => {
        const payload = messageFromNotification(type, author, permlink);
        sendWebPush(token, payload);
        console.log(
          `Sending notification to ${user} with payload ${JSON.stringify(
            payload,
          )}`,
        );
      });
    });
  });
};

const parseReply = (parent_author, author, permlink) => {
  if (trackReplies.indexOf(parent_author) !== -1) {
    sendNotification(parent_author, 'reply', author, permlink);
  }
};

const parseMentions = (users, author, permlink) => {
  if (!users || users.length < 1) return;
  users.forEach(u => {
    if (trackMentions.indexOf(u) !== -1) {
      sendNotification(u, 'mention', author, permlink);
    }
  });
};

const parseFollow = (json, follower) => {
  if (json[0] !== 'follow' || json[1].what[0] !== 'blog') return;
  const following = json[1].following;
  if (trackFollows.indexOf(following) !== -1) {
    sendNotification(following, 'follow', follower);
  }
};

const parseCuration = (author, permlink, weight) => {
  if (trackCuration.indexOf(author) !== -1) {
    sendNotification(
      author,
      weight < 6600 ? 'honour' : 'curation',
      author,
      permlink,
    );
  }
};

const processEvent = event => {
  client
    .get(JSON.parse(event).key)
    .then(function(result) {
      const res = JSON.parse(result);
      if (res.type === 'comment_operation') {
        if (!res.value.json_metadata) return;
        const c = JSON.parse(res.value.json_metadata);
        if (!c || !c.tags || c.tags.indexOf('travelfeed') === -1) return;
        parseReply(
          res.value.parent_author,
          res.value.author,
          res.value.permlink,
        );
        parseMentions(c.users, res.value.author, res.value.permlink);
      } else if (res.type === 'custom_json_operation') {
        if (res.value.id === 'follow')
          parseFollow(
            JSON.parse(res.value.json),
            res.value.required_posting_auths[0],
          );
      } else if (res.type === 'vote_operation') {
        if (res.value.voter !== 'travelfeed' || res.value.weight < 5000) return;
        parseCuration(res.value.author, res.value.permlink, res.value.weight);
      }
    })
    .catch(err => console.log(err));
};

stm.subscribe(
  'steem:op:custom_json:follow',
  'steem:op:comment',
  'steem:op:vote',
  function(err) {
    if (err) console.warn(err);
    else console.log('Subscribed');
  },
);

stm.on('message', function(channel, message) {
  processEvent(message);
});
