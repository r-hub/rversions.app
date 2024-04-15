
// Module dependencies.

import app from '../app.js';
import http from 'http';
import cache from '../lib/cache.js';

// set in run()
let port;

// Normalize a port into a number, string, or false.

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

// Event listener for HTTP server "error" event.

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

let server;

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  console.log('Listening on ' + bind);
}

async function cache_update() {
  try {
    await cache.update();
    console.log('[' + new Date().toUTCString() +
      '] Cache updated successfully');
  } catch (e) {
    console.log('[' + new Date().toUTCString() +
      '] Cache update failed :(');
    console.log(e);
  }
}

async function run() {
  // Get port from environment and store in Express.
  port = normalizePort(process.env.PORT || '3000');
  app.set('port', port);

  // Populate the DB, if empty
  await cache.maybe_update();

  // Update once in a minute ...
  setTimeout(cache_update, 60 * 1000);

  // ... and then update every hour
  setInterval(cache_update, 60 * 60 * 1000);

  // Create HTTP server.
  server = http.createServer(app);

  // Listen on provided port, on all network interfaces.
  server.listen(port);
  server.on('error', onError);
  server.on('listening', onListening);
}

export default run;
