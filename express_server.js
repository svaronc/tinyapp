// Require the express framework
const express = require("express");
const cookieParser = require("cookie-parser");
// Create an instance of the express application
const app = express();
app.use(cookieParser());
// Set the PORT constant to 8080, which will be used for the server to listen on
const PORT = 8080;

// Function to generate random strings
function generateRamdomStrings() {
  const alphanumericData =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    const random = Math.floor(Math.random() * alphanumericData.length);
    result += alphanumericData[random];
  }
  return result;
}

function getUserByEmail(email) {
  return Object.values(users).find((user) => user.email === email);
}
// Set the view engine of the express application to EJS
app.set("view engine", "ejs");

// Sample database holding shortened URLs and their corresponding long URLs
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};
const users = {};

// Use express's urlencoded middleware to parse incoming requests with URL-encoded data
app.use(express.urlencoded({ extended: true }));

// Route to handle POST requests to /urls
app.post("/register", (req, res) => {
  let { email, password } = req.body;
  let lookUser = getUserByEmail(email);
  if (req.body.email === "" || req.body.password === "") {
    return res
      .status(400)
      .send(
        `Please enter a valid information <a href = "/register">Go back</a>`
      );
  } else if (lookUser) {
    return res
      .status(400)
      .send(`Email already exist <a href = "/login">Go login</a>`);
  } else {
    let id = generateRamdomStrings();
    users[id] = {
      id,
      email,
      password,
    };
    console.log(users);
    res.redirect("/login");
  }
});
app.post("/urls", (req, res) => {
  let shortid = generateRamdomStrings();
  urlDatabase[shortid] = req.body.longURL;
  res.redirect(`/urls`);
});
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});
app.post("/urls/:id/edit", (req, res) => {
  res.redirect(`/urls/${req.params.id}`);
});
app.post("/login", (req, res) => {
  let { email, password } = req.body;
  let lookUser = getUserByEmail(email);
  console.log("----> lookUser", lookUser);
  if (lookUser === undefined) {
    return res
      .status(403)
      .send(`Create an Account first <a href = "/register">Go signup</a>`);
  } else if (email === lookUser.email && lookUser.password !== password) {
    return res
      .status(403)
      .send(`Wrong password  <a href = "/login">Go back</a>`);
  } else {
    res.cookie("user_id", lookUser.id);
    res.redirect("/urls");
  }
});
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});
// Route to display a page for creating new shortened URLs
app.get("/urls/new", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = { urls: urlDatabase, user };
  res.render("urls_new", templateVars);
});
app.get("/login", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = { urls: urlDatabase, user };
  if (user) {
    res.redirect("/urls");
  } else {
    res.render("urls_login", templateVars);
  }
});
// Dynamic route to display details of a specific shortened URL by its ID
app.get("/urls/:id", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = {
    id: req.params.id, // Get the id from the route parameter
    longURL: urlDatabase[req.params.id],
    user,
    // Get the corresponding long URL from the database
  };
  res.render("urls_show", templateVars);
});
app.post("/urls/:id", (req, res) => {
  console.log("body ---", req.body);
  urlDatabase[req.params.id] = req.body.url;
  res.redirect("/urls");
});
app.get("/register", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = { urls: urlDatabase, user };
  if (user) {
    res.redirect("/urls");
  } else {
    res.render("urls_registration", templateVars);
  }
});
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});
// Route to display a list of all shortened URLs
app.get("/urls", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = { urls: urlDatabase, user }; // Pass the entire URL database to the template
  res.render("urls_index", templateVars);
});
app.get("/", (req, res) => {
  res.render("urls");
});
// Start the server on the defined PORT (8080 in this case)
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
