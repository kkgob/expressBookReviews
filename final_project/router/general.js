const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

public_users.post("/register", (req,res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  if (users.find(user => user.username === username)) {
    return res.status(409).json({ message: "Username already exists" });
  }
  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  try {
    // Return the list of books directly without making an Axios call
    const bookList = JSON.stringify(books, null, 2);
    return res.status(200).json(books);
  } catch (error) {
    console.error('Error fetching book list:', error.message);
    return res.status(500).json({ message: 'Error fetching book list' });
  }
});

public_users.get('/', async function (req, res) {
  try {
    // Simulate an internal fetch using Axios
    const response = await axios.get('http://localhost:8080/');
    console.log('Fetched book list using Axios:', response.data);

    // Return the original books as usual
    return res.status(200).json(books);
  } catch (error) {
    console.error('Error fetching book list:', error.message);
    return res.status(500).json({ message: 'Error fetching book list' });
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn; // Extract ISBN from request parameters

  try {
    // Simulate an external Axios call to fetch book details by ISBN
    const response = await axios.get(`http://localhost:8080/books/${isbn}`); // Use a new internal route
    console.log(`Fetched details for ISBN ${isbn}:`, response.data);
    return res.status(200).json(response.data); // Return the fetched book details
  } catch (error) {
    console.error(`Error fetching book details for ISBN ${isbn}:`, error.message);
    return res.status(404).json({ message: "Book not found" }); // Handle book not found
  }
});

// Add a new route for Axios call to fetch book details by ISBN
public_users.get('/books/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn]; // Get the book details directly
  if (book) {
    return res.status(200).json(book);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author.toLowerCase(); // Get author from request parameters

  try {
    // Simulate an external Axios call to fetch book details by author
    const response = await axios.get(`http://localhost:8080/books/author/${author}`); // New internal route
    console.log(`Fetched books for author ${author}:`, response.data);

    return res.status(200).json(response.data); // Return the fetched book details
  } catch (error) {
    console.error(`Error fetching books for author ${author}:`, error.message);
    return res.status(404).json({ message: "No books found by this author" }); // Handle error
  }
});

// Add a new internal route for Axios to fetch book details by author
public_users.get('/books/author/:author', (req, res) => {
  const author = req.params.author.toLowerCase();
  const result = Object.values(books).filter(book => book.author.toLowerCase() === author); // Find books by author

  if (result.length > 0) {
    return res.status(200).json(result);
  } else {
    return res.status(404).json({ message: "No books found by this author" });
  }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title.toLowerCase(); // Extract title from request parameters

  try {
    // Use Axios to fetch book details by title from a new internal route
    const response = await axios.get(`http://localhost:8080/books/title/${title}`);
    console.log(`Fetched books with title ${title}:`, response.data);

    return res.status(200).json(response.data); // Return the fetched book details
  } catch (error) {
    console.error(`Error fetching books with title ${title}:`, error.message);
    return res.status(404).json({ message: "No books found with this title" }); // Handle error
  }
});

// Add a new internal route to return books based on title
public_users.get('/books/title/:title', (req, res) => {
  const title = req.params.title.toLowerCase();
  const result = Object.values(books).filter(book => book.title.toLowerCase().includes(title)); // Find books by title (partial match)

  if (result.length > 0) {
    return res.status(200).json(result);
  } else {
    return res.status(404).json({ message: "No books found with this title" });
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).json(books[isbn].reviews);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
