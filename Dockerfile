
FROM node:18

WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are
# copied where available (npm@5+)

COPY package*json ./

RUN npm install

## Include the app's source code
COPY . .

EXPOSE 3000

CMD [ "npm", "start" ]
