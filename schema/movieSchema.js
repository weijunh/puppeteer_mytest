
const mongoose = require('mongoose')

const movieSchema = new mongoose.Schema({
    movieLink: String,
    imgLink: String,
    title: String,
    rating: Number,
    director: String,
    summary: String

})

const Movies = mongoose.model('movies', movieSchema)

module.exports = Movies