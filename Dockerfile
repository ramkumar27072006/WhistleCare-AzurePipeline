FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install --production

# Bundle app source
COPY . .

# Expose the API port
EXPOSE 3000

# Start the application
CMD [ "npm", "start" ]
