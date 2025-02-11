const mongoose = require ('mongoose');

const finishedSchema = mongoose.Schema(
    {
        taskToBeDone:{
            type: String,
            required: [true, 'Please add a text value'],
        },
        dateCompleted:{
            type: Date,
            required:[true]
        }
    }
);

module.exports=mongoose.model('finishedTask',finishedSchema);