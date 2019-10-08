const Redis = require('ioredis');
const { getTrackedUsers, getUserToken } = require('./db/db');

// Redis requires separate instances for subscribing and retrieving messages
const stm = new Redis(6380);
const client = new Redis(6380);

let trackFollows;
let trackMentions;
let trackReplies;
let trackCuration;

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

const sendNotification = (user, message, button, action) => {
  // TODO: Get user token from db, send push notification with web-push
  getUserToken(user).then(token => {
    console.log(
      `Sending notification to ${user} with token ${token}: ${message}.${
        button ? ` Click ${button} to ${action}` : ''
      }`,
    );
  });
};

const parseReply = (parent_author, author, permlink) => {
  if (trackReplies.indexOf(parent_author) !== -1) {
    sendNotification(
      parent_author,
      `${author} has replied to you`,
      'View reply',
      `@${author}/${permlink}`,
    );
  }
};

const parseMentions = (users, author, permlink) => {
  if (!users || users.length < 1) return;
  users.forEach(u => {
    if (trackMentions.indexOf(u) !== -1) {
      sendNotification(
        u,
        `${author} has mentioned to you`,
        'View post',
        `@${author}/${permlink}`,
      );
    }
  });
};

const parseFollow = (json, follower) => {
  if (json[0] !== 'follow' || json[1].what[0] !== 'blog') return;
  const following = json[1].following;
  if (trackFollows.indexOf(following) !== -1) {
    sendNotification(following, `${follower} has followed you`);
  }
};

const parseCuration = (author, permlink, weight) => {
  if (trackCuration.indexOf(author) !== -1) {
    sendNotification(
      author,
      `Your post ${permlink} has been ${
        weight < 6600 ? 'honoured' : 'curated'
      } by the TravelFeed curation team!`,
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
            res.value.required_posting_auths,
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
