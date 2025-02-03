import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Spinner from'./components/Spinner.jsx'

function App() {
  const [count, setCount] = useState(0)
  const[data, setData]=useState('')
  const [isLoading, setIsLoading]=useState(false);
  const[todoList, setToDoList]=useState([]);
  const [insertTask,setInsertTask]=useState('');
  const[errorMessage,setErrorMessage]=useState('');




  const greetHandShake=async()=>{

    const requestOptions={
      method:'GET',
      headers:{'Content-Type':'application/json'}
    };

    fetch('http://localhost:8080/api/hello-world', requestOptions)
    //.then (res=>console.log(res.message))
    .then(res=>(res.json()))
    .then(data=>setData(data.message))
    .catch(err=>console.log(err));

    console.log(data)
    }

  useEffect(()=>{
    greetHandShake();
    //fetchToDoList();
  })

  const fetchToDoList=async()=>{
    const requestOptions={
      method:'GET',
      headers:{'Content-Type':'application/json'}

    };

    setErrorMessage('');
    setIsLoading(true);
    try{
    fetch('http://localhost:8080/api/todos',requestOptions) //
    .then(res=>(res.json()))
    .then(todoList=>setToDoList(todoList||[]))
    }
    catch(error){
      console.error(`Error fetching data: ${error}`);
      setErrorMessage('Try again later.');
    }
    finally{
      setIsLoading(false);
    }
  }

  const [val, setVal]=useState('')
  const [isChecked, setIsChecked]=useState(false)

  const click=()=>{
    setVal(val)
    setInsertTask(val)
    console.log("Value was changed:" +insertTask + val)

    callBackEnd()
    
    //app.post('/api/todos', async (req, res) => {
  }

  //BULLSHIT CORS ISSUES. MIGRATE OVER TO AXIOS.
  const callBackEnd=async()=>{
    const requestOptions={
      method:'POST',
      mode: "cors",
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({insertTask})
    };

    fetch('https://localhost:8080/api/todos', requestOptions)
    .then(res=>(res.json()))
    .then (data => setData(data.message))
    .catch(err=>console.log(err))
    
    console.log(data.message)
  }

  const change=event=>{
    setVal(event.target.value)
  }

  const handleCheckBoxChange=(event)=>{
    setIsChecked(event.target.checked);
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

              
        </div>


        <div className="all-tasks">
          (<ul>
            {todoList.map((todo)=>(
              <Card key={todo.task} task={todo.task} status={todo.status}/>

              //<input type="checkbox" checked={isChecked} onChange={handleCheckBoxChange}/>
              
            ))}
          </ul>)
        </div>
      
      {data? data:"Loading..."}
      
      </div>
    </main>
  )
}

export default App
