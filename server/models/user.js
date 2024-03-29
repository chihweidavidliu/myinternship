const mongoose = require('mongoose');
const validator = require('validator'); // email validation library
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');


let UserSchema = new mongoose.Schema({
  studentid: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    unique: true, // stops email duplicates occuring in the database
    },
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    },
  password: {
      type: String,
      require: true,
      minlength: 6
    },
  department: {
    type: String,
    require: true,
  },
  choices: {
    type: String,
    require: false,
  },
  tokens: [{
      access: {
        type: String,
        required: true
      },
      token: {
        type: String,
        required: true
      }
    }],
})

//define authentification methods

// generate authentification token for a specific user
UserSchema.methods.generateAuthToken = function(expiry) { // schema.methods defines instance methods (methods applied to instances of the model)
  let user = this;
  let access = 'auth';
  let token = jwt.sign({_id: user._id.toHexString(), access: access}, process.env.JWT_SECRET, { expiresIn: expiry }).toString();

  user.tokens.push({access, token});

  return user.save().then(() => { // return this in order to allow server.js to chain on to this promise chain
    return token; // return token so that it is accessible in server.js
  })
}

UserSchema.methods.removeToken = function(token) {
  let user = this;

  return user.update({
    $pull: {
      tokens: {
        token: token,
      }
    }
  })
}


//method to search Users database via authentication token
UserSchema.statics.findByToken = function(token) { // schema.methods defines methods applied to the  model (here User) not to the specific instance
  let User = this;
  let decoded;

  try {
   decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    return Promise.reject(); // this will trigger catch case in server.js
  }

  return User.findOne({ // success case - look in Users to find the matching user
    '_id': decoded._id,
    'tokens.token': token, // use dot notation within quotes to go to a deeper level within the user object
    'tokens.access': 'auth'
  });

}


UserSchema.statics.findByCredentials = function(studentid, password) {
  let User = this;

  return User.findOne({
    'studentid': studentid
  }).then((user) => {
    if(!user) {
      return Promise.reject(); // this will trigger catch case in server.js
    }

    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, res) => {
        if(res == true) {
          resolve(user)
        } else {
          reject();
        }
      })
    })
  })
}

UserSchema.methods.toJSON = function() { // redefine toJSON method used when using send() to leave off sensitive information
  let user = this;
  let userObject = user.toObject();

  return _.pick(userObject, ['_id', 'name', 'department']);
}


//mongoose middleware (use the .pre() method on schema to set middleware)
UserSchema.pre('save', function(next) { // this will hash all passwords every time a password is set or modified
  let user = this;

  if(user.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => { //genSalt(number of rounds of encryption, callback with err and salt parameters)
      bcrypt.hash(user.password, salt, (err, hash) => { //hash takes 3 arguments, thing to be hashed, the salt to be used and a callback
        user.password = hash;
        next(); // need to call next for middleware to move on
      })
    })
  } else {
    next();
  }
})


// User model
let User = mongoose.model('User', UserSchema)


module.exports = {
  User: User
}
