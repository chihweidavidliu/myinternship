require('./config/config.js'); // set up environment variables and ports/databsaes
const {mongoose} = require('./database/mongoose.js');
const {User} = require('./models/user');
const {authenticate} = require('./middleware/authenticate.js');

const hbs = require('hbs');
const {ObjectID} = require('mongodb'); // import ObjectID from mongodb for id validation methods
const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');

const port = process.env.PORT;

var app = express();

app.use(bodyParser.json()); // use bodyParser to parse request as JSON
var urlencodedParser = bodyParser.urlencoded({ extended: false }) // parse req body middleware for form submission

app.use(express.static(`public`)); // middleware that sets up static directory in a folder of your choice - for your pages which don't need to be loaded dynamically
hbs.registerPartials(`${__dirname}/views/partials`) // register default partials directory

app.listen(port, () => {
  console.log(`Listening to port ${port}`)
});

//homepage
app.get("/", (req, res) => {
  res.render("home.hbs");
})

//signup
app.post("/signup", urlencodedParser, (req, res, next) => {
  let body = _.pick(req.body, ['studentid', 'name', 'password', 'department']);
  let user = new User(body);

  user.save().then(() => {
    return user.generateAuthToken();
  }).then((token) => {
    res.header({'x-auth': token, studentid: req.body.studentid}).send(user);

  }).catch((err) => {
    res.status(400).send(err);
  })
})

app.post("/loggedin", authenticate, (req, res) => {
  console.log(`token: ${req.header('x-auth')}`)
  console.log(`name from database: ${req.user.name}`)
  res.render(`loggedIn.hbs`);
})
