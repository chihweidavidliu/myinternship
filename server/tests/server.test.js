const expect = require('expect');
const request = require('supertest');

const {app} = require('./../server.js');
const {ObjectID} = require('mongodb');
const mongoose = require('mongoose');
const {User} = require('./../models/user.js');
const {Admin} = require('./../models/admin.js');

const {users, populateUsers, admins, populateAdmins} = require('./seed/seed.js'); // set up the test data for the test database using seed.js

beforeEach(populateUsers);
beforeEach(populateAdmins);

describe("GET /", () => {
  it("should load homepage", (done) => {
    request(app)
      .get("/")
      .expect(200)
      .end(done)
  })
})

describe("POST /signup", () => {
  it("should create a new user in the database", (done) => {
    request(app)
      .post("/signup")
      .send({studentid: "123", name: "Aneta", password: "1521993", department: "Psychology"})
      .expect(200)
      .expect((res) => {
        expect(res.headers["x-auth"]).toBeTruthy();
        expect(res.headers["studentid"]).toBeTruthy();
      })
      .end((err, res) => {
        if(err) {
          return done(err)
        }

        User.findByCredentials("123", "1521993").then((user) => {
          expect(user.tokens[0].token).toBeTruthy();
          expect(user.tokens[0].token).toBe(res.headers["x-auth"]);
          done();
        }).catch((err) => done(err))
      })
  })

  it("should return 400 if user id already exists in database", (done) => {
    request(app)
      .post("/signup")
      .send({studentid: "12345", name: "Aneta", password: "1521993", department: "Psychology"})
      .expect(400)
      .end(done)
  })
})

describe("POST /signin", () => {
  it("should create token on login if credentials are valid", (done) => {
    request(app)
      .post('/signin')
      .send({studentid: "12345", password: "password"})
      .expect(200)
      .expect((res) => {
        expect(res.headers["x-auth"]).toBeTruthy();
        expect(res.headers["studentid"]).toBeTruthy();
      })
      .end((err, res) => {
        if(err) {
          return done(err)
        }

        // check token has been saved in database
        User.findById(users[0]._id).then((user) => {
          expect(user.tokens[0].token).toBeTruthy();
          expect(user.tokens[0].token).toBe(res.headers["x-auth"]);
          done();
        }).catch((err) => done(err));

      })
  });


  it("should return 400 if credentials are invalid", (done) => {
    request(app)
      .post('/signin')
      .send({studentid: "12345", password: "j"})
      .expect(400)
      .end(done)
  })
})

describe("GET /profile/:token", () => {
  it("should render profile page", (done) => {
    // let token = users[1]["tokens"][0]["token"].toString().trim();
    let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YmU5ZDFiNzM4NmYxYzRmOWM3N2U4YTciLCJhY2Nlc3MiOiJhdXRoIiwiaWF0IjoxNTQyMDUwMjMxfQ.1mDCOiWFLaQtq0HP-cZcA7ORIdcRfqv0D7byjGflg5I"
    request(app)
      .get(`/profile/${token}`)
      .expect(302)
      .end(done)
  })
})

describe("DELETE /logout", () => {
  it("should remove user token from database on logout", (done) => {
    request(app)
      .delete("/logout")
      .set('x-auth', users[1].tokens[0].token)
      .expect(200)
      .end((err, res) => {
        if(err) {
          return done(err)
        }
        User.findById(users[1]._id).then((user) => {
          expect(user.tokens.length).toBe(0);
          done();
        }).catch((err) => done(err))
      })
  })
})


describe("POST /profile/:token", () => {
  it("should save student's internship choices to database", (done) => {

    let choices = ["Facebook", "Apple"];
    let choicesStringified = JSON.stringify(choices).trim();
    request(app)
      .post(`/profile/${users[1].tokens[0].token}`)
      .send({choices: choicesStringified})
      .expect(200)
      .end((err, res) => {
        if(err) {
          return done(err)
        }

        User.findById(users[1]._id).then((user) => {
          expect(JSON.parse(user.choices)).toEqual(["Facebook", "Apple"]);
          done()
        }).catch((err) => done(err))
      })

  })
})
