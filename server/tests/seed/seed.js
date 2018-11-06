const {ObjectID} = require('mongodb');
const {User} = require('./../../models/user.js');
const jwt = require('jsonwebtoken');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();

const users = [{
  _id: userOneId,
  studentid: "12345",
  name: "Chih-Wei",
  email: 'chihweiliu1993@gmail.com',
  password: 'password',
  department: 'Languages',
  choices: ["Google", "Facebook", "Twitter"],

}, {
  _id: userTwoId,
  studentid: "54321",
  name: "Jen",
  email: 'jen@example.com',
  password: 'password',
  department: 'Law',
  choices: ["Uber", "Airbnb"],
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: userTwoId, access: 'auth'}, process.env.JWT_SECRET).toString()
  }]
}]

const populateUsers = (done) => {
  User.deleteMany({}).then(() => {
    let userOne = new User(users[0]).save();
    let userTwo = new User(users[1]).save();

    return Promise.all([userOne, userTwo]).then(()=> {
      done();
    })
  })
}

module.exports = {
  users: users,
  populateUsers: populateUsers
}
