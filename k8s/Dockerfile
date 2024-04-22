# Use official Node.js image as the base image
FROM node:lts

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install --save

# Copy the rest of the application code
COPY . .

# Expose port 8888 (adjust if your app listens on a different port)
EXPOSE 8888

# Specify the command to run your application
CMD ["node", "instagramMutualsList.js"]
