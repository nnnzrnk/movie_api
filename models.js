const mongoose = require('mongoose')
const bcrypt = require('bcrypt');
const passport = require('passport');

let movieSchema = mongoose.Schema({
    title: {type: String, required: true},
    description: {type: String, required: true},
    genre: {
        name: String,
        description: String
    },
    director: {
        name: String,
        bio: String
    },
    actors: [String],
    imagePath: String,
    featured: Boolean
});

let userSchema = mongoose.Schema({
    name: {type: String, required: true},
    password:  {type: String, required: true}, 
    email: {type: String, required: true},
    birthday: Date,
    favoriteMovies: [{type: mongoose.Schema.Types.ObjectId, ref: 'Movie'}]
});

userSchema.statics.hashPassword = (password) => {
    return bcrypt.hashSync(password, 10)
}

userSchema.methods.validatePassword = function (password) {
    return bcrypt.compareSync(password, this.password)
}

let movie = mongoose.model('movie', movieSchema);
let user = mongoose.model('user', userSchema);

module.exports.movie = movie;
module.exports.user = user;