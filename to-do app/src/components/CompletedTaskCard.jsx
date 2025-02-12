import React from 'react';
import axios from "axios";
import Swal from "sweetalert2";

//This fixes INVALID_URL error with Axios
const API_URL="http://localhost:8080/api";
const api= axios.create({baseURL: API_URL});

const CompletedTaskCard=({completedTask:{_id, taskToBeDone, dateCompleted}})=>{
    return(
        <div className="todo-card" class="mt-5 mb-5 border-solid border-black border-2 rounded-lg">
            <div className="st-4 p-2">
                <h3>{taskToBeDone ? taskToBeDone:"Task failed to render"}</h3>
                <div className="status">
                    <p> Finish Date: {dateCompleted}</p>
                </div>
            </div>

        </div>

    )


}
export default CompletedTaskCard;