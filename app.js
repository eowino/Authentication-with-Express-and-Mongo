var express = require('express');
// bodyParser reads the body of the requests sent to the server by a browser
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
// load and call connect-mongo and pass the express session as an argument
// this lets mongo middleware access the sessions
var MongoStore = require('connect-mongo')(session);
var app = express();

// mongodb connection
// connects to mongodb localhost on port 27017
// bookworm is the name (in this instance) of the database for this app
mongoose.connect("mongodb://localhost:27017/bookworm");

// represents the connection to mongodb
var db = mongoose.connection;
// mongo error
db.on('error', console.error.bind(console, 'connection error: '));

// app.use() function adds middleware to the application such as bodyParser and session
// use sessions for tracking logins - tell app to use the middleware express-session provides
// because it makes sessions available anywhere in the app is called "application-level middleware." 
// session function has a few parameters
// the only required option is 'secret' - a string used to sign a session ID cookie to ensure only the app created the cookie. 
// this adds a level of security to the system as it makes it difficult for someone to create a cookie in their browser and try to gain access to session data
// resave option forces the session to be saved in the session store and whether anything changing during the request
// 'saveUninitialized' forces an unitialised session to be saved in the session store
// 'store' stores an instance of MongoStore. The session constructor func takes a configuration object
// all that needs to be done is set the Mongoose connection to DB to use MongoDB as a session store
// this allows the application to store session data in Mongo instead of in RAM
app.use(session({
  secret: 'better learn some express',
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: db
  })
}));

// make user ID available in templates i.e. throughout whole app
app.use(function(req, res, next) {
  // the response object has a property called locals which provides a way to add info to the response object
  // in express all views have access to the response's locals object
  // if a user is logged in currentUser will hold the userID otherwise, undefined
  res.locals.currentUser = req.session.userID;
  next(); // call the next piece of middleware
});

// parse incoming requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// serve static files like pictures and stylesheets from /public
// In Node, __dirname describes the path from the server's root to our app root folder
app.use(express.static(__dirname + '/public'));

// view engine setup - telling express I want to use the pug templating engine
// when referencing a view by name, the file extension will be .pug
app.set('view engine', 'pug');
// infrom express where to find the pug templates
app.set('views', __dirname + '/views');

// include routes
var routes = require('./routes/index');
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('File Not Found');
  err.status = 404;
  next(err);
});

// error handler
// define as the last app.use callback
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

// listen on port 3000
app.listen(3000, function () {
  console.log('Express app listening on port 3000');
});
