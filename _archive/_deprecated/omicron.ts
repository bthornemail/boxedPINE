const { resolve } = require('node:path');
const net = require('node:net');
import http from 'node:http';

export default class Omicron{

propagate(){
const server = http.createServer((req, res) => {
  // 1. Only allow GET requests to your SSE endpoint
  if (req.method === 'GET' && req.url === '/events') {
    
    // 2. Set mandatory SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      // Fixes CORS if testing your frontend on a different port
      'Access-Control-Allow-Origin': '*', 
    });

    // 3. Send an initial comment to establish the stream connection immediately
    res.write(': ok\n\n');

    // 4. Periodically stream structured events to the client
    const intervalId = setInterval(() => {
      const payload = { 
        timestamp: new Date().toISOString(), 
        value: Math.floor(Math.random() * 100) 
      };

      // Format strictly requires "data: <message>\n\n"
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    }, 2000);

    // 5. Clean up interval memory when client aborts/disconnects
    req.on('close', () => {
      clearInterval(intervalId);
      res.end();
      console.log('Client disconnected from stream.');
    });

  } else {
    // Return a basic 404 response for any other route
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(3000, () => {
  console.log('Native Node.js SSE server running on http://localhost:3000/events');
});

}
export const getUsers = asyncAlt(function* () {
  const response = yield fetch('https://jsonplaceholder.typicode.com/users')
  const json = yield response.json()

  return json
});

// Define a function named asyncAlt that takes a generator function as an argument
function asyncAlt(generatorFunction) {
  // Return a function
  return function () {
    // Create and assign the generator object
    const generator = generatorFunction()

    // Define a function that accepts the next iteration of the generator
    function resolve(next) {
      // If the generator is closed and there are no more values to yield,
      // resolve the last value
      if (next.done) {
        return Promise.resolve(next.value)
      }

      // If there are still values to yield, they are promises and
      // must be resolved.
      return Promise.resolve(next.value).then((response) => {
        return resolve(generator.next(response))
      })
    }

    // Begin resolving promises
    return resolve(generator.next())
  }
}

// Invoking the function
getUsers().then((response) => console.log(response))

function* call(port,prefix,suffix){
    let prev = 0
    let next = 1

    yield prev
    yield next

    // Add previous and next values and yield them forever
    while (true) {
	const newVal = next + prev

	yield newVal

	prev = next
	next = newVal
    }
}
function* record(port,prefix,suffix){
  let i = 0

  while (true) {
    yield i++
  }    
}

constructor(){

}
}





