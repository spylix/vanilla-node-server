FROM node:16-alpine

WORKDIR /usr/src/server

COPY package*.json ./

RUN yarn

COPY . .

EXPOSE 8080

CMD ["node", "index.js"]
