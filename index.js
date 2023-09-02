// const url = require('url');

// const http = require('http');

// let server = http.createServer((request, response) => {
//     response.writeHead(200, {'Content-type': 'text/html; charset=utf-8'})
//     if(request.url == '/documentation')
//     fs.createReadStream('./documentation.html').pipe(response)

//     fs.appendFile('log.txt', 'URL: ' + request.url + '\nTimestamp: ' + new Date() + '\n\n', (err) => {
//         if (err) {
//           console.log(err);
//         } else {
//           console.log('Added to log.');
//         }
//       });

// })

const PORT = 8080
const HOST = 'localhost'

// server.listen(PORT, HOST, () => {
//     console.log(`http://${HOST}:${PORT}`)
// })

const express = require('express')
const app = express()
app.use(express.static('public'))
const morgan = require('morgan')
const fs = require('fs')
const path = require('path')


const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})
// app.use(morgan('common'))
app.use(morgan("combined", { stream: accessLogStream }));

let topMovies = [
  {
    title: 'Forrest Gump',
    year: 1994
  },
  {
    title: 'Léon',
    year: 1994
  },
  {
    title: 'Dunkirk',
    year: 2017
  },
  {
    title: 'The Boy in the Striped Pajamas',
    year: 2008
  },
  {
    title: 'Split',
    year: 2016
  },
  {
    title: 'Three Billboards Outside Ebbing, Missouri',
    year: 2017
  },
  {
    title: 'Promising Young Woman',
    year: 2020
  },
  {
    title: 'Inception',
    year: 2010
  },
  {
    title: 'Demolition',
    year: 2015
  },
  {
    title: 'Palmer',
    year: 2021
  }
]

app.get('/movies', (req, res) => {
  res.json(topMovies)
})

app.get('/', (req, res) => {
  res.send('This is my top list of movies')
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send('Warning!')
})

app.listen(8080, () => {
  console.log(`http://${HOST}:${PORT}`)
})

