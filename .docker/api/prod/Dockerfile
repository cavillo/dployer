FROM node:alpine as service-api
WORKDIR '/dployer/api'
COPY api/package*.json ./
RUN npm install --silent
COPY api ./
RUN rm -f .env
COPY api/.sample_env ./.env
CMD ["npm", "start"]
