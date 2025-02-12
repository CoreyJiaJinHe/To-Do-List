import React from 'react';
import axios from "axios";
import Swal from "sweetalert2";

//This fixes INVALID_URL error with Axios
const API_URL="http://localhost:8080/api";
const api= axios.create({baseURL: API_URL});

const deleteTask = async (id,refreshTasks)=>{
    const result = await Swal.fire({
        title: 'Do you really want to delete this task?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    })
    if (result.isConfirmed)
    {
        try{
            //console.log("This is the ID:" +id)
            const response=await axios.delete(`${API_URL}/todos/${id}`)
            Swal.fire({
                title:"Success!",
                text:response.data.message
            })
            //console.log(response)
        }
        catch(error){
            console.log(error.message)
        }
    }
    refreshTasks()
}

//IMPLEMENT UPDATE TASK STATUS
const handleChange=async(id, completed, refreshTasks)=>{
    try{
        //console.log("This is the ID:" +id)
        //console.log(completed)
        const response=await axios.put(`${API_URL}/todos/${id}`, {completed: !completed})
        //console.log("Changed status")
    }
    catch(error){
        console.log(error.message)
    }
    refreshTasks()
}



const TaskCard=({todo:{_id, taskToBeDone, completed}, refreshTasks})=>{
    return(
        <div className="todo-card" class="mt-5 mb-5 border-solid border-black border-2 rounded-lg">
            <div className="st-4 p-2">
                <h3>{taskToBeDone ? taskToBeDone:"Task failed to render"}</h3>
                <div className="status">
                    <button className="float-right border-solid border-black border-2 p-2 rounded-lg" onClick={()=>deleteTask(_id,refreshTasks)}>Remove</button>
                    <p> Status: {completed ? "Finished":"Not finished"}</p>
                    <label>
                        Completed?: <input type="checkbox" name="myCheckbox" onChange={()=>handleChange(_id,completed,refreshTasks)} defaultChecked={completed? true: false} />
                    </label>
                    <label>
                        
                        
                    </label>
                </div>
            </div>

        </div>

    )


}
export default TaskCard;