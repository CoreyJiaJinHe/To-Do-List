const fs = require('fs');
const path = require('path');

// Path to the MongoDB log file
const logFilePath = '/var/log/mongodb/mongod.log';

// Function to truncate the log file
const truncateLogs = () => {
  try {
    // Truncate the log file by writing an empty string
    fs.writeFileSync(logFilePath, '');
    console.log(`Log file truncated at ${new Date().toISOString()}`);
  } catch (err) {
    console.error(`Failed to truncate log file: ${err.message}`);
  }
};

// Periodically truncate the log file every hour (3600 seconds)
setInterval(truncateLogs, 3600 * 1000); // 1 hour