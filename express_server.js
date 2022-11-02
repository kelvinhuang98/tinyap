const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080; // default port 8080

const users = {
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
};

const MESSAGE_401 = "You must be logged in to use TinyApp";

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

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

const getUserByEmail = (email, users) => {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return null;
};

const urlsForUser = (id, database) => {
  let userURL = {};
  for (let shortURL in database) {
    if (database[shortURL].userID === id) {
      userURL[shortURL] = database[shortURL];
    }
  }
  return userURL;
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  if (!req.cookies.user_id) {
    res.status(401).send(MESSAGE_401);
  } else {
    const templateVars = {
      urls: urlsForUser(req.cookies.user_id, urlDatabase),
      user: users[req.cookies.user_id],
    };
    res.render("urls_index", templateVars);
  }
});

app.post("/urls", (req, res) => {
  if (!req.cookies.user_id) {
    res.status(401).send(MESSAGE_401);
  } else {
    const templateVars = {
      urls: urlsForUser(req.cookies.user_id, urlDatabase),
      user: users[req.cookies.user_id],
    };
    const shortURL = generateRandomString(6);
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: req.cookies.user_id,
    };
    res.redirect(`/urls/${shortURL}`);
  }
});

app.get("/urls/new", (req, res) => {
  if (!req.cookies.user_id) {
    res.redirect("/login");
  } else {
    const templateVars = {
      user: users[req.cookies.user_id],
    };
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:id", (req, res) => {
  if (!req.cookies.user_id) {
    res.status(401).send(MESSAGE_401);
  } else if (req.cookies.user_id !== urlDatabase[req.params.id].userID) {
    res.status(403).send("You do not have access to this URL");
  } else {
    const templateVars = {
      id: req.params.id,
      longURL: urlDatabase[req.params.id].longURL,
      user: users[req.cookies.user_id],
    };
    res.render("urls_show", templateVars);
  }
});

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  if (urlDatabase[shortURL] === undefined) {
    res.status(404).send("Cannot find ID");
  } else if (!req.cookies.user_id) {
    res.status(401).send(MESSAGE_401);
  } else if (req.cookies.user_id !== urlDatabase[req.params.id].userID) {
    res.status(403).send("You do not have access to this URL");
  } else {
    urlDatabase[shortURL] = {
      longURL: req.body.newURL,
      userID: req.cookies.user_id,
    };
    res.redirect("/urls");
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

app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;
  if (urlDatabase[shortURL] === undefined) {
    res.status(404).send("Cannot find ID");
  } else if (!req.cookies.user_id) {
    res.status(401).send(MESSAGE_401);
  } else if (req.cookies.user_id !== urlDatabase[req.params.id].userID) {
    res.status(403).send("You do not have access to this URL");
  } else {
    delete urlDatabase[shortURL];
    const templateVars = {
      urls: urlDatabase,
      user: users[req.cookies.user_id],
    };
    res.redirect("/urls");
  }
});

app.get("/login", (req, res) => {
  if (req.cookies.user_id) {
    res.redirect("/urls");
  } else {
    const templateVars = {
      user: users[req.cookies.user_id],
    };
    res.render("urls_login", templateVars);
  }
});

app.post("/login", (req, res) => {
  const user = getUserByEmail(req.body.email, users);
  if (user && user.password === req.body.password) {
    res.cookie("user_id", user.id);
    res.redirect("/urls");
  } else {
    res.status(403);
    res.send("Inputted invalid credentials");
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id", req.cookies.user_id);
  res.redirect("/login");
});

app.get("/register", (req, res) => {
  if (req.cookies.user_id) {
    res.redirect("/urls");
  } else {
    const templateVars = {
      user: users[req.cookies.user_id],
    };
    res.render("urls_register", templateVars);
  }
});

app.post("/register", (req, res) => {
  const newEmail = req.body.email;
  const newPass = req.body.password;
  if (newEmail === "" || newPass === "") {
    res.status(400);
    res.send("Please enter a valid email/password");
  } else if (getUserByEmail(newEmail, users)) {
    res.status(400);
    res.send("This email address has already been registered");
  } else {
    const user = {
      id: generateRandomString(6),
      email: newEmail,
      password: newPass,
    };
    users[user.id] = user;
    res.cookie("user_id", user.id);
    res.redirect("/urls");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
