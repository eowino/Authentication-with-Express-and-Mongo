// prevent logged in users from accessing a route 
function loggedOut(req, res, next) {
    // the session middleware makes a session obj available through the request
    if (req.session && req.session.userId) {
        // if true, then the user is logged in, therefore send them to their profile page
        return res.redirect('/profile');
    }
    // if the user is not logged in, just pass execution to the next piece of middleware by calling next()
    // i.e. if the use isn't logged in, this function won't do anything
    return next();
}

// checks to see if a user is logged in, if they are then they can continue
// if user isn't logged in, then display an error informing the use they must be logged in to view the content
function requireLogIn(req, res, next) {
    if (req.session && req.session.userId) {
        return next();
    } else {
        var err = new Error("Sorry! Must be logged in to view this page.");
        err.status = 403; // forbidden - off limits unless logged in
        return next(err);
    }
}


module.exports.loggedOut = loggedOut;
module.exports.requireLogIn = requireLogIn;