const express = require('express');
const SSOAuthRoute = express.Router();
const session = require('express-session');

const clientID = 'CBM_AVIO_AERO';
const clientSecret = '5$9AGMbwcrF$W5IHDy@Lh$Vy9qRgihBElUcO9ZHwtNpXUZMW70nRRQJuE9JLlzRW';

const oauth2 = require('simple-oauth2').create({
  client: {
    id: clientID,
    secret: clientSecret,
  },
  auth: {
    tokenHost: 'https://cbm.avio.net/',
    tokenPath: 'https://fssfed.ge.com/fss/as/token.oauth2',
    authorizePath: 'https://fssfed.ge.com/fss/as/authorization.oauth2',
  },
  http: {
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  }
});

//const BaseURI=window.location.origin;
//http://my-alb-1885598496.us-east-2.elb.amazonaws.com/Home
//http://localhost:4200.com/Home
// Authorization uri definition
const authorizationUri = oauth2.authorizationCode.authorizeURL({
  redirect_uri: 'http://my-alb-1885598496.us-east-2.elb.amazonaws.com/Home',
  scope: '',
  state: '3(#0/!~',
});

// Initial page redirecting to GE
SSOAuthRoute.route('/login').get((req, res) => {
 // console.log('Login api');
 // console.log(authorizationUri);
  res.redirect(authorizationUri);
});

SSOAuthRoute.route('/serverLogout').get((req, res) => {
  console.log('Server Logout');
  req.session.destroy();
  res.json({status: false});
});

SSOAuthRoute.route('/serverIsLoggedIn').get((req, res) => {
 // console.log('serverIsLoggedIn');
  // console.log(req.session);
  if(req.session.tokenObject) {
    let accessToken = oauth2.accessToken.create(req.session.tokenObject);
   // console.log(accessToken.expired());
    if(accessToken.expired()) {
     // console.log('If block');
      res.json({status: false});
    } else {
     // console.log('Else block');
      res.json({status: true});
    }
  } else {
    res.json({status: false});
  }
});

SSOAuthRoute.route('refreshToken').get((req, res) => {
  let accessToken = oauth2.accessToken.create(req.session.tokenObject);
  if(accessToken.expired()) {
    try {
      const params = {
        scope: ''
      };
      accessToken = accessToken.refresh(params);
    } catch(error) {
      console.log('Error refreshing access token: ', error.message);
    }
  }
});

// Callback service parsing the authorization token and asking for the access token
SSOAuthRoute.route('/Home').get((req, res) => {
  // console.log('Home route');
  const { code, state } =req.query;//{code:'OqpPgVyugwtf09ED02OyBQLsKLNIOLYtzoSm_gAE&state=3(%230%2F!~'};
  const tokenConfig = {
    code, state
  };
  //var URI='http://my-alb-1885598496.us-east-2.elb.amazonaws.com/';
//var URI='http://localhost:4200/';
  tokenConfig.redirect_uri='http://my-alb-1885598496.us-east-2.elb.amazonaws.com/Home';
  const httpOptions={};
  // console.log(tokenConfig);
  try {
    // debugger;
    // console.log('try block');
    const result = oauth2.authorizationCode.getToken(tokenConfig, httpOptions).then((data) => {
      // console.log("data");
      // console.log(data);
      req.session.tokenObject = data;
      req.session.save(function(success, error) {
        // console.log(req.session);
      });
      return res.status(200).redirect('/Homepage');
    }).catch((error) => {
      // console.log("Error");
      // console.log(error);
      return res.status(400).redirect('/');
    });

    //console.log('The resulting token: ', result);

    //const token = oauth2.accessToken.create(result);
    //console.log("Token");
//console.log(token);
   // return res.status(200).json(token);
  } catch (error) {
    console.error('Access Token Error', error.message);
    return res.status(500).json('Authentication failed', error.message);
  }
});

module.exports = SSOAuthRoute;