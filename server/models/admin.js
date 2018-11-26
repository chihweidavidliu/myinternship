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
  password: {
      type: String,
      require: true,
      minlength: 6
    },
  companyChoices: {
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


AdminSchema.methods.generateAuthToken = function(expiry) { // schema.methods defines instance methods (methods applied to instances of the model)
  let admin = this;
  let access = 'auth';
  let token = jwt.sign({_id: admin._id.toHexString(), access: access}, process.env.JWT_SECRET, { expiresIn: expiry }).toString();

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
    "username": username
  }).then((admin) => {
    if(!admin) {
      console.log("Can't find admin")
      return Promise.reject(); // this will trigger catch case in server.js
    }
    return new Promise((resolve, reject) => {
      if(admin.password == password) {
        resolve(admin)
      } else {
        console.log("Password does not match")
        reject()
      }
    })
  })
}

AdminSchema.methods.toJSON = function() { // redefine toJSON method used when using send() to leave off sensitive information
  let admin = this;
  let adminObject = admin.toObject();

  return _.pick(adminObject, ['_id', 'username']);
}

// Admin models
let Admin = mongoose.model('Admin', AdminSchema);

module.exports = {
  Admin: Admin
}
