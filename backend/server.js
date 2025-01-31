const express=require("express");
const mongoose = require('mongoose');
const cors=require('cors')
const dotenv=require('dotenv');

dotenv.config();

const app=express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.get("/api/hello-world",(req,res)=>{
  res.status(200).json({message: "hello world I am the back",status:200});
})
//DO NOT FUCKING USE RETURN, IT BREAKS THINGS.


app.listen(port, ()=>{
  console.log("Listening");
})



mongoose.connect(process.env.MONGODB_URI, {useNewUrlParser:true, useUnifiedTopology:true})
.then(()=>{
  console.log('Connected to MongoDB');
})
.catch((err)=>{
  console.error('Error connecting to MongoDB:',err);
})


const todoSchema = new mongoose.Schema({
  text: String,
  completed: Boolean,
})

const Todo=mongoose.model('Todo',todoSchema)

//CRUD, Create, Read, Update, Delete
// Create a new ToDo
app.post('/api/todos', async (req, res) => {
  try {
    const { text } = req.body;
    const todo = new Todo({ text, completed: false });
    await todo.save();
    res.status(201).json(todo);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create ToDo' });
  }
});

// Read all ToDos
app.get('/api/todos', async (req, res) => {
  try {
    const todos = await Todo.find();
    res.json(todos);
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