# Dployer

[![Build Status](http://cloud.drone.io/api/badges/cavillo/dployer/status.svg)](http://cloud.drone.io/cavillo/dployer)

Dployer is a tool for easily automating the deployment of dockerized applications to your own server.

  - Server & API
  - Web client (dashboard)

Dployer makes simple the deployment cycle (deploy-monitor-redeploy) of an application or project. What it provides is an abstraction to the `docker api` and a re-organization of grouped containers that makes sense to your business demands.
Dployer structure the deployed containers into **applications**, **namespaces** and **deployments**. Applications have namespaces, namespaces have deployments.

# Installation

> **Note:** Dployer assumes your server is already running docker with the needed credentials for registries.


## Via docker-compose

The easiest and fastest way is by using docker-compose.
In your server create a `docker-compose.yml` file and copy the following:

> Set **DPLOYER_API_URL** as the external DNS or ip address (including port) for your server.

```yml
version: '2'
services:
  mongo:
    image: 'bitnami/mongodb:latest'
    restart: always
    ports:
      - '27017:27017'
    environment:
      - MONGODB_USERNAME=usr_mongo_db
      - MONGODB_PASSWORD=pwd_mongo_db
      - MONGODB_DATABASE=dployer
  api:
    depends_on:
      - mongo
    image: 'cavillo/dployer-api:latest'
    environment:
      - MONGO_AUTH_USER=usr_mongo_db
      - MONGO_AUTH_PASSWORD=pwd_mongo_db
      - MONGO_URL='mongodb://mongo'
    ports:
      - '8002:8002'
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
  client:
    image: 'cavillo/dployer-client:latest'
    environment:
      - DPLOYER_API_URL=http://localhost:8002/api
    ports:
      - '3000:3000'
```
Finally start your Dployer
```bash
$ docker-compose up --build --detach
```

# WebClient (Dashboard)

To access the Dashboard open your browser and go to `http://YOUR_SERVER_URL:3000`
You will be ask for a access token that you will find in the logs of the **api service**.

```t
[May 12th 2019, 14:18:02.251] [dployer-api]: ==============
[May 12th 2019, 14:18:02.252] [dployer-api]: Authentication token
[May 12th 2019, 14:18:02.252] [dployer-api]: For api calls, set header Authorization: Bearer #AUTH_TOKEN#

*****************************************
```
> If you installed with docker compose, use `docker-compose logs api` to get the logs of the service.

# CI Integrations

The idea of Dployer is to automate the process of Continuous Integration and Continuous Deployment.
For integrating Dployer to your CI platform, you can use one of the following.

## Drone CI

If you are using Drone.io as your CI Platform, you can integrate Dployer by adding the following step to your pipeline.
```yml
  - name: plugin-test
    image: cavillo/dployer-drone-plugin:latest
    settings:
      api_host: YOUR_SERVER_URL
      api_port: 8002
      api_token:
        from_secret: dployer_token
      application: your-app-name
      namespace: prod
      deployment: hello-world
      image: hello-world
    when:
      event: push
      branch: master
```
