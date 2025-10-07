//To Run: node server.js in console

const express=require("express");
const mongoose = require('mongoose');
const cors=require('cors')
const dotenv=require('dotenv');
const todoModel=require('./models/todoModel')
const finishedModel=require('./models/finishedModel')

dotenv.config();

const app=express();
const port = process.env.PORT || 8080;


app.use(express.json());
app.use(cors());
app.options('*', cors());

//DO NOT FUCKING USE RETURN, IT BREAKS THINGS.


//= mongoose.connect(process.env.MONGODB_URI, {useNewUrlParser:true, useUnifiedTopology:true})
// .then(()=>{
//   console.log('Connected to MongoDB');
// })
// .catch((err)=>{
//   console.error('Error connecting to MongoDB:',err);
// })



class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

class DatabaseConnectionError extends Error {
  constructor(message) {
    super(message);
    this.name = 'DatabaseConnectionError';
  }
}




const connectWithRetry = () => {
  mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      console.log('Connected to MongoDB');
      processQueue(); // Process the queue when MongoDB reconnects
    })
    .catch((err) => {
      console.error('Error connecting to MongoDB, retrying in 5 seconds:', err.message);
      setTimeout(connectWithRetry, 5000);
    });
};

connectWithRetry();

const MAX_RETRIES = 5; // Maximum number of retries for an operation
const operationQueue = [];
let isProcessingQueue = false;
const processQueue = async () => {
  if (isProcessingQueue) return; // Prevent multiple concurrent queue processors
  isProcessingQueue = true;

  while (operationQueue.length > 0) {
    const operation = operationQueue.shift(); // Get the next operation from the queue
    try {
      console.log(`Processing queued operation: ${operation.type}`);
      await operation.execute(); // Execute the operation
      console.log(`Successfully processed operation: ${operation.type}`);
    } catch (err) {
      console.error(`Failed to process operation: ${operation.type}`, err.message);

      // Increment retry count and re-add to the queue if under the retry limit
      operation.retryCount = (operation.retryCount || 0) + 1;
      if (operation.retryCount <= MAX_RETRIES) {
        console.log(
          `Retrying operation: ${operation.type} (Attempt ${operation.retryCount}/${MAX_RETRIES})`
        );
        operationQueue.unshift(operation); // Re-add the operation to the front of the queue
      } else {
        console.error(
          `Operation failed after ${MAX_RETRIES} attempts: ${operation.type}`
        );
      }
      break; // Stop processing if an operation fails
    }
  }

  isProcessingQueue = false;
};

app.get('/api/queue-status', cors(), (req, res) => {
  const queueStatus = operationQueue.map((operation, index) => ({
    position: index + 1,
    type: operation.type,
    retryCount: operation.retryCount || 0,
  }));

  res.status(200).json({
    queueSize: operationQueue.length,
    operations: queueStatus,
  });
});

setInterval(() => {
  console.log(`Queue size: ${operationQueue.length}`);
  operationQueue.forEach((operation, index) => {
    console.log(
      `Position ${index + 1}: Type=${operation.type}, Retries=${operation.retryCount || 0}`
    );
  });
}, 600000); // Log every 10 minutes

const ensureDatabaseConnection = () => {
  if (mongoose.connection.readyState !== 1) {
    throw new DatabaseConnectionError('Database is not connected');
  }
};


const Todo=todoModel

