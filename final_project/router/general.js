const express = require('express');
let { booksArray, booksByISBN } = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  //Write your code here
  return res.status(300).json({message: "Yet to be implemented"});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  return res.send(JSON.stringify({booksArray}, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn
  const book = booksByISBN[isbn]
  if (book) {
    res.send(book)
  } else {
    res.status(403).json({ message: "Books not found" })
  }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
 const author = req.params.author;
 const filtered_book = booksArray.filter(book => book.author === author)
 res.send(filtered_book)
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  const filtered_book = booksArray.filter(book => book.title === title)
  res.send(filtered_book)
});


public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  // Access the reviews of the specific book by its ISBN
  if (booksByISBN[isbn]) {
    const review = booksByISBN[isbn].reviews;

    if (review && Object.keys(review).length > 0) {
      res.status(200).json(review);
    } else {
      res.status(404).json({ message: "No reviews available for this book" });
    }
  } else {
    res.status(400).json({ message: "Book not found" });
  }
});  


module.exports.general = public_users;
