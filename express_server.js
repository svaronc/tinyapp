// Required External Modules
const express = require("express");
const bcrypt = require("bcryptjs");
const cookieSession = require("cookie-session");
const methodOverride = require("method-override");

// Local Modules
const {
  getUserByEmail,
  generateRandomStrings,
  urlsForUser,
} = require("./helpers");

// App Configuration
const app = express();
const PORT = 8080; // Server port
app.set("view engine", "ejs"); // Set EJS as the view engine for rendering views

// Middlewares
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies (as sent by HTML forms)
app.use(methodOverride("_method")); // Override HTTP methods with "_method" query parameter

// Cookie Session Configuration
app.use(
  cookieSession({
    name: "session",
    keys: ["testing"],
  })
);
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

// In-Memory Database
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

// Route to handle registration
app.post("/register", (req, res) => {
  // Extract email and password from request body
  const { email, password } = req.body;

  // Validate that email and password are not empty
  if (email === "" || password === "") {
    // Respond with an error if validation fails
    return res
      .status(400)
      .send('Please enter valid information <a href="/register">Go back</a>');
  }

  // Check if user already exists by looking up the email in the user database
  const existingUser = getUserByEmail(email, users);
  if (existingUser) {
    // If the user exists, prepare template variables
    const user = users[req.session["user_id"]];
    const userUrls = urlsForUser(req.session["user_id"], urlDatabase);
    const templateVars = { urls: userUrls, user };

    // Respond with an error indicating the email exists
    return res.status(400).render("urls_emailExist", templateVars);
  }

  // If the user does not exist, create a new user
  // Hash the password with bcrypt
  const hashedPassword = bcrypt.hashSync(password, 10);
  // Generate a random string for user ID
  const id = generateRandomStrings();
  // Create a new user object in the user database
  users[id] = {
    id,
    email,
    hashedPassword, // Store the hashed password, not the plain one
  };

  // Logging the users object for debugging purposes
  console.log(users);

  // Redirect to the login page after successful registration
  res.redirect("/login");
});

// Route to handle the creation of shortened URLs
app.post("/urls", (req, res) => {
  // Check if the user is logged in
  const user = users[req.session["user_id"]];
  if (!user) {
    // If the user is not logged in, return an error message
    return res.send(`<h1>Need to login first to be able to use the app</h1>`);
  }

  // Generate a random string as a short ID for the URL
  const shortid = generateRandomStrings();
  // Extract and trim the submitted long URL
  let longURL = req.body.longURL.trim();

  // Ensure the long URL starts with "http://"
  if (!longURL.startsWith("http://") && !longURL.startsWith("https://")) {
    longURL = "http://" + longURL;
  }

  // Add the new short ID and long URL to the database
  urlDatabase[shortid] = {
    longURL: longURL,
    userId: req.session["user_id"],
  };

  // Redirect the user to the main URL page after creation
  res.redirect(`/urls`);
});

// DELETE route handler to remove a URL
app.delete("/urls/:id", (req, res) => {
  // Check if the short URL exists
  if (!urlDatabase[req.params.id]) {
    // If not, send an error message
    return res.send("The short URL that you are looking for does not exist.");
  }

  // Check if the user is logged in
  if (!req.session["user_id"]) {
    // If not, send an error message
    return res.send("Please log in first.");
  }

  // Check if the logged-in user owns the URL they're trying to delete
  if (urlDatabase[req.params.id].userId !== req.session["user_id"]) {
    // If not, send an error message
    return res.send("You do not own this URL.");
  }

  // Delete the URL from the database
  delete urlDatabase[req.params.id];

  // Redirect to the URLs index page
  res.redirect("/urls");
});

// PUT route handler to update a URL
app.put("/urls/:id", (req, res) => {
  // Redirect to the URL's detail page
  res.redirect(`/urls/${req.params.id}`);
});

// POST route handler for user login
app.post("/login", (req, res) => {
  // Get user information from session and database
  const user = users[req.session["user_id"]];
  const userUrls = urlsForUser(req.session["user_id"], urlDatabase);
  const templateVars = { urls: userUrls, user };

  // Destructure email and password from request body
  const { email, password } = req.body;

  // Attempt to find the user by email
  const lookUser = getUserByEmail(email, users);
  console.log("----> lookUser", lookUser); // Debugging log (should be removed or masked in production)

  // Check if the user exists
  if (lookUser === undefined) {
    // If not, render the create account page with a 403 status
    return res.status(403).render("urls_createAccount", templateVars);
  }

  // Check if the provided password is correct
  if (
    email === lookUser.email &&
    !bcrypt.compareSync(password, lookUser.hashedPassword)
  ) {
    // If not, render the wrong password page with a 403 status
    return res.status(403).render("urls_wrongPass", templateVars);
  }

  // Set the user ID in the session
  req.session["user_id"] = lookUser.id;

  // Redirect to the URLs index page
  res.redirect("/urls");
});

