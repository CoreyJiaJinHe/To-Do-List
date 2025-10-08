#!/bin/sh

# Run the database synchronization script
echo "Running database synchronization..."
node syncDatabases.js

# Start the backend server
echo "Starting the backend server..."
node server.js &

# Start the log truncation script
echo "Starting the log truncation script..."
node truncateLogs.js &

# Process MongoDB logs
echo "Processing MongoDB logs..."
tail -f /var/log/mongodb/mongod.log | node processLogs.js