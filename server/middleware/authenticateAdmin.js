let {Admin} = require('./../models/admin.js');

let authenticate = (req, res, next) => { // authentication middleware
  let token = req.header('admin-auth') || req.params.token || req.cookies["admin-auth"];

  Admin.findByToken(token).then((admin) => {
    if(!admin) {
      return Promise.reject(); // send a rejection that automatically runs the catch clauses
    }

    req.admin = admin; // set the request admin to the admin we just found
    req.token = token;
    next();
  }).catch((e) => {
    res.redirect("/admin"); // go home if authentification fails
  })
}

module.exports = {
  authenticateAdmin: authenticate
}
