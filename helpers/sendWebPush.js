const webpush = require('web-push');
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const { FCM_API_KEY, FCM_EMAIL, WEB_PUSH_PUB, WEB_PUSH_PRIV } = process.env;

webpush.setGCMAPIKey(FCM_API_KEY);
webpush.setVapidDetails(FCM_EMAIL, WEB_PUSH_PUB, WEB_PUSH_PRIV);

const sendWebPush = (token, payload) => {
  webpush
    .sendNotification(JSON.parse(token), JSON.stringify(payload))
    .then(res => {
      console.log(res);
    })
    .catch(err => {
      console.log(err);
    });
};

module.exports = {
  sendWebPush,
};
