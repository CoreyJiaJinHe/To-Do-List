import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const[data, setData]=useState('')




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
    }



  useEffect(()=>{
    greetHandShake();
  })
  return (
    <>
      <div>
      <h3>Maybe I am working</h3>
      {data? data:"Loading..."}
      </div>
    </>
  )
}

export default App