//CRUD, Create, Read, Update, Delete
// Create a new ToDo
app.post("/api/todos", cors(), async (req, res) => {
  try {
    const inputText = req.body.text;

    // Validate and sanitize input
    const sanitizedText = validateInputandSanitize(inputText);

    // Ensure database connection
    ensureDatabaseConnection();

    const todo = new Todo({ taskToBeDone: sanitizedText, completed: false });
    await todo.save();
    res.status(201).json({ message: "Successfully saved", status: 200, todo });
  } catch (err) {
    if (err instanceof ValidationError) {
      console.error('Validation error:', err.message);
      return res.status(400).json({ error: err.message });
    }
    if (err instanceof DatabaseConnectionError) {
      console.error('Database connection error:', err.message);
      operationQueue.push({
        type: 'create',
        execute: async () => {
          const inputText = req.body.text;
          const sanitizedText = validateInputandSanitize(inputText);
          const todo = new Todo({ taskToBeDone: sanitizedText, completed: false });
          await todo.save();
        }
      });
      return res.status(202).json({ message: 'ToDo queued for creation' });
    }

    console.error('Unexpected error:', err.message);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
});

// Read all ToDos
app.get('/api/todos', cors() ,async (req, res) => {
  try {
    const todos = await Todo.find({},);
    res.status(200).json(todos)
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve ToDos' });
  }
});



app.get('/api/completed', cors() ,async (req, res) => {
  try {
    const completeTasks = await completed.find({},);
    res.status(200).json(completeTasks)
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve completed' });
  }
});


const completed=finishedModel
// Update a ToDo
app.put('/api/todos/:id', cors(), async (req, res) => {
  try {
    const { id } = req.params;
    const newStatus = req.body.completed;

    // Validate Object ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    // Validate `completed` field
    if (typeof newStatus !== 'boolean') {
      return res.status(400).json({ error: 'Invalid value for completed field' });
    }
    // Ensure database connection
    ensureDatabaseConnection();
// If marking as completed, move the task to the `finishedtasks` collection
    if (newStatus === true) {
      const todo = await Todo.findById(id);
      if (!todo) {
        return res.status(404).json({ error: 'ToDo not found' });
      }

      // Check if the task already exists in the `finishedtasks` collection
      const existingFinishedTask = await completed.findOne({ taskToBeDone: todo.taskToBeDone }).select('_id').lean();
      if (existingFinishedTask == null) {
        // Create a new entry in the `finishedtasks` collection
        const newEntry = new completed({
          taskToBeDone: todo.taskToBeDone,
          dateCompleted: new Date(), // Add the current date
        });
        await newEntry.save();

        // Delete the original task from the `todos` collection
        await Todo.findByIdAndDelete(id);

        return res.status(200).json({ message: 'Task moved to finished tasks', task: newEntry });
      } else {
        return res.status(400).json({ error: 'Task already exists in finished tasks' });
      }
    }

    // If not marking as completed, simply update the `completed` field
    const todo = await Todo.findByIdAndUpdate(id, { completed: newStatus }, { new: true });
    if (!todo) {
      return res.status(404).json({ error: 'ToDo not found' });
    }

    res.status(200).json(todo);
  } catch (err) {
    if (err instanceof DatabaseConnectionError) {
      console.error('Database connection error:', err.message);
      operationQueue.push({
        type: 'update',
        execute: async () => {
          const todo = await Todo.findById(id);
          if (newStatus === true && todo) {
            const existingFinishedTask = await completed.findOne({ taskToBeDone: todo.taskToBeDone }).select('_id').lean();
            if (existingFinishedTask == null) {
              const newEntry = new completed({
                taskToBeDone: todo.taskToBeDone,
                dateCompleted: new Date(),
              });
              await newEntry.save();
              await Todo.findByIdAndDelete(id);
            }
          } else {
            await Todo.findByIdAndUpdate(id, { completed: newStatus });
          }
        }
      });
      console.log(`Operation queued. Current queue size: ${operationQueue.length}`);
      return res.status(202).json({ message: 'ToDo queued for update' });
    }

    console.error('Unexpected error:', err.message);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
});

// Delete a ToDo
app.delete('/api/todos/:id', cors(), async (req, res) => {
  try {
    const { id } = req.params;

    
    // Validate Object ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    
    // Ensure database connection
    ensureDatabaseConnection();

    // Perform the operation
    const todo = await Todo.findByIdAndDelete(id);
    if (!todo) {
      return res.status(404).json({ error: 'ToDo not found' });
    }
    res.status(204).send();
  } catch (err) {
    if (err instanceof DatabaseConnectionError) {
      console.error('Database connection error:', err.message);
      operationQueue.push({
        type: 'delete',
        execute: async () => {
          await Todo.findByIdAndDelete(id);
        }
      });
      console.log(`Operation queued. Current queue size: ${operationQueue.length}`);
      return res.status(202).json({ message: 'ToDo queued for deletion' });
    }

    console.error('Unexpected error:', err.message);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
});

app.use(express.static('./public'));

// app.get('/react',function(req,res,next){
//   console.log("React Frontend Deployed")
//   res.render('index-CTaU7-Oy.js')
// })


const rateLimitMap = new Map();

const validateInputandSanitize = (input) => {
  if (input.length < 1 || input.length > 200) {
    throw new ValidationError('Input must be between 1 and 200 characters');
  }
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

const rateLimiter = (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  const windowSize = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 100;

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, []);
  }

  const timestamps = rateLimitMap.get(ip);
  const filteredTimestamps = timestamps.filter((timestamp) => now - timestamp < windowSize);

  if (filteredTimestamps.length >= maxRequests) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }

  filteredTimestamps.push(now);
  rateLimitMap.set(ip, filteredTimestamps);

  next();
};

// Apply the rate limiter to all routes
app.use(rateLimiter);




app.listen(port, ()=>{
  console.log("Listening. Connect using localhost:8080");
})