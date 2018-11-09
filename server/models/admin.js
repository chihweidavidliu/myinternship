const mongoose = require('mongoose');
const validator = require('validator'); // email validation library
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

// Admin schema

let AdminSchema = new mongoose.Schema({
  username: {
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


AdminSchema.methods.generateAuthToken = function() { // schema.methods defines instance methods (methods applied to instances of the model)
  let admin = this;
  let access = 'auth';
  let token = jwt.sign({_id: admin._id.toHexString(), access: access}, process.env.JWT_SECRET).toString();

  admin.tokens.push({access, token});

  return admin.save().then(() => { // return this in order to allow server.js to chain on to this promise chain
    return token; // return token so that it is accessible in server.js
  })
}

AdminSchema.methods.removeToken = function(token) {
  let admin = this;

  return admin.update({
    $pull: {
      tokens: {
        token: token,
      }
    }
  })
}


AdminSchema.statics.findByToken = function(token) { // schema.methods defines methods applied to the  model (here User) not to the specific instance
  let Admin = this;
  let decoded;

  try {
   decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    return Promise.reject(); // this will trigger catch case in server.js
  }

  return Admin.findOne({ // success case - look in Admins to find the matching user
    '_id': decoded._id,
    'tokens.token': token, // use dot notation within quotes to go to a deeper level within the user object
    'tokens.access': 'auth'
  });

}

AdminSchema.statics.findByCredentials = function(username, password) {
  let Admin = this;

  return Admin.findOne({
    'username': username
  }).then((admin) => {
    if(!admin) {
      return Promise.reject(); // this will trigger catch case in server.js
    }

    return new Promise((resolve, reject) => {
      bcrypt.compare(password, admin.password, (err, res) => {
        if(res == true) {
          resolve(admin)
        } else {
          reject();
        }
      })
    })
  })
}

AdminSchema.methods.toJSON = function() { // redefine toJSON method used when using send() to leave off sensitive information
  let admin = this;
  let adminObject = admin.toObject();

  return _.pick(adminObject, ['_id', 'username']);
}

//mongoose middleware (use the .pre() method on schema to set middleware)
AdminSchema.pre('save', function(next) { // this will hash all passwords every time a password is set or modified
  let admin = this;

  if(admin.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => { //genSalt(number of rounds of encryption, callback with err and salt parameters)
      bcrypt.hash(admin.password, salt, (err, hash) => { //hash takes 3 arguments, thing to be hashed, the salt to be used and a callback
        admin.password = hash;
        next(); // need to call next for middleware to move on
      })
    })
  } else {
    next();
  }
})


// Admin models
let Admin = mongoose.model('Admin', AdminSchema);

module.exports = {
  Admin: Admin
}
