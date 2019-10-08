# TravelFeed notify

This service streams the Steem blockchain from a [meeseeker](https://github.com/inertia186/meeseeker) redis instance and sends web-push notifications to users on certain events.

## Development

1. Run meeseeker as docker container

```
docker run -d --name meeseeker -p 6380:6379 --env MEESEEKER_PUBLISH_OP_CUSTOM_ID=true --env MEESEEKER_INCLUDE_VIRTUAL=false inertia/meeseeker:latest
```

2. Run tf-notify

```
npm run dev
```
