# API
FROM node:alpine as dployer-api
WORKDIR '/dployer/api'
COPY api/package*.json ./
RUN npm install --silent
COPY api ./
RUN rm -f .env
COPY api/.sample_env ./.env
CMD ["npm", "start"]

# CLIENT
FROM node:alpine as dployer-client
WORKDIR '/dployer/client'
COPY client/package*.json ./
RUN npm install --silent
COPY client ./
CMD ["npm", "run", "start-prod"]

# DRONE PLUGIN NODE
FROM node:alpine as dployer-drone-plugin
WORKDIR '/dployer/drone-plugin'
RUN npm i -g --silent typescript
RUN npm i -g --silent ts-node
COPY drone-plugin/package*.json ./
RUN npm i --silent
COPY drone-plugin/index.ts ./index.ts
RUN chmod +x /dployer/drone-plugin/index.ts
RUN apk -Uuv add curl ca-certificates
ENTRYPOINT /dployer/drone-plugin/index.ts
