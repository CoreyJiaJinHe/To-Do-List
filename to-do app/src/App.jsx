import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Spinner from'./components/Spinner.jsx'
import axios from "axios";
import TaskCard from './components/TaskCard.jsx'
//const axios=require('axios/dist/browser/axios.cjs');


//This fixes INVALID_URL error with Axios
const API_URL="http://localhost:8080/api";
const api= axios.create({baseURL: API_URL});

function App() {
  const [count, setCount] = useState(0)
  const[data, setData]=useState('')
  const [isLoading, setIsLoading]=useState(false);
  const[todoList, setToDoList]=useState([]);
  const [insertTask,setInsertTask]=useState('');
  const[errorMessage,setErrorMessage]=useState('');



  const [doOnce, setDoOnce]=useState(false);

  async function greetHandShake(){

      try{
        setIsLoading(true);
        const response= await axios.get(`${API_URL}/hello-world`);
        const data= await response.data.message
        console.log(response)
        if (response.statusText!="OK"){
          throw new Error ('Failed to connect');
        }
        if (response.Response==='False')
        {
          setErrorMessage(data.Error || 'Failed to retrieve message');
          return;
        }
        console.log("The message is:" +data)
      }
      catch(error){
        console.log(error)
      }
      finally {
        setIsLoading(false)
      }
    }
  
  useEffect(()=>{
    if (!doOnce)
    {
      //greetHandShake();
      setDoOnce(true);
      fetchToDoList();
    }
  })

  const [val, setVal]=useState('')
  const [isChecked, setIsChecked]=useState(false)

  const click=()=>{
    setVal(val)
    setInsertTask(val)
    console.log("Value was changed:" +insertTask)

    callBackEnd()
  }

  //BULLSHIT CORS ISSUES. MIGRATE OVER TO AXIOS.
  async function callBackEnd(){
    try{
      setIsLoading(true)
      const response=await axios.post(`${API_URL}/todos`,{
        headers:{'Content-Type':'application/json'},
          text: `${insertTask}`
        }
      )
      console.log(response)
        if (response.statusText!="Created"){
          throw new Error ('Failed to post');
        }
      if (response.Response==='False')
        {
          setErrorMessage(data.Error || 'Failed to connect');
          return;
        }
      console.log("The task has been posted")
    }
    catch(error){
      console.log(error)
    }
    finally {
      setIsLoading(false)
    }
}
  const change=event=>{
    setVal(event.target.value)
  }

  const handleCheckBoxChange=(event)=>{
    setIsChecked(event.target.checked);
  }

  

  async function fetchToDoList(){
    try{
      setIsLoading(true)
      setErrorMessage('');
      const response=await axios.get(`${API_URL}/todos`)
      console.log(response)
        if (response.statusText!="OK"){
          throw new Error ('Failed to get');
        }
      if (response.Response==='False')
        {
          setErrorMessage(data.Error || 'Failed to connect');
          return;
        }
      console.log("Tasks have been retrieved")
      console.log(response.data)
      setToDoList(response.data||[])

    }
    catch(error){
      console.log(error)
    }
    finally {
      setIsLoading(false)
    }
  }



//DO CSS NEXT. LEARN TAILWIND CSS
  return (
    <main>
      <div class='w-full px-3 py-4 grid grid-cols-1 gap-4'>
        <div class="flex items-stretch justify-center mx-auto mt-20 mb-20">
          <h2>To-Do List</h2>
        </div>
        <div className="inserts bg-white text-black m-2 w-25/100 justify-center mx-auto p-10 rounded-lg bg-light">
          <div className="col-span-2">
              <input onChange={change} className="w-80/100 border-solid border-black border-2 p-2 rounded-lg" 
              value={val}
              type="text"
              placeholder="Add a new ToDo"/>

              <button className="float-right border-solid border-black border-2 p-2 rounded-lg"onClick={click}>Add</button>
          </div>
        <div className="all-tasks" class="mt-10">
          <ul>
            {todoList.map((todo)=>(
              <TaskCard key={todo._id} todo={todo}/>
              //const[todoList, setToDoList]=useState([]);
              
            ))}
          </ul>
        </div>
        </div>
      </div>
    </main>
  )
}

export default App
