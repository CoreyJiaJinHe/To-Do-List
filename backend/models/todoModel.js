const mongoose = require ('mongoose');

const todoSchema = mongoose.Schema(
    {
        text:{
            type: String,
            required: [true, 'Please add a text value'],
        },
        completed:{
            type: Boolean,
            required: [true, 'Please add a boolean value'],
        },
    },
    {
        timestamps:true,
    }
);

module.exports=mongoose.model('Todo',todoSchema);