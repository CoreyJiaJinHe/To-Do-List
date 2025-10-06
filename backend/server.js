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

const connectWithRetry = () => {
  mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      console.log('Connected to MongoDB');
    })
    .catch((err) => {
      console.error('Error connecting to MongoDB, retrying in 5 seconds:', err.message);
      setTimeout(connectWithRetry, 5000);
    });
};

connectWithRetry();

const Todo=todoModel

//CRUD, Create, Read, Update, Delete
// Create a new ToDo
app.post("/api/todos", cors() ,(req, res) => {
  try {
    const inputText = req.body.text;
    const todo = new Todo({ taskToBeDone: inputText, completed: false });
    todo.save();
    res.status(201).json({message: "Successfully saved", status:200, todo});
  } catch (err) {
    res.status(400).json({ error: 'Failed to create ToDo' });
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
    const newStatus=req.body.completed;
    const todo = await Todo.findByIdAndUpdate(id, {completed: newStatus });
    if (newStatus)
    {
      const result = await completed.findOne({taskToBeDone:todo.taskToBeDone}).select("_id").lean();
      if (result==null){
        const newEntry = new completed({taskToBeDone:todo.taskToBeDone, dateCompleted:Date()})
          newEntry.save();
          res.status(200).json(todo);
      }
    }
  } catch (err) {
    res.status(400).json({ error: 'Failed to update ToDo' });
  }
});

// Delete a ToDo
app.delete('/api/todos/:id', cors(), async (req, res) => {
  
  try {
    const { id } = req.params;
    console.log("I have deleted object with "+id);
    await Todo.findByIdAndDelete(id);
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete ToDo' });
  }
});

app.use(express.static('./public'));

// app.get('/react',function(req,res,next){
//   console.log("React Frontend Deployed")
//   res.render('index-CTaU7-Oy.js')
// })


app.listen(port, ()=>{
  console.log("Listening. Connect using localhost:8080");
})