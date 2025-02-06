const express=require("express");
const mongoose = require('mongoose');
const cors=require('cors')
const dotenv=require('dotenv');
const todoModel=require('./models/todoModel')

dotenv.config();

const app=express();
const port = process.env.PORT || 8080;


app.use(express.json());
app.use(cors());
app.options('*', cors());

app.get("/api/hello-world",(req,res)=>{
  res.status(200).json({message: "hello world I am the back",status:200});
})
//DO NOT FUCKING USE RETURN, IT BREAKS THINGS.


mongoose.connect(process.env.MONGODB_URI, {useNewUrlParser:true, useUnifiedTopology:true})
.then(()=>{
  console.log('Connected to MongoDB');
})
.catch((err)=>{
  console.error('Error connecting to MongoDB:',err);
})


const Todo=todoModel

//CRUD, Create, Read, Update, Delete
// Create a new ToDo
app.post("/api/todos", cors() ,(req, res) => {
  console.log(req.body)
  try {
    const inputText = req.body.text;
    
    const todo = new Todo({ taskToBeDone: inputText, completed: false });
    todo.save();
    //res.set('Access-Control-Allow-Origin', '*');
    console.log('Attempted to save to MongoDB');
    res.status(201).json({message: "Successfully saved", status:200, todo});
  } catch (err) {
    res.status(400).json({ error: 'Failed to create ToDo' });
  }
});

// Read all ToDos
app.get('/api/todos', cors() ,async (req, res) => {
  try {
    const todos = await Todo.find({},);
    //const cursor = db.collection('todos').find({taskToBeDone, completed});
    console.log('Attempted to retrieve from MongoDB');
    //cursor=cursor.toArray();
    //console.log(todos)

    //console.log(res.status(200).json(cursor, 200));
    //res.status(200).json(cursor);
    res.status(200).json(todos)
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve ToDos' });
  }
});

// Update a ToDo
app.put('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { text, completed } = req.body;
    const todo = await Todo.findByIdAndUpdate(id, { text, completed }, { new: true });
    res.json(todo);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update ToDo' });
  }
});

// Delete a ToDo
app.delete('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Todo.findByIdAndDelete(id);
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete ToDo' });
  }
});










app.listen(port, ()=>{
  console.log("Listening");
})