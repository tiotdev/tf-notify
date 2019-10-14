const notificationTypes = {
  FOLLOW: 'follow',
  REPLY: 'reply',
  MENTION: 'mention',
  HONOUR: 'honour',
  CURATION: 'curation',
};

const messageFromNotification = (type, author, permlink) => {
  let body = '';
  let title = '';
  let actions;
  const icon = 'https://travelfeed.io/android-chrome-192x192.png';
  let data = {
    author,
    permlink,
  };

  switch (type) {
    case notificationTypes.CURATION:
      title = 'Your post is featured!';
      body = `Your post was curated by the TravelFeed curation team!`;
      actions = [
        {
          action: 'open-post',
          title: 'View post',
        },
      ];
      break;

    case notificationTypes.HONOUR:
      title = 'Keep up the good work!';
      body = `We have chosen your post for a small upvote!`;
      actions = [
        {
          action: 'open-post',
          title: 'View post',
        },
      ];
      break;

    case notificationTypes.REPLY:
      title = `New reply`;
      body = `${author} replied to your post`;
      actions = [
        {
          action: 'open-post',
          title: 'Go to reply',
        },
      ];
      break;

    case notificationTypes.FOLLOW:
      title = 'New follower';
      body = `${author} follows you`;
      data = undefined;
      break;

    case notificationTypes.MENTION:
      title = 'New mention';
      body = `${author} mentioned you`;
      actions = [
        {
          action: 'open-post',
          title: 'Go to post',
        },
      ];
      break;

    default:
      title = 'New notification';
      body = 'You have a new notification';
      data = undefined;
  }

  const res = { body, title, actions, icon };
  if (actions) res.actions = actions;
  if (data) res.data = data;
  return res;
};

module.exports = {
  messageFromNotification,
};
