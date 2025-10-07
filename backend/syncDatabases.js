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

const dotenv=require('dotenv');
dotenv.config();

// Connect to the local database
const localDbUri = process.env.LOCAL_DB_URI;
const containerDbUri = process.env.CONTAINER_DB_URI;

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

    const copiedToContainer = [];
    const copiedToLocal = [];

        
    // Find new tasks in the local database and sync to the container database
    for (const localTodo of localTodos) {
      const existsInContainer = containerTodos.some(
        (containerTodo) => containerTodo.taskToBeDone === localTodo.taskToBeDone
      );
      if (!existsInContainer) {
        await ContainerTodo.create(localTodo.toObject());
        copiedToContainer.push(localTodo.taskToBeDone);
        console.log(`Copied to container database: Task="${localTodo.taskToBeDone}", Completed=${localTodo.completed}`);
      }
    }

    // Find new tasks in the container database and sync to the local database
    for (const containerTodo of containerTodos) {
      const existsInLocal = localTodos.some(
        (localTodo) => localTodo.taskToBeDone === containerTodo.taskToBeDone
      );
      if (!existsInLocal) {
        await LocalTodo.create(containerTodo.toObject());
        copiedToLocal.push(containerTodo.taskToBeDone);
        console.log(`Copied to local database: Task="${containerTodo.taskToBeDone}", Completed=${containerTodo.completed}`);
      }
    }


    // Log a summary of the synchronization process
    console.log('Synchronization Summary:');
    console.log(`Tasks copied to container database: ${copiedToContainer.length > 0 ? copiedToContainer.join(', ') : 'None'}`);
    console.log(`Tasks copied to local database: ${copiedToLocal.length > 0 ? copiedToLocal.join(', ') : 'None'}`);

    console.log('Databases synchronized successfully!');
    localDb.close();
    containerDb.close();
  } catch (err) {
    console.error('Error synchronizing databases:', err);
  }
};

console.log('Starting database synchronization...');
syncDatabases();