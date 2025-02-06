import React from 'react';

const TaskCard=({todo:{taskToBeDone, completed}})=>{
    return(
        <div className="todo-card" class="mt-5 mb-5 border-solid border-black border-2 rounded-lg">
            <div className="st-4 p-2">
                <h3>{taskToBeDone ? taskToBeDone:"Task failed to render"}</h3>
                <div className="status">
                    <button className="float-right border-solid border-black border-2 p-2 rounded-lg">Remove</button>
                    <p> Status: {completed ? completed:" Not finished"}</p>
                    <label>
                        Completed?: <input type="checkbox" name="myCheckbox" defaultChecked={false} />
                    </label>
                    <label>
                        
                        
                    </label>
                </div>
            </div>

        </div>

    )


}
export default TaskCard;