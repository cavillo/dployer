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
CMD ["npm", "start"]

