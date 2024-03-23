const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator')

//
const bookSchema = mongoose.Schema({
    userId: { type:String, require:true},
    title: { type:String, require:true, unique:true},
    author: { type:String, require:true},
    imageUrl: { type:String},
    year: { type:Number, require:true},
    genre: { type:String, require:true},
    ratings: [{
        userId : String,
        grade : Number
    }],
    averageRating: {type:Number}
})

bookSchema.plugin(uniqueValidator)

module.exports = mongoose.model('Book', bookSchema)