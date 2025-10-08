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
# Ensure the processLogs.js script is executable
RUN chmod +x processLogs.js

# Command to run the backend
CMD ["sh", "/app/start.sh"]
# Note: Ensure that the frontend is built and served correctly, possibly using a multi-stage build if needed.