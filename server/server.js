require('./config/config.js'); // set up environment variables and ports/databsaes
const {mongoose} = require('./database/mongoose.js');
const {User} = require('./models/user');
const {Admin} = require('./models/admin');

const {authenticate} = require('./middleware/authenticate.js');
const {authenticateAdmin} = require('./middleware/authenticateAdmin.js');

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


// signin
app.post("/signin", urlencodedParser, (req, res) => {
  let body = _.pick(req.body, ['studentid', 'password']);

  User.findByCredentials(body.studentid, body.password).then((user) => {
    return user.generateAuthToken().then((token) => {
      res.header({'x-auth': token, studentid: body.studentid}).send(user);
    })
  }).catch((e) => {
    res.status(400).send();
  })
});


// access profile
app.get("/profile/:token", authenticate, (req, res, next) => {

    let choicesList = "";
    let choices = req.user.choices; // get user choices from req.user object (returned from authentification middleware)

    if(choices != "None") { // if there are choices, turn them into list items to be passed to handlebars
      let choicesArray = JSON.parse(choices);
      choicesArray.forEach(choice => {
        console.log(choice)
        choicesList += `<li>${choice}</li>`
      })
    }

    res.render('loggedIn.hbs', {
      name: req.user.name,
      department: req.user.department,
      studentid: req.user.studentid,
      choices: choicesList,
    })

})

// logout
app.delete('/logout', authenticate, (req, res) => {
  req.user.removeToken(req.token).then(() => {
    res.status(200).send();
  }).catch((e) => {
    res.status(400).send();
  })
})


// save company choices
app.post("/profile/:token", authenticate, urlencodedParser, (req, res) => {
  console.log(req.body.choices)
  let choices = req.body.choices;
  // save company choices

  User.findOneAndUpdate({
    _id: req.user._id
  }, {$set: {choices: choices}}, {new: true}).then((choices) => {
    res.status(200).send();
  }).catch((err) => {
    res.status(400).send();
  })
})


// admin homepage

app.get("/admin", urlencodedParser, (req, res) => {
  res.render("admin.hbs");
})

module.exports = {
  app: app
}
