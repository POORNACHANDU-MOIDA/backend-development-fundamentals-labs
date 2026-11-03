// Lab 2: SQLite database and CRUD routes
// Express server connecting to SQLite using sqlite and sqlite3

const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const dbPath = path.join(__dirname, "books.db");

let db = null;

// Middleware to parse JSON request bodies
app.use(express.json());

// Helper function to validate positive integer book IDs
function isValidPositiveInteger(value) {
  // Uses regex so strings like "1 OR 1=1", "abc", "-5", or "1.5" are strictly rejected
  return /^[1-9]\d*$/.test(String(value).trim());
}

// GET / - Root welcome route
app.get("/", (request, response) => {
  response.status(200).json({
    message: "Welcome to Lab 2: SQLite Books CRUD API",
    student: {
      name: "M.POORNA CHANDU",
      registrationNumber: "252U1R9099",
      section: "CSE-GEN AI -2B"
    },
    endpoints: {
      getAllBooks: "GET /books/",
      getOneBook: "GET /books/:bookId/"
    }
  });
});

// GET /books/ - Retrieve all books
app.get("/books/", async (request, response) => {
  try {
    // Why await? Database disk reads take time (asynchronous I/O).
    // await pauses function execution until the database driver returns the rows.
    const books = await db.all("SELECT id, title, author, price, pages FROM book ORDER BY id ASC");
    response.status(200).json(books);
  } catch (error) {
    console.error("Error fetching books:", error.message);
    response.status(500).json({ error: "Internal Server Error" });
  }
});

// GET /books/:bookId/ - Retrieve a single book by ID
app.get("/books/:bookId/", async (request, response) => {
  const { bookId } = request.params;

  // Validate :bookId is a positive integer (prevents non-integers and injection strings)
  if (!isValidPositiveInteger(bookId)) {
    return response.status(400).json({ error: "Invalid book ID. Must be a positive integer." });
  }

  const parsedId = parseInt(bookId, 10);

  try {
    // What do placeholders (?) do?
    // The ? placeholder passes parsedId separately as data, never as executable SQL code.
    // The database engine compiles the query template first, completely preventing SQL injection.
    const book = await db.get(
      "SELECT id, title, author, price, pages FROM book WHERE id = ?",
      [parsedId]
    );

    if (!book) {
      return response.status(404).json({ error: "Book not found" });
    }

    response.status(200).json(book);
  } catch (error) {
    console.error(`Error fetching book ${bookId}:`, error.message);
    response.status(500).json({ error: "Internal Server Error" });
  }
});

// Unknown route 404 handler
app.use((request, response) => {
  response.status(404).json({ error: "404 - Route Not Found" });
});

// Initialize database connection and start HTTP server
async function initializeDBAndServer() {
  try {
    // Open connection to SQLite database
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    // Start server ONLY after DB connection succeeds
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running at http://localhost:${PORT}/`);
    });
  } catch (error) {
    console.error(`Database connection failed: ${error.message}`);
    process.exit(1);
  }
}

initializeDBAndServer();
