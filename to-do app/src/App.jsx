import { useState, useEffect } from 'react'
import axios from "axios";
import TaskCard from './components/TaskCard.jsx'
import CompletedTaskCard from './components/CompletedTaskCard.jsx'
import { useDebounce } from 'react-use';
//const axios=require('axios/dist/browser/axios.cjs');

//MERGED REACT FRONT END WITH BACKEND
//REACT TODO LIST CAN BE ACCESS BY RUNNING NODE SERVER.JS
//ACCESSED AT LOCALHOST:8080

//This fixes INVALID_URL error with Axios
const API_URL = "http://localhost:8080/api";
const api = axios.create({ baseURL: API_URL });

function App() {
  const [data, setData] = useState('')
  const [isLoading, setIsLoading] = useState(false);
  const [todoList, setToDoList] = useState([]);
  const [insertTask, setInsertTask] = useState('');
  const [completedList, setCompletedList] = useState([]);
  const [whichList, setWhichList] = useState(true);


  const [doOnce, setDoOnce] = useState(false);

  //IMPLEMENT DEBOUNCE TO REFRESH TASKS AFTER DELETE AND INSERTION

  useEffect(() => {
    if (!doOnce) {
      setDoOnce(true);
      refreshLists();
    }
  }, [])

  //BULLSHIT CORS ISSUES. MIGRATE OVER TO AXIOS.
  //SUCCESS
  async function callBackEnd() {
    console.log("Tasks refreshed");
    try {
      setIsLoading(true)
      const response = await axios.post(`${API_URL}/todos`, {
        headers: { 'Content-Type': 'application/json' },
        text: `${insertTask}`
      }
      )
      console.log(response)
      if (response.statusText != "Created") {
        throw new Error('Failed to post');
      }
      if (response.Response === 'False') {
        setErrorMessage(data.Error || 'Failed to connect');
        return;
      }
      console.log("The task has been posted")
    }
    catch (error) {
      console.log(error)
    }
    finally {
      setIsLoading(false)
      refreshLists()
    }
  }

  //FIXED OUTPUT
  async function fetchToDoList() {
    try {
      setIsLoading(true)
      setErrorMessage('');
      const response = await axios.get(`${API_URL}/todos`)
      //console.log(response)
      if (response.statusText != "OK") {
        throw new Error('Failed to get');
      }
      if (response.Response === 'False') {
        setErrorMessage(data.Error || 'Failed to connect');
        return;
      }
      //console.log("Tasks have been retrieved")
      const dataY = await response
      const dataX = JSON.parse(JSON.stringify(dataY)).data
      //console.log(dataX)
      dataX.map(setToDoList)
      //console.log(dataY[0].taskToBeDone)
      setToDoList(await dataX)
      //console.log(setToDoList)

    }
    catch (error) {
      console.log(error)
    }
    finally {
      setIsLoading(false)
    }
  }

  const btnClick = event => {
    setInsertTask(event.target.value)
    callBackEnd()
  }

  async function fetchCompletedList() {
    try {
      setIsLoading(true)
      setErrorMessage('');
      const response = await axios.get(`${API_URL}/completed`)
      if (response.statusText != "OK") {
        throw new Error('Failed to get');
      }
      if (response.Response === 'False') {
        setErrorMessage(data.Error || 'Failed to connect');
        return;
      }
      console.log("Tasks have been retrieved")
      const dataY = await response
      const dataX = JSON.parse(JSON.stringify(dataY)).data
      dataX.map(setCompletedList)
      setCompletedList(await dataX)
    }
    catch (error) {
      console.log(error)
    }
    finally {
      setIsLoading(false)
    }
  }

  const switchList = (buttonType) => {
    if (buttonType) {
      setWhichList(true);
    }
    else {
      setWhichList(false);
    }
    getTaskCards()
  }

  const getTaskCards = () => {
    if (whichList) {
      const list = todoList.map((todo) => (
        <TaskCard key={todo._id} todo={todo} refreshTasks={refreshLists} />))
      return <ul>{list}</ul>
    }
    else {
      const list = completedList.map((complete) => (
        <CompletedTaskCard key={complete._id} completedTask={complete} />)
      )
      return <ul>{list}</ul>
    }
  }
  function refreshLists(e) {
    fetchToDoList();
    fetchCompletedList()
  }

  function handleKeyPress(e) {
    if (e === 'Enter') {
      callBackEnd()
    }
  }

  //DO CSS NEXT. LEARN TAILWIND CSS
  return (
    <main>
      <div class='w-full px-3 py-4 grid grid-cols-1 gap-4'>
        <div class="flex items-stretch justify-center mx-auto mt-20 mb-20">
          <h2>To-Do List</h2>
        </div>
        <div className="inserts bg-white text-black m-2 w-25/100 justify-center mx-auto rounded-lg bg-light">
          <div className="p-10">
            <button className="float-left border-solid border-black border-2 p-2 rounded-lg" onClick={() => switchList(true)}>To-Do List</button>
            <button className="float-right border-solid border-black border-2 p-2 rounded-lg" onClick={() => switchList(false)}>Completed List</button>

          </div>
          <div className="p-10">
            <div className="col-span-2">
              <input className="w-80/100 border-solid border-black border-2 p-2 rounded-lg"
                onChange={(event) => setInsertTask(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key == 'Enter') {
                    setInsertTask(event.target.value);
                    handleKeyPress(event.key);
                  }
                }}
                type="text"
                value={insertTask}
                placeholder="Add a new ToDo" />

              <button className="float-right border-solid border-black border-2 p-2 rounded-lg" onClick={btnClick}>Add</button>
            </div>
            <div className="all-tasks" class="mt-10 max-h-100 overflow-scroll overflow-x-hidden">
              {getTaskCards()}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default App
