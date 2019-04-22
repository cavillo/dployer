FROM node:alpine as client-web
WORKDIR '/dployer/client'
COPY client/package*.json ./
RUN npm install --silent
COPY client ./
RUN rm -rf /dployer/client/src/conf/index.ts
CMD ["npm", "run", "start-prod"]
