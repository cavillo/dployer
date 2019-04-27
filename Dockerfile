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

# DRONE_PLUGIN
FROM alpine as dployer-drone-plugin
ADD drone-plugin-script.sh /bin/
RUN chmod +x /bin/drone-plugin-script.sh
RUN apk -Uuv add curl ca-certificates
ENTRYPOINT /bin/drone-plugin-script.sh
