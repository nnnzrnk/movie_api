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

app.use(express.static("public"));
app.use(bodyParser.json());

const accessLogStream = fs.createWriteStream(path.join(__dirname, "log.txt"), {
  flags: "a",
});
// app.use(morgan('common'))
app.use(morgan("combined", { stream: accessLogStream }));

let movies = [
  {
    title: "Forrest Gump",
    description:
      "Forrest, a man with low IQ, recounts the early years of his life when he found himself in the middle of key historical events. All he wants now is to be reunited with his childhood sweetheart, Jenny.",
    genre: {
      name: "drama",
      description:
        "On top of all of that, the movie is a comedy because it has plenty of humor and because things in general tend to work out well for Forrest. But, then again: Forrest loses the two people he loves most when his mother and Jenny die.",
    },
    director: {
      name: "Robert Zemeckis",
      bio: "Robert Lee Zemeckis was born on May 14, 1952, in Chicago.  He first came to public attention as the director of the action-adventure romantic comedy Romancing the Stone (1984). Zemeckis first attended Northern Illinois University in DeKalb, Illinois, and gained early experience in film as a film cutter for NBC News in Chicago during a summer break.He also edited commercials in his home state.",
      birth: 1952
    },
    imageURL: "https://www.google.com/imgres?imgurl=https%3A%2F%2Fm.media-amazon.com%2Fimages%2FM%2FMV5BNWIwODRlZTUtY2U3ZS00Yzg1LWJhNzYtMmZiYmEyNmU1NjMzXkEyXkFqcGdeQXVyMTQxNzMzNDI%40._V1_.jpg&tbnid=QlnzevRKnwHbaM&vet=12ahUKEwiO26K6wJOBAxU6wwIHHW7LClEQMygAegQIARB0..i&imgrefurl=https%3A%2F%2Fwww.imdb.com%2Ftitle%2Ftt0109830%2F&docid=n7SHbqLMs1UIQM&w=558&h=809&q=forrest%20gump&ved=2ahUKEwiO26K6wJOBAxU6wwIHHW7LClEQMygAegQIARB0",
    featured: false
  },
  {
    title: "Leon",
    description:
      "12-year-old Mathilda is reluctantly taken in by Léon, a professional assassin, after her family is murdered. An unusual relationship forms as she becomes his protégée and learns the assassin's trade.",
    genre: {
      name: "action",
      description:
        "English-language French action-thriller film.",
    },
    director: {
      name: "Luc Besson",
      bio: "Besson was born in Paris, to parents who both worked as Club Med scuba-diving instructors.Influenced by this milieu, as a child, he planned to become a marine biologist. In 1980, near the beginning of his career, he founded his own production company, Les Films du Loup, later renamed Les Films du Dauphin. ",
      birth: 1959
    },
    imageURL: "https://www.google.com/url?sa=i&url=https%3A%2F%2Fdie-hard-scenario.fandom.com%2Fwiki%2FL%25C3%25A9on%3A_The_Professional&psig=AOvVaw2PFP1yITltWmID-mTdGHBU&ust=1694008799953000&source=images&cd=vfe&opi=89978449&ved=0CBAQjRxqFwoTCJigjdjQk4EDFQAAAAAdAAAAABAJ",
    featured: false
  },
  {
    title: "Split",
    description:
    "The film follows a man with dissociative identity disorder who kidnaps and imprisons three teenage girls in an isolated underground facility.",
  genre: {
    name: "thriller",
    description:
      "This film is a psychological horror about a man with DID ",
  },
  director: {
    name: "M. Night Shyamalan",
    bio: "Shyamalan was born in Mahé, India to ethnic Indian parents in a town in the Union Territory of Pondicherry. He is best known for making original films with contemporary supernatural plots and twist endings.",
    birth: 1970
  },
  imageURL: "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.imdb.com%2Ftitle%2Ftt4972582%2F&psig=AOvVaw0Pg9L-svDlSgjbLsnTnuWj&ust=1694008233872000&source=images&cd=vfe&opi=89978449&ved=0CBAQjRxqFwoTCNDikcrOk4EDFQAAAAAdAAAAABAE",
  featured: false
  }
];

let users = [
  {
    id: 1,
    name: 'Marta',
    favoriteMovies: [] 
  },
  {
    id: 2,
    name: 'Luci',
    favoriteMovies: ['Leon']
  }
];

app.get("/movies", (req, res) => {
  res.status(200).json(movies);
});

// app.get("/", (req, res) => {
//   res.send("This is my top list of movies");
// });

// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).send("Warning!");
// });

//find movie by title
app.get("/movies/:title", (req, res) => {
  const { title } = req.params;
  const movie = movies.find(movie => movie.title === title)
  if (movie) {
    res.status(200).json(movie)
  } else {
    res.status(400).send('No such movie')
  }
});

//find movie by genre
app.get("/movies/genre/:genreName", (req, res) => {
  const { genreName } = req.params;
  const genre = movies.find(movie => movie.genre.name === genreName).genre
  if (genre) {
    res.status(200).json(genre)
  } else {
    res.status(400).send('No such movie')
  }
});

//find director by name
app.get("/movies/director/:directorName", (req, res) => {
  const { directorName } = req.params;
  const director = movies.find(movie => movie.director.name === directorName).director
  if (director) {
    res.status(200).json(director)
  } else {
    res.status(400).send('No such movie')
  }
});

//create new user
app.post("/users", (req, res) => {
  const newUser = req.body;
  if (!newUser.name) {
    let message = "Name is missing";
    res.status(400).send(message)
  } else {
    newUser.id = uuid.v4()
    users.push(newUser)
    res.status(201).json(newUser)
  }
});

//update users info
app.put("/users/:id", (req, res) => {
  const { id } = req.params;
  const updateUser = req.body;
  let user = users.find( user => user.id == id)
  if (user){
    user.name = updateUser.name
    res.status(200).json(user)
  } else {
    res.status(400).send('no such user')
  }
});

//add movies to users array
app.put("/users/:id/:movieTitle", (req, res) => {
  const { id, movieTitle } = req.params;
  let user = users.find( user => user.id == id)
  if (user){
    user.favoriteMovies.push(movieTitle)
    res.status(200).json(`${movieTitle} has been added to user ${id}'s array`)
  } else {
    res.status(400).send('no such user')
  }
});

//remove movies from users array
app.delete("/users/:id/:movieTitle", (req, res) => {
  const { id, movieTitle } = req.params;
  let user = users.find( user => user.id == id)
  if (user){
    user.favoriteMovies = user.favoriteMovies.filter(title => title !== movieTitle)
    res.status(200).json(`${movieTitle} has been removed from user ${id}'s array`)
  } else {
    res.status(400).send('no such user')
  }
});

//delete user by id
app.delete("/users/:id", (req, res) => {
  const { id } = req.params;
  let user = users.find(user => user.id == id)
  if (user){
    users = users.filter(user => user.id != id)
    res.status(200).json(`${id} has been deleted`)
  } else {
    res.status(400).send('no such user')
  }
});

app.listen(3000, () => {
  console.log(`http://${HOST}:${PORT}`);
});
