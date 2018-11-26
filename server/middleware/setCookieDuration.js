
let setCookieDuration = (req, res, next) => {
  let stayLoggedIn = req.body['stayLoggedIn'];
  console.log(`Stay Logged In = ${stayLoggedIn}`)
  let expiry;
  let maxAge;
  if(stayLoggedIn == "true") {
    expiry = "30d";
    maxAge = (86400000 * 30);
  } else {
    expiry = "1d";
    maxAge = 86400000;
  }

  req.expiry = expiry;
  req.maxAge = maxAge;
  next();
}

module.exports = {
  setCookieDuration: setCookieDuration,
}
