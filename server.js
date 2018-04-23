// BASE SETUP
// ======================================

// CALL THE PACKAGES --------------------
var express = require('express'); // call express
var app = express(); // define our app using express
var bodyParser = require('body-parser'); // get body-parser
var morgan = require('morgan'); // used to see requests
var mongoose = require('mongoose');
var config = require('./config');
var path = require('path');

var server = require('http').createServer(app),
  io = require('socket.io').listen(server),
  messages = [];
  players = [];

app.use(express.static(__dirname + '/public'));

// APP CONFIGURATION ==================
// ====================================
// use body parser so we can grab information from POST requests
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

// configure our app to handle CORS requests
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
  next();
});

// log all requests to the console
app.use(morgan('dev'));

// connect to our database (hosted on modulus.io)
mongoose.connect(config.database);

// set static files location
// used for requests that our frontend will make
app.use(express.static(__dirname + '/public'));

// ROUTES FOR OUR API =================
// ====================================

// API ROUTES ------------------------
var apiRoutes = require('./app/routes/api')(app, express);
app.use('/api', apiRoutes);

// MAIN CATCHALL ROUTE ---------------
// SEND USERS TO FRONTEND ------------
// has to be registered after API ROUTES
app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname + '/public/app/views/index.html'));
});

// SOCKETS
// ======================================

io.sockets.on('connection', function (socket) {
  // Message log  
  socket.on('send message', function (msg, username) {
    messages.push({
      username: username,
      message: msg
    });
    io.sockets.emit('new message', {
      messages
    });
  });

  // Initial players


  // Show player
  socket.on('playerInitialLocation', function (data){
    players.push({
      name: data.name,
      x: data.x,
      y: data.y
    });
    io.sockets.emit('drawPlayer', {
      name: data.name,
      x: data.x,
      y: data.y
    });
  })

  // Moving player
  socket.on('move', function (data) {
    var pos = players.findIndex(item => item.name === data.name);
    players[pos].x = data.x;
    players[pos].y =  data.y;
    io.sockets.emit('moved', {
      x: data.x,
      y: data.y,
      name: data.name,
    });
  });
});

// START THE SERVER
// ====================================
server.listen(config.port);
console.log('Application is available on port ' + config.port);