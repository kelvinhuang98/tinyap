// Function to generate a random string with the desired length as the paramater
const generateRandomString = (number) => {
  shortURL = "";
  characters = "aAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpPqQrRsStTuUvVwWxXyYzZ0123456789";
  for (let i = 0; i < number; i++) {
    shortURL += characters.substr(
      Math.floor(Math.random() * characters.length + 1),
      1
    );
  }
  return shortURL;
};

// Function to get a specific user in a database based on the inputted email
const getUserByEmail = (email, users) => {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return null;
};

// Function to get the URLs of a user in a database based on their user ID
const urlsForUser = (id, database) => {
  let userURL = {};
  for (let shortURL in database) {
    if (database[shortURL].userID === id) {
      userURL[shortURL] = database[shortURL];
    }
  }
  return userURL;
};

module.exports = { generateRandomString, getUserByEmail, urlsForUser };
