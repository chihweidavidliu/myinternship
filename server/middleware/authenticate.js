let {User} = require('./../models/user.js');

let authenticate = (req, res, next) => { // authentication middleware
  let token = req.header('x-auth') || req.params.token;

  User.findByToken(token).then((user) => {
    if(!user) {
      return Promise.reject(); // send a rejection that automatically runs the catch clauses
    }

    req.user = user; // set the request user to the user we just found
    req.token = token;
    next();
  }).catch((e) => {
    res.redirect("/"); // go home if authentification fails
  })
}

module.exports = {
  authenticate: authenticate
}
