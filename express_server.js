const express = require("express");
const {
  getUserByEmail,
  generateRamdomStrings,
  urlsForUser,
} = require("./helpers");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const app = express();
app.use(
  cookieSession({
    name: "session",
    keys: ["testing"],
  })
);
const methodOverride = require("method-override");
const PORT = 8080;
app.use(methodOverride("_method"));
app.set("view engine", "ejs");

const urlDatabase = {
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userId: "aJ48lW",
  },

  "9sm5xK": {
    longURL: "http://www.google.com",
    userId: "aJ48lW",
  },
};
const users = {};

app.use(express.urlencoded({ extended: true }));

app.post("/register", (req, res) => {
  let { email, password } = req.body;
  const user = users[req.session["user_id"]];
  const userUrls = urlsForUser(req.session["user_id"], urlDatabase);
  const templateVars = { urls: userUrls, user };
  let hashedPassword = bcrypt.hashSync(password, 10);
  let lookUser = getUserByEmail(email, users);
  if (req.body.email === "" || req.body.password === "") {
    return res
      .status(400)
      .send(
        `Please enter a valid information <a href = "/register">Go back</a>`
      );
  } else if (lookUser) {
    return res.status(400).render("urls_emailExist", templateVars);
  } else {
    let id = generateRamdomStrings();
    users[id] = {
      id,
      email,
      hashedPassword,
    };
    console.log(users);
    res.redirect("/login");
  }
});
app.post("/urls", (req, res) => {
  let shortid = generateRamdomStrings();
  const user = users[req.session["user_id"]];
  let longURL = req.body.longURL.trim();
  if (!longURL.startsWith("http://")) {
    longURL = "http://" + longURL;
  }
  urlDatabase[shortid] = {
    longURL: longURL,
    userId: req.session["user_id"],
  };
  if (user) {
    res.redirect(`/urls`);
  } else {
    return res.send(`<h1>Need to login first to be able to use the app</h1>`);
  }
});
app.delete("/urls/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    return res.send("The short url that you are looking for do not exist");
  }
  if (!req.session["user_id"]) {
    return res.send("Please login first");
  }
  if (urlDatabase[req.params.id].userId !== req.session["user_id"]) {
    return res.send("You do not own this URL");
  }
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});
app.put("/urls/:id", (req, res) => {
  res.redirect(`/urls/${req.params.id}`);
});
app.post("/login", (req, res) => {
  const user = users[req.session["user_id"]];
  const userUrls = urlsForUser(req.session["user_id"], urlDatabase);
  const templateVars = { urls: userUrls, user };
  let { email, password } = req.body;
  let lookUser = getUserByEmail(email, users);
  console.log("----> lookUser", lookUser);
  if (lookUser === undefined) {
    return res.status(403).render("urls_createAccount", templateVars);
  } else if (
    email === lookUser.email &&
    !bcrypt.compareSync(password, lookUser.hashedPassword)
  ) {
    return res.status(403).render("urls_wrongPass", templateVars);
  } else {
    req.session["user_id"] = lookUser.id;
    res.redirect("/urls");
  }
});
app.get("/u/:id", (req, res) => {
  const urlId = req.params.id;
  const longURL = urlDatabase[urlId].longURL;
  const userId = req.session["user_id"];
  if (!userId) {
    return res.send("Please log in to acces this page.");
  }
  if (!urlDatabase[urlId]) {
    return res.send("URL not found.");
  }
  if (urlDatabase[urlId].userId !== userId) {
    return res.send("You do not own this URL");
  }
  res.redirect(longURL);
});
app.get("/urls/new", (req, res) => {
  const user = users[req.session["user_id"]];
  const templateVars = { urls: urlDatabase, user };
  if (user) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});
app.get("/login", (req, res) => {
  const user = users[req.session["user_id"]];
  const templateVars = { urls: urlDatabase, user };
  if (user) {
    res.redirect("/urls");
  } else {
    res.render("urls_login", templateVars);
  }
});
app.get("/urls/:id", (req, res) => {
  const user = users[req.session["user_id"]];
  let longURL = urlDatabase[req.params.id].longURL;
  const templateVars = {
    id: req.params.id,
    longURL: longURL,
    user,
  };
  res.render("urls_show", templateVars);
});
app.post("/urls/:id", (req, res) => {
  console.log("body ---", req.body);
  let longURL = req.body.url;
  if (!longURL.startsWith("http://")) {
    longURL = "http://" + longURL;
  }
  urlDatabase[req.params.id].longURL = longURL;
  if (!urlDatabase[req.params.id]) {
    return res.send("The short url that you are looking for do not exist");
  }
  if (!req.session["user_id"]) {
    return res.send("Please login first");
  }
  if (urlDatabase[req.params.id].userId !== req.session["user_id"]) {
    return res.send("You do not own this URL");
  }
  res.redirect("/urls");
});
app.get("/register", (req, res) => {
  const user = users[req.session["user_id"]];
  const templateVars = { urls: urlDatabase, user };
  if (user) {
    res.redirect("/urls");
  } else {
    res.render("urls_registration", templateVars);
  }
});
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});
app.get("/urls", (req, res) => {
  const user = users[req.session["user_id"]];
  const userUrls = urlsForUser(req.session["user_id"], urlDatabase);
  const templateVars = { urls: userUrls, user };
  console.log("--->user urls", userUrls);
  console.log("database", urlDatabase);
  if (user) {
    res.render("urls_index", templateVars);
  } else {
    res.render("urls_loginFirst", templateVars);
  }
});
app.get("/", (req, res) => {
  res.render("urls");
});
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
