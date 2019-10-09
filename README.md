# TravelFeed notify

This service streams the Steem blockchain from a [meeseeker](https://github.com/inertia186/meeseeker) redis instance and sends web-push notifications to users on certain events. The 20 most recent notifications (per user) are additionally stored in mongodb.

## Development

1. Run meeseeker as docker container

Use the anyx.io node to avoid problems caused by api.steemit.com.

```
docker run -d --name meeseeker -p 6379:6379 --env MEESEEKER_PUBLISH_OP_CUSTOM_ID=true --env MEESEEKER_NODE_URL=https://anyx.io --env MEESEEKER_INCLUDE_VIRTUAL=false inertia/meeseeker:latest
```

2. Run tf-notify

Nodemon automatically restarts on changes.

```
npm run dev
```

## Production

1. Run meeseeker as docker container

```
docker run -d --name meeseeker --env MEESEEKER_PUBLISH_OP_CUSTOM_ID=true --env MEESEEKER_INCLUDE_VIRTUAL=false --env MEESEEKER_EXPIRE_KEYS=300 --env MEESEEKER_NODE_URL=https://anyx.io --restart unless-stopped inertia/meeseeker:latest
```

2. Pull tfnotify from Docker hub & run

```
docker run -d --link meeseeker:meeseeker --env-file .env --restart unless-stopped travelfeed/tfnotify
```
