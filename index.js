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



//allows all
app.use(cors(


//   {
//   origin: (origin, callback) => {
//     if (!origin) return callback(null, true)
//     if (allowedOrigins.indexOf(origin) === -1) {
//       let message = `The CORS policy for this application doesn't allow access from origin ` + origin
//       return callback(new Error(message), false)
//     }
//     return callback(null, true)
//   }
// }
))

let auth = require('./auth')(app)
const passport = require('passport');
const { callbackify } = require("util");
require('./passport')

const accessLogStream = fs.createWriteStream(path.join(__dirname, "log.txt"), {
  flags: "a",
});

app.use(morgan("combined", { stream: accessLogStream }));

app.get('/', (req, res) => {
  res.send('Welcome to my movie app!')
})


/**
 * @method GET
 * @param {string} endpoint - /movies
 * @param {function} callback 
 * @returns {object} response - Returns a list of all movies
 * @description Returns a list of all movies
 * @example response [
 * {
 * _id: 123456789, 
 * title: 'movie1', 
 * description: 'movie1 description', 
 * genre: {name: 'genre1', description: 'genre1 description'}, 
 * director: {name: 'director1', bio: 'director1 bio', birth: '01/01/2000', death: '01/01/2000'}, 
 * image: 'imageURL', 
 * featured: true
 * }, [] ]
 * @throws Will throw an error if something goes wrong
 */
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

/**
 * @method GET
 * @param {string} endpoint - /users
 * @param {function} callback
 * @returns {object} response - Returns a list of all users 
 * @description Returns a list of all users   
 * @example response [
 * {
 * _id: 123456789,
 * name: 'user1',
 * password: 'password',
 * email: '',
 * birthday: '01/01/2000',
 * favoriteMovies: [123456789, 123456789]
 *  }, [] ]
 * @throws Will throw an error if the user is not found
 * @throws Will throw an error if the user is not the same as the user being updated
 */
app.get("/users",passport.authenticate('jwt', {session: false}),
(req, res) => {
 users.find().then((users) => {
   res.status(200).json(users)
  }).catch((err) => {
   console.error(err);
   res.status(500).send('Error '+ err)
 })
});


/**
 * @method GET
 * @param {string} endpoint - /movies/:title
 * @param {function} callback
 * @returns {object} response - Returns a movie object
 * @description Returns a movie object
 * @example response {
 * _id: 123456789,
 * title: 'movie1',
 * description: 'movie1 description',
 * genre: {name: 'genre1', description: 'genre1 description'},
 * director: {name: 'director1', bio: 'director1 bio', birth: '01/01/2000', death: '01/01/2000'},
 * image: 'imageURL',
 * featured: true
 * }
 * @throws Will throw an error if the movie is not found
 */
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

/**
 * @method GET
 * @param {string} endpoint - /movies/genre/:name
 * @param {function} callback
 * @returns {object} response - Returns a genre object
 * @description Returns a genre object
 * @example response {
 * name: 'genre1',
 * description: 'genre1 description'
 * }
 * @throws Will throw an error if the genre is not found
 */
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

/**
 * @method GET
 * @param {string} endpoint - /movies/director/:name
 * @param {function} callback
 * @returns {object} response - Returns a director object
 * @description Returns a director object
 * @example response {
 * name: 'director1',
 * bio: 'director1 bio'
 * birth: '01/01/2000'
 * death: '01/01/2000'
 * }
 * @throws Will throw an error if the director is not found
 */
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

/**
 * @method POST
 * @param {string} endpoint - /users
 * @param {function} callback
 * @returns {object} response - Returns a user object
 * @description Adds a new user
 * @example body {
 * name: 'user1',
 * password: 'password',
 * email: '',
 * birthday: '01/01/2000'
 * }
 * @example response {
 * _id: 123456789,
 * name: 'user1',
 * password: 'password',
 * email: '',
 * birthday: '01/01/2000',
 * favoriteMovies: [123456789, 123456789]
 * }
 * @throws Will throw an error if the user already exists
 * @throws Will throw an error if the username contains non alphanumric characters
 * @throws Will throw an error if the username is less than 5 characters
 * @throws Will throw an error if the email is not valid
 * @throws Will throw an error if the password is empty
 * @throws Will throw an error if the birthday is not a date
 * @throws Will throw an error if the birthday is not in the past
 */
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

