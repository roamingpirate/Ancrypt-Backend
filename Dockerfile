# Use the official Node.js image from Docker Hub
FROM node:20

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if exists)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

RUN chmod +x /usr/src/app/bin/rhubarb

# Expose the port the app will run on
EXPOSE 8080

# Start the app
CMD ["node", "index.js"]
