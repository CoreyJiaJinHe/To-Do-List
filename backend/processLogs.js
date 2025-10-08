const readline = require('readline');

// Create an interface to read logs from stdin
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

rl.on('line', (line) => {
  try {
    // Parse the log line as JSON
    const log = JSON.parse(line);

    // Extract the fields you care about
    const timestamp = log.t?.$date || 'N/A';
    const message = log.msg || 'No message';

    // Output the simplified log
    console.log(`[${timestamp}] ${message}`);
  } catch (err) {
    // If the line is not valid JSON, ignore it
    console.error('Invalid log line:', line);
  }
});