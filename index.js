// const url = require('url');
// const fs = require('fs');
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

let express = require('express')
let app = express()
app.use(express.static('public'))
let morgan = require('morgan')

app.use(morgan('common'))

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

