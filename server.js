let express = require('express'),
   path = require('path'),
   cors = require('cors'),
   bodyParser = require('body-parser')
   request = require('request');

const app = express();
// app.use(cors()); 
app.use(cors({
   'Access-Control-Allow-Origin': window.location.href //'http://localhost:4200'
}));

// passport js
const passport = require('passport');
const OAuth2Strategy = require('passport-oauth2');

const clientID = 'CBM_AVIO_AERO';
const clientSecret = '5$9AGMbwcrF$W5IHDy@Lh$Vy9qRgihBElUcO9ZHwtNpXUZMW70nRRQJuE9JLlzRW';

passport.use(new OAuth2Strategy({
   authorizationURL: 'https://fssfed.ge.com/fss/as/authorization.oauth2',
   tokenURL: 'https://fssfed.ge.com/fss/as/token.oauth2',
   clientID: clientID,
   clientSecret: clientSecret,
   callbackURL: "https://cbm.avio.net/"
  // callbackURL:"http://my-alb-1885598496.us-east-2.elb.amazonaws.com/"
 },
 function(req, res) {
   console.log('Request: ', req);
   console.log('Response: ', res);
 }
));

app.get('/auth',
 passport.authenticate('oauth2'), cors({
   'Access-Control-Allow-Origin': window.location.href //'http://localhost:4200'
}));

app.get('/auth/callback',
 passport.authenticate('oauth2', { failureRedirect: '/login' }),
 function(req, res) {
   // Successful authentication, redirect home.
   res.redirect('/');
});

// Setting up routes
const SSOAuthRoute = require('./server/routes/sso/auth.route');

// Setting up port with express js
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
   extended: false
}));
// app.use(express.static(path.join(__dirname, 'dist/AvioAeroApp')));
app.use('/', express.static(path.join(__dirname, 'dist/AvioAeroApp')));

app.use('/api/v1/auth', SSOAuthRoute);

// Catch all other routes and return the index file
app.get('*', function(req, res) {
   res.sendFile(path.join(__dirname, 'dist/AvioAeroApp/index.html'));
});

// Create port
const port = process.env.PORT || 4200;
const server = app.listen(port, () => {
  console.log('Connected to port ' + port)
})

// Find 404 and hand over to error handler
app.use((req, res, next) => {
   res.header('Access-Control-Allow-Origin', '*');
   next();
});

app.all('/*', function(req, res, next) {
   res.header("Access-Control-Allow-Origin", "*");
   next();
});

// error handler
app.use(function (err, req, res, next) {
  console.error(err.message); // Log error message in our server's console
  if (!err.statusCode) err.statusCode = 500; // If err has no specified error code, set error code to 'Internal Server Error (500)'
  res.status(err.statusCode).send(err.message); // All HTTP requests must have a response, so let's send back an error with its status code and message
});