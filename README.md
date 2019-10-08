# TravelFeed notify

This service streams the Steem blockchain from a [meeseeker](https://github.com/inertia186/meeseeker) redis instance and sends web-push notifications to users on certain events.

## Development

1. Run meeseeker as docker container

```
docker run -d --name meeseeker -p 6379:6379 --env MEESEEKER_PUBLISH_OP_CUSTOM_ID=true --env MEESEEKER_INCLUDE_VIRTUAL=false inertia/meeseeker:latest
```

2. Run tf-notify

```
npm run dev
```

## Production

1. Run meeseeker as docker container

```
docker run -d --name meeseeker --env MEESEEKER_PUBLISH_OP_CUSTOM_ID=true --env MEESEEKER_INCLUDE_VIRTUAL=false --env MEESEEKER_EXPIRE_KEYS=300 inertia/meeseeker:latest --restart unless-stopped
```

2. Pull tfnotify from Docker hub & run

```
docker run -d --link meeseeker:meeseeker --env-file .env travelfeed/tfnotify --restart unless-stopped
```
