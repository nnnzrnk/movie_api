const PORT = 3000;
const HOST = "localhost";

const express = require("express");
const app = express();
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const uuid = require("uuid");
const { title } = require("process");
const mongoose = require('mongoose');
const Models = require('./models');
const { error } = require("console");

const movies = Models.movie;
const users = Models.user;
mongoose.connect('mongodb://127.0.0.1:27017/cfDB', {useNewUrlParser: true, useUnifiedTopology: true});

app.use(bodyParser.json());

app.use(express.json());
app.use(express.urlencoded({extended: true}))

let auth = require('./auth')(app)
const passport = require('passport')
require('./passport')

const accessLogStream = fs.createWriteStream(path.join(__dirname, "log.txt"), {
  flags: "a",
});
// app.use(morgan('common'))
app.use(morgan("combined", { stream: accessLogStream }));

app.get("/movies", passport.authenticate('jwt', {session: false}),
async (req, res) => {
 await movies.find().then((movies) => {
    res.status(201).json(movies);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err)
  })
});

app.get("/users",passport.authenticate('jwt', {session: false}),
async (req, res) => {
 await users.find().then((users) => {
   res.status(201).json(users)
  }).catch((err) => {
   console.error(err);
   res.status(500).send('Error '+ err)
 })
});


//find movie by title
app.get("/movies/:title", passport.authenticate('jwt', {session: false}),
async (req, res) => {
 await movies.findOne({title: req.params.title})
  .then((movie) => {
    res.json(movie);
  }).catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err)
  })
});

//find a certain genre
app.get("/movies/genre/:name", passport.authenticate('jwt', {session: false}),
async (req, res) => {
 await movies.findOne({'genre.name' : req.params.name})
  .then((movie) => {
    res.json(movie.genre);
  }).catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err)
  })
});

//find director by name
app.get("/movies/director/:name", passport.authenticate('jwt', {session: false}),
async (req, res) => {
 await movies.findOne({'director.name': req.params.name})
  .then((movie) => {
    res.json(movie.director);
  }).catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err)
  })
});

//create a new user
app.post("/users", (req, res) => {
  users.findOne({name: req.body.name})
  .then((user) => {
    if (user){
      return res.status(400).send(req.body.name + ' already exists')
    } else {
      users.create({
        name: req.body.name,
        password: req.body.password,
        email: req.body.email,
        birthday: req.body.birthday
      }).then((user) => {
        res.status(201).json(user)
      }).catch((err) => {
        console.error(err);
        res.status(500).send('Error ' + err)
      })
    }
  })
});

//update users info 
app.put("/users/:name", passport.authenticate('jwt', {session: false}),
 async(req, res) => {
  if (req.user.name !== req.params.name) {
    return res.status(400).send('Permission denied')
  }
   await users.findOneAndUpdate(
    {name: req.params.name},
    {$set: {
      name: req.body.name,
      password: req.body.password,
      email: req.body.email,
      birthday: req.body.birthday
    }},{new: true}).then((updatedUser) => {
      res.json(updatedUser)}).catch((err) => {
      console.error(err);
      res.status(500).send('Error ' + err)
    })
});

//delete user by name
app.delete("/users/:name", passport.authenticate('jwt', {session: false}),
async (req, res) => {
 await users.findOneAndRemove({name: req.params.name})
  .then((user) => {
    if (!user) {
      res.status(400).send(req.params.name + ' was not found')
    } else {
      res.status(200).send(req.params.name + ' was deleted')
    }
  }).catch((err) => {
    console.error(err);
    res.status(500).send('Error ' + err)
  })
});

//add movies to users array
app.post("/users/:name/movies/:movieID", passport.authenticate('jwt', {session: false}),
async (req, res) => {
 await users.findOneAndUpdate({name: req.params.name}, 
    {$push: {favoriteMovies: req.params.movieID}},
    {new: true}).then((user) => {
      res.status(201).json(user)
    }).catch((err) => {
      console.error(err);
      res.status(500).send('Error ' + err)
    })
  });


//remove movies from users array
app.delete("/users/:name/movies/:movieID", passport.authenticate('jwt', {session: false}),
async (req, res) => {
 await users.findOneAndUpdate({name: req.params.name}, 
    {$pull: {favoriteMovies: req.params.movieID}},
    {new: true}).then((user) => {
      res.status(201).json(user)
    }).catch((err) => {
      console.error(err);
      res.status(500).send('Error ' + err)
    })
});


app.listen(3000, () => {
  console.log(`http://${HOST}:${PORT}`);
});
