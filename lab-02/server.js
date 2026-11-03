// Lab 2: SQLite database and CRUD routes
// Express server connecting to SQLite using sqlite and sqlite3
// Student: M.POORNA CHANDU (252U1R9099), Section: CSE-GEN AI -2B

const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const dbPath = path.join(__dirname, "books.db");

let db = null;

// Middleware to parse incoming JSON request bodies into JavaScript objects
app.use(express.json());

// Helper function to validate positive integer book IDs (e.g., 1, 2, 3...)
function isValidPositiveInteger(value) {
  // Regex ensures only digits greater than 0 are accepted.
  // Rejects letters ("abc"), decimals ("1.5"), negatives ("-5"), and SQL injection strings ("1 OR 1=1").
  return /^[1-9]\d*$/.test(String(value).trim());
}

// Helper function to validate book creation and update request payloads
function validateBookPayload(body) {
  if (!body || typeof body !== "object") {
    return "Request body must be a valid JSON object.";
  }

  const { title, author, price, pages } = body;

  if (typeof title !== "string" || title.trim() === "") {
    return "Field 'title' is required and must be a non-empty string.";
  }

  if (typeof author !== "string" || author.trim() === "") {
    return "Field 'author' is required and must be a non-empty string.";
  }

  const numPrice = Number(price);
  if (
    typeof price === "boolean" ||
    price === null ||
    price === undefined ||
    !Number.isInteger(numPrice) ||
    numPrice < 0
  ) {
    return "Field 'price' is required and must be a non-negative integer.";
  }

  const numPages = Number(pages);
  if (
    typeof pages === "boolean" ||
    pages === null ||
    pages === undefined ||
    !Number.isInteger(numPages) ||
    numPages <= 0
  ) {
    return "Field 'pages' is required and must be a positive integer.";
  }

  return null;
}

// GET / - Root welcome route with API info
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
      getOneBook: "GET /books/:bookId/",
      createBook: "POST /books/",
      updateBook: "PUT /books/:bookId/",
      deleteBook: "DELETE /books/:bookId/"
    }
  });
});

// 1. GET /books/ - Retrieve all books
app.get("/books/", async (request, response) => {
  try {
    // Why await?
    // Database queries involve asynchronous file/disk I/O.
    // 'await' pauses this request handler until SQLite finishes reading and returns the rows.
    const books = await db.all(
      "SELECT id, title, author, price, pages FROM book ORDER BY id ASC"
    );
    response.status(200).json(books);
  } catch (error) {
    console.error("Error fetching books:", error.message);
    response.status(500).json({ error: "Internal Server Error" });
  }
});

// 2. GET /books/:bookId/ - Retrieve a single book by ID
app.get("/books/:bookId/", async (request, response) => {
  const { bookId } = request.params;

  // Validate :bookId is a positive integer
  if (!isValidPositiveInteger(bookId)) {
    return response.status(400).json({ error: "Invalid book ID. Must be a positive integer." });
  }

  const parsedId = parseInt(bookId, 10);

  try {
    // What do ? placeholders do?
    // A placeholder tells SQLite to compile the SQL query template first, treating the ? as a variable.
    // The driver safely injects the parameter as literal data, never as executable code.
    // This completely neutralizes SQL injection attacks.
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

// 3. POST /books/ - Add a new book
app.post("/books/", async (request, response) => {
  const validationError = validateBookPayload(request.body);
  if (validationError) {
    return response.status(400).json({ error: validationError });
  }

  const { title, author, price, pages } = request.body;

  try {
    // All inputs bound safely using ? placeholders
    const result = await db.run(
      "INSERT INTO book (title, author, price, pages) VALUES (?, ?, ?, ?)",
      [title.trim(), author.trim(), Number(price), Number(pages)]
    );

    // result.lastID gives the auto-incremented primary key of the inserted row
    response.status(201).json({
      message: "Book created successfully",
      bookId: result.lastID
    });
  } catch (error) {
    console.error("Error inserting book:", error.message);
    response.status(500).json({ error: "Internal Server Error" });
  }
});

// 4. PUT /books/:bookId/ - Update an entire book by ID
app.put("/books/:bookId/", async (request, response) => {
  const { bookId } = request.params;

  if (!isValidPositiveInteger(bookId)) {
    return response.status(400).json({ error: "Invalid book ID. Must be a positive integer." });
  }

  const validationError = validateBookPayload(request.body);
  if (validationError) {
    return response.status(400).json({ error: validationError });
  }

  const parsedId = parseInt(bookId, 10);
  const { title, author, price, pages } = request.body;

  try {
    const result = await db.run(
      "UPDATE book SET title = ?, author = ?, price = ?, pages = ? WHERE id = ?",
      [title.trim(), author.trim(), Number(price), Number(pages), parsedId]
    );

    // Why check result.changes?
    // In SQL, an UPDATE statement succeeds without error even if 0 rows matched the WHERE condition.
    // result.changes tells us exactly how many rows were modified.
    // If result.changes === 0, no book with that ID existed in the database, so we return 404.
    if (result.changes === 0) {
      return response.status(404).json({ error: "Book not found" });
    }

    response.status(200).json({ message: "Book updated successfully" });
  } catch (error) {
    console.error(`Error updating book ${bookId}:`, error.message);
    response.status(500).json({ error: "Internal Server Error" });
  }
});

// 5. DELETE /books/:bookId/ - Delete a book by ID
app.delete("/books/:bookId/", async (request, response) => {
  const { bookId } = request.params;

  if (!isValidPositiveInteger(bookId)) {
    return response.status(400).json({ error: "Invalid book ID. Must be a positive integer." });
  }

  const parsedId = parseInt(bookId, 10);

  try {
    const result = await db.run(
      "DELETE FROM book WHERE id = ?",
      [parsedId]
    );

    // Why check result.changes?
    // DELETE returns successfully even if the row didn't exist.
    // If result.changes === 0, the bookId was not found in the table.
    if (result.changes === 0) {
      return response.status(404).json({ error: "Book not found" });
    }

    response.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
    console.error(`Error deleting book ${bookId}:`, error.message);
    response.status(500).json({ error: "Internal Server Error" });
  }
});

// Unknown route 404 fallback handler
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

    // Start Express server ONLY after database connection succeeds
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running at http://localhost:${PORT}/`);
    });
  } catch (error) {
    console.error(`Database connection failed: ${error.message}`);
    process.exit(1);
  }
}

initializeDBAndServer();
