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
const { check, validationResult } = require('express-validator'); 
const cors = require('cors');


const movies = Models.movie;
const users = Models.user;
// mongoose.connect('mongodb://127.0.0.1:27017/cfDB', {useNewUrlParser: true, useUnifiedTopology: true});

mongoose.connect(process.env.CONNECTION_URI, {useNewUrlParser: true, useUnifiedTopology: true});
app.use(bodyParser.json());

app.use(express.static('public'));
app.use(express.urlencoded({extended: true}))
// app.use(morgan('common'))

let allowedOrigins = [
'*'
]
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    if (allowedOrigins.indexOf(origin) === -1) {
      let message = `The CORS policy for this application doesn't allow access from origin ` + origin
      return callback(new Error(message), false)
    }
    return callback(null, true)
  }
}))

let auth = require('./auth')(app)
const passport = require('passport');
const { callbackify } = require("util");
require('./passport')

const accessLogStream = fs.createWriteStream(path.join(__dirname, "log.txt"), {
  flags: "a",
});

app.use(morgan("combined", { stream: accessLogStream }));

// app.use(morgan("combined", { stream: accessLogStream }));

app.get('/', (req, res) => {
  res.send('Welcome to my movie app!')
})

app.get("/movies", 
passport.authenticate('jwt', {session: false}),
(req, res) => {
    movies.find().then((movies) => {
    res.status(200).json(movies);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).json({'Error: ': err})
  })
});

app.get("/users",passport.authenticate('jwt', {session: false}),
(req, res) => {
 users.find().then((users) => {
   res.status(200).json(users)
  }).catch((err) => {
   console.error(err);
   res.status(500).send('Error '+ err)
 })
});


//find movie by title
app.get("/movies/:title", passport.authenticate('jwt', {session: false}),
(req, res) => {
 movies.findOne({title: req.params.title})
  .then((movie) => {
    res.json(movie);
  }).catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err)
  })
});

//find a certain genre
app.get("/movies/genre/:name", passport.authenticate('jwt', {session: false}),
(req, res) => {
 movies.findOne({'genre.name' : req.params.name})
  .then((movie) => {
    res.json(movie.genre);
  }).catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err)
  })
});

//find director by name
app.get("/movies/director/:name", passport.authenticate('jwt', {session: false}),
(req, res) => {
movies.findOne({'director.name': req.params.name})
  .then((movie) => {
    res.json(movie.director);
  }).catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err)
  })
});

//create a new user
app.post("/users",[
  check('name', 'Username is required').isLength({min: 5}),
  check('name', 'Username contains non alphanumric characters - not allowed.').isAlphanumeric(),
  check('password', 'Password is required').not().isEmpty(),
  check('email', 'Email does not appear to be vaild').isEmail()
], async (req, res) => {
  let errors = validationResult(req)
  if(!errors.isEmpty()){
    return res.status(422).json({errors: errors.array()})
  }
  let hashPassword = users.hashPassword(req.body.password);
  await users.findOne({name: req.body.name})
  .then((user) => {
    if (user){
      return res.status(400).send(req.body.name + ' already exists')
    } else {
      users.create({
        name: req.body.name,
        password: hashPassword,
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
  .catch((error) => {
    console.error(error)
    res.status(500).send('Error ' + error)
  })
});

//update users info 
app.put("/users/:name", passport.authenticate('jwt', {session: false}),
(req, res) => {
  if (req.user.name !== req.params.name) {
    return res.status(400).send('Permission denied')
  }
  let hashPassword = users.hashPassword(req.body.password);
  users.findOneAndUpdate(
    {name: req.params.name},
    {$set: {
      name: req.body.name,
      password: hashPassword,
      email: req.body.email,
      birthday: req.body.birthday
    }},{new: true}).then((updatedUser) => {
      res.json(updatedUser)}).catch((err) => {
      console.error(err);
      res.status(500).send('Error ' + err)
    })
});


//update movies info by title 
app.patch("/movies/:title", passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let updateObj = {};
    if (req.body.title !== undefined) updateObj.title = req.body.title;
    if (req.body.description !== undefined) updateObj.description = req.body.description;
    if (req.body.image !== undefined) updateObj.image = req.body.image;

    try {
      const updatedMovie = await movies.findOneAndUpdate(
        { title: req.params.title },
        { $set: updateObj },
        { new: true } // This option ensures that the updated document is returned
      );

      if (!updatedMovie) {
        return res.status(404).send("Movie not found");
      }

      res.json(updatedMovie);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error: " + err);
    }
  }
);


//add new movie
app.post("/movies", passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const movie = await movies.findOne({ title: req.body.title });
      if (movie) {
        return res.status(400).send(req.body.title + "already exists");
      } else {
        const newMovie = await movies.create({
          title: req.body.title,
          description: req.body.description,
          genre: {
            name: req.body.genre.name,
            description: req.body.genre.description,
          },
          image: req.body.image,
          featured: req.body.featured,
        });
        res.status(201).json(newMovie);
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Error" + error);
    }
  }
);



//delete user by name
app.delete("/users/:name", passport.authenticate('jwt', {session: false}),
(req, res) => {
users.findOneAndRemove({name: req.params.name})
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
(req, res) => {
users.findOneAndUpdate({name: req.params.name}, 
    {$push: {favoriteMovies: req.params.movieID}},
    {new: true}).then((user) => {
      res.status(200).json(user)
    }).catch((err) => {
      console.error(err);
      res.status(500).send('Error ' + err)
    })
  });


//remove movies from users array
app.delete("/users/:name/movies/:movieID", passport.authenticate('jwt', {session: false}),
(req, res) => {
 users.findOneAndUpdate({name: req.params.name}, 
    {$pull: {favoriteMovies: req.params.movieID}},
    {new: true}).then((user) => {
      res.status(201).json(user)
    }).catch((err) => {
      console.error(err);
      res.status(500).send('Error ' + err)
    })
});


const port = process.env.PORT || 3000;
// const HOST = "localhost";

// app.listen(PORT, '0.0.0.0', () => {
//   console.log(`http://${HOST}:${PORT}`);
// });

app.listen(port, "0.0.0.0", () => {
	console.log("listening on port" + port);
});

