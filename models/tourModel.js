const mongoose = require('mongoose')

const tourSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true, 'Tour must have a name'],
        unique:true
    },
    price:{
        type:Number,
        required: [true, 'Tour must have a price'],
    },
    rating:{
        type:Number,
        required: true
    }
})

const Tour = mongoose.model('Tour', tourSchema)

module.exports = Tour