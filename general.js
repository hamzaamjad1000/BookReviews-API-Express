const express = require('express');
let books = require("./booksdb.js");
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).send("Missing credentials");

  if (users.some(user => user.username === username)) {
    return res.status(400).send("User already exists");
  }

  users.push({ username, password });
  return res.status(200).send("User registered");
});

public_users.get("/", (req, res) => {
  res.send(JSON.stringify(books, null, 4));
});

public_users.get("/isbn/:isbn", (req, res) => {
  const { isbn } = req.params;
  res.send(books[isbn]);
});

public_users.get("/author/:author", (req, res) => {
  const { author } = req.params;
  const result = Object.values(books).filter(book => book.author === author);
  res.send(result);
});

public_users.get("/title/:title", (req, res) => {
  const { title } = req.params;
  const result = Object.values(books).filter(book => book.title === title);
  res.send(result);
});

public_users.get("/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  res.send(books[isbn]?.reviews || {});
});

module.exports = public_users;
