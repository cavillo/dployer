# DRONE PLUGIN NODE
FROM node:alpine as dployer-drone-plugin-node
WORKDIR '/dployer/drone-plugin'
COPY package.json ./
RUN npm install --silent
COPY . ./
CMD ["npm", "start"]