/**
 * @method PUT 
 * @param {string} endpoint - /users/:name
 * @param {function} callback
 * @returns {object} response - Returns a user object
 * @description Updates a user
 * @example body {
 * name: 'user1',
 * password: 'password',
 * email: '',
 * birthday: '01/01/2000'
 * }
 * @example response {
 * _id: 123456789,
 * name: 'user1',
 * password: 'password',
 * email: '',
 * birthday: '01/01/2000',
 * favoriteMovies: [123456789, 123456789]
 * }
 * @throws Will throw an error if the user is not found
 * @throws Will throw an error if the user is not the same as the user being updated
 */
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


/**
 *  @method PATCH 
 * @param {string} endpoint - /movies/:title
 * @param {function} callback
 * @returns {object} response - Returns a movie object
 * @description Updates a movie object by title
 * @example body {
 * title: 'movie1',
 * description: 'movie1 description',
 * genre: {name: 'genre1', description: 'genre1 description'},
 * director: {name: 'director1', bio: 'director1 bio', birth: '01/01/2000', death: '01/01/2000'},
 * image: 'imageURL',
 * featured: true
 * }
 * @example response {
 * _id: 123456789,
 * title: 'movie1',
 * description: 'movie1 description',
 * genre: {name: 'genre1', description: 'genre1 description'},
 * director: {name: 'director1', bio: 'director1 bio', birth: '01/01/2000', death: '01/01/2000'},
 * image: 'imageURL',
 * featured: true
 * }
 * @throws Will throw an error if the movie is not found
 */
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

/**
 * @method POST
 * @param {string} endpoint - /movies
 * @param {function} callback
 * @returns {object} response - Returns a movie object
 * @description Adds a new movie
 * @example body {
 * title: 'movie1',
 * description: 'movie1 description',
 * genre: {name: 'genre1', description: 'genre1 description'},
 * director: {name: 'director1', bio: 'director1 bio', birth: '01/01/2000', death: '01/01/2000'},
 * image: 'imageURL',
 * featured: true
 * }
 * @example response {
 * _id: 123456789,
 * title: 'movie1',
 * description: 'movie1 description',
 * genre: {name: 'genre1', description: 'genre1 description'},
 * director: {name: 'director1', bio: 'director1 bio', birth: '01/01/2000', death: '01/01/2000'},
 * image: 'imageURL',
 * featured: true
 * }
 * @throws Will throw an error if the movie already exists
 * @throws Will throw an error if the genre is not found
 * @throws Will throw an error if the director is not found
 */
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



/**
 * @method DELETE
 * @param {string} endpoint - /users/:name
 * @param {function} callback
 * @returns {string} response - Returns a string
 * @description Deletes a user
 * @example response 'user1 was deleted'
 * @throws Will throw an error if the user is not found
 * @throws Will throw an error if the user has movies in their favoriteMovies array
 */
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

/**
 * @method POST 
 * @param {string} endpoint - /users/:name/movies/:movieID
 * @param {function} callback
 * @returns {object} response - Returns a user object
 * @description Adds a movie to users array
 * @example response {
 * _id: 123456789,
 * name: 'user1',
 * password: 'password',
 * email: '',
 * birthday: '01/01/2000',
 * favoriteMovies: [123456789]  
 * }
 * @throws Will throw an error if the user is not found
 * @throws Will throw an error if the movie is not found
 * @throws Will throw an error if the movie is already in the users array
 */
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


/** 
 * @method DELETE
 * @param {string} endpoint - /users/:name/movies/:movieID
 * @param {function} callback
 * @returns {object} response - Returns a user object
 * @description Deletes a movie from users array
 * @example response {
 * _id: 123456789,
 * name: 'user1',
 * password: 'password',
 * email: '',
 * birthday: '01/01/2000',
 * favoriteMovies: []
 * }
 * @throws Will throw an error if the user is not found
 * @throws Will throw an error if the movie is not found
 * @throws Will throw an error if the movie is not in the users array
 */
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

