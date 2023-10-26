// Require the express framework
const express = require("express");
// Create an instance of the express application
const app = express();
// Set the PORT constant to 8080, which will be used for the server to listen on
const PORT = 8080;

// Function to generate random strings (currently empty, implementation is missing)
function generateRamdomStrings() {
  const alphanumericData =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = '';
    for (let i = 0; i < 6; id++) {
      const random = Math.floor(Math.random() * alphanumericData.length);
      result += alphanumericData[random];
    }
    return result;
}

// Set the view engine of the express application to EJS
app.set("view engine", "ejs");

// Sample database holding shortened URLs and their corresponding long URLs
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

// Use express's urlencoded middleware to parse incoming requests with URL-encoded data
app.use(express.urlencoded({ extended: true }));

// Route to handle POST requests to /urls
// Currently, it just logs the request body and responds with "Ok"
app.post("/urls", (req, res) => {
  console.log(req.body);
  res.send("Ok");
});

// Route to display a page for creating new shortened URLs
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// Dynamic route to display details of a specific shortened URL by its ID
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id, // Get the id from the route parameter
    longURL: urlDatabase[req.params.id], // Get the corresponding long URL from the database
  };
  res.render("urls_show", templateVars);
});

// Route to display a list of all shortened URLs
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase }; // Pass the entire URL database to the template
  res.render("urls_index", templateVars);
});

// Start the server on the defined PORT (8080 in this case)
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