// Route to handle redirection from a short URL to the original (long) URL
app.get("/u/:id", (req, res) => {
  const urlId = req.params.id;
  // Check if the short URL exists
  if (!urlDatabase[urlId]) {
    return res.send("URL not found.");
  }

  // Retrieve the corresponding long URL
  const longURL = urlDatabase[urlId].longURL;
  // Check if the user is logged in
  const userId = req.session["user_id"];
  if (!userId) {
    return res.send("Please log in to access this page.");
  }

  // Check if the logged-in user owns the short URL
  if (urlDatabase[urlId].userId !== userId) {
    return res.send("You do not own this URL.");
  }

  // Redirect to the long URL
  res.redirect(longURL);
});

// Route to display the form for creating new URLs
app.get("/urls/new", (req, res) => {
  // Check if the user is logged in
  const user = users[req.session["user_id"]];
  if (!user) {
    // If not, redirect to the login page
    res.redirect("/login");
  } else {
    // If logged in, render the page to create new URLs
    const templateVars = { urls: urlDatabase, user };
    res.render("urls_new", templateVars);
  }
});

// Route to display the login page
app.get("/login", (req, res) => {
  // Check if the user is already logged in
  const user = users[req.session["user_id"]];
  if (user) {
    // If logged in, redirect to the URLs index page
    res.redirect("/urls");
  } else {
    // If not logged in, render the login page
    const templateVars = { urls: urlDatabase, user };
    res.render("urls_login", templateVars);
  }
});

// Route to display a specific URL entry
app.get("/urls/:id", (req, res) => {
  const user = users[req.session["user_id"]];

  // Fetch the long URL from the database using the short URL ID
  let longURL = urlDatabase[req.params.id].longURL;

  // Only proceed if the long URL exists, otherwise return an error
  if (!longURL) {
    return res.status(404).send("The short URL does not exist");
  }

  // Prepare variables for rendering the view
  const templateVars = {
    id: req.params.id,
    longURL,
    user,
  };

  // Render the page to show the details of a URL
  res.render("urls_show", templateVars);
});

// Route to update a specific URL entry
app.post("/urls/:id", (req, res) => {
  const shortId = req.params.id;
  const user = users[req.session["user_id"]];

  // Ensure the URL and user exist before attempting to update
  if (!urlDatabase[shortId]) {
    return res
      .status(404)
      .send("The short URL you are looking for does not exist.");
  }
  if (!user) {
    return res.status(401).send("Please login first.");
  }
  if (urlDatabase[shortId].userId !== user.id) {
    return res.status(403).send("You do not own this URL.");
  }

  // Retrieve the submitted URL
  let longURL = req.body.url;
  // Ensure the URL starts with "http://"
  if (!longURL.startsWith("http://")) {
    longURL = "http://" + longURL;
  }

  // Update the long URL in the database
  urlDatabase[shortId].longURL = longURL;

  // Redirect back to the URLs index page after update
  res.redirect("/urls");
});

// Route to render the registration page
app.get("/register", (req, res) => {
  const user = users[req.session["user_id"]];

  // If the user is already logged in, redirect to the URLs page
  if (user) {
    res.redirect("/urls");
  } else {
    // If not logged in, render the registration page
    const templateVars = { urls: urlDatabase, user };
    res.render("urls_registration", templateVars);
  }
});

// Route to handle user logout
app.post("/logout", (req, res) => {
  // Clear the session to log the user out
  req.session = null;
  // Redirect the user to the login page after logging out
  res.redirect("/login");
});

// Route to display all URLs for the logged-in user
app.get("/urls", (req, res) => {
  // Retrieve the logged-in user's information
  const userId = req.session["user_id"];
  const user = users[userId];
  // Retrieve URLs that belong to the logged-in user
  const userUrls = urlsForUser(userId, urlDatabase);

  // Prepare variables for rendering the view
  const templateVars = { urls: userUrls, user };

  // Render the URLs index page for logged-in users, or a prompt to log in for guests
  if (user) {
    res.render("urls_index", templateVars);
  } else {
    res.render("urls_loginFirst", templateVars);
  }
});

// Route to handle the root path
app.get("/", (req, res) => {
  // users should be redirected to the login or urls page
  const userId = req.session["user_id"];
  if (userId && users[userId]) {
    res.redirect("/urls"); // Redirect to the URLs page if the user is logged in
  } else {
    res.render("urls");
  }
});
