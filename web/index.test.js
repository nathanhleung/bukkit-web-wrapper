// Set NODE_ENV to "test" to suppress logging
process.env.NODE_ENV = "test";

const request = require("supertest");

const app = require("./");

it("responds to GET /", () => {
  request(app)
    .get("/")
    .expect(200, done);
});
