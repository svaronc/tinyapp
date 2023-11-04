# TinyApp Project

## URL Shortener Service

This application is a URL shortener service built with Node.js and Express. It allows users to shorten long URLs much like Bitly or TinyURL.

## Features

- **User Authentication**: Secure login and registration system.
- **URL Shortening**: Convert long URLs into short, manageable links.
- **Dashboard**: Users can view, manage, and track their shortened URLs.
- **Easy Redirection**: Users can visit the original URL by entering the short link.

## Getting Started

### Prerequisites

Before running this project, you'll need to install:

- [Node.js](https://nodejs.org/)
- [npm](https://npmjs.com/)

### Installation

Clone the repository:

```bash
git clone https://github.com/svaronc/tinyapp.git
cd tinyapp
```
Install the dependencies
## Dependencies

- Node.js
- Express
- EJS
- bcryptjs
- cookie-session
```bash
 npm install
 ```
 Start the server
 ```bash
 npm start
 ```
 The server will start running on http://localhost:8080.

# Usage
- **Register**: Create a new account to manage your URLs.
- **Login**: Log into your account.
- **Create**: Shorten a new URL by entering the long URL and receiving a short link.
- **Manage**: Access your dashboard to view and manage your URLs.
- **Redirect**: Use the short link to be redirected to the original long URL.

# Routes
- `GET /`: The root path that redirects to the login page or user's URL dashboard if logged in.
- `GET /urls`: Shows the user's dashboard with all shortened URLs.
- `GET /urls/new`: Provides a form for creating a new short URL.
- `POST /urls`: Endpoint to create a new short URL.
- `GET /urls/:id`: Displays details for a specific short URL.
- `POST /urls/:id`: Updates a specific short URL.
- `DELETE /urls/:id`: Deletes a specific short URL.
- `GET /u/:id`: Redirects to the original URL associated with the short URL.
- `GET /login`: Shows the login page.
- `POST /login`: Authenticates and logs in a user.
- `GET /register`: Shows the registration page.
- `POST /register`: Registers a new user.
- `POST /logout`: Logs out the user.

# Security
Passwords are hashed using `bcryptjs`, and sessions are managed with `cookie-session` for added security.

## Final Product
Welcome page

!["Welcome page"](/docs/welcome.png)
List of user's URLs

!["List of user's URLs"](/docs/urlsHome.png)
Create a new shortUrls

!["Create a new shortUrls"](/docs/urlsnew.png)


