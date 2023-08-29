const url = require('url');
const fs = require('fs');
const http = require('http');

let server = http.createServer((request, response) => {
    response.writeHead(200, {'Content-type': 'text/html; charset=utf-8'})
    if(request.url == '/')
    fs.createReadStream('./index.html').pipe(response)
    else if(request.url == '/documentation')
    fs.createReadStream('./documentation.html').pipe(response)

    fs.appendFile('log.txt', 'URL: ' + request.url + '\nTimestamp: ' + new Date() + '\n\n', (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log('Added to log.');
        }
      });

})

const PORT = 8080
const HOST = 'localhost'

server.listen(PORT, HOST, () => {
    console.log(`http://${HOST}:${PORT}`)
})