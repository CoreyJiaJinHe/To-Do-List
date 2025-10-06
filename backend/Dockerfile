# Use a Node.js base image
FROM node:18

# Install ping
RUN apt-get update && apt-get install -y iputils-ping

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the backend runs on
EXPOSE 8080

# Command to run the backend
# Run the synchronization script and then start the backend
CMD ["sh", "-c", "node syncDatabases.js && node server.js"]
# Note: Ensure that the frontend is built and served correctly, possibly using a multi-stage build if needed.