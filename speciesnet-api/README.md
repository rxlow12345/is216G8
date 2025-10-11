# Building Docker Image Locally (Skip to Deployment if not building the image)

## Build

`docker build -t speciesnet-api .`

## Test locally

`docker run -p 8000:8000 speciesnet-api`

## Push if works

```
docker login
docker tag speciesnet-api ryanc9029/speciesnet-api:latest
docker push ryanc9029/speciesnet-api:latest
```

# Deployment on Google Cloud

Using machine type: e2-standard-2 (2 vCPUs, 8 GB Memory)

Storage: 40gb

Allow HTTP and HTTPS

## Docker Image URL and Tag

Docker image URL:
`https://hub.docker.com/layers/ryanc9029/speciesnet-api/latest/images/sha256-5761217309157d47d73a144973bca41cfb702a6dc1ba860c286d3fbe59e3383b`

Docker image tag
`docker.io/ryanc9029/speciesnet-api:latest`

## Pull

Change disk size to ~40gb before pulling to be safe
`docker pull docker.io/ryanc9029/speciesnet-api:latest 2>&1 | tee speciesnet_pull.log`

## Run

`docker run -d -p 8000:8000 --name speciesnet ryanc9029/speciesnet-api:latest`

## Diagnostics

Bunch of commands for diagnosing problems

```
docker stop speciesnet
docker rm speciesnet
docker logs speciesnet
docker run -it ryanc9029/speciesnet-api:latest bash
```
