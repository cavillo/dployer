FROM node:alpine as client-web
WORKDIR '/dployer/client'
COPY client/package*.json ./
RUN npm install --silent
COPY client ./
CMD ["npm", "start"]

