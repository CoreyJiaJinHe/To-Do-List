const mongoose = require('mongoose');

// Retry connection function
const connectWithRetry = async (uri, options) => {
  let isConnected = false;
  while (!isConnected) {
    try {
      console.log(`Attempting to connect to MongoDB at ${uri}...`);
      const connection = await mongoose.createConnection(uri, options);
      console.log(`Connected to MongoDB at ${uri}`);
      isConnected = true;
      return connection;
    } catch (err) {
      console.error(`Failed to connect to MongoDB at ${uri}, retrying in 5 seconds...`, err.message);
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds before retrying
    }
  }
};

// Connect to the local database
const localDbUri = 'mongodb://host.docker.internal:27017/todo-app';
const containerDbUri = 'mongodb://mongo:27017/todo-app';

const localDbOptions = { 
  useNewUrlParser: true, 
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000 // Increase timeout to 30 seconds
};

const containerDbOptions = { 
  useNewUrlParser: true, 
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000 // Increase timeout to 30 seconds
};

const syncDatabases = async () => {
  try {
    const localDb = await connectWithRetry(localDbUri, localDbOptions);
    const containerDb = await connectWithRetry(containerDbUri, containerDbOptions);

    // Define the schema for the ToDo model
    const todoSchema = new mongoose.Schema({
      taskToBeDone: String,
      completed: Boolean,
      dateCompleted: Date,
    });

    // Create models for both databases
    const LocalTodo = localDb.model('Todo', todoSchema);
    const ContainerTodo = containerDb.model('Todo', todoSchema);

    const localTodos = await LocalTodo.find({});
    const containerTodos = await ContainerTodo.find({});

    // Find new tasks in the local database
    for (const localTodo of localTodos) {
      const existsInContainer = containerTodos.some(
        (containerTodo) => containerTodo.taskToBeDone === localTodo.taskToBeDone
      );
      if (!existsInContainer) {
        await ContainerTodo.create(localTodo.toObject());
      }
    }

    // Find new tasks in the container database
    for (const containerTodo of containerTodos) {
      const existsInLocal = localTodos.some(
        (localTodo) => localTodo.taskToBeDone === containerTodo.taskToBeDone
      );
      if (!existsInLocal) {
        await LocalTodo.create(containerTodo.toObject());
      }
    }

    console.log('Databases synchronized successfully!');
    localDb.close();
    containerDb.close();
  } catch (err) {
    console.error('Error synchronizing databases:', err);
  }
};

console.log('Starting database synchronization...');
syncDatabases();