let express = require('express'),
   path = require('path'),
   cors = require('cors'),
   bodyParser = require('body-parser'),
   request = require('request'),
   session= require('express-session');;

const app = express();
app.use(cors());

// Setting up port with express js
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
   extended: false
}));

// app.use(express.static(path.join(__dirname, 'dist/AvioAeroApp')));
app.use('/', express.static(path.join(__dirname, 'dist/AvioAeroApp')));

// session set up
app.use(session({
   secret: 'AvioAero',
   resave: false,
   saveUninitialized: true
}));

// Setting up routes
const SSOAuthRoute = require('./server/routes/sso/auth.route');

app.use('/', SSOAuthRoute);

// Catch all other routes and return the index file
app.get('*', function(req, res) {
   res.sendFile(path.join(__dirname, 'dist/AvioAeroApp/index.html'));
});

// Create port
//const port = process.env.PORT|| 4200;
const port = 8081;
const server = app.listen(port, () => {
  console.log('Connected to port ' + port)
})

// Find 404 and hand over to error handler
app.use((req, res, next) => {
   res.header('Access-Control-Allow-Origin', '*');
   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
   next();
});

// error handler
app.use(function (err, req, res, next) {
//   console.error(err.message); // Log error message in our server's console
  if (!err.statusCode) err.statusCode = 500; // If err has no specified error code, set error code to 'Internal Server Error (500)'
  res.status(err.statusCode).send(err.message); // All HTTP requests must have a response, so let's send back an error with its status code and message
});