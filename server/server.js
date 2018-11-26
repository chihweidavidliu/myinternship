require('./config/config.js'); // set up environment variables and ports/databsaes
const {mongoose} = require('./database/mongoose.js');
const {User} = require('./models/user');
const {Admin} = require('./models/admin');

const {authenticate} = require('./middleware/authenticate.js');
const {authenticateAdmin} = require('./middleware/authenticateAdmin.js');
const {loadCompanyChoices} = require('./middleware/loadCompanyChoices.js');
const {loadStudentChoices} = require('./middleware/loadStudentChoices.js');
const {loadCompanyOptions} = require('./middleware/loadCompanyOptions.js');
const {sorterGetStudentChoices} = require('./middleware/sorterGetStudentChoices.js');
const {sorterGetCompanyChoices} = require('./middleware/sorterGetCompanyChoices.js');
const hbs = require('hbs');
const {ObjectID} = require('mongodb'); // import ObjectID from mongodb for id validation methods
const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const port = process.env.PORT;

var app = express();

app.use(bodyParser.json()); // use bodyParser to parse request as JSON
var urlencodedParser = bodyParser.urlencoded({ extended: false }) // parse req body middleware for form submission

app.use(cookieParser()); // activate cookie parser

app.use(express.static(`public`)); // middleware that sets up static directory in a folder of your choice - for your pages which don't need to be loaded dynamically
hbs.registerPartials(`${__dirname}/../views/partials`); // register default partials directory


app.listen(port, () => {
  console.log(`Listening to port ${port}`);
});

//homepage
app.get("/", (req, res) => {
  // redirect if logged in
  if(req.cookies["x-auth"]) {
    return res.redirect('/profile')
  }
  res.render("home.hbs");
})

//signup
app.post("/signup", urlencodedParser, (req, res, next) => {
  let body = _.pick(req.body, ['studentid', 'name', 'password', 'department', 'stayLoggedIn']);
  let user = new User(body);
  let stayLoggedIn = body['stayLoggedIn'];
  let expiry;
  let maxAge;
  if(stayLoggedIn == "true") {
    expiry = "30d";
    maxAge = (86400000 * 30);
  } else {
    expiry = "1d";
    maxAge = 86400000;
  }

  user.save().then(() => {
    return user.generateAuthToken(expiry);
  }).then((token) => {
    res.cookie("x-auth", token, { maxAge: maxAge }).send();
  }).catch((err) => {
    res.status(400).send(err);
  })
})


// signin
app.post("/signin", urlencodedParser, (req, res) => {
  let body = _.pick(req.body, ['studentid', 'password', 'stayLoggedIn']);
  let stayLoggedIn = body['stayLoggedIn'];
  if(stayLoggedIn == "true") {
    expiry = "30d";
    maxAge = (86400000 * 30);
  } else {
    expiry = "1d";
    maxAge = 86400000;
  }

  User.findByCredentials(body.studentid, body.password).then((user) => {
    return user.generateAuthToken(expiry).then(token => {
       res.cookie("x-auth", token, { maxAge: maxAge }).send();
    })
  }).catch((e) => {
    res.status(400).send();
  })
});


app.get("/profile", urlencodedParser, authenticate, loadCompanyOptions, (req, res) => {
  let companyList = req.companyList; // get companyList from req object as set by loadCompanyOptions middleware
  let choices = req.user.choices; // get user choices from req.user object (returned from authentification middleware)
  let choicesList = "";

  if(choices && choices != "None") { // if there are choices, turn them into list items to be passed to handlebars
    let choicesArray = JSON.parse(choices);
    choicesArray.forEach(choice => {
      choicesList += `<li>${choice}</li>`
    })
  }

  res.render('loggedIn.hbs', {
    name: req.user.name,
    department: req.user.department,
    studentid: req.user.studentid,
    choices: choicesList,
    companyList: companyList,
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
app.post("/profile", authenticate, urlencodedParser, (req, res) => {
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
});


// admin homepage
app.get("/admin", urlencodedParser, (req, res) => {
  if(req.cookies["admin-auth"]) {
    return res.redirect('/admin/profile')
  }
  res.render("admin.hbs");
});

// admin signin
app.post("/admin", urlencodedParser, (req, res) => {
  let body = _.pick(req.body, ['username', 'password']);

  Admin.findByCredentials(body.username, body.password).then((admin) => {
    return admin.generateAuthToken().then((token) => {
      // if admin has chosen to stay logged in, then set the cookie to something longer

      res.cookie("admin-auth", token, { maxAge: 86400 }).send();
    })
  }).catch((e) => {
    res.status(400).send();
  });
});


// show logged in page for admin
app.get("/admin/profile", authenticateAdmin, loadCompanyChoices, loadStudentChoices, (req, res, next) => {

  let studentChoicesTable = req.studentChoicesTable;
  let companyChoicesTable = req.companyChoicesTable;

    res.render('loggedInAdmin.hbs', {
      studentChoicesTable: studentChoicesTable,
      companyChoicesTable: companyChoicesTable,
    })
})


// update companyChoices
app.post("/admin/update", authenticateAdmin, urlencodedParser, (req, res) => {

  let companyChoices = req.body.companyChoices;
  let admin = req.admin;

  admin.companyChoices = companyChoices;

  admin.save().then(() => {
    res.status(200).send();
  }).catch(e => {
    res.status(400).send();
  })

});

// load sorter route
app.get("/admin/sorter", authenticateAdmin, (req, res) => {
  res.render("sorter.hbs")
})


// get student data for sorter
app.get("/fetchSorterData", authenticateAdmin, sorterGetStudentChoices, sorterGetCompanyChoices, (req, res) => {

    // get data from the req object where the middleware has stored the relevant values
    let studentsArray = req.studentsArray;
    let companyChoicesObject = req.companyChoicesObject;

    let sorterData = {}; // combine student and company data into one data package to be sent
    sorterData.studentsArray = studentsArray;
    sorterData.companyChoices = companyChoicesObject;

    res.send(sorterData);
})



//admin logout
app.delete('/admin/logout', authenticateAdmin, (req, res) => {
  req.admin.removeToken(req.token).then(() => {
    res.status(200).send();
  }).catch((e) => {
    res.status(400).send();
  })
})

// export app for use in other modules
module.exports = {
  app: app
}
