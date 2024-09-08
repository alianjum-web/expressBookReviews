const express = require('express');
const jwt = require('jsonwebtoken');
let { booksArray, booksByISBN } = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
  let userwithusername = users.filter((user) => {
    return user.username === username
  })
  return userwithusername.length > 0
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
  let validuser = users.filter((user) => {
    return user.username === username && user.password === password
  })
  return validuser.length > 0
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const { username, password } = req.body
  if (!username || !password) {
    return res.status(301).json({message: "invalid usernama and password"})
  }
  if (authenticatedUser(username,password)) {
    const accessToken = jwt.sign({ 
      //do not store password in the payload
      data: username
    },'access', { expiresIn: 60 * 60 })
    req.session.authorization = {
      accessToken, username
    }
    return res.status(201).json({ message: "User successfully loged In" })
  } else {
   return res.status(208).json({ message: "Invalid login! check username and password" }) 
  }
});

//Route to hanlde register the user
regd_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password

  if (username && password) {
    // function isValid check whether username is present or is registred
    if (!isValid(username)) {
      users.push({"username": username, "password": password })
      return res.status(200).json({ message : "User succesfully registered" })
    } else {
     return res.status(402).json({ message: "User already existed" }) 
    }
  }
  res.status(401).json({message: "Unable to register user"})
}) 

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { username } = req.session.authorization;
  const isbn = req.params.isbn;
  const review = req.query.review;

  if (!username) {
    return res.status(400).json({ message: "User is not logged In" })
  }
  if (!review) {
    return res.status(401).json({ message: "Review is not provided" })
  }
  if (booksByISBN[isbn]) {
    let existedReview = booksByISBN[isbn].reviews;
    if (existedReview[username]) {
      existedReview[username] = review;
      return res.status(200).json({ message: "Review updated successfully" }, review );
    } else {
      existedReview[username] = review;
      return res.status(201).json({ message: "New review added successfully", review });
    }
  } else {
    return res.status(400).json({ message: "Book not found" });
  }
  
});
// Delelte teh book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  if (!req.session.authorization) {
    return res.status(400).json({ message: "Unauthorized" });
  }
  const { username } = req.session.authorization;
  const isbn = req.params.isbn;
  if (booksByISBN[isbn]) {
    let existed_Review = booksByISBN[isbn].reviews; // Corrected here
    if (existed_Review[username]) {
      delete existed_Review[username];
      return res.status(200).json({ message: "Review deleted successfully" });
    } else {
      return res.status(400).json({ message: "Unable to delete review" });
    }
  } else {
    return res.status(404).json({ message: "Book by this ISBN number is not present" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;