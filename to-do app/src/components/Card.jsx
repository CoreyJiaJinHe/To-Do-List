import React from 'react';

const Card=({todo:{task, status}})=>{
    return(
        <div className="todo-card">

            <div className="mt-4">
                <h3>{task}</h3>
                <div className="status">
                    <p>{status ? status:" Not finished"}</p>
                </div>
            </div>

        </div>

    )


}
export default Card;