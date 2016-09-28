// This is the Users schema that will be used to capture user sign up details

// loads module and stores it in the variable
var mongoose = require('mongoose');
//var bcyrpt = require('bcyrpt');

// mongoose Schema Object
// required ensures that a user cannot create an account if the field is omitted
// unique ensures the provided email address does not exist in the db
// trim removes any additional whitespace
var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  favoriteBook: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  }
});

// authenticate input against database documents
// in mongoose the statics obj lets you add method directly to the model
// the callback will either log the user in or alert the user with an unauthorised user error
UserSchema.statics.authenticate = function(email, password, callback) {
  // tell mongoose to find the document with the User's email address
  User.findOne({email: email})
      .exec(function (error, user) {
        // the exec function performs the search and provides this callback to process the results
        if (error) {
          return callback(error); // if there was an error with the query
        } else if ( !user ) {
          var err = new Error('User not found!');
          err.status = 401;
          return callback(err);
        }

        // user found in db with the supplied email
        // compare the supplied password with the hashed version
        // arg 1: the plain text passowrd provided by user on the log-in form
        // arg 2: the hashed password in the retrieved db document
        // arg 3: a callback
        bcyrpt.compare(password, user.password, function(error, result){
          // result is true if the passwords match
          if (result === true) {
            // null represents an error value. Node uses a standard pattern for callbacks,
            // an error followed by other arguments. In this case, there is no error as authentication worked
            // therefore a null value is passed followed by the user object
            return callback(null, user);
          } else {
            return callback();
          }
        });
      }); 
};


// use a pre-save hook (function that mongoose runs before saving a record to mongo) from mongoose
// hash password before storing in db
// the 'pre' method takes 2 args. The first args is the hook name in this case 'save'. A mongoose keyword.
// before saving the document, mongoose runs a function. The 2nd arg to the 'pre' function.
// UserSchema.pre('save', function(next) {
//   // 'next' is the middleware passed to the anonymous function. It represents the next function to run after this one
//   // it provides a way to process input as its passed through a chain of commands. 
//   // Express takes care of which middleware to run next
//   // Mongoose assigns the obj its about to insert into the db to the JavaScript keyword 'this'
//   var user = this;
  
//   // bcyrpt provides capabilities for both hashing and salting in the 'hash' function
//   // 1st arg: a plain text password
//   // 2nd arg: tells bcyrpt how many times to apply the encryption algorithm. Bigger = Secure = the slower the process.
//   // 3rd arg: a callback that bcyrpt runs after the password is hashed
//   // bcyrpt passes 2 args to the callback. An error is the hashing fails or the hash value if it succeeds.
//   bcyrpt.hash(user.password, 10, function(err, hash) {
//     // handle errors
//     if (err) {
//       return next(err);
//     }
//     // use the callback to replace the plain text password with the hashed password
//     user.password = hash;
//     next(); // call the next function in the middleware stack. In this case, save the document to the db.
//   })
// });

// export the Schema to allow usage in the app
var User = mongoose.model('User', UserSchema);
module.exports = User;