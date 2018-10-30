let env = process.env.NODE_ENV || 'development'; // set the environment

console.log('env -------', env)


if(env === 'development') {
  process.env.PORT = 3000;
  process.env.MONGODB_URI = "mongodb://localhost:27017/Myinternship";
  process.env.JWT_SECRET = "dkgaslglsgjl68565u"

} else if(env === 'test') {
  process.env.PORT = 3000;
  process.env.MONGODB_URI = "mongodb://localhost:27017/MyinternshipTest";
  process.env.JWT_SECRET = "dkgaslglsgjl68565u"

}

// if(env === 'development' || env === 'test') {
//   let config = require('./config.json');
//   let envConfig = config[env];
//
//   Object.keys(envConfig).forEach((key) => { // turn the envConfig object into an array of key names
//     process.env[key] = envConfig[key];  // for each key, set process.env[key] to the value of that key (taken from envConfig object)
//   })
// }
