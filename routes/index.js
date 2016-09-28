var express = require('express');
var router = express.Router();
var User = require('../models/user');
var mid = require('../middleware');

// router.get()
// 1st args is a string representing the endpoint
// 2nd args is a callback function which tells express what to do when the endpoint is requested
// the callback takes 3 args: a request object sent from the client, 
// the response object which enables us to send data back to the user,
// and a function called next which tells express to continue onto the next piece of middleware
// i.e. what function express should run after the callback


// GET /
router.get('/', function(req, res, next) {
  // render is how a (in this e.g.) a pug template is taken and rendered into HTML
  // 1 args, the name of the template file i.e. 'index'
  // 2 args, an object which allows the router to pass information to pug
  return res.render('index', { title: 'Home' });
});

// GET /about
router.get('/about', function(req, res, next) {
  return res.render('about', { title: 'About' });
});

// GET /contact
router.get('/contact', function(req, res, next) {
  return res.render('contact', { title: 'Contact' });
});

// GET /register
// use loggedOut middleware from middleware DIR
router.get('/register', mid.loggedOut, function(req, res, next) {
  return res.render('register', { title: 'Sign Up' });
});

// POST /register
// used to create a new user in the database
router.post('/register', function(req, res, next) {
    if ( req.body.email && req.body.name && 
         req.body.favoriteBook && req.body.password && req.body.confirmPassword ) {

      // confirm that user type same password twice
      if ( req.body.password !== req.body.confirmPassword ){
        var err = new Error('Passwords do not match.');
        err.status = 400;
        return next(err);
      }

      // create an Object with form input
      // a new object representing the document to insert into Mongo
      var userData = {
        email: req.body.email,
        name: req.body.name,
        favoriteBook: req.body.favoriteBook,
        password: req.body.password
      };
      
      // use schema's 'create' method to insert a new document into Mongo based on the model
      // 'User' is the mongoose model return by the user.js schema file
      User.create(userData, function(error, user) {
         // if there is an error, pass it off to the error handling middleware
         if(error) {
           return next(error);
        } else {
        // if successful, the application sends the user to the profile page
           req.session.userId = user._id; // once registered, automatically logged in
           res.redirect('/profile');
         }
      });

    } else {
      var err = new Error('All fields required.');
      err.status = 400; // HTTP status code meaning Bad Request -> user will have to redo
      return next(err);
    }
});

// GET /login
router.get('/login', mid.loggedOut, function(req, res, next) {
  return res.render('login', { title: 'Log In' });
});

// POST /login
router.post('/login', function(req, res, next) {
  if ( req.body.email && req.body.password ) {
    User.authenticate(req.body.email, req.body.password, function(error, user) {
      if (error || !user) {
        var err = new Error("Wrong email or password.");
        err.status = 401;
        return next(err);
      } else {
        // tell express to add a property of the session or create a new session if one doesn't exist
        req.session.userId = user._id;
        return res.redirect('/profile');
      }  
    });
  } else {
    var err = new Error('Email and password are required');
    err.status = 401;
    return next(err);
  }
});

// GET /profile
router.get('/profile', mid.requireLogIn, function(req, res, next) {
  User.findById(req.session.userId)
      .exec(function(error, user){
        if (error) {
          return next(error);
        } else {
          return res.render('profile', {
            title: 'Profile',
            name: user.name,
            favorite: user.favoriteBook
          });
        }
      });
});

// GET /logout
router.get('/logout', function(req, res, next) {
  // check to see if a session exists
  if (req.session) {
    // delete session object
    // destroying the session which was tracking the user is the easiest way to log the user out of the site
    // the sessions destroy takes a callback which indicates what it should do after the session is destroyed
    req.session.destroy(function(err) {
      // check to see if there were any errors
      if(err) {
        return next(err);
      } else {
        // if no errors, redirect the logged out user to the homepage
        return res.redirect('/');
      }
    });
  }  
});



module.exports = router;
