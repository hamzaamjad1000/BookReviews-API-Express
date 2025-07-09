const express = require("express");
const jwt = require("jsonwebtoken");
const session = require("express-session");

const app = express();
app.use(express.json());

app.use(
  session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true,
  })
);

let books = {
  "9780007117116": {
    author: "J.R.R. Tolkien",
    title: "The Hobbit",
    reviews: {}
  },
  "9780439554930": {
    author: "J.K. Rowling",
    title: "Harry Potter and the Sorcerer's Stone",
    reviews: {}
  }
};

let users = [];

const isValid = (username) => {
  return users.some((user) => user.username === username);
};

const authenticatedUser = (username, password) => {
  return users.some(
    (user) => user.username === username && user.password === password
  );
};

// Register route
app.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  if (isValid(username)) {
    return res.status(409).json({ message: "User already exists" });
  }

  users.push({ username, password });
  return res.status(201).json({ message: "User registered" });
});

// Login route
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  let accessToken = jwt.sign({ username }, "access", {
    expiresIn: "1h",
  });

  req.session.authorization = { accessToken, username };
  return res
    .status(200)
    .json({ message: "User successfully logged in", token: accessToken });
});

// Get all books
app.get("/books", (req, res) => {
  return res.status(200).json(books);
});

// Get book details by ISBN
app.get("/isbn/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    return res.status(200).json(book);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

// Get books by author
app.get("/author/:author", (req, res) => {
  const author = req.params.author.toLowerCase();
  const filteredBooks = Object.values(books).filter(
    (book) => book.author.toLowerCase() === author
  );
  return res.status(200).json(filteredBooks);
});

// Get books by title
app.get("/title/:title", (req, res) => {
  const title = req.params.title.toLowerCase();
  const filteredBooks = Object.values(books).filter(
    (book) => book.title.toLowerCase() === title
  );
  return res.status(200).json(filteredBooks);
});

// Get book review
app.get("/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book && book.reviews) {
    return res.status(200).json(book.reviews);
  } else {
    return res.status(404).json({ message: "No reviews found" });
  }
});

// Add or modify a book review
app.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;
  const username = req.session.authorization?.username;

  if (!username) {
    return res.status(403).json({ message: "User not logged in" });
  }

  if (books[isbn]) {
    books[isbn].reviews[username] = review;
    return res.status(200).json({ message: "Review successfully posted" });
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

// Delete a book review
app.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization?.username;

  if (!username) {
    return res.status(401).json({ message: "User not logged in" });
  }

  if (books[isbn]) {
    if (books[isbn].reviews[username]) {
      delete books[isbn].reviews[username];
      return res.status(200).json({ message: "Review deleted successfully" });
    } else {
      return res.status(404).json({ message: "No review found for this user" });
    }
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

// Task 10: Get all books using async callback
app.get("/async-books", (req, res) => {
  new Promise((resolve, reject) => {
    resolve(books);
  }).then((bookList) => {
    return res.status(200).json(bookList);
  });
});

// Search by ISBN – Using Promises
app.get("/isbn-promise/:isbn", (req, res) => {
  const isbn = req.params.isbn;

  const getBookByISBN = new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject("Book not found");
    }
  });

  getBookByISBN
    .then((book) => res.status(200).json(book))
    .catch((err) => res.status(404).json({ message: err }));
});

// Search by Author – Using Promises
app.get("/author-promise/:author", (req, res) => {
  const author = req.params.author.toLowerCase();

  const getBooksByAuthor = new Promise((resolve, reject) => {
    const filteredBooks = Object.values(books).filter(
      (book) => book.author.toLowerCase() === author
    );

    if (filteredBooks.length > 0) {
      resolve(filteredBooks);
    } else {
      reject("No books found for this author");
    }
  });

  getBooksByAuthor
    .then((results) => res.status(200).json(results))
    .catch((err) => res.status(404).json({ message: err }));
});

// Search by Title – Using Promises
app.get("/title-promise/:title", (req, res) => {
  const title = req.params.title.toLowerCase();

  const getBooksByTitle = new Promise((resolve, reject) => {
    const filteredBooks = Object.values(books).filter(
      (book) => book.title.toLowerCase() === title
    );

    if (filteredBooks.length > 0) {
      resolve(filteredBooks);
    } else {
      reject("No books found with this title");
    }
  });

  getBooksByTitle
    .then((results) => res.status(200).json(results))
    .catch((err) => res.status(404).json({ message: err }));
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Book review server is running on port ${PORT}`);
});
