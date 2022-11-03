const { assert } = require("chai");

const {
  generateRandomString,
  getUserByEmail,
  urlsForUser,
} = require("../helpers.js");

const testUsers = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
  p2qT9r: {
    longURL: "https://www.youtube.com",
    userID: "tR4q5y",
  },
  tOq42x: {
    longURL: "https://www.reddit.com",
    userID: "tR4q5y",
  },
};

describe("generateRandomString", function () {
  it("should generate a string with the same number of characters as the inputted number", function () {
    assert.equal(generateRandomString(6).length, 6);
  });
  it("should generate a string with the same number of characters as the inputted number", function () {
    assert.equal(generateRandomString(1).length, 1);
  });
  it("should generate a string with the same number of characters as the inputted number", function () {
    assert.equal(generateRandomString(30).length, 30);
  });
});

describe("getUserByEmail", function () {
  it("should return a user with a valid email", function () {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.equal(user.id, expectedUserID);
  });
  it("should return a undefined with an invalid email", function () {
    const user = getUserByEmail("user3@example.com", testUsers);
    assert.equal(user, undefined);
  });
});

describe("urlsForUser", function () {
  it("should return valid urls given a valid userID", function () {
    const userID = "aJ48lW";
    const urls = {
      b6UTxQ: {
        longURL: "https://www.tsn.ca",
        userID: "aJ48lW",
      },
      i3BoGr: {
        longURL: "https://www.google.ca",
        userID: "aJ48lW",
      },
    };
    assert.deepEqual(urlsForUser(userID, urlDatabase), urls);
  });
  it("should return valid urls given a valid userID", function () {
    const userID = "tR4q5y";
    const urls = {
      p2qT9r: {
        longURL: "https://www.youtube.com",
        userID: "tR4q5y",
      },
      tOq42x: {
        longURL: "https://www.reddit.com",
        userID: "tR4q5y",
      },
    };
    assert.deepEqual(urlsForUser(userID, urlDatabase), urls);
  });
  it("should return an empty object if the userID does not contain URLs", function () {
    const userID = "t4qrs2";
    assert.deepEqual(urlsForUser(userID, urlDatabase), {});
  });
});
