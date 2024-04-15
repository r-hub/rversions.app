FROM node:20-alpine

WORKDIR /src

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are
# copied where available (npm@5+)

COPY package*json /
EXPOSE 80
ENV PORT=80

RUN npm install -g nodemon && npm install
COPY . .
RUN npm ci

ENV R_VERSIONS_CACHE_LIMIT=3600000

CMD [ "npm", "start" ]
