const express = require("express");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080;

const {
  generateRandomString,
  getUserByEmail,
  urlsForUser,
} = require("./helpers");

const users = {};

const urlDatabase = {};

const MESSAGE_401 = "You must be logged in to use TinyApp";

// Set EJS Template Engine
app.set("view engine", "ejs");

// MIDDLEWARE
app.use(express.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2", "key3"],

    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);

// ENDPOINTS
app.get("/", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/login");
  } else {
    res.redirect("/urls");
  }
});

app.get("/urls", (req, res) => {
  if (!req.session.user_id) {
    res.status(401).send(MESSAGE_401);
  } else {
    const templateVars = {
      urls: urlsForUser(req.session.user_id, urlDatabase),
      user: users[req.session.user_id],
    };
    res.render("urls_index", templateVars);
  }
});

app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/login");
  } else {
    const templateVars = {
      user: users[req.session.user_id],
    };
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:id", (req, res) => {
  if (!req.session.user_id) {
    res.status(401).send(MESSAGE_401);
  } else if (req.session.user_id !== urlDatabase[req.params.id].userID) {
    res.status(403).send("You do not have access to this URL");
  } else {
    const templateVars = {
      id: req.params.id,
      longURL: urlDatabase[req.params.id].longURL,
      user: users[req.session.user_id],
    };
    res.render("urls_show", templateVars);
  }
});

app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL].longURL;
  if (!longURL) {
    res.status(400).send("Invalid URL");
  } else {
    res.redirect(longURL);
  }
});

app.get("/login", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    const templateVars = {
      user: users[req.session.user_id],
    };
    res.render("urls_login", templateVars);
  }
});

app.get("/register", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    const templateVars = {
      user: users[req.session.user_id],
    };
    res.render("urls_register", templateVars);
  }
});

app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    res.status(401).send(MESSAGE_401);
  } else {
    const templateVars = {
      urls: urlsForUser(req.session.user_id, urlDatabase),
      user: users[req.session.user_id],
    };
    const shortURL = generateRandomString(6);
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: req.session.user_id,
    };
    res.redirect(`/urls/${shortURL}`);
  }
});

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  if (urlDatabase[shortURL] === undefined) {
    res.status(404).send("Cannot find ID");
  } else if (!req.session.user_id) {
    res.status(401).send(MESSAGE_401);
  } else if (req.session.user_id !== urlDatabase[req.params.id].userID) {
    res.status(403).send("You do not have access to this URL");
  } else {
    urlDatabase[shortURL] = {
      longURL: req.body.newURL,
      userID: req.session.user_id,
    };
    res.redirect("/urls");
  }
});

app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;
  if (urlDatabase[shortURL] === undefined) {
    res.status(404).send("Cannot find ID");
  } else if (!req.session.user_id) {
    res.status(401).send(MESSAGE_401);
  } else if (req.session.user_id !== urlDatabase[req.params.id].userID) {
    res.status(403).send("You do not have access to this URL");
  } else {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  }
});

app.post("/login", (req, res) => {
  const user = getUserByEmail(req.body.email, users);
  if (user && bcrypt.compareSync(req.body.password, user.password)) {
    req.session.user_id = user.id;
    res.redirect("/urls");
  } else {
    res.status(403).send("Inputted invalid credentials");
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.post("/register", (req, res) => {
  const newEmail = req.body.email;
  const newPass = req.body.password;
  if (newEmail === "" || newPass === "") {
    res.status(400).send("Please enter a valid email/password");
  } else if (getUserByEmail(newEmail, users)) {
    res.status(400).send("This email address has already been registered");
  } else {
    const hashedPassword = bcrypt.hashSync(newPass, 10);
    const user = {
      id: generateRandomString(6),
      email: newEmail,
      password: hashedPassword,
    };
    users[user.id] = user;
    req.session.user_id = user.id;
    res.redirect("/urls");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
