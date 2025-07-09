const express = require('express');
const jwt = require('jsonwebtoken');
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  return users.some(user => user.username === username);
};

const authenticatedUser = (username, password) => {
  return users.find(user => user.username === username && user.password === password);
};

regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = authenticatedUser(username, password);
  if (user) {
    let accessToken = jwt.sign({ data: password }, 'secret', { expiresIn: 60 * 60 });
    req.session.authorization = { accessToken, username };
    return res.status(200).send("User successfully logged in");
  }
  return res.status(401).send("Invalid login. Check username and password");
});

regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const { review } = req.body;
  const username = req.session.authorization.username;
  const books = require("./booksdb.js");
  books[isbn].reviews[username] = review;
  return res.send("Review added/updated.");
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const username = req.session.authorization.username;
  const books = require("./booksdb.js");
  delete books[isbn].reviews[username];
  return res.send("Review deleted.");
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
