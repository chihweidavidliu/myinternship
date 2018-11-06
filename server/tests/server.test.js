const expect = require('expect');
const request = require('supertest');

const {app} = require('./../server.js');
const {ObjectID} = require('mongodb');
const {User} = require('./../models/user.js');
const {users, populateUsers} = require('./seed/seed.js'); // set up the test data for the test database using seed.js

beforeEach(populateUsers);

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
